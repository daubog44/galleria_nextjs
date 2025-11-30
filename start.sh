#!/bin/bash
set -e

# Load environment variables from .env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "Starting Database..."
docker compose up -d db

echo "Waiting for database to be ready..."
until docker compose exec db pg_isready -U ${POSTGRES_USER} -d galleria; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

# Migrations and seeding are handled by entrypoint.sh inside the app container

echo "Building and Starting App..."
docker compose pull
docker compose up -d --remove-orphans
# Run Umami setup
./setup-umami.sh

#docker compose logs -f