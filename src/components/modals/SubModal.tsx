import React, { useState } from "react";
import { THEME } from "../../utils/constants";
import { useMasterData, formatProfileOption } from "../../utils/masterData";
import { Modal, ModalActions } from "../ui/Modal";
import { Field } from "../ui/Form";
import { ServiceLogo, resolveBrand } from "../ui/BrandLogos";
import { CreditCard, Smartphone, Landmark, Apple, PlayCircle, RefreshCw, Zap } from "lucide-react";
import { getSubscriptionMonthlyEquivalent, fmtINRFull } from "../../utils/finance";

export interface SubscriptionItem {
  id?: string;
  owner?: string;
  name: string;
  category: string;
  amount: number | string;
  cycle: string;
  renewalDate?: string;
  paymentMethod?: string;
  autopay?: boolean;
  remark?: string;
  website?: string;
  lastPaidAmount?: number;
  paused?: boolean;
}

interface PresetItem {
  name: string;
  category: string;
  website: string;
  cycle: string;
  defaultAmount?: number;
  tiers?: { label: string; amount: number; cycle: string }[];
}

const POPULAR_PRESETS: PresetItem[] = [
  {
    name: "Netflix",
    category: "Entertainment",
    website: "netflix.com",
    cycle: "monthly",
    defaultAmount: 649,
    tiers: [
      { label: "Mobile (₹149)", amount: 149, cycle: "monthly" },
      { label: "Basic (₹199)", amount: 199, cycle: "monthly" },
      { label: "Standard (₹499)", amount: 499, cycle: "monthly" },
      { label: "Premium 4K (₹649)", amount: 649, cycle: "monthly" },
    ],
  },
  {
    name: "Spotify",
    category: "Entertainment",
    website: "spotify.com",
    cycle: "monthly",
    defaultAmount: 119,
    tiers: [
      { label: "Individual (₹119/mo)", amount: 119, cycle: "monthly" },
      { label: "Duo (₹149/mo)", amount: 149, cycle: "monthly" },
      { label: "Family (₹179/mo)", amount: 179, cycle: "monthly" },
      { label: "Annual (₹1,189/yr)", amount: 1189, cycle: "yearly" },
    ],
  },
  {
    name: "Amazon Prime",
    category: "Entertainment",
    website: "primevideo.com",
    cycle: "yearly",
    defaultAmount: 1499,
    tiers: [
      { label: "Monthly (₹299/mo)", amount: 299, cycle: "monthly" },
      { label: "Quarterly (₹599/3mo)", amount: 599, cycle: "quarterly" },
      { label: "Annual (₹1,499/yr)", amount: 1499, cycle: "yearly" },
    ],
  },
  {
    name: "YouTube Premium",
    category: "Entertainment",
    website: "youtube.com",
    cycle: "monthly",
    defaultAmount: 149,
    tiers: [
      { label: "Individual (₹149/mo)", amount: 149, cycle: "monthly" },
      { label: "Family (₹299/mo)", amount: 299, cycle: "monthly" },
      { label: "Student (₹89/mo)", amount: 89, cycle: "monthly" },
      { label: "Annual (₹1,490/yr)", amount: 1490, cycle: "yearly" },
    ],
  },
  {
    name: "Disney+ Hotstar",
    category: "Entertainment",
    website: "hotstar.com",
    cycle: "yearly",
    defaultAmount: 1499,
    tiers: [
      { label: "Super (₹899/yr)", amount: 899, cycle: "yearly" },
      { label: "Premium (₹1,499/yr)", amount: 1499, cycle: "yearly" },
      { label: "Premium Monthly (₹299/mo)", amount: 299, cycle: "monthly" },
    ],
  },
  {
    name: "Google One",
    category: "Storage/Cloud",
    website: "google.com",
    cycle: "yearly",
    defaultAmount: 1300,
    tiers: [
      { label: "100 GB (₹130/mo)", amount: 130, cycle: "monthly" },
      { label: "100 GB (₹1,300/yr)", amount: 1300, cycle: "yearly" },
      { label: "2 TB (₹650/mo)", amount: 650, cycle: "monthly" },
      { label: "2 TB (₹6,500/yr)", amount: 6500, cycle: "yearly" },
    ],
  },
  {
    name: "Apple One",
    category: "Entertainment",
    website: "apple.com",
    cycle: "monthly",
    defaultAmount: 195,
    tiers: [
      { label: "Individual (₹195/mo)", amount: 195, cycle: "monthly" },
      { label: "Family (₹365/mo)", amount: 365, cycle: "monthly" },
      { label: "iCloud 50GB (₹75/mo)", amount: 75, cycle: "monthly" },
      { label: "iCloud 200GB (₹219/mo)", amount: 219, cycle: "monthly" },
    ],
  },
  {
    name: "ChatGPT Plus",
    category: "Productivity",
    website: "openai.com",
    cycle: "monthly",
    defaultAmount: 1999,
    tiers: [
      { label: "Plus ($20 ~ ₹1,999/mo)", amount: 1999, cycle: "monthly" },
      { label: "Team ($25 ~ ₹2,499/mo)", amount: 2499, cycle: "monthly" },
    ],
  },
  {
    name: "Claude Pro",
    category: "Productivity",
    website: "anthropic.com",
    cycle: "monthly",
    defaultAmount: 1999,
    tiers: [
      { label: "Pro ($20 ~ ₹1,999/mo)", amount: 1999, cycle: "monthly" },
    ],
  },
  {
    name: "Microsoft 365",
    category: "Productivity",
    website: "microsoft.com",
    cycle: "yearly",
    defaultAmount: 6199,
    tiers: [
      { label: "Personal (₹4,899/yr)", amount: 4899, cycle: "yearly" },
      { label: "Family (₹6,199/yr)", amount: 6199, cycle: "yearly" },
    ],
  },
  {
    name: "Cult.fit",
    category: "Fitness",
    website: "cult.fit",
    cycle: "yearly",
    defaultAmount: 14000,
    tiers: [
      { label: "Cultpass ELITE (₹14,000/yr)", amount: 14000, cycle: "yearly" },
      { label: "Cultpass PRO (₹10,500/yr)", amount: 10500, cycle: "yearly" },
    ],
  },
  {
    name: "Swiggy One",
    category: "Other",
    website: "swiggy.com",
    cycle: "yearly",
    defaultAmount: 899,
    tiers: [
      { label: "3 Months (₹299)", amount: 299, cycle: "quarterly" },
      { label: "12 Months (₹899)", amount: 899, cycle: "yearly" },
    ],
  },
  {
    name: "Zomato Gold",
    category: "Other",
    website: "zomato.com",
    cycle: "quarterly",
    defaultAmount: 299,
    tiers: [
      { label: "3 Months (₹299)", amount: 299, cycle: "quarterly" },
      { label: "12 Months (₹999)", amount: 999, cycle: "yearly" },
    ],
  },
  {
    name: "Airtel Fiber",
    category: "Utilities",
    website: "airtel.in",
    cycle: "monthly",
    defaultAmount: 943,
    tiers: [
      { label: "40 Mbps (₹589/mo)", amount: 589, cycle: "monthly" },
      { label: "100 Mbps (₹943/mo)", amount: 943, cycle: "monthly" },
      { label: "200 Mbps (₹1,179/mo)", amount: 1179, cycle: "monthly" },
    ],
  },
  {
    name: "JioFiber",
    category: "Utilities",
    website: "jio.com",
    cycle: "monthly",
    defaultAmount: 825,
    tiers: [
      { label: "30 Mbps (₹471/mo)", amount: 471, cycle: "monthly" },
      { label: "100 Mbps (₹825/mo)", amount: 825, cycle: "monthly" },
      { label: "150 Mbps (₹1,179/mo)", amount: 1179, cycle: "monthly" },
    ],
  },
  {
    name: "Tata Play",
    category: "Entertainment",
    website: "tataplay.com",
    cycle: "monthly",
    defaultAmount: 450,
  },
  {
    name: "Times Prime",
    category: "Entertainment",
    website: "timesprime.com",
    cycle: "yearly",
    defaultAmount: 1199,
  },
];

