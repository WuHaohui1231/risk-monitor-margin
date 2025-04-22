const express = require('express');
const router = express.Router();
const db = require('../database/db');
const twelveDataService = require('../services/twelveDataService');

// Get all market data
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM market_data');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching market data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market data for a specific symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await db.query(
      'SELECT * FROM market_data WHERE symbol = $1',
      [symbol]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Symbol not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching market data for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manually trigger an update of all market data
router.post('/update', async (req, res) => {
  try {
    await twelveDataService.updateAllMarketData();
    res.json({ message: 'Market data update initiated' });
  } catch (error) {
    console.error('Error updating market data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 