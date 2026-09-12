/* eslint-disable */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InformalLoanSection } from "../components/credit/InformalLoanSection";
import { InformalPersonModal } from "../components/credit/InformalPersonModal";
import { InformalTrancheModal } from "../components/credit/InformalTrancheModal";
import { InformalPaymentModal } from "../components/credit/InformalPaymentModal";
import { InformalStatementModal } from "../components/credit/InformalStatementModal";

describe("Informal Loans Redesign (From People & To People)", () => {
  const mockBorrowedItems = [
    {
      id: "b1",
      person: "Uncle Ramesh",
      relationship: "Relative",
      phone: "9876543210",
      owner: "self",
      note: "Home renovation help",
      tranches: [
        { id: "tr1", amount: 100000, date: "2026-01-10", dueDate: "2026-06-01", note: "First installment" },
        { id: "tr2", amount: 50000, date: "2026-02-15", note: "Second installment" },
      ],
      payments: [
        { id: "pm1", amount: 60000, date: "2026-04-01", method: "Bank Transfer", note: "Part repayment" },
      ],
    },
    {
      id: "b2",
      person: "Rohit",
      relationship: "Friend",
      owner: "self",
      tranches: [
        { id: "tr3", amount: 20000, date: "2026-03-01", note: "Emergency loan" },
      ],
      payments: [
        { id: "pm2", amount: 20000, date: "2026-05-01", method: "UPI", note: "Full settlement" },
      ],
    },
  ];

  const mockLentItems = [
    {
      id: "l1",
      person: "Priya Sharma",
      relationship: "Colleague",
      phone: "9123456780",
      owner: "self",
      note: "Medical expenses",
      tranches: [
        { id: "ltr1", amount: 75000, date: "2026-02-01", dueDate: "2026-05-01", note: "Initial loan" },
      ],
      payments: [
        { id: "lpm1", amount: 25000, date: "2026-03-15", method: "UPI" },
      ],
    },
    {
      id: "l2",
      person: "Deepak",
      relationship: "Friend",
      owner: "self",
      tranches: [
        { id: "ltr2", amount: 30000, date: "2026-01-01" },
      ],
      payments: [
        { id: "lpm2", amount: 35000, date: "2026-02-01" }, // Overpaid by 5000
      ],
    },
  ];

  const mockBankAccounts = [
    { id: "ba1", bankName: "HDFC Bank", accountNumber: "1234567890", balance: 250000 },
    { id: "ba2", bankName: "ICICI Bank", accountNumber: "9876543210", balance: 100000 },
  ];

  describe("InformalLoanSection (From People / Borrowed Mode)", () => {
    it("renders KPI cards and lender cards correctly", () => {
      const onAddPerson = vi.fn();
      const onUpdate = vi.fn();
      const onRemove = vi.fn();

      render(
        <InformalLoanSection
          direction="borrowed"
          items={mockBorrowedItems}
          bankAccounts={mockBankAccounts}
          onAddPerson={onAddPerson}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      // Hero Stat Cards
      expect(screen.getByText("Total Borrowed")).toBeTruthy();
      expect(screen.getByText("Total Repaid")).toBeTruthy();
      expect(screen.getByText("Net Outstanding")).toBeTruthy();
      expect(screen.getByText("Overdue Follow-ups")).toBeTruthy();

      // Check rendered lenders
      expect(screen.getByText("Uncle Ramesh")).toBeTruthy();
      expect(screen.getByText("Rohit")).toBeTruthy();
      expect(screen.getByText("SETTLED ✓")).toBeTruthy();
    });

    it("supports searching lenders by name and note", () => {
      render(
        <InformalLoanSection
          direction="borrowed"
          items={mockBorrowedItems}
          onAddPerson={vi.fn()}
          onUpdate={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search lenders/i);
      fireEvent.change(searchInput, { target: { value: "renovation" } });

      expect(screen.getByText("Uncle Ramesh")).toBeTruthy();
      expect(screen.queryByText("Rohit")).toBeNull();
    });

    it("switches to Table Ledger view mode smoothly", () => {
      render(
        <InformalLoanSection
          direction="borrowed"
          items={mockBorrowedItems}
          onAddPerson={vi.fn()}
          onUpdate={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      const tableModeBtn = screen.getByTitle("Table Ledger View");
      fireEvent.click(tableModeBtn);

      expect(screen.getByText("Party / Name")).toBeTruthy();
      expect(screen.getByText("Uncle Ramesh")).toBeTruthy();
    });

    it("opens Add Lender modal when CTA is clicked", () => {
      render(
        <InformalLoanSection
          direction="borrowed"
          items={mockBorrowedItems}
          onAddPerson={vi.fn()}
          onUpdate={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      const addBtn = screen.getByRole("button", { name: /Add Lender/i });
      fireEvent.click(addBtn);

      expect(screen.getByText("Add New Lender")).toBeTruthy();
    });
  });

  describe("InformalLoanSection (To People / Lent Mode)", () => {
    it("renders borrower cards and handles Overpaid and Overdue status tags", () => {
      render(
        <InformalLoanSection
          direction="lent"
          items={mockLentItems}
          bankAccounts={mockBankAccounts}
          onAddPerson={vi.fn()}
          onUpdate={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      expect(screen.getByText("Total Lent")).toBeTruthy();
      expect(screen.getByText("Total Received")).toBeTruthy();
      expect(screen.getByText("Priya Sharma")).toBeTruthy();
      expect(screen.getByText("Deepak")).toBeTruthy();
      expect(screen.getByText("OVERPAID")).toBeTruthy();
    });

    it("filters by status pills (Active, Overdue, Settled, Overpaid)", () => {
      render(
        <InformalLoanSection
          direction="lent"
          items={mockLentItems}
          onAddPerson={vi.fn()}
          onUpdate={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      const activePill = screen.getByRole("button", { name: /Active/i });
      fireEvent.click(activePill);

      expect(screen.getByText("Priya Sharma")).toBeTruthy();
      expect(screen.queryByText("Deepak")).toBeNull();
    });
  });

  describe("InformalPersonModal Component", () => {
    it("validates input and submits new person data", async () => {
      const onSave = vi.fn();
      const onClose = vi.fn();

      render(
        <InformalPersonModal
          direction="borrowed"
          onSave={onSave}
          onClose={onClose}
        />
      );

      expect(screen.getByText("Add New Lender")).toBeTruthy();

      const nameInput = screen.getByPlaceholderText(/Uncle Ramesh/i);
      fireEvent.change(nameInput, { target: { value: "Suresh Gupta" } });

      const saveBtn = screen.getByRole("button", { name: /Add Lender/i });
      fireEvent.click(saveBtn);

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          person: "Suresh Gupta",
          relationship: "Friend",
        })
      );
    });
  });

  describe("InformalTrancheModal Component", () => {
    it("adds a new tranche and creates linked bank transaction if chosen", async () => {
      const onSave = vi.fn();
      const onClose = vi.fn();

      render(
        <InformalTrancheModal
          direction="lent"
          person={mockLentItems[0]}
          bankAccounts={mockBankAccounts}
          onSave={onSave}
          onClose={onClose}
        />
      );

      const amountInput = screen.getByPlaceholderText("50000");
      fireEvent.change(amountInput, { target: { value: "15000" } });

      const bankSelect = screen.getByRole("combobox");
      fireEvent.change(bankSelect, { target: { value: "ba1" } });

      const saveBtn = screen.getByRole("button", { name: /Save Loan/i });
      fireEvent.click(saveBtn);

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 15000,
        }),
        expect.objectContaining({
          amount: 15000,
          accountId: "ba1",
          bankAccountId: "ba1",
          type: "debit",
        })
      );
    });
  });

  describe("InformalPaymentModal Component", () => {
    it("supports 1-click 'Settle Full' button and records payment with bank credit", async () => {
      const onSave = vi.fn();
      const onClose = vi.fn();

      render(
        <InformalPaymentModal
          direction="lent"
          person={mockLentItems[0]} // Outstanding is 50,000 (75k - 25k)
          bankAccounts={mockBankAccounts}
          onSave={onSave}
          onClose={onClose}
        />
      );

      // Verify Settle Full button exists
      const settleBtn = screen.getByText(/Settle Full/i);
      expect(settleBtn).toBeTruthy();
      fireEvent.click(settleBtn);

      const selects = screen.getAllByRole("combobox");
      const bankSelect = selects[1]; // Bank account select
      fireEvent.change(bankSelect, { target: { value: "ba1" } });

      const saveBtn = screen.getByRole("button", { name: /Record Payment/i });
      fireEvent.click(saveBtn);

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50000,
        }),
        expect.objectContaining({
          amount: 50000,
          accountId: "ba1",
          bankAccountId: "ba1",
          type: "credit",
        })
      );
    });
  });

  describe("InformalStatementModal Component", () => {
    it("generates formatted WhatsApp statement with copy support", () => {
      const onClose = vi.fn();

      render(
        <InformalStatementModal
          direction="lent"
          person={mockLentItems[0]}
          onClose={onClose}
        />
      );

      expect(screen.getByText(/Statement & Reminder — Priya Sharma/i)).toBeTruthy();
      expect(screen.getByText(/Share on WhatsApp/i)).toBeTruthy();
      expect(screen.getByText(/Copy Statement/i)).toBeTruthy();

      // Switch to Full Ledger mode
      const ledgerBtn = screen.getByText(/Full Ledger/i);
      fireEvent.click(ledgerBtn);

      const previewText = screen.getByDisplayValue(/STATEMENT OF ACCOUNT/i);
      expect(previewText).toBeTruthy();
    });
  });
});
