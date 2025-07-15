// server/utils/cronJobs.js
// const cron = require("node-cron");
// const { checkAndSendAlerts } = require('../controllers/issController');

// exports.startAlertScheduler = () => {
//   // Schedule the alert check to run every 10 minutes
//   // You can adjust the cron schedule as needed
//   cron.schedule('*/10 * * * *', () => {
//     console.log('Running scheduled ISS alert check...');
//     checkAndSendAlerts();
//   });
// };

// utils/cronJobs.js
import cron from "node-cron";

export function startAlertScheduler() {
  cron.schedule("* * * * *", () => {
    console.log("Running scheduled ISS alert task...");
    checkAndSendAlerts();
  });
}
