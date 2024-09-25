# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /sistema

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install dependencies using npm
RUN npm install
COPY .env* ./

# Copy the startup script
COPY start.sh ./
RUN chmod +x start.sh

# Expose the port the app runs on
EXPOSE 3000

# Use the startup script as the entry point
ENTRYPOINT ["/bin/sh", "./start.sh"]
