import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Registration {
  id?: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  country: string;
  role: string;
  field_of_activity?: string;
  reason: string;
  created_at?: string;
  payment_ref?: string;
  payment_status?: string;
}
