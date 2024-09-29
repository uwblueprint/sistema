#!/bin/bash

# Define the input file
ENV_FILE=".env"

# Login to Vault
echo "Logging into Vault..."
hcp auth login
if [ $? -ne 0 ]; then
echo "Failed to login to Vault. Please check your credentials."
exit 1
fi

hcp profile init

# Check if .env file exists and exit if it doesn't
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found."
    exit 1
fi

# Fetch all existing secret keys and delete them
echo "Fetching and deleting all existing secrets..."
SECRET_KEYS=$(hcp vault-secrets secrets list --format=json --app=sistema | grep -Eo '"([^"]*)"\s*:\s*"([^"]*)"' | sed -E 's/^"([^"]*)"\s*:\s*"([^"]*)"$/\1=\2/' | grep '^\(name=\|"name":\)'| grep -v "@" | sed 's/^"name": "\(.*\)"$/\1/; s/^name=\(.*\)$/\1/')

for secret_key in $SECRET_KEYS; do
    echo "Deleting secret with name $secret_key"
    hcp vault-secrets secrets delete "$secret_key" --app=sistema || echo "Failed to delete secret $secret_key."
    echo ""
done

# Read the secrets from the .env file and create them
while IFS='=' read -r key value; do
    if [ -n "$key" ] && [ -n "$value" ]; then
        # Create the secret with the new value
        echo -n "$value" | hcp vault-secrets secrets create "$key" --app=sistema --data-file=- || echo "Failed to create secret for $key."
        echo ""
    fi
done < "$ENV_FILE"

echo "Secrets from $ENV_FILE have been sent to Vault."
