# Wait for the database to be ready (you might need to adjust this)
echo "Waiting for database to be ready..."
sleep 10

# Run Prisma commands
echo "Running Prisma commands..."
npx prisma generate
npx prisma db push
npx @snaplet/seed sync
npx prisma db seed

# Start the Next.js application in development mode
echo "Starting Next.js application..."
npm run dev