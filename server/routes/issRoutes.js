import express from 'express';
import { getCurrentIssPosition, setUserLocation } from '../controllers/issController.js';

const router = express.Router();

router.get('/iss/current', getCurrentIssPosition);
router.post('/users/location', setUserLocation);

export default router;
