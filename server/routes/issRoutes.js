// server/routes/issRoutes.js
const express = require('express');
const { getCurrentIssPosition, setUserLocation } = require('../controllers/issController');

const router = express.Router();

router.get('/iss/current', getCurrentIssPosition);
router.post('/users/location', setUserLocation);

module.exports = router;