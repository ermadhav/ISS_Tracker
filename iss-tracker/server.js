// server.js 
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/iss-location', async (req, res) => {
  try {
    const response = await axios.get('http://api.open-notify.org/iss-now.json');
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch ISS location' });
  }
});

app.get('/api/iss-astronauts', async (req, res) => {
  try {
    const response = await axios.get('http://api.open-notify.org/astros.json');
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch ISS astronauts' });
  }
});

// Haversine distance formula
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'madhavtiwari2024@gmail.com',
    pass: 'litp xhcv cpdy yomo',
  }
});

app.post('/api/check-visibility', async (req, res) => {
  const { userLat, userLng, email } = req.body;

  try {
    const response = await axios.get('http://api.open-notify.org/iss-now.json');
    const issLat = parseFloat(response.data.iss_position.latitude);
    const issLng = parseFloat(response.data.iss_position.longitude);

    const distance = getDistanceKm(userLat, userLng, issLat, issLng);

    if (true || distance <= 1000) {
      await transporter.sendMail({
        from: 'madhavtiwari2024@gmail.com',
        to: email,
        subject: '🚀 ISS is Overhead!',
        text: `Look up! The ISS is currently passing near you.\n\nLatitude: ${issLat}\nLongitude: ${issLng}`,
      });

      return res.json({ message: '📧 Alert sent! ISS is visible overhead.' });
    } else {
      return res.json({ message: 'ISS is not nearby currently.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check ISS visibility or send email.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));