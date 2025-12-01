// ============= TIPOS DE BASE DE DATOS =============

export interface ProfileData {
  user_id: string;
  full_name: string | null;
  email: string | null;
  business_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  business_type: string | null;
  description: string | null;
  website: string | null;
  tax_id: string | null;
  avatar_url: string | null;
  tax_regime: string | null;
  fiscal_address: any | null;
  fiscal_data_verified: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface WalletData {
  user_id: string;
  balance: number;
  total_earnings: number;
  total_withdrawn: number;
  currency: string;
  last_transaction_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============= TIPOS DE RESPUESTA =============

export interface AsyncResult<T = any> {
  success: boolean;
  data?: T;
  error?: string | Error;
}

export interface MutationResult {
  success: boolean;
  error?: any;
}

// ============= TIPOS DE HANDLERS =============

export type AsyncHandler = () => Promise<AsyncResult>;
export type AsyncHandlerWithParam<T> = (param: T) => Promise<AsyncResult>;
export type VoidHandler = () => void;
