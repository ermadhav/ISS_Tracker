const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/iss-location', async (req, res) => {
  try {
    const response = await axios.get('http://api.open-notify.org/iss-now.json');
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch ISS location' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));