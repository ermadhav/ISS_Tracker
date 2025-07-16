const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/api/iss-location', async (req, res) => {
  try {
    const response = await axios.get('http://api.open-notify.org/iss-now.json');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ISS location' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
