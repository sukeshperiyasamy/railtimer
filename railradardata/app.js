// app.js - RailDetails Frontend Application Logic

class RailDetailsClient {
  constructor() {
    this.fallbackData = null;
  }

  async loadFallbackData() {
    if (!this.fallbackData) {
      try {
        const response = await fetch('trains_data.json');
        this.fallbackData = await response.json();
      } catch (err) {
        this.fallbackData = {};
      }
    }
    return this.fallbackData;
  }

  /**
   * Fetch train schedule: First try Express Backend API (/api/train/:number),
   * fallback to local JSON dataset if server is offline or in static demo mode.
   */
  async getTrainSchedule(query) {
    const cleanQuery = query.trim();

    // 1. Try Backend Server Proxy (/api/train/:number)
    try {
      const response = await fetch(`/api/train/${cleanQuery}`);
      if (response.ok) {
        const result = await response.json();
        if (result && result.success && result.data) {
          return this.formatApiData(result.data);
        }
      }
    } catch (e) {
      console.log('Backend server API unavailable. Falling back to local offline dataset...');
    }

    // 2. Fallback to Local Offline JSON Dataset
    const fallback = await this.loadFallbackData();
    if (fallback[cleanQuery]) {
      return fallback[cleanQuery];
    }

    // Partial search in fallback
    const foundKey = Object.keys(fallback).find(key => {
      const train = fallback[key];
      return train.number.includes(cleanQuery) || 
             train.name.toLowerCase().includes(cleanQuery.toLowerCase());
    });

    if (foundKey) {
      return fallback[foundKey];
    }

    return null;
  }

  formatApiData(data) {
    return {
      number: data.number || data.train_number,
      name: data.name || data.train_name,
      route: `${data.from_station || 'Origin'} ➔ ${data.to_station || 'Destination'}`,
      runsOn: data.runsOn || 'Sun, Mon, Tue, Wed, Thu, Fri, Sat',
      classes: data.classes || '1A, 2A, 3A, SL',
      totalDistance: data.totalDistance || 'Scheduled Route',
      schedule: Array.isArray(data.schedule) ? data.schedule.map((stn, idx) => ({
        sn: idx + 1,
        station: stn.station_name || stn.station || stn.code,
        code: stn.station_code || stn.code || 'STN',
        arr: stn.arrival || stn.arr || '--',
        dep: stn.departure || stn.dep || '--',
        halt: stn.halt || '--',
        dist: stn.distance || `${idx * 50} km`,
        day: stn.day || 1
      })) : []
    };
  }
}

const client = new RailDetailsClient();

// DOM Elements
const trainInput = document.getElementById('trainInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const trainNumberEl = document.getElementById('trainNumber');
const trainNameEl = document.getElementById('trainName');
const routeSummaryEl = document.getElementById('routeSummary');
const runsOnEl = document.getElementById('runsOn');
const totalDistanceEl = document.getElementById('totalDistance');
const scheduleBodyEl = document.getElementById('scheduleBody');
const chips = document.querySelectorAll('.chip');

// Search Event Handlers
async function handleSearch(trainQuery) {
  const query = trainQuery || trainInput.value;
  if (!query) return;

  searchBtn.textContent = 'Searching...';
  searchBtn.disabled = true;

  try {
    const trainData = await client.getTrainSchedule(query);

    if (trainData) {
      renderTrainDetails(trainData);
    } else {
      alert(`No train found for "${query}". Try popular trains like 12951, 22436, 12002, or 12626.`);
    }
  } catch (err) {
    console.error('Search error:', err);
  } finally {
    searchBtn.textContent = 'Search Schedule';
    searchBtn.disabled = false;
  }
}

function renderTrainDetails(data) {
  trainNumberEl.textContent = data.number;
  trainNameEl.textContent = data.name;
  routeSummaryEl.textContent = data.route;
  runsOnEl.textContent = data.runsOn;
  totalDistanceEl.textContent = data.totalDistance;

  // Clear & build table
  scheduleBodyEl.innerHTML = '';
  if (data.schedule && data.schedule.length > 0) {
    data.schedule.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.sn}</td>
        <td><strong>${row.station}</strong></td>
        <td><span class="stn-code">${row.code}</span></td>
        <td>${row.arr}</td>
        <td>${row.dep}</td>
        <td>${row.halt}</td>
        <td>${row.dist}</td>
        <td>Day ${row.day}</td>
      `;
      scheduleBodyEl.appendChild(tr);
    });
  } else {
    scheduleBodyEl.innerHTML = `<tr><td colspan="8" style="text-align:center;">No station schedule details available for this train.</td></tr>`;
  }

  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Event Listeners
searchBtn.addEventListener('click', () => handleSearch());

trainInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const trainNo = chip.getAttribute('data-train');
    trainInput.value = trainNo;
    handleSearch(trainNo);
  });
});

// Auto load default train on startup
window.addEventListener('DOMContentLoaded', () => {
  handleSearch('12951');
});
