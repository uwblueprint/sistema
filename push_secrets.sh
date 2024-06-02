#!/bin/bash

# Define the input file
ENV_FILE=".env"

# Ensure the Vault CLI is authenticated
login_message=$(vlt login)
if [[ "$login_message" != "Successfully logged in" ]]; then
    echo "Currently not logged in. Please login to Vault first to set up the secrets."
    exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found."
    exit 1
fi

# Read the secrets from the .env file
while IFS='=' read -r key value; do
    if [ -n "$key" ] && [ -n "$value" ]; then
        # Check if the secret already exists
        secret_exists=$(vlt secrets get "$key" 2>&1)
        if [[ "$secret_exists" == *"not found"* ]]; then
            # Secret does not exist, create it
            vlt secrets create "$key"="$value" || echo "Failed to create secret for $key."
        else
            # Secret exists, update it
            vlt secrets update "$key"="$value" || echo "Failed to update secret for $key."
        fi
    fi
done < "$ENV_FILE"

echo "Secrets from $ENV_FILE have been sent to Vault."
