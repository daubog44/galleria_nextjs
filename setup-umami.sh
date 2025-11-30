#!/bin/bash

# Wait for DB to be ready
echo "Waiting for database..."
sleep 5

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Variables
WEBSITE_ID="${NEXT_PUBLIC_UMAMI_WEBSITE_ID}"
SHARE_ID="${NEXT_PUBLIC_UMAMI_SHARE_ID}"
USER_ID="41e2b680-648e-4b09-bcd7-3e2b10c06264"
DOMAIN="${DOMAIN_NAME:-localhost}"
UMAMI_URL="${UMAMI_HOST:-localhost:3000}"

# Wait for Umami to finish migrations (table 'website' must exist)
echo "Waiting for Umami migrations..."
MAX_RETRIES=30
COUNT=0
while [ $COUNT -lt $MAX_RETRIES ]; do
    TABLE_EXISTS=$(docker compose exec -T db psql -U postgres -d umami -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'website');")
    if [ "$TABLE_EXISTS" = "t" ]; then
        echo "Umami tables found."
        break
    fi
    echo "Waiting for website table... ($COUNT/$MAX_RETRIES)"
    sleep 2
    COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "Error: Umami migrations timed out."
    exit 1
fi

# Check if website exists
EXISTS=$(docker compose exec -T db psql -U postgres -d umami -tAc "SELECT 1 FROM website WHERE website_id = '$WEBSITE_ID'")

if [ "$EXISTS" = "1" ]; then
    echo "Website already exists."
    # Get existing share_id
    EXISTING_SHARE_ID=$(docker compose exec -T db psql -U postgres -d umami -tAc "SELECT share_id FROM website WHERE website_id = '$WEBSITE_ID'")
    if [ -z "$EXISTING_SHARE_ID" ]; then
        echo "Enabling share URL..."
        docker compose exec -T db psql -U postgres -d umami -c "UPDATE website SET share_id = '$SHARE_ID' WHERE website_id = '$WEBSITE_ID';"
        echo "Share URL enabled: https://$UMAMI_URL/share/$SHARE_ID"
    else
        echo "Share URL already enabled: https://$UMAMI_URL/share/$EXISTING_SHARE_ID"
    fi
else
    echo "Creating website..."
    docker compose exec -T db psql -U postgres -d umami -c "INSERT INTO website (website_id, name, domain, share_id, user_id) VALUES ('$WEBSITE_ID', '$NAME', '$DOMAIN', '$SHARE_ID', '$USER_ID');"
    echo "Website created with ID: $WEBSITE_ID"
    echo "Share URL enabled: https://$UMAMI_URL/share/$SHARE_ID"
fi
