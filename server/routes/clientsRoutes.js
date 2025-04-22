const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all clients
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clients');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific client
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching client ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new client
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Input validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if email already exists
    const emailCheck = await db.query('SELECT id FROM clients WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Insert new client
    const result = await db.query(
      'INSERT INTO clients (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding client:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    // Input validation
    if (!name && !email) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Check if client exists
    const clientCheck = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Check if email already exists (if updating email)
    if (email && email !== clientCheck.rows[0].email) {
      const emailCheck = await db.query('SELECT id FROM clients WHERE email = $1', [email]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    // Update client
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (name) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    
    if (email) {
      updateFields.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    values.push(id);
    
    const result = await db.query(
      `UPDATE clients SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating client ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if client exists
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1', [id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Delete client (cascading will delete positions and margin account)
    await db.query('DELETE FROM clients WHERE id = $1', [id]);
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(`Error deleting client ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 