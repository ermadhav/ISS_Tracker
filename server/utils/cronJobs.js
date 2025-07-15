import cron from "node-cron";
import { checkAndSendAlerts } from '../controllers/issController.js';

export function startAlertScheduler() {
  cron.schedule("* * * * *", async () => {
    console.log("Running scheduled ISS alert task...");
    try {
      await checkAndSendAlerts();
    } catch (error) {
      console.error("Error in scheduled ISS alert task:", error);
    }
  });
}
