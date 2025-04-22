const db = require('../database/db');

// Maintenance Margin Rate (MMR) - 25% as specified in the requirements
const MAINTENANCE_MARGIN_RATE = 0.25;

/**
 * Calculate the margin status for a specific client
 * @param {number} clientId - The client ID to calculate margin for
 * @returns {Promise<Object>} Margin status information
 */
const calculateMarginStatus = async (clientId) => {
  try {
    // Get client's positions with current market prices
    const positionsResult = await db.query(
      `SELECT p.symbol, p.quantity, p.cost_basis, m.current_price 
       FROM positions p
       JOIN market_data m ON p.symbol = m.symbol
       WHERE p.client_id = $1`,
      [clientId]
    );
    
    // Get client's loan amount
    const loanResult = await db.query(
      `SELECT loan_amount FROM margin_accounts WHERE client_id = $1`,
      [clientId]
    );
    
    // If client has no positions or no margin account, return error
    if (positionsResult.rows.length === 0) {
      return {
        error: 'Client has no positions'
      };
    }
    
    if (loanResult.rows.length === 0) {
      return {
        error: 'Client has no margin account'
      };
    }
    
    const positions = positionsResult.rows;
    const loanAmount = parseFloat(loanResult.rows[0].loan_amount);
    
    // Calculate portfolio market value
    let portfolioMarketValue = 0;
    
    // Create a positions array with calculated values for the response
    const positionsWithValues = positions.map(position => {
      const quantity = parseInt(position.quantity);
      const currentPrice = parseFloat(position.current_price);
      const positionValue = quantity * currentPrice;
      
      // Add to portfolio total
      portfolioMarketValue += positionValue;
      
      return {
        symbol: position.symbol,
        quantity,
        costBasis: parseFloat(position.cost_basis),
        currentPrice,
        positionValue
      };
    });
    
    // Calculate net equity
    const netEquity = portfolioMarketValue - loanAmount;
    
    // Calculate total margin requirement
    const totalMarginRequirement = MAINTENANCE_MARGIN_RATE * portfolioMarketValue;
    
    // Calculate margin shortfall
    const marginShortfall = totalMarginRequirement - netEquity;
    
    // Determine if margin call is needed
    const marginCallTriggered = marginShortfall > 0;
    
    return {
      clientId,
      portfolioMarketValue,
      loanAmount,
      netEquity,
      totalMarginRequirement,
      marginShortfall,
      marginCallTriggered,
      positions: positionsWithValues
    };
  } catch (error) {
    console.error(`Error calculating margin status for client ${clientId}:`, error.message);
    throw error;
  }
};

/**
 * Calculate margin status for all clients
 * @returns {Promise<Array>} Array of client margin statuses
 */
const calculateAllClientsMarginStatus = async () => {
  try {
    // Get all client IDs
    const clientsResult = await db.query(
      'SELECT id FROM clients'
    );
    
    const clients = clientsResult.rows;
    const marginStatuses = [];
    
    // Calculate margin status for each client
    for (const client of clients) {
      const marginStatus = await calculateMarginStatus(client.id);
      marginStatuses.push(marginStatus);
    }
    
    return marginStatuses;
  } catch (error) {
    console.error('Error calculating all clients margin status:', error.message);
    throw error;
  }
};

module.exports = {
  calculateMarginStatus,
  calculateAllClientsMarginStatus
}; 