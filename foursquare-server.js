const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = 5003;
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

app.get('/api/foursquare/nearby', async (req, res) => {
  const { lat, lng } = req.query;

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
          categories: 13065, // Restaurants
          limit: 20,
          sort: 'DISTANCE'
        }
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

app.listen(PORT, () => {
  console.log(`🍽️ Foursquare proxy running at http://localhost:${PORT}`);
});

app.get('/api/foursquare/cuisine', async (req, res) => {
    const { lat, lng } = req.query;
  
    try {
      const response = await axios.get(
        'https://api.foursquare.com/v3/places/search',
        {
          headers: {
            Authorization: FOURSQUARE_API_KEY,
          },
          params: {
            ll: `${lat},${lng}`,
            radius: 50, // Small radius to find place at exact location
            categories: 13065,
            limit: 1,
            sort: 'DISTANCE'
          }
        }
      );
  
      const place = response.data.results[0];
      const cuisine = place?.categories?.map(cat => cat.name).join(', ') || "Unknown Cuisine";
      res.json({ cuisine });
    } catch (err) {
      console.error('❌ Foursquare Cuisine Fetch Failed:', err.response?.data || err.message);
      res.status(500).json({ cuisine: "Unknown Cuisine" });
    }
  });
  