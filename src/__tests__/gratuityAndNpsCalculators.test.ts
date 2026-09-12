import { describe, it, expect } from "vitest";

describe("Gratuity Calculations (Payment of Gratuity Act, 1972 & Section 10(10))", () => {
  it("computes gratuity correctly for employee covered under Gratuity Act (15/26 formula)", () => {
    const basic = 80000;
    const years = 7;
    const months = 4;
    // months <= 6 -> effective years = 7
    const effectiveYears = months > 6 ? years + 1 : years;
    const gratuity = (15 * basic * effectiveYears) / 26;

    expect(effectiveYears).toBe(7);
    expect(Math.round(gratuity)).toBe(323077);
  });

  it("rounds up months > 6 to next year for covered employees", () => {
    const basic = 80000;
    const years = 7;
    const months = 8;
    // months > 6 -> effective years = 8
    const effectiveYears = months > 6 ? years + 1 : years;
    const gratuity = (15 * basic * effectiveYears) / 26;

    expect(effectiveYears).toBe(8);
    expect(Math.round(gratuity)).toBe(369231);
  });

  it("computes gratuity correctly for non-covered organizations (15/30 formula with completed years only)", () => {
    const basic = 60000;
    const years = 10;
    const gratuity = (15 * basic * years) / 30;

    expect(gratuity).toBe(300000);
  });

  it("enforces Section 10(10) statutory ₹20,00,000 exemption limit for private employees", () => {
    const basic = 300000;
    const years = 20;
    const actualGratuity = (15 * basic * years) / 26; // ~34,61,538
    const exemptCap = 2000000;
    const exemptAmount = Math.min(actualGratuity, exemptCap);
    const taxableAmount = Math.max(0, actualGratuity - exemptAmount);

    expect(actualGratuity).toBeGreaterThan(2000000);
    expect(exemptAmount).toBe(2000000);
    expect(Math.round(taxableAmount)).toBe(Math.round(actualGratuity - 2000000));
  });
});

describe("Leave Encashment (Section 10(10AA))", () => {
  it("computes leave encashment gross value based on 30-day salary", () => {
    const averageSalary = 90000;
    const leaveBalanceDays = 60;
    const dailyRate = averageSalary / 30;
    const grossEncashment = dailyRate * leaveBalanceDays;

    expect(dailyRate).toBe(3000);
    expect(grossEncashment).toBe(180000);
  });

  it("enforces statutory exemption cap of ₹25,00,000 for non-government employees", () => {
    const averageSalary = 300000;
    const leaveBalanceDays = 300;
    const grossEncashment = (averageSalary / 30) * leaveBalanceDays; // ₹30,00,000
    const exemptLimit = 2500000;
    const exemptAmount = Math.min(grossEncashment, exemptLimit);
    const taxableAmount = Math.max(0, grossEncashment - exemptLimit);

    expect(grossEncashment).toBe(3000000);
    expect(exemptAmount).toBe(2500000);
    expect(taxableAmount).toBe(500000);
  });
});

describe("NPS Tier-1 Pension & Wealth Accumulation Simulator", () => {
  it("projects total NPS corpus and 60% lump sum vs 40% annuity split", () => {
    const initial = 100000;
    const monthly = 10000;
    const years = 10;
    const totalMonths = years * 12;
    const annualReturn = 12 / 100;
    const r = annualReturn / 12;

    const fvInitial = initial * Math.pow(1 + r, totalMonths);
    const fvMonthly = monthly * ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r);
    const totalCorpus = fvInitial + fvMonthly;

    const annuityRatio = 40;
    const annuityCorpus = (totalCorpus * annuityRatio) / 100;
    const lumpSum = totalCorpus - annuityCorpus;

    const annuityYield = 6 / 100;
    const monthlyPension = (annuityCorpus * annuityYield) / 12;

    expect(totalCorpus).toBeGreaterThan(2300000);
    expect(lumpSum).toBeCloseTo(totalCorpus * 0.6, 0);
    expect(annuityCorpus).toBeCloseTo(totalCorpus * 0.4, 0);
    expect(monthlyPension).toBeGreaterThan(4500);
  });
});

describe("GST and Income Tax TDS Rules", () => {
  it("computes exclusive GST with intra-state CGST & SGST split", () => {
    const baseValue = 100000;
    const rate = 18;
    const tax = (baseValue * rate) / 100;
    const cgst = tax / 2;
    const sgst = tax / 2;
    const total = baseValue + tax;

    expect(tax).toBe(18000);
    expect(cgst).toBe(9000);
    expect(sgst).toBe(9000);
    expect(total).toBe(118000);
  });

  it("computes reverse/inclusive GST correctly", () => {
    const grossInvoice = 118000;
    const rate = 18;
    const baseValue = grossInvoice / (1 + rate / 100);
    const tax = grossInvoice - baseValue;

    expect(Math.round(baseValue)).toBe(100000);
    expect(Math.round(tax)).toBe(18000);
  });

  it("applies Section 206AA penalty rate (20%) when PAN is not provided", () => {
    const grossBill = 50000;
    const hasPan = false;
    const standardRate = 10;
    const effectiveRate = !hasPan ? 20 : standardRate;
    const tds = (grossBill * effectiveRate) / 100;
    const netPayable = grossBill - tds;

    expect(effectiveRate).toBe(20);
    expect(tds).toBe(10000);
    expect(netPayable).toBe(40000);
  });

  it("applies Section 194Q only on amount exceeding ₹50 Lakhs threshold", () => {
    const purchaseAmount = 6500000; // 65 Lakhs
    const threshold = 5000000; // 50 Lakhs
    const taxableBase = Math.max(0, purchaseAmount - threshold); // 15 Lakhs
    const rate = 0.1 / 100; // 0.1%
    const tds = taxableBase * rate;

    expect(taxableBase).toBe(1500000);
    expect(tds).toBe(1500);
  });
});
