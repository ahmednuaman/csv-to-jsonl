#!/usr/bin/env node

const _ = require('lodash')
const async = require('async')
const colors = require('colors')
const csv = require('csv')
const fs = require('fs')
const path = require('path')
const transform = require('stream-transform')
const yargs = require('yargs')

const argv =
  yargs
    .option('extension', {
      alias: 'e',
      default: '.jsonl'
    })
    .option('sanitise', {
      alias: ['s', 'sanitize'],
      default: true,
      type: 'boolean'
    })
    .argv

const sanitise = (row) => argv.sanitise ? _.mapKeys(row, (v, k) => _.snakeCase(k)) : row

async.parallel(argv._.map((file) => (done) => {
  const filename = path.basename(file)

  const input = fs.createReadStream(file)
  const output = fs.createWriteStream(`${file}.${argv.extension}`)

  const parser = csv.parse({
    auto_parse: true,
    auto_parse_date: true,
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  const transformer = transform((row, done) => done(null, `${JSON.stringify(sanitise(row))}\n`), {
    parallel: 10
  })

  console.log(colors.yellow(`Transforming ${filename} => ${filename}.${argv.extension} ⏳`))

  output.on('close', () => {
    console.log(colors.green(`Successfully transformed ${filename} ✅`))
    done(null, file)
  })

  input
    .pipe(parser)
    .pipe(transformer)
    .pipe(output)
}), (error, results) => {
  if (error) {
    console.log(colors.red(error))
  } else {
    console.log(colors.bold.green(`Successfully converted ${results.length} files! ✨`))
  }
})
