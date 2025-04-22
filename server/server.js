const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const marketDataRoutes = require('./routes/marketDataRoutes');
const positionsRoutes = require('./routes/positionsRoutes');
const marginRoutes = require('./routes/marginRoutes');
const clientsRoutes = require('./routes/clientsRoutes');

// Import services
const twelveDataService = require('./services/twelveDataService');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/market-data', marketDataRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/margin', marginRoutes);
app.use('/api/clients', clientsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Risk Monitoring API' });
});

// Schedule market data updates - every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled market data update');
  try {
    await twelveDataService.updateAllMarketData();
  } catch (error) {
    console.error('Scheduled market data update failed:', error.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initial market data update
(async () => {
  try {
    console.log('Performing initial market data update');
    await twelveDataService.updateAllMarketData();
  } catch (error) {
    console.error('Initial market data update failed:', error.message);
  }
})(); 