const axios = require('axios');
require('dotenv').config();
const db = require('../database/db');

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

/**
 * Fetch real-time price data for a list of symbols
 * @param {Array} symbols - Array of stock symbols
 * @returns {Promise<Object>} - Price data for the symbols
 */
const fetchPriceData = async (symbols) => {
  try {
    const symbolString = symbols.join(',');
    const response = await axios.get(`${BASE_URL}/price`, {
      params: {
        symbol: symbolString,
        apikey: TWELVE_DATA_API_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching price data:', error.message);
    throw error;
  }
};

/**
 * Update market data in the database
 * @param {string} symbol - Stock symbol
 * @param {number} price - Current price
 * @returns {Promise<void>}
 */
const updateMarketData = async (symbol, price) => {
  try {
    // Upsert market data (insert if not exists, update if exists)
    await db.query(
      `INSERT INTO market_data (symbol, current_price) 
       VALUES ($1, $2) 
       ON CONFLICT (symbol) 
       DO UPDATE SET current_price = $2, timestamp = NOW()`,
      [symbol, price]
    );
  } catch (error) {
    console.error(`Error updating market data for ${symbol}:`, error.message);
    throw error;
  }
};

/**
 * Fetch all stock symbols from the positions table
 * @returns {Promise<Array>} - List of unique stock symbols
 */
const getAllSymbols = async () => {
  try {
    const result = await db.query(
      'SELECT DISTINCT symbol FROM positions'
    );
    return result.rows.map(row => row.symbol);
  } catch (error) {
    console.error('Error fetching all symbols:', error.message);
    throw error;
  }
};

/**
 * Update all market data for all symbols in the positions table
 * @returns {Promise<void>}
 */
const updateAllMarketData = async () => {
  try {
    // Get all unique symbols from positions
    const symbols = await getAllSymbols();
    
    if (symbols.length === 0) {
      console.log('No symbols to update');
      return;
    }
    
    console.log(`Updating market data for ${symbols.length} symbols: ${symbols.join(', ')}`);
    
    // Fetch price data for all symbols
    const priceData = await fetchPriceData(symbols);
    
    // Update market data in the database
    for (const symbol of symbols) {
      if (priceData[symbol] || (priceData.hasOwnProperty(symbol) && priceData[symbol].price)) {
        const price = parseFloat(priceData[symbol].price || priceData[symbol]);
        await updateMarketData(symbol, price);
      } else {
        console.warn(`No price data returned for ${symbol}`);
      }
    }
    
    console.log('Market data update completed');
  } catch (error) {
    console.error('Error updating all market data:', error.message);
    throw error;
  }
};

module.exports = {
  fetchPriceData,
  updateMarketData,
  getAllSymbols,
  updateAllMarketData,
}; 