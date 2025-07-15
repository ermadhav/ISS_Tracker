import cron from "node-cron";

export function startAlertScheduler() {
  cron.schedule("* * * * *", () => {
    console.log("Running scheduled ISS alert task...");
    checkAndSendAlerts();
  });
}
