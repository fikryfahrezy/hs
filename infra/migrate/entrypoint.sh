#!/bin/sh
set -eu

first_migration="$(find /workspace/db/migrations -type f -name '*.sql' -print -quit)"

if [ -z "$first_migration" ]; then
  node /opt/dbmate/dist/cli.js --version
  echo "No product migrations to apply yet."
  exit 0
fi

exec node /opt/dbmate/dist/cli.js \
  --migrations-dir /workspace/db/migrations \
  "$@"
