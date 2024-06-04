#!/bin/bash

# Define the input file
ENV_FILE=".env"

# Login to Vault
echo "Logging into Vault..."
vlt login
if [ $? -ne 0 ]; then
echo "Failed to login to Vault. Please check your credentials."
exit 1
fi

vlt config init

# Check if .env file exists and exit if it doesn't
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found."
    exit 1
fi

# Fetch all existing secret keys and delete them
echo "Fetching and deleting all existing secrets..."
SECRET_KEYS=$(vlt secrets list -format=json | grep -Eo '"([^"]*)"\s*:\s*"([^"]*)"' | sed -E 's/^"([^"]*)"\s*:\s*"([^"]*)"$/\1=\2/' | grep "^name=" | grep -v "@" | sed 's/^name=//')

for secret_key in $SECRET_KEYS; do
    echo "Deleting secret with name $secret_key"
    vlt secrets delete "$secret_key" || echo "Failed to delete secret $secret_key."
    echo ""
done

# Read the secrets from the .env file and create them
while IFS='=' read -r key value; do
    if [ -n "$key" ] && [ -n "$value" ]; then
        # Create the secret with the new value
        vlt secrets create "$key"="$value" || echo "Failed to create secret for $key."
        echo ""
    fi
done < "$ENV_FILE"

echo "Secrets from $ENV_FILE have been sent to Vault."
