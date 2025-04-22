const express = require('express');
const router = express.Router();
const db = require('../database/db');
const marginService = require('../services/marginService');

// Get margin status for a specific client
router.get('/status/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Calculate margin status
    const marginStatus = await marginService.calculateMarginStatus(parseInt(clientId));
    
    if (marginStatus.error) {
      return res.status(404).json({ error: marginStatus.error });
    }
    
    res.json(marginStatus);
  } catch (error) {
    console.error(`Error calculating margin status for client ${req.params.clientId}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get margin status for all clients
router.get('/status', async (req, res) => {
  try {
    const marginStatuses = await marginService.calculateAllClientsMarginStatus();
    res.json(marginStatuses);
  } catch (error) {
    console.error('Error calculating all clients margin status:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update loan amount for a client
router.put('/loan/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { loan_amount } = req.body;
    
    // Input validation
    if (loan_amount === undefined) {
      return res.status(400).json({ error: 'Missing loan_amount field' });
    }
    
    // Check if client exists
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Update loan amount
    const result = await db.query(`
      UPDATE margin_accounts
      SET loan_amount = $1, updated_at = NOW()
      WHERE client_id = $2
      RETURNING *
    `, [loan_amount, clientId]);
    
    if (result.rows.length === 0) {
      // Create new margin account if it doesn't exist
      const newAccountResult = await db.query(`
        INSERT INTO margin_accounts (client_id, loan_amount)
        VALUES ($1, $2)
        RETURNING *
      `, [clientId, loan_amount]);
      
      res.status(201).json(newAccountResult.rows[0]);
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error(`Error updating loan amount for client ${req.params.clientId}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 