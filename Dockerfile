# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /sistema

# pnpm for nextjs
RUN npm install -g pnpm

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
COPY prisma ./prisma/ 

# Install dependencies using npm
RUN npm install

# Create Prisma Client
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000
EXPOSE 5432

# Start the Next.js application in development mode
CMD ["npm", "run", "dev"]