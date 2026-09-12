/* eslint-disable */
import React, { useState } from "react";
import {
  MessageSquare,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Phone,
  Calendar,
  IndianRupee,
  Clock,
  Sparkles,
} from "lucide-react";
import { THEME } from "../../utils/constants";
import { fmtINR, fmtINRFull } from "../../utils/finance";
import { Modal } from "../ui/Modal";
import { Field } from "../ui/Form";
import { Money } from "../ui/Money";

interface LoanReminderModalProps {
  loan: any;
  onClose: () => void;
}

export function LoanReminderModal({ loan, onClose }: LoanReminderModalProps) {
  const [tone, setTone] = useState<"friendly" | "formal" | "urgent">("friendly");
  const [upiId, setUpiId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const borrower = loan.borrower || "Friend";
  const outstanding = Number(loan.outstanding ?? loan.principal) || 0;
  const dueDateStr = loan.dueDate
    ? new Date(loan.dueDate + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const isOverdue = loan.dueDate && new Date(loan.dueDate + "T00:00:00") < new Date();

  const generateMessage = () => {
    const upiText = upiId.trim() ? `\n\nYou can pay directly via UPI to: ${upiId.trim()}` : "";
    const dueText = dueDateStr ? `which was due on ${dueDateStr}` : "as discussed";

    if (tone === "friendly") {
      return (
        `Hi ${borrower}, hope you're doing well! Just a friendly reminder regarding the pending balance of ${fmtINR(
          outstanding
        )} ${dueText}. Whenever convenient, please arrange for the repayment.${upiText}\n\nThanks!`
      );
    } else if (tone === "formal") {
      return (
        `Dear ${borrower},\n\nThis is a gentle reminder regarding the loan repayment balance of ${fmtINR(
          outstanding
        )} ${dueText}. Please let me know when you can process the settlement.${upiText}\n\nWarm regards.`
      );
    } else {
      return (
        `Hi ${borrower}, please note that your loan balance of ${fmtINR(
          outstanding
        )} is now overdue (${dueDateStr || "past agreed date"}). Kindly prioritize settling this amount at the earliest or let me know a firm payment date.${upiText}\n\nThank you.`
      );
    }
  };

  const messageText = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const phone = (loan.phone || "").replace(/[^0-9]/g, "");
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <Modal title={`Payment Reminder — ${borrower}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Loan Context */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: "color-mix(in srgb, var(--surface-1) 60%, transparent)",
            borderRadius: 10,
            border: `1px solid var(--t-line)`,
          }}
        >
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--t-muted)" }}>
              Pending Balance
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "var(--t-rust)", marginTop: 1 }}>
              <Money value={outstanding} variant="exact" />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--t-muted)" }}>
              Agreed Due Date
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: isOverdue ? "var(--t-rust)" : "var(--t-ink)",
                marginTop: 2,
              }}
            >
              {dueDateStr || "Open / Flexible"}
              {isOverdue && <span style={{ marginLeft: 4, color: "var(--t-rust)", fontSize: 10 }}>(OVERDUE)</span>}
            </div>
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--t-muted)", display: "block", marginBottom: 6 }}>
            Reminder Tone
          </label>
          <div style={{ display: "flex", gap: 6, background: "var(--surface-1)", padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setTone("friendly")}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                background: tone === "friendly" ? "var(--surface-0)" : "transparent",
                color: tone === "friendly" ? "var(--t-ink)" : "var(--t-muted)",
              }}
            >
              Friendly & Warm
            </button>
            <button
              onClick={() => setTone("formal")}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                background: tone === "formal" ? "var(--surface-0)" : "transparent",
                color: tone === "formal" ? "var(--t-ink)" : "var(--t-muted)",
              }}
            >
              Formal / Professional
            </button>
            <button
              onClick={() => setTone("urgent")}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                background: tone === "urgent" ? "var(--surface-0)" : "transparent",
                color: tone === "urgent" ? "var(--t-rust)" : "var(--t-muted)",
              }}
            >
              Urgent / Overdue
            </button>
          </div>
        </div>

        {/* Optional UPI ID */}
        <Field label="Your UPI ID (Optional for 1-click payment)">
          <input
            placeholder="e.g. yourname@okhdfcbank"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--t-line)",
              background: "var(--surface-0)",
              color: "var(--t-ink)",
              fontSize: 13,
              outline: "none",
            }}
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
        </Field>

        {/* Message Preview */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--t-muted)", display: "block", marginBottom: 6 }}>
            Generated Message
          </label>
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: "var(--surface-0)",
              border: `1px solid var(--t-line)`,
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--t-ink)",
              whiteSpace: "pre-wrap",
              minHeight: 100,
            }}
          >
            {messageText}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <button
            onClick={handleCopy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--t-line)",
              background: "var(--surface-0)",
              color: "var(--t-ink)",
              fontWeight: 800,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {copied ? <Check size={14} color="var(--t-sage)" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
          <button
            onClick={handleWhatsApp}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#25D366",
              color: "#FFFFFF",
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)",
            }}
          >
            <Share2 size={14} /> Send via WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
}
