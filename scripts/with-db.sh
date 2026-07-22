#!/usr/bin/env bash
# Runs a command with the Payload Postgres container up for its lifetime,
# then stops the container when the command exits (including on Ctrl-C).
# `stop` rather than `down` so the pgdata volume survives.
set -euo pipefail

cd "$(dirname "$0")/.."

cleanup() {
  # Clear the traps first: a signal fires INT/TERM and then EXIT, which would
  # otherwise run `docker compose stop` twice.
  trap - EXIT INT TERM
  docker compose stop -t 5 >/dev/null 2>&1 || true
}
# `"$@"` below runs in the foreground on purpose. Backgrounding it (`"$@" & wait`)
# makes bash set SIGINT to SIG_IGN on the child, so Ctrl-C would stop the database
# out from under a still-running dev server.
trap cleanup EXIT INT TERM

docker compose up -d --wait

"$@"
