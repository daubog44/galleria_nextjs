#!/bin/bash
set -e

# Load environment variables from .env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "Starting Database..."
docker compose -f compose.local.yml up -d db

echo "Waiting for database to be ready..."
until docker compose -f compose.local.yml exec db pg_isready -U ${POSTGRES_USER} -d galleria; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

# Migrations and seeding are handled by entrypoint.sh inside the app container

echo "Building and Starting App..."
docker compose -f compose.local.yml up -d --build app
docker compose -f compose.local.yml up -d umami
docker compose -f compose.local.yml up -d umami-proxy
# Run Umami setup
export COMPOSE_FILE=compose.local.yml
./setup-umami.sh

#docker compose -f compose.local.yml logs -f
