#!/bin/sh
# Husky shell script for running hooks
if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky (debug) - $1"
  }
  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."
  if [ -z "$HUSKY" ]; then
    export HUSKY=0
  fi
  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is 0, skipping hook"
    exit 0
  fi
fi
