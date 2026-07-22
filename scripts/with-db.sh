#!/usr/bin/env bash
# Runs a command with the Payload Postgres container up for its lifetime,
# then stops the container when the command exits (including on Ctrl-C).
# `stop` rather than `down` so the pgdata volume survives.
set -euo pipefail

cd "$(dirname "$0")/.."

cleanup() {
  docker compose stop -t 5 >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker compose up -d --wait

"$@"
