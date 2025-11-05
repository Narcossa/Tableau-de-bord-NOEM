export const SUPABASE_URL = "https://qydukezdxohxuvwqiedq.supabase.co";
export const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZHVrZXpkeG9oeHV2d3FpZWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjY0ODcsImV4cCI6MjA3NzkwMjQ4N30.ndxryLkgzUXQ7IcGsLDjmJGfNUWQC7GnoAGw8ZPafBM";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
