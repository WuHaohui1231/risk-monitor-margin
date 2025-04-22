# Risk Monitoring System

A full-stack application for monitoring client portfolio risk, calculating margin requirements, and generating margin calls when necessary.

## High-Level Architecture

This application is built using a modern full-stack architecture:

- **Frontend**: React.js with TypeScript for a responsive, typesafe user interface
- **Backend**: Node.js with Express.js for a RESTful API
- **Database**: PostgreSQL for persistent data storage

The system is divided into three main components:

1. **Backend Server**: Handles API requests, business logic for margin calculations, and data retrieval
2. **Frontend Client**: Provides a user interface for monitoring risk and portfolio status
3. **Database**: Stores client positions, market data, and margin account information


## Tech Stack Explanation

- **PostgreSQL**: Chosen for its robust relational data model, which works well for financial data where relationships between entities (clients, positions, etc.) are important. It also offers strong ACID compliance, which is crucial for financial applications.

- **Node.js/Express**: Provides a lightweight, high-performance backend that can handle asynchronous operations efficiently, such as fetching market data from external APIs.

- **React**: Offers a component-based architecture that's perfect for building a dynamic dashboard interface with real-time updates.

- **TypeScript**: Adds static typing to JavaScript, helping prevent common errors and improving code maintainability.

## Setup/Installation

### Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL (v12+ recommended)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
   ```
   psql -U postgres
   CREATE DATABASE risk_monitor;
   ```

2. Run the database schema script:
   ```
   psql -U postgres -d risk_monitor -f server/database/schema.sql
   ```

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your PostgreSQL credentials and Twelve Data API key.

4. Start the server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:5000 by default

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The client will run on http://localhost:3000

## Usage

### Dashboard

The main dashboard provides an overview of all clients' risk profiles, highlighting those with margin calls. You can:

- View a summary of total portfolio values and loan amounts
- See which clients have margin calls
- Access detailed information for individual clients

### Client Portfolio View

For each client, you can:

- View all positions with current market prices
- See the margin status, including whether a margin call is needed
- Monitor net equity and margin requirements

### API Endpoints

The backend provides several RESTful endpoints:

- `GET /api/market-data`: Get current market data for all tracked symbols
- `GET /api/positions/client/:clientId`: Get all positions for a specific client
- `GET /api/margin/status/:clientId`: Get margin status for a specific client

## Testing

The application includes sample data for testing purposes. You can:

1. Log in to view the dashboard with pre-populated client data
2. View margin calculations based on the provided positions and loan amounts
3. See how the system triggers margin calls when requirements aren't met

## Known Limitations

- The system uses the Twelve Data API for market prices, which may have rate limits on the free tier
- The margin calculation uses a simplified model with a fixed Maintenance Margin Rate (25%)
- In a production environment, you would want to implement authentication and role-based access controls

## Future Enhancements

- Add user authentication
- Implement more sophisticated margin calculations
- Create alerts and notifications
- Add historical data tracking and visualization 