const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_DEMO_URL || env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_DEMO_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: env.VITE_DEMO_USER_EMAIL,
    password: env.VITE_DEMO_USER_PASSWORD
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  const userId = authData.user.id;
  console.log("Logged into Demo account as user:", userId);

  const { data: bills } = await supabase.from("bill_payments").select("*").eq("user_id", userId);
  const { data: history } = await supabase.from("bill_payment_history").select("*").eq("user_id", userId);

  console.log(`\n=== DEMO SUPABASE VERIFICATION ===`);
  console.log(`Bills retrieved: ${bills ? bills.length : 0}`);
  bills?.forEach(b => {
    console.log(`- [${b.category.toUpperCase()}] ${b.nickname || b.provider} (₹${b.amount}/mo, Due day: ${b.due_day}, AutoPay: ${b.auto_pay})`);
  });

  console.log(`\nPayment History records: ${history ? history.length : 0}`);
  history?.forEach(h => {
    console.log(`- Paid ₹${h.amount} on ${h.paid_date} via ${h.payment_method} (${h.notes})`);
  });
}

main();
