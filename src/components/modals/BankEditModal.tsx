import React, { useState } from "react";
import { THEME } from "../../utils/constants";
import { Modal, ModalActions } from "../ui/Modal";
import { Field } from "../ui/Form";
import { useMasterData, formatProfileOption } from "../../utils/masterData";
import { POPULAR_INDIAN_BANKS } from "../tabs/BanksTab";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: `1.5px solid ${THEME.line}`,
  borderRadius: "var(--radius-md)",
  color: THEME.ink,
  fontSize: 13,
  background: "var(--surface-0)",
  outline: "none",
};

interface BankAccount {
  id?: string;
  owner?: string;
  bankName?: string;
  accountNumber?: string;
  type?: string;
  balance?: number | string;
}

interface BankEditModalProps {
  account: BankAccount | null | undefined;
  onClose: () => void;
  onSave: (data: BankAccount) => void;
  saving?: boolean;
}

export function BankEditModal({ account, onClose, onSave, saving = false }: BankEditModalProps) {
  const { bankAccountTypes, familyProfiles } = useMasterData();
  const [f, setF] = useState<BankAccount>({
    owner: account?.owner || "self",
    bankName: account?.bankName || "",
    accountNumber: account?.accountNumber || "",
    type: account?.type || bankAccountTypes[0] || "Savings",
    balance: account?.balance != null ? account.balance : "",
  });

  return (
    <Modal title="Edit Bank Account" onClose={onClose}>
      <Field label="Owner / Family Profile">
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

      <Field label="Bank Name">
        <div style={{ position: "relative" }}>
          <input
            style={inputStyle}
            value={f.bankName}
            onChange={(e) => setF({ ...f, bankName: e.target.value })}
            placeholder="e.g. HDFC Bank, SBI, ICICI Bank"
            list="edit-popular-banks-list"
            autoFocus
          />
          <datalist id="edit-popular-banks-list">
            {(POPULAR_INDIAN_BANKS || []).map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
      </Field>

      <Field label="Account Number (full or last 4 digits)">
        <input
          style={inputStyle}
          value={f.accountNumber}
          onChange={(e) => setF({ ...f, accountNumber: e.target.value })}
          placeholder="e.g. 50100432109876"
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Account Type">
          <select
            style={inputStyle}
            value={f.type}
            onChange={(e) => setF({ ...f, type: e.target.value })}
          >
            {bankAccountTypes.map((t: string) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Current Balance (₹)">
          <input
            style={inputStyle}
            type="number"
            step="0.01"
            inputMode="decimal"
            value={f.balance}
            onChange={(e) => setF({ ...f, balance: e.target.value })}
            placeholder="0.00"
          />
        </Field>
      </div>

      <ModalActions
        onSave={() => f.bankName?.trim() && onSave(f)}
        onClose={onClose}
        disabled={!f.bankName?.trim() || saving}
        loading={saving}
        saveLabel="Save Changes"
      />
    </Modal>
  );
}
