/* eslint-disable */
import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { FamilyViewTab } from "../components/tabs/FamilyViewTab";

// Mock recharts responsive container for server render
vi.mock("recharts", async () => {
  const original = await vi.importActual<any>("recharts");
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
  };
});

describe("FamilyViewTab Redesign & Executive UI/UX", () => {
  const mockState = {
    settings: { darkMode: false },
    profile: { fy: "2026-2027" },
    bankAccounts: [
      { id: "ba1", bankName: "HDFC Bank", balance: 250000, owner: "self" },
      { id: "ba2", bankName: "ICICI Bank", balance: 150000, owner: "wife" },
    ],
    fixedDeposits: [
      { id: "fd1", bank: "SBI", principal: 500000, rate: 7.1, owner: "self" },
      { id: "fd2", bank: "HDFC", principal: 300000, rate: 7.5, owner: "wife" },
    ],
    recurringDeposits: [],
    stocks: [
      { id: "st1", symbol: "RELIANCE", qty: 100, currentPrice: 2800, owner: "self" },
      { id: "st2", symbol: "TCS", qty: 50, currentPrice: 4000, owner: "wife" },
    ],
    mutualFunds: [
      { id: "mf1", schemeName: "Parag Parikh Flexi Cap", units: 1000, currentNav: 85, owner: "self" },
      { id: "mf2", schemeName: "Mirae Asset Large Cap", units: 500, currentNav: 120, owner: "daughter" },
    ],
    ppf: [{ id: "ppf1", balance: 400000, owner: "self" }],
    epf: [{ id: "epf1", employeeShare: 200000, employerShare: 200000, pensionShare: 50000, interest: 20000, owner: "self" }],
    nps: [{ id: "nps1", balance: 350000, owner: "self" }],
    lic: [{ id: "lic1", policyName: "LIC Jeevan Labh", sumAssured: 1000000, premiumPaid: 50000, owner: "self" }],
    termPlans: [{ id: "tp1", planName: "HDFC Click 2 Protect", coverAmount: 10000000, premium: 18000, owner: "self" }],
    healthInsurance: [
      { id: "hi1", insurer: "Star Health", sumInsured: 1000000, owner: "self", coveredMembers: ["self", "wife", "daughter"] },
    ],
    bonds: [],
    investmentPlans: [],
    realEstateProperties: [
      { id: "re1", name: "Green Acres Apartment", marketValue: 12000000, status: "ready", owner: "self" },
    ],
    vehicles: [{ id: "v1", name: "Honda City", currentValue: 800000, owner: "self" }],
    goldHoldings: [{ id: "g1", grams: 50, purity: "24K", type: "physical", owner: "wife" }],
    govtSchemes: [{ id: "gs1", schemeType: "SSY", schemeName: "Sukanya Samriddhi", currentBalance: 200000, owner: "daughter" }],
    loansTaken: [{ id: "l1", name: "Home Loan", principal: 4000000, emi: 45000, rate: 8.5, tenureMonths: 120, startDate: "2024-01-01", owner: "self" }],
    creditCards: [{ id: "cc1", cardName: "Infinia", outstanding: 45000, owner: "self" }],
    income: [
      { id: "inc1", date: "2026-05-01", amount: 150000, owner: "self" },
      { id: "inc2", date: "2026-06-01", amount: 150000, owner: "self" },
      { id: "inc3", date: "2026-05-01", amount: 80000, owner: "wife" },
    ],
    prepaidCards: [],
    loansGiven: [],
    rentalProperties: [],
    rentedProperties: [],
    informalBorrowed: [],
    informalLent: [],
  };

  it("renders the redesigned executive Family Wealth command center", () => {
    const html = renderToString(<FamilyViewTab state={mockState} />);

    expect(html).toContain("Family Wealth Overview");
    expect(html).toContain("Consolidated Family Net Worth");
    expect(html).toContain("Family Portfolio Analytics");
    expect(html).toContain("Protection &amp; Insurance Health Matrix");
    expect(html).toContain("Family Wealth &amp; Tax Optimization Insights");
  });

  it("calculates multi-member assets and displays member personas", () => {
    const html = renderToString(<FamilyViewTab state={mockState} />);

    expect(html).toContain("Consolidated Family");
    expect(html).toContain("Self");
    expect(html).toContain("Total Family Assets");
    expect(html).toContain("Family Debt Ratio");
    expect(html).toContain("Liquid Emergency Reserve");
  });

  it("renders tax optimization & generational wealth strategy insights", () => {
    const html = renderToString(<FamilyViewTab state={mockState} />);

    expect(html).toContain("Hindu Undivided Family (HUF)");
    expect(html).toContain("Health Insurance (Section 80D)");
    expect(html).toContain("Minor Children &amp; Long-Term Compounding");
    expect(html).toContain("Senior Citizen Privileges (60+)");
  });

  it("renders empty state when no family members have assets", () => {
    const emptyState = {
      ...mockState,
      bankAccounts: [],
      fixedDeposits: [],
      stocks: [],
      mutualFunds: [],
      ppf: [],
      epf: [],
      nps: [],
      lic: [],
      termPlans: [],
      realEstateProperties: [],
      vehicles: [],
      goldHoldings: [],
      govtSchemes: [],
      loansTaken: [],
      creditCards: [],
    };

    const html = renderToString(<FamilyViewTab state={emptyState} />);
    expect(html).toContain("No Family Financial Data Yet");
  });
});
