/* eslint-disable */
import React, { useState } from "react";
import { IndianRupee, Calendar, Clock, FileText, Landmark, AlertCircle } from "lucide-react";
import { THEME } from "../../utils/constants";
import { fmtINR, today } from "../../utils/finance";
import { Modal, ModalActions } from "../ui/Modal";
import { Field } from "../ui/Form";

interface InformalTrancheModalProps {
  direction: "borrowed" | "lent";
  person: any;
  initial?: any | null;
  bankAccounts?: any[];
  onSave: (trancheData: any, bankTxn?: any) => Promise<void> | void;
  onClose: () => void;
  saving?: boolean;
}

export function InformalTrancheModal({
  direction,
  person,
  initial = null,
  bankAccounts = [],
  onSave,
  onClose,
  saving = false,
}: InformalTrancheModalProps) {
  const isBorrowed = direction === "borrowed";
  const actionTitle = initial
    ? `Edit Loan Record — ${person?.person || person?.name || "Person"}`
    : isBorrowed
    ? `Add Loan Received — ${person?.person || person?.name || "Lender"}`
    : `Add Loan Given — ${person?.person || person?.name || "Borrower"}`;

  const [amount, setAmount] = useState<string>(initial?.amount ? String(initial.amount) : "");
  const [date, setDate] = useState<string>(initial?.date || today());
  const [dueDate, setDueDate] = useState<string>(initial?.dueDate || "");
  const [note, setNote] = useState<string>(initial?.note || "");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const numAmt = Number(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) {
      setError("Please enter a valid loan amount greater than ₹0");
      return;
    }
    if (!date) {
      setError("Please select the transaction date");
      return;
    }
    setError(null);

    const trancheData: any = {
      ...(initial || {}),
      id: initial?.id || `tr-${Date.now()}`,
      amount: numAmt,
      date,
      note: note.trim(),
    };
    if (dueDate) {
      trancheData.dueDate = dueDate;
    } else {
      delete trancheData.dueDate;
    }

    // Optional bank transaction linkage (only on new tranche creation)
    let bankTxn: any = null;
    if (!initial && selectedBankId) {
      const selectedBank = bankAccounts.find((b: any) => b.id === selectedBankId);
      const personName = person?.person || person?.name || "Party";
      if (isBorrowed) {
        // Borrowed money received: Credit into user's bank account
        bankTxn = {
          id: `txn-${Date.now()}`,
          date,
          amount: numAmt,
          type: "credit",
          category: "Loan Received",
          description: `Loan received from ${personName}${note ? ` (${note})` : ""}`,
          accountId: selectedBankId,
          bankAccountId: selectedBankId,
          bankName: selectedBank?.bankName || "Bank",
          mode: "Bank Transfer",
          owner: person?.owner || "self",
        };
      } else {
        // Lent money disbursed: Debit from user's bank account
        bankTxn = {
          id: `txn-${Date.now()}`,
          date,
          amount: numAmt,
          type: "debit",
          category: "Loan Given",
          description: `Personal loan given to ${personName}${note ? ` (${note})` : ""}`,
          accountId: selectedBankId,
          bankAccountId: selectedBankId,
          bankName: selectedBank?.bankName || "Bank",
          mode: "Bank Transfer",
          owner: person?.owner || "self",
        };
      }
    }

    await onSave(trancheData, bankTxn);
  };

  return (
    <Modal title={actionTitle} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {error && (
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 6,
              color: "var(--t-rust)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Amount & Date */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label={isBorrowed ? "Amount Received (₹)" : "Amount Lent (₹)"}>
            <div style={{ position: "relative" }}>
              <input
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--t-line)",
                  background: "var(--t-card-bg)",
                  color: "var(--t-ink)",
                  fontSize: 14,
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                type="number"
                min="1"
                step="any"
                placeholder="50000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                autoFocus
              />
              <IndianRupee
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--t-muted)",
                }}
              />
            </div>
          </Field>

          <Field label="Transaction Date">
            <div style={{ position: "relative" }}>
              <input
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--t-line)",
                  background: "var(--t-card-bg)",
                  color: "var(--t-ink)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Calendar
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--t-muted)",
                }}
              />
            </div>
          </Field>
        </div>

        {/* Due Date (Optional) */}
        <Field label="Repayment Target / Due Date (optional)">
          <div style={{ position: "relative" }}>
            <input
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--t-line)",
                background: "var(--t-card-bg)",
                color: "var(--t-ink)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Clock
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--t-muted)",
              }}
            />
          </div>
        </Field>

        {/* Bank Account Selection (Only for new entries) */}
        {!initial && bankAccounts && bankAccounts.length > 0 && (
          <Field label={isBorrowed ? "Deposit to Bank Account (optional)" : "Disburse from Bank Account (optional)"}>
            <div style={{ position: "relative" }}>
              <select
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--t-line)",
                  background: "var(--t-card-bg)",
                  color: "var(--t-ink)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
              >
                <option value="">Do not log bank transaction</option>
                {bankAccounts.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} - {b.accountNumber ? `•••• ${b.accountNumber.slice(-4)}` : "Account"} (₹{fmtINR(b.balance || 0)})
                  </option>
                ))}
              </select>
              <Landmark
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--t-muted)",
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--t-muted)", marginTop: 4 }}>
              {isBorrowed
                ? "If selected, creates an incoming credit transaction in this bank account."
                : "If selected, creates an outgoing debit transaction from this bank account."}
            </div>
          </Field>
        )}

        {/* Note */}
        <Field label="Description / Note (optional)">
          <div style={{ position: "relative" }}>
            <input
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--t-line)",
                background: "var(--t-card-bg)",
                color: "var(--t-ink)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="e.g. Bank Transfer, Cheque #4521, Cash"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <FileText
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--t-muted)",
              }}
            />
          </div>
        </Field>

        <ModalActions
          onSave={handleSubmit}
          onClose={onClose}
          saveLabel={initial ? "Save Changes" : isBorrowed ? "Save Borrowing" : "Save Loan"}
          disabled={saving || !amount || Number(amount) <= 0}
          loading={saving}
        />
      </div>
    </Modal>
  );
}