const PAYMENT_METHODS = [
  { id: "credit_card", label: "Credit Card", icon: CreditCard },
  { id: "upi_autopay", label: "UPI AutoPay", icon: Smartphone },
  { id: "net_banking", label: "Bank Auto-Debit", icon: Landmark },
  { id: "apple_store", label: "Apple Subscriptions", icon: Apple },
  { id: "google_play", label: "Google Play Billing", icon: PlayCircle },
  { id: "manual", label: "Manual / Invoice", icon: RefreshCw },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: `1.5px solid ${THEME.line}`,
  borderRadius: "var(--radius-md)",
  color: THEME.ink,
  background: "var(--surface-0)",
  fontSize: 14,
  transition: "border-color 0.15s ease",
  outline: "none",
};

interface SubModalProps {
  onClose: () => void;
  onSave: (sub: SubscriptionItem) => void;
  initialValues?: SubscriptionItem | null;
  saving?: boolean;
}

export function SubModal({ onClose, onSave, initialValues = null, saving = false }: SubModalProps) {
  const { familyProfiles } = useMasterData();
  const [attempted, setAttempted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetItem | null>(() => {
    if (!initialValues) return null;
    return POPULAR_PRESETS.find((p) => p.name.toLowerCase() === (initialValues.name || "").toLowerCase()) || null;
  });

  const [f, setF] = useState<SubscriptionItem>(
    initialValues
      ? {
          owner: initialValues.owner || "self",
          name: initialValues.name || "",
          category: initialValues.category || "Entertainment",
          amount: initialValues.amount || "",
          cycle: initialValues.cycle || "monthly",
          renewalDate: initialValues.renewalDate || "",
          paymentMethod: initialValues.paymentMethod || "credit_card",
          autopay: initialValues.autopay !== false,
          remark: initialValues.remark || "",
          website: initialValues.website || "",
        }
      : {
          owner: "self",
          name: "",
          category: "Entertainment",
          amount: "",
          cycle: "monthly",
          renewalDate: "",
          paymentMethod: "credit_card",
          autopay: true,
          remark: "",
          website: "",
        }
  );

  const nameError = attempted && !f.name.trim() ? "Service name is required" : undefined;
  const amountError =
    attempted && !(Number(f.amount) > 0) ? "Enter an amount greater than 0" : undefined;

  const handleNameChange = (val: string) => {
    const updated = { ...f, name: val };
    const matchedPreset = POPULAR_PRESETS.find((p) => p.name.toLowerCase() === val.trim().toLowerCase());
    if (matchedPreset) {
      setSelectedPreset(matchedPreset);
      if (!f.category || f.category === "Entertainment") updated.category = matchedPreset.category;
      if (!f.website) updated.website = matchedPreset.website;
    } else {
      setSelectedPreset(null);
    }

    if (!f.website?.trim() && val.trim()) {
      const match = resolveBrand(val.trim());
      if (match?.domain) {
        updated.website = match.domain;
      }
    }
    setF(updated);
  };

  const applyPreset = (p: PresetItem) => {
    setSelectedPreset(p);
    setF((prev) => ({
      ...prev,
      name: p.name,
      category: p.category,
      website: p.website,
      cycle: p.cycle || prev.cycle,
      amount: p.defaultAmount ? String(p.defaultAmount) : prev.amount,
    }));
  };

  const handleSelectTier = (tier: { label: string; amount: number; cycle: string }) => {
    setF((prev) => ({
      ...prev,
      amount: String(tier.amount),
      cycle: tier.cycle,
    }));
  };

  const numericAmount = Number(f.amount) || 0;
  const monthlyEquiv = getSubscriptionMonthlyEquivalent(numericAmount, f.cycle);
  const annualEquiv = monthlyEquiv * 12;

  const handleSave = () => {
    if (f.name.trim() && Number(f.amount) > 0) {
      const resolvedDomain = f.website?.trim() || resolveBrand(f.name.trim())?.domain || "";
      onSave({
        ...f,
        website: resolvedDomain,
      });
    } else {
      setAttempted(true);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Subscription" : "Add Subscription & Recurring Plan"}
      onClose={onClose}
    >
      {/* Quick Add Presets Bar */}
      {!initialValues && (
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: THEME.muted,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Zap size={12} color={THEME.accent} />
            <span>Popular Services & Quick-Fill</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 6,
              scrollbarWidth: "thin",
            }}
          >
            {POPULAR_PRESETS.map((p) => {
              const active = f.name.toLowerCase() === p.name.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 9999,
                    background: active
                      ? `color-mix(in srgb, ${THEME.accent} 14%, var(--surface-0))`
                      : "var(--surface-1)",
                    border: `1.5px solid ${active ? THEME.accent : THEME.line}`,
                    color: active ? THEME.accent : THEME.ink,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  <ServiceLogo name={p.name} website={p.website} size={16} />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Tier Chips if preset active */}
      {selectedPreset?.tiers && selectedPreset.tiers.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--surface-1)",
            border: `1px solid ${THEME.line}`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: THEME.muted, marginBottom: 6 }}>
            Select {selectedPreset.name} Plan Tier:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedPreset.tiers.map((t, idx) => {
              const active = Number(f.amount) === t.amount && f.cycle === t.cycle;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTier(t)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: active ? THEME.accent : "var(--surface-0)",
                    color: active ? "#ffffff" : THEME.ink,
                    border: `1px solid ${active ? THEME.accent : THEME.line}`,
                    transition: "all 0.15s ease",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Owner / Member Profile">
          <select
            style={inputStyle}
            value={f.owner || "self"}
            onChange={(e) => setF({ ...f, owner: e.target.value })}
          >
            {familyProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {formatProfileOption(p)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category">
          <select
            style={inputStyle}
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value })}
          >
            <option>Entertainment</option>
            <option>Productivity</option>
            <option>Storage/Cloud</option>
            <option>News/Media</option>
            <option>Fitness</option>
            <option>Utilities</option>
            <option>Other</option>
          </select>
        </Field>
      </div>

      <Field label="Service / Subscription Name" error={nameError}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              border: `1px solid ${THEME.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--surface-1)",
              flexShrink: 0,
            }}
            title="Brand Logo Preview"
          >
            <ServiceLogo
              name={f.name || "Preview"}
              website={f.website}
              category={f.category}
              size={30}
            />
          </div>
          <div style={{ flex: 1 }}>
            <input
              style={{ ...inputStyle, ...(nameError ? { borderColor: THEME.rust } : {}) }}
              value={f.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Netflix, Spotify, Google One, OpenAI ChatGPT"
            />
          </div>
        </div>
      </Field>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <Field label="Plan Cost (₹)" error={amountError}>
          <input
            style={{ ...inputStyle, ...(amountError ? { borderColor: THEME.rust } : {}) }}
            type="number"
            min="0"
            step="any"
            value={f.amount}
            onChange={(e) => setF({ ...f, amount: e.target.value })}
            placeholder="e.g., 649"
          />
        </Field>

        <Field label="Billing Frequency">
          <select
            style={inputStyle}
            value={f.cycle}
            onChange={(e) => setF({ ...f, cycle: e.target.value })}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly (3 Months)</option>
            <option value="half-yearly">Half-Yearly (6 Months)</option>
            <option value="yearly">Yearly (Annual)</option>
          </select>
        </Field>

        <Field label="Next Billing / Renewal Date" hint="Auto-advances once paid">
          <input
            style={inputStyle}
            type="date"
            value={f.renewalDate}
            onChange={(e) => setF({ ...f, renewalDate: e.target.value })}
          />
        </Field>
      </div>

      {/* Live Financial Run-Rate Preview */}
      {numericAmount > 0 && (
        <div
          style={{
            margin: "4px 0 16px 0",
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: `linear-gradient(135deg, color-mix(in srgb, ${THEME.accent} 8%, var(--surface-0)), var(--surface-0))`,
            border: `1px solid color-mix(in srgb, ${THEME.accent} 25%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 600 }}>
            Run-Rate Equivalent:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>
              {fmtINRFull(monthlyEquiv)} <span style={{ fontSize: 10, color: THEME.muted, fontWeight: 600 }}>/ month</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.ink }}>
              {fmtINRFull(annualEquiv)} <span style={{ fontSize: 10, color: THEME.muted, fontWeight: 600 }}>/ year</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <Field label="Payment Channel / Linked Account">
          <select
            style={inputStyle}
            value={f.paymentMethod || "credit_card"}
            onChange={(e) => setF({ ...f, paymentMethod: e.target.value })}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Auto-Renewal / AutoPay">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 42,
              padding: "0 12px",
              background: "var(--surface-1)",
              border: `1px solid ${THEME.line}`,
              borderRadius: "var(--radius-md)",
            }}
          >
            <input
              type="checkbox"
              id="sub-autopay-toggle"
              checked={f.autopay !== false}
              onChange={(e) => setF({ ...f, autopay: e.target.checked })}
              style={{ cursor: "pointer", width: 16, height: 16 }}
            />
            <label
              htmlFor="sub-autopay-toggle"
              style={{ fontSize: 12, fontWeight: 700, color: THEME.ink, cursor: "pointer" }}
            >
              {f.autopay !== false ? "Auto-Debit Enabled" : "Manual Renewal"}
            </label>
          </div>
        </Field>
      </div>

      <Field label="Service Website (Used for Brand Logo matching)">
        <input
          style={inputStyle}
          value={f.website}
          onChange={(e) => setF({ ...f, website: e.target.value })}
          placeholder="e.g., netflix.com, spotify.com, openai.com"
        />
      </Field>

      <Field label="Notes / Plan Remarks (Optional)">
        <input
          style={inputStyle}
          value={f.remark}
          onChange={(e) => setF({ ...f, remark: e.target.value })}
          placeholder="e.g., Billed to Axis Olympus Card, shared with spouse"
        />
      </Field>

      <ModalActions
        onSave={handleSave}
        onClose={onClose}
        saveLabel={initialValues ? "Save Changes" : "Add Subscription"}
        disabled={saving}
        loading={saving}
      />
    </Modal>
  );
}
