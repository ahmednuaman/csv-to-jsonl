#!/usr/bin/env node

const { argv } = require('yargs')
const async = require('async')
const colors = require('colors')
const csv = require('csv')
const fs = require('fs')
const path = require('path')
const transform = require('stream-transform')

async.parallel(argv._.map((file) => (done) => {
  const filename = path.basename(file)

  const input = fs.createReadStream(file)
  const output = fs.createWriteStream(`${file}.jsonl`)

  const parser = csv.parse({
    auto_parse: true,
    auto_parse_date: true,
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  const transformer = transform((row, done) => done(null, `${JSON.stringify(row)}\n`), {
    parallel: 10
  })

  console.log(colors.yellow(`Transforming ${filename} => ${filename}.jsonl ⏳`))

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
