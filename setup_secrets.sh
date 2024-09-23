#!/bin/bash

# Define the output file
ENV_FILE=".env"

# Login to Vault
echo "Logging into Vault..."
hcp auth login 
if [ $? -ne 0 ]; then
echo "Failed to login to Vault. Please check your credentials."
exit 1
fi

hcp profile init 

# Check if .env file exists and delete it if it does
if [ -f "$ENV_FILE" ]; then
    rm "$ENV_FILE"
fi

# Fetch all secret keys from Vault
SECRET_KEYS=$(hcp vault-secrets secrets list --format=json | grep -Eo '"([^"]*)"\s*:\s*"([^"]*)"' | sed -E 's/"([^"]+)": "([^"]+)"/\1=\2/g' | grep "^name=" | grep -v "@" | sed 's/^name=//')

if [ $? -ne 0 ] || [ -z "$SECRET_KEYS" ]; then
    echo "Failed to retrieve secret keys from Vault."
    exit 1
fi

# Iterate over each secret key and fetch the secret value
for key in $SECRET_KEYS; do
    SECRET_VALUE=$(hcp vault-secrets secrets open $key | grep "Value:" | sed -E 's/Value:\s*(.*)/\1/; s/^[ \t]+|[ \t]+$//g' 2>/dev/null)

    if [ $? -ne 0 ] || [ -z "$SECRET_VALUE" ]; then
        echo "Failed to retrieve secret for key $key. Skipping."
        continue
    fi

    # Append the secret key-value pair to the .env file
    echo "$key=$SECRET_VALUE" >> $ENV_FILE
done

echo ".env file has been created/updated successfully."
