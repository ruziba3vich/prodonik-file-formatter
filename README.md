# Prodonik Formatter

`prodonik_formatter` is a simple Go-based command-line tool that automates the formatting of modified files in Yandex's `arc` repositories. It parses the output of `arc status` to find modified files and formats them using the `ya tool tt format <path-to-file>` command.

## Features

- Automatically identifies modified files from `arc status`.
- Formats files using `ya tool tt format <path-to-file>`.
- Simplifies the workflow for developers by automating repetitive formatting tasks.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ruziba3vich/prodonik_formatter.git
   cd prodonik_formatter

Build the Binary: Make sure you have Go installed. Run the following command to build the binary:
```
  go build -o <any_name_you_like> prodonik_formatter.go

```
so then the binary build file is created as `<any_name_you_like> `, I want it to be `prodonik_formatter`

Move the Binary to Your PATH: To use the tool globally, move the binary to a directory in your $PATH:
```bash
   sudo mv prodonik_formatter /usr/local/bin/
```
so now you're free to use the comman via your terminal :) -> `prodonik_formatter`


# AUTHORS : github.com/rarebek and github.com/ruziba3vich
