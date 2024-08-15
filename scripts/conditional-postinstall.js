const { execSync } = require('child_process');

const isVercel = process.env.VERCEL === '1';

if (isVercel) {
  console.log('Running in Vercel environment. Executing postinstall script...');
  try {
    execSync('prisma generate', { stdio: 'inherit' });
  } catch (error) {
    console.error('Postinstall script failed:', error);
    process.exit(1);
  }
} else {
  console.log(
    'Not running in Vercel environment. Skipping postinstall script.'
  );
}
