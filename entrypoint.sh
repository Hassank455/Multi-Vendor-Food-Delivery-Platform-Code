#!/bin/sh

set -e

IS_LIVE_=${IS_LIVE:-0}

if [ "$APP_ENV" = "production" ] || [ "$IS_LIVE_" != "0" ]; then
  echo "applying production deploy"

  if ! npm run db:deploy:base; then
    echo "ERROR: Production database deployment failed. Stopping SERVICE"
    exit 1
  fi
else
  echo "applying soft db:push"

  if ! npm run db:push:base -- --accept-data-loss; then
    echo "applying hard db:push"

    if ! npm run db:push:base -- --force-reset; then
      echo "ERROR: Database push (even with force-reset) failed. Stopping SERVICE"
      exit 1
    fi

    npm run db:seed:base
  fi
fi

node prisma/seed.deploy.js

exec "$@"
