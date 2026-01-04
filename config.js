import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
console.log (createClient);
const supaKey = 'https://ivuahrbcszzybdfeiawd.supabase.co';
const supaUrl = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dWFocmJjc3p6eWJkZmVpYXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjUzMTIsImV4cCI6MjA3ODI0MTMxMn0.V_KwDl63VRyoAKn2fHdY-UpDnONrypF2o_0g7TncaB4'
const supaBase = createClient (supaKey , supaUrl);

export default supaBase