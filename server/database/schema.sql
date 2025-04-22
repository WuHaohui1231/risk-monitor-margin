CREATE DATABASE risk_monitor;

\c risk_monitor;

-- Create tables

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE positions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  cost_basis DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_client_symbol UNIQUE (client_id, symbol)
);

CREATE TABLE market_data (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  current_price DECIMAL(12, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_symbol UNIQUE (symbol)
);

CREATE TABLE margin_accounts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  loan_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_client_margin UNIQUE (client_id)
);

-- Add some sample data
INSERT INTO clients (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com');

INSERT INTO positions (client_id, symbol, quantity, cost_basis) VALUES 
  (1, 'AAPL', 100, 150.00),
  (1, 'MSFT', 50, 250.00),
  (1, 'GOOGL', 20, 2500.00),
  (2, 'AMZN', 30, 3000.00),
  (2, 'TSLA', 50, 800.00);

INSERT INTO market_data (symbol, current_price) VALUES 
  ('AAPL', 155.00),
  ('MSFT', 260.00),
  ('GOOGL', 2600.00),
  ('AMZN', 3100.00),
  ('TSLA', 820.00);

INSERT INTO margin_accounts (client_id, loan_amount) VALUES 
  (1, 25000.00),
  (2, 50000.00); 