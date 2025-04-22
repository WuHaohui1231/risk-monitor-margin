const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all positions
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.name as client_name, m.current_price 
      FROM positions p
      JOIN clients c ON p.client_id = c.id
      JOIN market_data m ON p.symbol = m.symbol
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all positions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get positions for a specific client
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const result = await db.query(`
      SELECT p.*, m.current_price 
      FROM positions p
      JOIN market_data m ON p.symbol = m.symbol
      WHERE p.client_id = $1
    `, [clientId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No positions found for this client' });
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching positions for client ${req.params.clientId}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new position
router.post('/', async (req, res) => {
  try {
    const { client_id, symbol, quantity, cost_basis } = req.body;
    
    // Input validation
    if (!client_id || !symbol || !quantity || !cost_basis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if client exists
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1', [client_id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Insert new position or update if exists
    const result = await db.query(`
      INSERT INTO positions (client_id, symbol, quantity, cost_basis)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (client_id, symbol)
      DO UPDATE SET 
        quantity = $3,
        cost_basis = $4,
        updated_at = NOW()
      RETURNING *
    `, [client_id, symbol, quantity, cost_basis]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding position:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a position
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, cost_basis } = req.body;
    
    // Input validation
    if (!quantity || !cost_basis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await db.query(`
      UPDATE positions
      SET quantity = $1, cost_basis = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [quantity, cost_basis, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating position ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a position
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM positions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error(`Error deleting position ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 