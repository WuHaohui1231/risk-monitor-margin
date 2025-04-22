import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Client } from '../types';
import { clientsApi } from '../services/api';

const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await clientsApi.getAll();
        setClients(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch clients');
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="clients-list">
      <h2>Clients</h2>
      {clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>
                  <Link to={`/client/${client.id}`}>View Portfolio</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientsList; 