#!/bin/sh
set -e

# Fix volume permissions if running as root
if [ "$(id -u)" = '0' ]; then
    echo "Fixing permissions for /app/public/sitedata..."
    mkdir -p /app/public/sitedata
    chown -R nextjs:nodejs /app/public/sitedata
    
    # Re-run this script as the 'nextjs' user
    exec gosu nextjs "$0" "$@"
fi
# Run migrations
echo "Running migrations..."
# Run db push (sync schema directly)
echo "Running db push..."
./node_modules/.bin/drizzle-kit push

# Run seed - REMOVED (moved to Admin Dashboard)
# echo "Running seed..."
# ./node_modules/.bin/tsx src/db/seed.ts

# Build step removed - handled in CI/Dockerfile

# Start the application
echo "Building application..."
npm run build
echo "Starting application..."
exec npm run start
