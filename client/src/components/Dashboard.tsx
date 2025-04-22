import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { marginApi } from '../services/api';
import { MarginStatus } from '../types';

const Dashboard: React.FC = () => {
  const [allMarginStatuses, setAllMarginStatuses] = useState<MarginStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(60); // seconds
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(refreshInterval);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await marginApi.getAllStatuses();
      setAllMarginStatuses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch margin statuses');
      console.error('Error fetching margin statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Setup auto-refresh
    const intervalId = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchData();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  if (loading && allMarginStatuses.length === 0) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  // Count clients with margin calls
  const marginCallCount = allMarginStatuses.filter(
    (status) => status.marginCallTriggered
  ).length;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Risk Monitoring Dashboard</h1>
        <div className="refresh-info">
          <button onClick={fetchData} className="refresh-button">
            Refresh Now
          </button>
          <span>Auto-refresh in {timeUntilRefresh}s</span>
        </div>
      </div>
      
      <div className="summary-section">
        <div className="summary-card total-clients">
          <h3>Total Clients</h3>
          <p className="value">{allMarginStatuses.length}</p>
        </div>
        
        <div className="summary-card margin-calls">
          <h3>Margin Calls</h3>
          <p className={`value ${marginCallCount > 0 ? 'negative' : 'positive'}`}>
            {marginCallCount}
          </p>
        </div>
        
        <div className="summary-card total-portfolio">
          <h3>Total Portfolio Value</h3>
          <p className="value">
            ${allMarginStatuses.reduce((sum, status) => sum + status.portfolioMarketValue, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="summary-card total-loans">
          <h3>Total Loans</h3>
          <p className="value">
            ${allMarginStatuses.reduce((sum, status) => sum + status.loanAmount, 0).toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="clients-section">
        <h2>Client Risk Overview</h2>
        
        <table className="table">
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Portfolio Value</th>
              <th>Loan Amount</th>
              <th>Net Equity</th>
              <th>Margin Requirement</th>
              <th>Margin Shortfall</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allMarginStatuses.map((status) => {
              const statusClass = status.marginCallTriggered ? 'negative' : 'positive';
              
              return (
                <tr key={status.clientId} className={status.marginCallTriggered ? 'margin-call-row' : ''}>
                  <td>{status.clientId}</td>
                  <td>${status.portfolioMarketValue.toFixed(2)}</td>
                  <td>${status.loanAmount.toFixed(2)}</td>
                  <td>${status.netEquity.toFixed(2)}</td>
                  <td>${status.totalMarginRequirement.toFixed(2)}</td>
                  <td className={status.marginShortfall > 0 ? 'negative' : 'positive'}>
                    ${status.marginShortfall.toFixed(2)}
                  </td>
                  <td className={statusClass}>
                    {status.marginCallTriggered ? 'MARGIN CALL' : 'NORMAL'}
                  </td>
                  <td>
                    <Link to={`/client/${status.clientId}`} className="button">View Details</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard; 