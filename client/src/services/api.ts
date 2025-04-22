import axios from 'axios';
import { Client, MarginStatus, MarketData, Position } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Market data API
export const marketDataApi = {
  getAll: () => api.get<MarketData[]>('/market-data'),
  getBySymbol: (symbol: string) => api.get<MarketData>(`/market-data/${symbol}`),
  updateAll: () => api.post('/market-data/update'),
};

// Positions API
export const positionsApi = {
  getAll: () => api.get<Position[]>('/positions'),
  getByClientId: (clientId: number) => api.get<Position[]>(`/positions/client/${clientId}`),
  create: (position: Omit<Position, 'id' | 'created_at' | 'updated_at' | 'current_price'>) => 
    api.post<Position>('/positions', position),
  update: (id: number, position: Pick<Position, 'quantity' | 'cost_basis'>) => 
    api.put<Position>(`/positions/${id}`, position),
  delete: (id: number) => api.delete(`/positions/${id}`),
};

// Margin API
export const marginApi = {
  getStatus: (clientId: number) => api.get<MarginStatus>(`/margin/status/${clientId}`),
  getAllStatuses: () => api.get<MarginStatus[]>('/margin/status'),
  updateLoan: (clientId: number, loanAmount: number) => 
    api.put(`/margin/loan/${clientId}`, { loan_amount: loanAmount }),
};

// Clients API
export const clientsApi = {
  getAll: () => api.get<Client[]>('/clients'),
  getById: (id: number) => api.get<Client>(`/clients/${id}`),
  create: (client: Pick<Client, 'name' | 'email'>) => api.post<Client>('/clients', client),
  update: (id: number, client: Partial<Pick<Client, 'name' | 'email'>>) => 
    api.put<Client>(`/clients/${id}`, client),
  delete: (id: number) => api.delete(`/clients/${id}`),
}; 