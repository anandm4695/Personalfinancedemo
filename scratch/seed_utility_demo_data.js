const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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

  // Let's create UUIDs for bills
  const bill1Id = crypto.randomUUID();
  const bill2Id = crypto.randomUUID();
  const bill3Id = crypto.randomUUID();
  const bill4Id = crypto.randomUUID();
  const bill5Id = crypto.randomUUID();
  const bill6Id = crypto.randomUUID();
  const bill7Id = crypto.randomUUID();

  // Test inserting without non-existent columns (check schema compatibility)
  const sampleBills = [
    {
      id: bill1Id,
      user_id: userId,
      category: "electricity",
      provider: "Tata Power",
      nickname: "Home Electricity (Mumbai)",
      account_number: "900012348765",
      amount: 3450,
      due_day: 18,
      auto_pay: true,
      owner: "self",
      notes: "Sub-meter 102A, 100 units green energy rebate"
    },
    {
      id: bill2Id,
      user_id: userId,
      category: "broadband",
      provider: "Airtel Xstream Fiber",
      nickname: "Home Wi-Fi 300Mbps",
      account_number: "02245901234",
      amount: 1179,
      due_day: 14,
      auto_pay: true,
      owner: "self",
      notes: "Includes Disney+ Hotstar & Netflix VIP pack"
    },
    {
      id: bill3Id,
      user_id: userId,
      category: "gas",
      provider: "Mahanagar Gas (MGL)",
      nickname: "Kitchen Piped Gas",
      account_number: "MGL-99882211",
      amount: 850,
      due_day: 25,
      auto_pay: false,
      owner: "self",
      notes: "Bi-monthly billing cycle based on meter reading"
    },
    {
      id: bill4Id,
      user_id: userId,
      category: "water",
      provider: "Municipal Corporation (BMC / MCGM)",
      nickname: "Water Supply & Sewage",
      account_number: "BMC-WT-400050",
      amount: 420,
      due_day: 28,
      auto_pay: false,
      owner: "self",
      notes: "Meter No. W-7721, domestic rate"
    },
    {
      id: bill5Id,
      user_id: userId,
      category: "maintenance",
      provider: "Residential Society Maintenance",
      nickname: "Apartment Monthly Maintenance",
      account_number: "FLAT-C-1402",
      amount: 6500,
      due_day: 10,
      auto_pay: true,
      owner: "self",
      notes: "Includes sinking fund, 2 car parking & clubhouse fees"
    },
    {
      id: bill6Id,
      user_id: userId,
      category: "mobile",
      provider: "Jio Postpaid Plus",
      nickname: "Primary Mobile Postpaid",
      account_number: "9820011223",
      amount: 471,
      due_day: 5,
      auto_pay: true,
      owner: "self",
      notes: "75GB family pool plan"
    },
    {
      id: bill7Id,
      user_id: userId,
      category: "cable_tv",
      provider: "Tata Play (Tata Sky)",
      nickname: "Living Room DTH",
      account_number: "1089223344",
      amount: 499,
      due_day: 22,
      auto_pay: false,
      owner: "self",
      notes: "HD Sports & News pack"
    }
  ];

  console.log("Inserting bills with valid UUIDs...");
  const { data: insertedBills, error: insertErr } = await supabase
    .from("bill_payments")
    .insert(sampleBills)
    .select();

  if (insertErr) {
    console.error("Error inserting bills:", insertErr.message);
    return;
  }
  console.log("Successfully inserted bills:", insertedBills.length);

  // Today's date calculations for payment records
  const today = new Date();
  const curYear = today.getFullYear();
  const curMonth = today.getMonth();

  const formatDate = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const prevMonthDate = (d) => {
    const m = curMonth === 0 ? 11 : curMonth - 1;
    const y = curMonth === 0 ? curYear - 1 : curYear;
    return formatDate(y, m, d);
  };

  const twoMonthsAgoDate = (d) => {
    const m = curMonth <= 1 ? 12 + (curMonth - 2) : curMonth - 2;
    const y = curMonth <= 1 ? curYear - 1 : curYear;
    return formatDate(y, m, d);
  };

  const curMonthDate = (d) => formatDate(curYear, curMonth, d);

  const sampleHistory = [
    {
      id: crypto.randomUUID(),
      user_id: userId,
      bill_id: bill1Id,
      paid_date: prevMonthDate(17),
      amount: 3210,
      units_consumed: 245,
      payment_method: "Auto-Debit / NACH",
      receipt_number: "TP-NACH-9921",
      notes: "Auto-debited on schedule"
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      bill_id: bill1Id,
      paid_date: twoMonthsAgoDate(18),
      amount: 3580,
      units_consumed: 280,
      payment_method: "Auto-Debit / NACH",
      receipt_number: "TP-NACH-8412",
      notes: "Higher summer cooling usage"
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      bill_id: bill2Id,
      paid_date: prevMonthDate(13),
      amount: 1179,
      payment_method: "Credit Card",
      receipt_number: "AIRTEL-CC-771",
      notes: "Paid via Airtel Thanks app"
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      bill_id: bill3Id,
      paid_date: twoMonthsAgoDate(24),
      amount: 820,
      units_consumed: 18,
      payment_method: "UPI",
      receipt_number: "UPI-MGL-4410",
      notes: "Bi-monthly bill settled"
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      bill_id: bill5Id,
      paid_date: curMonthDate(9),
      amount: 6500,
      payment_method: "Net Banking",
      receipt_number: "NEFT-SOC-10492",
      notes: "Society maintenance for current month"
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      bill_id: bill6Id,
      paid_date: curMonthDate(4),
      amount: 471,
      payment_method: "UPI",
      receipt_number: "UPI-JIO-8812",
      notes: "Paid on bill generation"
    },
    {
      id: crypto.randomUUID(),
      user_id: userId,
      bill_id: bill7Id,
      paid_date: prevMonthDate(21),
      amount: 499,
      payment_method: "UPI",
      receipt_number: "UPI-TP-5520",
      notes: "DTH monthly recharge"
    }
  ];

  console.log("Inserting payment history records...");
  const { data: insertedHistory, error: histErr } = await supabase
    .from("bill_payment_history")
    .insert(sampleHistory)
    .select();

  if (histErr) {
    console.error("Error inserting payment history:", histErr.message);
  } else {
    console.log("Successfully inserted payment history:", insertedHistory.length);
  }
}

main();
