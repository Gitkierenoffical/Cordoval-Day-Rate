import { useEffect, useId, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  buildCopySummary,
  calculate,
  defaultForm,
  formatGbp,
  type FormDefaults,
} from "./calculator";

const PRIVACY_URL = "https://scrub.cordoval.co.uk/privacy";
const TERMS_URL = "https://scrub.cordoval.co.uk/terms";

function App() {
  const [form, setForm] = useState<FormDefaults>(defaultForm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => calculate(form), [form]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  function updateField<K extends keyof FormDefaults>(
    key: K,
    value: FormDefaults[K],
  ) {
    setCopied(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClear() {
    setCopied(false);
    setForm({ ...defaultForm });
  }

  function handleCopy() {
    if (!result.ok) return;
    const text = buildCopySummary(result);

    function legacyCopy(): boolean {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } finally {
        document.body.removeChild(textarea);
      }
      return ok;
    }

    const legacyOk = legacyCopy();
    flushSync(() => {
      setCopied(true);
    });
    if (!legacyOk) {
      window.setTimeout(() => {
        void navigator.clipboard?.writeText(text);
      }, 0);
    }
  }

  const incomeId = useId();
  const costsId = useId();
  const billableId = useId();
  const taxId = useId();
  const projectDaysId = useId();
  const vatId = useId();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a
            href="https://cordoval.co.uk"
            className="brand"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/logos/day-rate.svg"
              alt=""
              width={36}
              height={36}
              className="brand-mark"
            />
            <span className="brand-name">Cordoval</span>
          </a>
          <a
            href="https://cordoval.co.uk"
            target="_blank"
            rel="noreferrer"
            className="header-link"
          >
            cordoval.co.uk
          </a>
        </div>
      </header>

      <main className="main">
        <div className="page">
          <p className="badge">Runs entirely in your browser</p>
          <h1 className="title">Cordoval Day Rate</h1>
          <p className="lede">
            Work out your freelance day rate from the income you want to keep,
            your business costs, and how many days you can bill.
          </p>

          <section className="card" aria-labelledby="inputs-heading">
            <h2 id="inputs-heading" className="visually-hidden">
              Your figures
            </h2>

            <div className="field-grid">
              <div className="field">
                <label htmlFor={incomeId}>Yearly income to keep</label>
                <div className="input-wrap">
                  <span className="input-prefix" aria-hidden="true">£</span>
                  <input
                    id={incomeId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.yearlyIncome}
                    onChange={(e) =>
                      updateField("yearlyIncome", e.target.value)
                    }
                    placeholder="80000"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor={costsId}>Yearly business costs</label>
                <div className="input-wrap">
                  <span className="input-prefix" aria-hidden="true">£</span>
                  <input
                    id={costsId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.yearlyCosts}
                    onChange={(e) => updateField("yearlyCosts", e.target.value)}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor={billableId}>Billable days per year</label>
                <input
                  id={billableId}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.billableDays}
                  onChange={(e) => updateField("billableDays", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor={taxId}>Tax percent (optional)</label>
                <div className="input-wrap">
                  <input
                    id={taxId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.taxPercent}
                    onChange={(e) => updateField("taxPercent", e.target.value)}
                  />
                  <span className="input-suffix" aria-hidden="true">%</span>
                </div>
              </div>

              <div className="field">
                <label htmlFor={projectDaysId}>Project days</label>
                <input
                  id={projectDaysId}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.projectDays}
                  onChange={(e) => updateField("projectDays", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor={vatId}>VAT percent (display only)</label>
                <div className="input-wrap">
                  <input
                    id={vatId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.vatPercent}
                    onChange={(e) => updateField("vatPercent", e.target.value)}
                  />
                  <span className="input-suffix" aria-hidden="true">%</span>
                </div>
              </div>
            </div>

            <div className="actions">
              <button type="button" className="btn-secondary" onClick={handleClear}>
                Clear
              </button>
            </div>

            {!result.ok && (
              <p className="error" role="status">{result.error}</p>
            )}

            {result.ok && (
              <div className="results">
                <dl className="rate-list">
                  <div className="rate-row">
                    <dt>Day rate</dt>
                    <dd>{formatGbp(result.dayRate)}</dd>
                  </div>
                  <div className="rate-row">
                    <dt>Half-day rate</dt>
                    <dd>{formatGbp(result.halfDayRate)}</dd>
                  </div>
                  <div className="rate-row">
                    <dt>Minimum project price</dt>
                    <dd>{formatGbp(result.projectPrice)}</dd>
                  </div>
                  <div className="rate-row muted">
                    <dt>Day rate with VAT</dt>
                    <dd>{formatGbp(result.dayRateWithVat)}</dd>
                  </div>
                  <div className="rate-row muted">
                    <dt>Minimum project price with VAT</dt>
                    <dd>{formatGbp(result.projectPriceWithVat)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCopy}
                >
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>
            A{" "}
            <a
              href="https://cordoval.co.uk"
              target="_blank"
              rel="noreferrer"
            >
              Cordoval
            </a>{" "}
            product. Nothing is stored.
          </p>
          <nav className="footer-nav" aria-label="Legal">
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            <a href={TERMS_URL} target="_blank" rel="noreferrer">
              Terms of Service
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default App;
