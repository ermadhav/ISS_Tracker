// In your issRoutes.js or server.js temporarily

import express from 'express';
import { checkAndSendAlerts } from '../controllers/issController.js';

const router = express.Router();

router.get('/test-alerts', async (req, res) => {
  try {
    await checkAndSendAlerts();
    res.json({ message: 'Alert check triggered. Check server logs for details.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
