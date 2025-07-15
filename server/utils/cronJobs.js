import cron from 'node-cron';
import { checkAndSendAlerts } from '../controllers/issController.js';

export const startAlertScheduler = () => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    console.log('Running scheduled ISS alert check...');
    checkAndSendAlerts();
  });
};
