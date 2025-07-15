// server/routes/issRoutes.js
import express from 'express';
import { getCurrentIssPosition, setUserLocation } from '../controllers/issController.js';

const router = express.Router();

// Define route to get current ISS position
router.get('/iss-position', getCurrentIssPosition);

// Define route to set user location
router.post('/set-location', setUserLocation);

export default router;
