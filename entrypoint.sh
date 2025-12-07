#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
# Run migrations
echo "Running migrations..."
./node_modules/.bin/drizzle-kit migrate

# Run seed - REMOVED (moved to Admin Dashboard)
# echo "Running seed..."
# ./node_modules/.bin/tsx src/db/seed.ts

# Build step removed - handled in CI/Dockerfile

# Start the application
echo "Building application..."
npm run build
echo "Starting application..."
exec npm run start
