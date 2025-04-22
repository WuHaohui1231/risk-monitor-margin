import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import ClientsList from './components/ClientsList';
import ClientPositions from './components/ClientPositions';
import MarginStatus from './components/MarginStatus';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="logo">Risk Monitor</div>
          <ul className="nav-links">
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/clients">Clients</Link>
            </li>
          </ul>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/client/:clientId" element={
              <div className="client-details">
                <ClientPositions />
                <MarginStatus />
              </div>
            } />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>&copy; 2023 Risk Monitor System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
