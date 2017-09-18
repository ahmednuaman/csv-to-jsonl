# csv-to-jsonl
A simple node CLI to convert CSV to JSONL (for services like Athena)

## Usage
```
csv-to-jsonl -e extension -s sanitise [...csv-files.csv]
```

- `-e|--extension` specifies what extension the output file ought to have
- `-s|--sanitise|--sanitize` specifies whether or not to convert the column names to `snake_case` (eg for Athena)
