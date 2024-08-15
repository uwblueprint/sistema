# Use the official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /sistema

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
COPY scripts ./scripts
COPY prisma ./prisma

# Install dependencies using npm
RUN npm install
COPY .env* ./

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application in development mode
CMD ["npm", "run", "dev"]

# RUN npx prisma generate && npx prisma db push && npx @snaplet/seed sync && npx prisma db seed