# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /sistema

# Copy package.json, package-lock.json, and prisma directory
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install dependencies using npm
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application in development mode
CMD ["npm", "run", "dev"]