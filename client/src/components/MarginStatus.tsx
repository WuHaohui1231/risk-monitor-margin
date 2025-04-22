import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { marginApi, clientsApi } from '../services/api';
import { MarginStatus as MarginStatusType, Client } from '../types';
import useRefreshTimer from '../hooks/useRefreshTimer';

const MarginStatus: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [marginStatus, setMarginStatus] = useState<MarginStatusType | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      
      // Fetch client info
      const clientResponse = await clientsApi.getById(parseInt(clientId));
      setClient(clientResponse.data);
      
      // Fetch margin status
      const marginResponse = await marginApi.getStatus(parseInt(clientId));
      setMarginStatus(marginResponse.data);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch margin data');
      console.error('Error fetching margin data:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Use the shared refresh timer hook
  const { timeUntilRefresh, triggerRefresh } = useRefreshTimer(fetchData, 30);

  if (loading && !marginStatus) return <div>Loading margin status...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!marginStatus || !client) return <div className="error">Margin data not available</div>;

  const marginCallClass = marginStatus.marginCallTriggered ? 'margin-call-alert' : '';

  // Position breakdown for the table
  const positionRows = marginStatus.positions.map((position) => (
    <tr key={position.symbol}>
      <td>{position.symbol}</td>
      <td>{position.quantity}</td>
      <td>${position.current_price.toFixed(2)}</td>
      <td>${position.positionValue.toFixed(2)}</td>
      <td>{((position.positionValue / marginStatus.portfolioMarketValue) * 100).toFixed(2)}%</td>
    </tr>
  ));

  return (
    <div className="margin-status">
      <div className="header">
        <h2>Margin Status for {client.name}</h2>
        <div className="refresh-info">
          <button onClick={triggerRefresh} className="refresh-button">
            Refresh Now
          </button>
          <span>Auto-refresh in {timeUntilRefresh}s</span>
        </div>
      </div>
      
      <div className={`margin-summary ${marginCallClass}`}>
        <div className="summary-grid">
          <div className="summary-item">
            <h3>Portfolio Value</h3>
            <p className="value">${marginStatus.portfolioMarketValue.toFixed(2)}</p>
          </div>
          
          <div className="summary-item">
            <h3>Loan Amount</h3>
            <p className="value">${marginStatus.loanAmount.toFixed(2)}</p>
          </div>
          
          <div className="summary-item">
            <h3>Net Equity</h3>
            <p className="value">${marginStatus.netEquity.toFixed(2)}</p>
          </div>
          
          <div className="summary-item">
            <h3>Margin Requirement</h3>
            <p className="value">${marginStatus.totalMarginRequirement.toFixed(2)}</p>
          </div>
          
          <div className="summary-item">
            <h3>Margin Shortfall</h3>
            <p className={`value ${marginStatus.marginShortfall > 0 ? 'negative' : 'positive'}`}>
              ${marginStatus.marginShortfall.toFixed(2)}
            </p>
          </div>
          
          <div className="summary-item status">
            <h3>Status</h3>
            <p className={`value ${marginStatus.marginCallTriggered ? 'negative' : 'positive'}`}>
              {marginStatus.marginCallTriggered ? 'MARGIN CALL' : 'NORMAL'}
            </p>
          </div>
        </div>
        
        {marginStatus.marginCallTriggered && (
          <div className="margin-call-warning">
            <h3>WARNING: MARGIN CALL TRIGGERED</h3>
            <p>This account has insufficient equity to meet margin requirements.</p>
          </div>
        )}
      </div>
      
      <div className="positions-section">
        <h3>Position Breakdown</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Current Price</th>
              <th>Market Value</th>
              <th>% of Portfolio</th>
            </tr>
          </thead>
          <tbody>
            {positionRows}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarginStatus; 