import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Position, Client } from '../types';
import { positionsApi, clientsApi } from '../services/api';

const ClientPositions: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [positions, setPositions] = useState<Position[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        
        // Fetch client info
        const clientResponse = await clientsApi.getById(parseInt(clientId));
        setClient(clientResponse.data);
        
        // Fetch client positions
        const positionsResponse = await positionsApi.getByClientId(parseInt(clientId));
        setPositions(positionsResponse.data);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch client data');
        console.error('Error fetching client data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading) return <div>Loading client positions...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!client) return <div className="error">Client not found</div>;

  const calculatePositionValue = (position: Position): number => {
    return position.quantity * position.current_price;
  };

  const calculateTotalValue = (): number => {
    return positions.reduce((total, position) => total + calculatePositionValue(position), 0);
  };

  return (
    <div className="client-positions">
      <h2>Positions for {client.name}</h2>
      
      <div className="summary">
        <h3>Portfolio Summary</h3>
        <p>Total Portfolio Value: ${calculateTotalValue().toFixed(2)}</p>
      </div>
      
      {positions.length === 0 ? (
        <p>No positions found for this client.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Cost Basis</th>
              <th>Current Price</th>
              <th>Market Value</th>
              <th>Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const marketValue = calculatePositionValue(position);
              const costBasisTotal = position.quantity * position.cost_basis;
              const profitLoss = marketValue - costBasisTotal;
              const profitLossPercent = (profitLoss / costBasisTotal) * 100;
              
              return (
                <tr key={position.id}>
                  <td>{position.symbol}</td>
                  <td>{position.quantity}</td>
                  <td>${position.cost_basis.toFixed(2)}</td>
                  <td>${position.current_price.toFixed(2)}</td>
                  <td>${marketValue.toFixed(2)}</td>
                  <td className={profitLoss >= 0 ? 'profit' : 'loss'}>
                    ${profitLoss.toFixed(2)} ({profitLossPercent.toFixed(2)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientPositions; 