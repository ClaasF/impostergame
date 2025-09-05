#!/bin/zsh
# Simple local static server for development
# Usage: ./dev-server.sh

set -e

PORT=8080
if [[ ! -z "$1" ]]; then
  PORT=$1
fi

# Use Python's built-in HTTP server
python3 -m http.server $PORT --bind 127.0.0.1
