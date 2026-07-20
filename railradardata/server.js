// server.js
// Express backend proxy for RailRadar API & static file serving

const express = require('express');
const path = require('path');
const RailRadarClient = require('./live_api_service');

const app = express();
const PORT = process.env.PORT || 3000;
const client = new RailRadarClient(process.env.RAILRADAR_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 1. Train Details API Endpoint
app.get('/api/train/:number', async (req, res) => {
  try {
    const data = await client.getTrainDetails(req.params.number);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Live Status Endpoint
app.get('/api/train/:number/live', async (req, res) => {
  try {
    const data = await client.getLiveStatus(req.params.number);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Station Board Endpoint
app.get('/api/station/:code/trains', async (req, res) => {
  try {
    const data = await client.getStationBoard(req.params.code);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Trains Between Stations
app.get('/api/trains/between/:from/:to', async (req, res) => {
  try {
    const data = await client.getTrainsBetween(req.params.from, req.params.to);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚆 RailDetails Server running on http://localhost:${PORT}`);
});
