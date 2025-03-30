import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');


const app = express();
app.use(cors());

const PORT = process.env.PORT || 5003;
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

app.get('/api/foursquare/nearby', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const response = await axios.get(
      'https://api.foursquare.com/v3/places/search',
      {
        headers: {
          Authorization: FOURSQUARE_API_KEY,
        },
        params: {
          ll: `${lat},${lng}`,
          radius: 10000,
          categories: 13065,
          limit: 20,
          sort: 'DISTANCE',
        },
      }
    );

    const results = response.data.results.map(place => ({
      name: place.name,
      address: place.location.formatted_address,
      position: {
        lat: place.geocodes.main.latitude,
        lng: place.geocodes.main.longitude,
      },
      cuisine: place.categories.map(cat => cat.name).join(', '),
      distance: (place.distance / 1000).toFixed(2),
    }));

    res.json({ restaurants: results });
  } catch (err) {
    console.error('❌ Foursquare error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Foursquare API failed' });
  }
});

app.get('/api/foursquare/cuisine', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    const response = await axios.get(
      'https://api.foursquare.com/v3/places/search',
      {
        headers: {
          Authorization:  FOURSQUARE_API_KEY,
        },
        params: {
          ll: `${lat},${lng}`,
          radius: 50,
          categories: 13065,
          limit: 1,
          sort: 'DISTANCE',
        },
      }
    );

    const place = response.data.results[0];
    const cuisine = place?.categories?.map(cat => cat.name).join(', ') || 'Unknown Cuisine';

    res.json({ cuisine });
  } catch (err) {
    console.error('❌ Foursquare Cuisine Fetch Failed:', err.response?.data || err.message);
    res.status(500).json({ cuisine: 'Unknown Cuisine' });
  }
});

// Always define all routes before starting the server
app.listen(PORT, () => {
  console.log(`🍽️ Foursquare proxy running at http://localhost:${PORT}`);
});
