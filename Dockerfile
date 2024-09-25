# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /sistema

# Copy package.json, package-lock.json, and prisma directory
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install dependencies using npm
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy environment variables
COPY .env* ./

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD echo "Waiting for database to be ready..." && \
    echo "Running Prisma commands..." && \
    npx prisma generate && \
    npx prisma db push && \
    npx @snaplet/seed sync && \
    npx prisma db seed && \
    echo "Starting Next.js application..." && \
    npm run dev