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

-- Add sample data for clients
INSERT INTO clients (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Michael Johnson', 'michael@example.com'),
  ('Emily Davis', 'emily@example.com'),
  ('Robert Wilson', 'robert@example.com'),
  ('Sarah Brown', 'sarah@example.com'),
  ('David Miller', 'david@example.com'),
  ('Emma Taylor', 'emma@example.com');

-- Add sample data for positions
INSERT INTO positions (client_id, symbol, quantity, cost_basis) VALUES 
  -- John Doe's positions (client_id: 1)
  (1, 'AAPL', 100, 150.00),
  (1, 'MSFT', 50, 250.00),
  (1, 'GOOGL', 20, 2500.00),
  (1, 'AMZN', 15, 2900.00),
  (1, 'META', 80, 300.00),
  
  -- Jane Smith's positions (client_id: 2)
  (2, 'AMZN', 30, 3000.00),
  (2, 'TSLA', 50, 800.00),
  (2, 'NVDA', 40, 400.00),
  (2, 'AMD', 100, 90.00),
  
  -- Michael Johnson's positions (client_id: 3)
  (3, 'TSLA', 75, 750.00),
  (3, 'NVDA', 60, 350.00),
  (3, 'AAPL', 150, 140.00),
  (3, 'MSFT', 80, 240.00),
  (3, 'GOOGL', 25, 2400.00),
  
  -- Emily Davis's positions (client_id: 4)
  (4, 'META', 120, 280.00),
  (4, 'AMZN', 25, 2950.00),
  (4, 'NFLX', 40, 400.00),
  (4, 'DIS', 100, 120.00),
  
  -- Robert Wilson's positions (client_id: 5)
  (5, 'AAPL', 200, 145.00),
  (5, 'MSFT', 120, 230.00),
  (5, 'NVDA', 70, 380.00),
  
  -- Sarah Brown's positions (client_id: 6)
  (6, 'TSLA', 90, 780.00),
  (6, 'GOOG', 30, 2550.00),
  (6, 'MSFT', 130, 235.00),
  (6, 'AMZN', 20, 3050.00),
  
  -- David Miller's positions (client_id: 7)
  (7, 'AAPL', 180, 155.00),
  (7, 'AMZN', 35, 2980.00),
  (7, 'META', 150, 290.00),
  (7, 'NFLX', 60, 380.00),
  (7, 'TSLA', 100, 790.00),
  
  -- Emma Taylor's positions (client_id: 8)
  (8, 'MSFT', 160, 245.00),
  (8, 'GOOGL', 35, 2480.00),
  (8, 'AMD', 200, 85.00),
  (8, 'NVDA', 90, 370.00);

-- Add market data for all symbols
INSERT INTO market_data (symbol, current_price) VALUES 
  ('AAPL', 165.00),
  ('MSFT', 270.00),
  ('GOOGL', 2650.00),
  ('GOOG', 2645.00),
  ('AMZN', 3150.00),
  ('TSLA', 820.00),
  ('META', 320.00),
  ('NVDA', 430.00),
  ('AMD', 100.00),
  ('NFLX', 420.00),
  ('DIS', 130.00);

-- Add margin accounts
INSERT INTO margin_accounts (client_id, loan_amount) VALUES 
  (1, 25000.00),  -- John Doe: Moderate loan
  (2, 50000.00),  -- Jane Smith: Large loan
  (3, 100000.00), -- Michael Johnson: Very large loan (likely to trigger margin call)
  (4, 15000.00),  -- Emily Davis: Small loan
  (5, 35000.00),  -- Robert Wilson: Moderate loan
  (6, 75000.00),  -- Sarah Brown: Large loan (potential margin call)
  (7, 150000.00), -- David Miller: Very large loan (likely margin call)
  (8, 10000.00);  -- Emma Taylor: Small loan 