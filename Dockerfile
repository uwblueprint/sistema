# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /sistema

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Copy Prisma Schema
COPY prisma ./prisma

# Install dependencies using npm
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD echo "Running Prisma commands..." && \
    npm run dev