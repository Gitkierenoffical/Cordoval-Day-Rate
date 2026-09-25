export type FormDefaults = {
  yearlyIncome: string;
  yearlyCosts: string;
  billableDays: string;
  taxPercent: string;
  projectDays: string;
  vatPercent: string;
};

export const defaultForm: FormDefaults = {
  yearlyIncome: "",
  yearlyCosts: "",
  billableDays: "200",
  taxPercent: "0",
  projectDays: "1",
  vatPercent: "20",
};

function parseMoney(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  const normalised = trimmed.replace(/,/g, "");
  if (!/^-?\d*(\.\d+)?$/.test(normalised)) return null;
  const n = Number(normalised);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parsePercent(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const normalised = trimmed.replace(/,/g, "");
  if (!/^-?\d*(\.\d+)?$/.test(normalised)) return null;
  const n = Number(normalised);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parsePositiveDays(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const normalised = trimmed.replace(/,/g, "");
  if (!/^\d+$/.test(normalised)) return null;
  const n = Number(normalised);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export type CalculationResult =
  | { ok: false; error: string }
  | {
      ok: true;
      dayRate: number;
      halfDayRate: number;
      projectPrice: number;
      projectPriceWithVat: number;
      dayRateWithVat: number;
    };

export function calculate(form: FormDefaults): CalculationResult {
  const yearlyIncome = parseMoney(form.yearlyIncome);
  if (yearlyIncome === null) {
    return { ok: false, error: "Enter a valid yearly income to keep." };
  }

  const yearlyCosts = parseMoney(form.yearlyCosts);
  if (yearlyCosts === null) {
    return { ok: false, error: "Enter valid yearly business costs." };
  }

  const billableDays = parsePositiveDays(form.billableDays);
  if (billableDays === null) {
    return { ok: false, error: "Billable days must be greater than zero." };
  }

  const taxPercent = parsePercent(form.taxPercent);
  if (taxPercent === null) {
    return { ok: false, error: "Enter a valid tax percent." };
  }
  if (taxPercent < 0 || taxPercent >= 100) {
    return {
      ok: false,
      error: "Tax percent must be from 0 up to but not including 100.",
    };
  }

  const projectDays = parsePositiveDays(form.projectDays);
  if (projectDays === null) {
    return { ok: false, error: "Project days must be greater than zero." };
  }

  const vatPercent = parsePercent(form.vatPercent);
  if (vatPercent === null || vatPercent < 0) {
    return { ok: false, error: "VAT percent must be zero or more." };
  }

  const base = yearlyIncome + yearlyCosts;
  const amountToEarn =
    taxPercent === 0 ? base : base / (1 - taxPercent / 100);

  const dayRate = amountToEarn / billableDays;
  const halfDayRate = dayRate / 2;
  const projectPrice = dayRate * projectDays;
  const projectPriceWithVat = projectPrice * (1 + vatPercent / 100);
  const dayRateWithVat = dayRate * (1 + vatPercent / 100);

  return {
    ok: true,
    dayRate,
    halfDayRate,
    projectPrice,
    projectPriceWithVat,
    dayRateWithVat,
  };
}

const gbpFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGbp(amount: number): string {
  return gbpFormatter.format(amount);
}

export function buildCopySummary(
  result: Extract<CalculationResult, { ok: true }>,
): string {
  return [
    `Day rate: ${formatGbp(result.dayRate)}`,
    `Half day: ${formatGbp(result.halfDayRate)}`,
    `Project price (ex VAT): ${formatGbp(result.projectPrice)}`,
    `Project price (inc VAT): ${formatGbp(result.projectPriceWithVat)}`,
  ].join("\n");
}
