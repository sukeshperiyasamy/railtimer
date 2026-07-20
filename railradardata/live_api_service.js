// live_api_service.js
// Production-ready RailRadar API client module for Node.js / Express

const axios = require('axios');

class RailRadarClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.RAILRADAR_API_KEY || 'rr_live_demo_key';
    this.baseUrl = 'https://api.railradar.in/v1';
  }

  get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * GET /v1/trains/{number} - Train Details & Full Schedule
   */
  async getTrainDetails(trainNumber) {
    try {
      const res = await axios.get(`${this.baseUrl}/trains/${trainNumber}`, { headers: this.headers });
      return res.data;
    } catch (err) {
      this.handleError('getTrainDetails', err);
    }
  }

  /**
   * GET /v1/trains/{number}/live - Live Status & Delay
   */
  async getLiveStatus(trainNumber) {
    try {
      const res = await axios.get(`${this.baseUrl}/trains/${trainNumber}/live`, { headers: this.headers });
      return res.data;
    } catch (err) {
      this.handleError('getLiveStatus', err);
    }
  }

  /**
   * GET /v1/trains/between/{from}/{to} - Trains Between Stations
   */
  async getTrainsBetween(fromCode, toCode) {
    try {
      const res = await axios.get(`${this.baseUrl}/trains/between/${fromCode}/${toCode}`, { headers: this.headers });
      return res.data;
    } catch (err) {
      this.handleError('getTrainsBetween', err);
    }
  }

  /**
   * GET /v1/stations/{code}/trains - Station Board
   */
  async getStationBoard(stationCode) {
    try {
      const res = await axios.get(`${this.baseUrl}/stations/${stationCode}/trains`, { headers: this.headers });
      return res.data;
    } catch (err) {
      this.handleError('getStationBoard', err);
    }
  }

  /**
   * GET /v1/trains/{number}/route - Route Geometry (GeoJSON)
   */
  async getRouteGeometry(trainNumber) {
    try {
      const res = await axios.get(`${this.baseUrl}/trains/${trainNumber}/route`, { headers: this.headers });
      return res.data;
    } catch (err) {
      this.handleError('getRouteGeometry', err);
    }
  }

  /**
   * GET /v1/lookup/trains - Flat train number -> name search map
   */
  async lookupTrains() {
    try {
      const res = await axios.get(`${this.baseUrl}/lookup/trains`, { headers: this.headers });
      return res.data;
    } catch (err) {
      this.handleError('lookupTrains', err);
    }
  }

  handleError(method, err) {
    console.error(`[RailRadar API Error in ${method}]:`, err.response?.data || err.message);
    throw new Error(err.response?.data?.meta?.message || err.message);
  }
}

module.exports = RailRadarClient;
