import { createClient } from '@supabase/supabase-js';

// 1. Your Project URL
const supabaseUrl = 'https://srpdqnccyncsblmsfsnm.supabase.co';

// 2. PASTE YOUR ANON KEY HERE (starts with 'ey...')
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycGRxbmNjeW5jc2JsbXNmc25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDY5MzYsImV4cCI6MjA4MjQyMjkzNn0.gZIREtGfEmZGczP6jCcBV8QnE27Rl1_2DUFc9mK1CnY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);