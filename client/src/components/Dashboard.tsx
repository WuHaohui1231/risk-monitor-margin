import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { marginApi } from '../services/api';
import { MarginStatus } from '../types';
import useRefreshTimer from '../hooks/useRefreshTimer';

const Dashboard: React.FC = () => {
  const [allMarginStatuses, setAllMarginStatuses] = useState<MarginStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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
  }, []);

  // Use the shared refresh timer hook
  const { timeUntilRefresh, triggerRefresh } = useRefreshTimer(fetchData, 30);

  if (loading && allMarginStatuses.length === 0) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

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