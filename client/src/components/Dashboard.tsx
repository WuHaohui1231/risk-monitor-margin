import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { marginApi, clientsApi } from '../services/api';
import { MarginStatus } from '../types';
import useRefreshTimer from '../hooks/useRefreshTimer';

const Dashboard: React.FC = () => {
  const [allMarginStatuses, setAllMarginStatuses] = useState<MarginStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
  const [clientNames, setClientNames] = useState<Record<number, string>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marginApi.getAllStatuses();
      setAllMarginStatuses(response.data);
      
      // Fetch client names
      try {
        const clientsResponse = await clientsApi.getAll();
        const clientsMap: Record<number, string> = {};
        clientsResponse.data.forEach((client: any) => {
          clientsMap[client.id] = client.name;
        });
        setClientNames(clientsMap);
      } catch (clientErr) {
        console.error('Error fetching client names:', clientErr);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch margin statuses');
      console.error('Error fetching margin statuses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use the shared refresh timer hook
  const { timeUntilRefresh, triggerRefresh } = useRefreshTimer(fetchData, 30);

  if (loading && allMarginStatuses.length === 0) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  // Toggle expanded view for client positions
  const toggleClientExpand = (clientId: number) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
    } else {
      setExpandedClient(clientId);
    }
  };

  // Safe number formatter
  const formatNumber = (value: number | undefined | null): string => {
    return value !== undefined && value !== null ? value.toFixed(2) : '0.00';
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Risk Monitoring Dashboard</h1>
        <div className="refresh-info">
          <button onClick={triggerRefresh} className="refresh-button">
            Refresh Now
          </button>
          <span>Auto-refresh in {timeUntilRefresh}s</span>
        </div>
      </div>
      
      <div className="clients-section">
        <h2>Client Risk Overview</h2>
        
        {allMarginStatuses.map((status) => {
          const statusClass = status.marginCallTriggered ? 'negative' : 'positive';
          const isExpanded = expandedClient === status.clientId;
          const clientName = clientNames[status.clientId] || 'Unknown';
          
          return (
            <div 
              key={status.clientId} 
              className={`client-card ${status.marginCallTriggered ? 'margin-call' : ''}`}
            >
              <div className="client-header">
                <h3>Client: {clientName} (ID: {status.clientId})</h3>
                <button 
                  className="toggle-button"
                  onClick={() => toggleClientExpand(status.clientId)}
                >
                  {isExpanded ? 'Hide Positions' : 'Show Positions'}
                </button>
                {/* <Link to={`/client/${status.clientId}`} className="button">
                  View Details
                </Link> */}
              </div>
              
              <div className="margin-metrics">
                <div className="metric">
                  <span className="label">Portfolio Value:</span>
                  <span className="value">${formatNumber(status.portfolioMarketValue)}</span>
                </div>
                <div className="metric">
                  <span className="label">Loan Amount:</span>
                  <span className="value">${formatNumber(status.loanAmount)}</span>
                </div>
                <div className="metric">
                  <span className="label">Net Equity:</span>
                  <span className="value">${formatNumber(status.netEquity)}</span>
                </div>
                <div className="metric">
                  <span className="label">Margin Requirement:</span>
                  <span className="value">${formatNumber(status.totalMarginRequirement)}</span>
                </div>
                <div className="metric">
                  <span className="label">Margin Shortfall:</span>
                  <span className={`value ${status.marginShortfall > 0 ? 'negative' : 'positive'}`}>
                    ${formatNumber(status.marginShortfall)}
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Status:</span>
                  <span className={`value ${statusClass}`}>
                    {status.marginCallTriggered ? 'MARGIN CALL' : 'NORMAL'}
                  </span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="positions-section">
                  <h4>Client Positions</h4>
                  {status.positions && status.positions.length > 0 ? (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Symbol</th>
                          <th>Quantity</th>
                          <th>Current Price</th>
                          <th>Market Value</th>
                          {/* <th>Cost Basis</th> */}
                          <th>% of Portfolio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {status.positions.map((position) => {
                          // Calculate position value if not present
                          const positionValue = position.positionValue || 
                            (position.quantity * (position.current_price || 0));
                          
                          // Calculate percentage of portfolio
                          const portfolioPercentage = status.portfolioMarketValue && status.portfolioMarketValue > 0
                            ? (positionValue / status.portfolioMarketValue) * 100
                            : 0;
                            
                          return (
                            <tr key={position.symbol}>
                              <td>{position.symbol}</td>
                              <td>{position.quantity}</td>
                              <td>${formatNumber(positionValue / position.quantity)}</td>
                              <td>${formatNumber(positionValue)}</td>
                              {/* <td>${formatNumber(position.cost_basis)}</td> */}
                              <td>{formatNumber(portfolioPercentage)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p>No positions found for this client.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard; 