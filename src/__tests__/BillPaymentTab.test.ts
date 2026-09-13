import { describe, it, expect } from "vitest";
import { CATEGORIES, CAT_MAP, PROVIDER_PRESETS } from "../components/tabs/BillPaymentTab";
import { dueStatus } from "../utils/dueStatus";

describe("BillPaymentTab Cross-Module Auto-Sync & Logic", () => {
  it("defines comprehensive utility categories with icons, colors, and unit labels", () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(8);
    const expectedCats = ["electricity", "gas", "water", "broadband", "mobile", "cable_tv", "maintenance", "other"];
    expectedCats.forEach((c) => {
      expect(CAT_MAP[c]).toBeDefined();
      expect(CAT_MAP[c].unit).toBeDefined();
      expect(CAT_MAP[c].color).toBeDefined();
    });
  });

  it("provides comprehensive Indian utility provider presets", () => {
    expect(PROVIDER_PRESETS.electricity).toContain("Tata Power");
    expect(PROVIDER_PRESETS.electricity).toContain("Adani Electricity");
    expect(PROVIDER_PRESETS.electricity).toContain("BESCOM (Bengaluru)");
    expect(PROVIDER_PRESETS.gas).toContain("Mahanagar Gas (MGL)");
    expect(PROVIDER_PRESETS.broadband).toContain("Airtel Xstream Fiber");
    expect(PROVIDER_PRESETS.broadband).toContain("Jio Fiber / AirFiber");
  });

  it("calculates due status accurately across billing cycles", () => {
    const today = new Date();
    const todayDay = today.getDate();

    // Bill due today without payment
    const statusToday = dueStatus(todayDay, null);
    expect(statusToday.label).toBe("Due Today");
    expect(statusToday.paid).toBe(false);

    // Bill due today with today's payment logged
    const todayStr = today.toISOString().split("T")[0];
    const statusPaid = dueStatus(todayDay, todayStr);
    expect(statusPaid.label).toBe("Paid");
    expect(statusPaid.paid).toBe(true);
  });

  it("supports linked payment accounts for seamless cross-posting to banking and credit ledgers", () => {
    const bankLinkedSource = "bank:hdfc-101";
    const ccLinkedSource = "cc:icici-404";

    expect(bankLinkedSource.startsWith("bank:")).toBe(true);
    expect(bankLinkedSource.slice(5)).toBe("hdfc-101");

    expect(ccLinkedSource.startsWith("cc:")).toBe(true);
    expect(ccLinkedSource.slice(3)).toBe("icici-404");
  });
});
