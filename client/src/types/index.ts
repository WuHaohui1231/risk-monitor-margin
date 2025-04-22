// Client type
export interface Client {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// Position type
export interface Position {
  id: number;
  client_id: number;
  symbol: string;
  quantity: number;
  cost_basis: number;
  current_price: number;
  created_at: string;
  updated_at: string;
}

// Market data type
export interface MarketData {
  id: number;
  symbol: string;
  current_price: number;
  timestamp: string;
}

// Margin account type
export interface MarginAccount {
  id: number;
  client_id: number;
  loan_amount: number;
  created_at: string;
  updated_at: string;
}

// Position with calculated value
export interface PositionWithValue extends Position {
  positionValue: number;
}

// Margin status type
export interface MarginStatus {
  clientId: number;
  portfolioMarketValue: number;
  loanAmount: number;
  netEquity: number;
  totalMarginRequirement: number;
  marginShortfall: number;
  marginCallTriggered: boolean;
  positions: PositionWithValue[];
}

// Error response type
export interface ErrorResponse {
  error: string;
}

// API response types
export type ApiResponse<T> = T | ErrorResponse; 