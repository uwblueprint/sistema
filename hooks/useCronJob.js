import { useEffect } from 'react';

const useCronJob = () => {
  console.log('cron job');
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Running a task every minute');
      // Your task logic here
    }, 600); // 60000 milliseconds = 1 minute

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
};

export default useCronJob;
