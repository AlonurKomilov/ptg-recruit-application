/* global React, ReactDOM, STEPS, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakButton */
// PTG · Apply page (v2) — matches premiertruckinggroup.com aesthetic.

const { useState, useMemo, useEffect, useRef } = React;

// Persisted tweak defaults — edited via the Tweaks panel.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "premier",
  "density": "regular",
  "showHeadMeta": true
}/*EDITMODE-END*/;

// Sample driver — fills every required field so reviewers can preview Step 7.
const SAMPLE_DATA = {
  gate: { cdl1yr: "yes", age21: "yes", workAuth: "yes", cdlClassA: "yes", dotMedical: "yes" },
  personal: {
    first: "Marcus", middle: "Ray", last: "Holloway",
    dob: "1986-04-12", ssn: "555-66-7777",
    phone: "(513) 555-2840", email: "marcus.holloway@example.com",
    addr1: "418 Tradesman Ln", addr2: "",
    city: "Cincinnati", state: "OH", zip: "45215", yearsAtAddr: "6",
  },
  cdl: {
    number: "H82710449", state: "OH", class: "A", exp: "2028-09-30",
    restrictions: "",
    endorsements: { H: true, N: true, T: true, X: false, P: false, S: false },
    twic: "yes", hazmat: "current", military: true,
    docs: {
      cdlFront: { name: "cdl-front.jpg", size: 842113, type: "image/jpeg", dataUrl: null },
      cdlBack:  { name: "cdl-back.jpg",  size: 793204, type: "image/jpeg", dataUrl: null },
      medical:  { name: "dot-medical-card.pdf", size: 218445, type: "application/pdf", dataUrl: null },
    },
  },
  experience: {
    yearsCdl: "10-14", totalMiles: "1M–2M", longestRun: "2,640",
    equipment: ["Dry van", "Reefer", "Flatbed"],
    regions: ["OTR (48-state)", "Regional SE"],
    preferredRole: "otr",
  },
  employment: [
    {
      company: "Rolling Iron Logistics", phone: "(704) 555-1188",
      city: "Concord", state: "NC", position: "Lead OTR Driver",
      from: "2022-03", to: "", current: true,
      equipment: "53' dry van, day cab", reason: "—",
      fmcsa: "yes", contactOk: "later",
    },
    {
      company: "Piedmont Reefer Co.", phone: "(336) 555-7711",
      city: "Greensboro", state: "NC", position: "OTR Driver",
      from: "2018-06", to: "2022-02", current: false,
      equipment: "Refrigerated 53'", reason: "Career advancement",
      fmcsa: "yes", contactOk: "yes",
    },
  ],
  incidents: {
    hasAccidents: "no",
    hasViolations: "yes",
    violations: [{ date: "2024-08-14", state: "TN", charge: "Speeding 8 over", penalty: "$110 fine", status: "Convicted" }],
    hasSuspensions: "no",
    hasDenial: "no",
  },
  consents: {
    psp: true, mvr: true, clearinghouse: true,
    fcra: true, drug: true, truthful: true,
    sigName: "Marcus Holloway",
    sigDate: new Date().toISOString().slice(0, 10),
  },
};

// ── deep set ──
function deepSet(obj, path, value) {
  const keys = path.split(".");
  const next = Array.isArray(obj) ? obj.slice() : { ...obj };
  let cur = next;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const v = cur[k];
    cur[k] = (v && typeof v === "object" && !Array.isArray(v)) ? { ...v } : (Array.isArray(v) ? v.slice() : {});
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return next;
}

// ── icons ──
const Icon = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/></svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

// ── Brand wordmark ──
function Brand() {
  return (
    <a href="#" className="brand">
      <div className="logo-slot" aria-label="PTG logo">LOGO</div>
      <div className="wordmark">
        <div className="wordmark-top">Premier Trucking <em>Group</em></div>
        <div className="wordmark-bot">Driver recruiting · Cincinnati, OH</div>
      </div>
    </a>
  );
}

function TopBar({ onOpenMenu }) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Brand />
        <nav className="nav">
          <a href="https://premiertruckinggroup.com/">Home</a>
          <a href="https://premiertruckinggroup.com/about-us/">About Us</a>
          <a href="https://premiertruckinggroup.com/company-drivers/">Company Drivers</a>
          <a href="https://premiertruckinggroup.com/owner-operators/">Own with Us</a>
          <a href="https://premiertruckinggroup.com/services/states/">States</a>
          <a href="https://premiertruckinggroup.com/contact-us/">Contact Us</a>
          <a href="#" className="active">Apply</a>
        </nav>
        <a className="call-cta" href="tel:+15134930303">
          {Icon.phone}
          (513) 493-0303
        </a>
        <button className="menu-btn" aria-label="Menu" onClick={onOpenMenu}>{Icon.menu}</button>
      </div>
    </header>
  );
}

function MobileDrawer({ open, onClose }) {
  // Lock scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="drawer-hd">
          <span className="ttl">Menu</span>
          <button className="drawer-close" onClick={onClose} aria-label="Close menu">×</button>
        </div>
        <nav className="drawer-nav" onClick={(e) => { if (e.target.tagName === "A") onClose(); }}>
          <a href="https://premiertruckinggroup.com/">Home</a>
          <a href="https://premiertruckinggroup.com/about-us/">About Us</a>
          <a href="https://premiertruckinggroup.com/company-drivers/">Company Drivers</a>
          <a href="https://premiertruckinggroup.com/owner-operators/">Own with Us</a>
          <a href="https://premiertruckinggroup.com/services/states/">States</a>
          <a href="https://premiertruckinggroup.com/contact-us/">Contact Us</a>
          <a href="#" className="active">Apply</a>
        </nav>
        <div className="drawer-ft">
          <a className="call-cta" href="tel:+15134930303">
            {Icon.phone}
            (513) 493-0303
          </a>
        </div>
      </aside>
    </>
  );
}

function PageHead({ showMeta }) {
  return (
    <section className="page-head">
      <div className="container">
        <div className="crumbs">
          <a href="https://premiertruckinggroup.com/">Home</a>
          <span className="sep">›</span>
          <span className="cur">Driver Application</span>
        </div>
        <h1 className="page-title">
          Apply to drive with <em>Premier Trucking Group</em>.
        </h1>
        <p className="page-lead">
          OTR routes, dry van freight, full dispatch, and weekly pay up to <b>$3,000</b>.
          Submit your driver file in about 8 minutes — we'll be in touch within 24 hours.
        </p>
        {showMeta && (
          <div className="head-meta">
            <div className="pill">{Icon.clock} <span><b>≈8 min</b> · all questions inline</span></div>
            <div className="pill">{Icon.shield} <span>Encrypted · DOT-compliant</span></div>
            <div className="pill">{Icon.check} <span><b>24-hour</b> decision turnaround</span></div>
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p className="blurb">
              Premier Trucking Group Inc. — full dispatch service and nationwide OTR
              dry-van capacity. Based in Cincinnati, OH and serving 48 states with a fleet
              of 86 modern trucks and 500+ broker partners.
            </p>
            <div className="social">
              <a href="https://www.facebook.com/premiertruckinggroupInc/" aria-label="Facebook">{Icon.facebook}</a>
              <a href="https://www.instagram.com/premiertruckinggroup/" aria-label="Instagram">{Icon.instagram}</a>
              <a href="https://www.linkedin.com/company/premier-trucking-group-inc/" aria-label="LinkedIn">{Icon.linkedin}</a>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="https://premiertruckinggroup.com/">Home</a></li>
              <li><a href="https://premiertruckinggroup.com/about-us/">About Us</a></li>
              <li><a href="https://premiertruckinggroup.com/company-drivers/">Company Drivers</a></li>
              <li><a href="https://premiertruckinggroup.com/owner-operators/">Own with Us</a></li>
              <li><a href="https://premiertruckinggroup.com/services/states/">States</a></li>
              <li><a href="https://premiertruckinggroup.com/contact-us/">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4>States</h4>
            <ul>
              <li><a href="#">Ohio</a></li>
              <li><a href="#">Texas</a></li>
              <li><a href="#">California</a></li>
              <li><a href="#">Arizona</a></li>
              <li><a href="#">Colorado</a></li>
              <li><a href="https://premiertruckinggroup.com/services/states/">More States</a></li>
            </ul>
          </div>
          <div>
            <h4>Get in touch</h4>
            <div className="footer-contact">
              <div className="row-c">
                {Icon.phone}
                <div>
                  <div className="lbl">Phone</div>
                  <a className="val" href="tel:+15134930303">+1 (513) 493-0303</a>
                </div>
              </div>
              <div className="row-c">
                {Icon.email}
                <div>
                  <div className="lbl">Recruiting</div>
                  <a className="val" href="mailto:recruiting@premiertruckinggroup.com">
                    recruiting@premiertruckinggroup.com
                  </a>
                </div>
              </div>
              <div className="row-c">
                {Icon.pin}
                <div>
                  <div className="lbl">Address</div>
                  <span className="val">
                    10390 Taconic Terrace<br/>Cincinnati, OH 45215
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-legal">
          <span>© 2026 Premier Trucking Group Inc. · All rights reserved.</span>
          <span>
            <a href="#">Privacy</a> · <a href="#">Terms</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── Success ──
function Success({ data, onReset }) {
  const ref = `PTG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  return (
    <div className="card success-card">
      <div className="success-icon">{Icon.check}</div>
      <h2>Application submitted</h2>
      <p>
        Thanks {(data.personal && data.personal.first) || "driver"} — a PTG recruiter will reach out within{" "}
        <b>24 hours</b> at <b>{(data.personal && data.personal.phone) || "the number you provided"}</b>.
        Have your CDL, DOT medical card, and last 3 years of employer info ready for the call.
      </p>
      <div className="ref-box">
        <span className="ref-label">Your reference number</span>
        <span className="ref-num">{ref}</span>
      </div>
      <div className="mt-4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn ghost" onClick={onReset}>Start a new application</button>
        <a className="btn" href="https://premiertruckinggroup.com/">Back to ptg.com</a>
      </div>
    </div>
  );
}

// ── Stepper rail ──
function Stepper({ current, max, onJump }) {
  return (
    <aside className="stepper" aria-label="Application progress">
      <div className="stepper-hd">Application progress</div>
      {STEPS.map((s, i) => {
        const status = i < current ? "done" : i === current ? "current" : "";
        const reachable = i <= max;
        return (
          <button
            key={i}
            type="button"
            className={`step ${status} ${!reachable ? "disabled" : ""}`}
            onClick={() => reachable && onJump(i)}
            aria-current={i === current ? "step" : undefined}
          >
            <span className="step-num"><span>{i + 1}</span></span>
            <span>
              <span className="step-title">{s.title}</span>
              <span className="step-sub">{s.sub}</span>
            </span>
          </button>
        );
      })}
    </aside>
  );
}

// ── Main form ──
function ApplicationForm() {
  const [data, setData] = useState({});
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [attempted, setAttempted] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const cardRef = useRef(null);

  const set = (path, value) => setData((d) => deepSet(d, path, value));

  const curStep = STEPS[step];
  const errors = useMemo(() => curStep.validate(data), [step, data]);
  const hasErrors = Object.keys(errors).length > 0;
  const showErrors = attempted[step];
  const visibleErrors = showErrors ? errors : {};

  const scrollToCard = () => {
    const el = cardRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const next = () => {
    if (hasErrors) {
      setAttempted((a) => ({ ...a, [step]: true }));
      setTimeout(() => {
        const el = document.querySelector(".invalid, .err");
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 50);
      return;
    }
    if (step === STEPS.length - 1) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const n = step + 1;
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
    setTimeout(scrollToCard, 30);
  };

  const back = () => {
    if (step === 0) return;
    setStep(step - 1);
    setTimeout(scrollToCard, 30);
  };

  const jumpTo = (i) => {
    if (i <= maxReached) {
      setStep(i);
      setTimeout(scrollToCard, 30);
    }
  };

  const reset = () => {
    setData({}); setStep(0); setMaxReached(0); setAttempted({}); setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handler = () => {
      setData(SAMPLE_DATA);
      setMaxReached(STEPS.length - 1);
      setStep(STEPS.length - 1);
      setTimeout(scrollToCard, 30);
    };
    window.addEventListener("ptg:prefill", handler);
    return () => window.removeEventListener("ptg:prefill", handler);
  }, []);

  if (submitted) {
    return (
      <section className="app-wrap">
        <div className="container">
          <Success data={data} onReset={reset} />
        </div>
      </section>
    );
  }

  const StepRender = curStep.Render;

  return (
    <section className="app-wrap">
      <div className="container">
        <div className="app-grid">
          <Stepper current={step} max={maxReached} onJump={jumpTo} />
          <div className="card" ref={cardRef}>
            <div className="card-hd">
              <h3 className="ttl">
                <small>Step {step + 1} of {STEPS.length}</small>
                {curStep.title}
              </h3>
              <div className="meta">
                <div className="progress">
                  {STEPS.map((_, i) => (
                    <i key={i} className={i < step ? "done" : i === step ? "on" : ""}></i>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-bd">
              <StepRender data={data} set={set} errors={visibleErrors} />
            </div>
            <div className="card-ft">
              <button className="btn ghost" onClick={back} disabled={step === 0}>
                <span className="arrow">←</span> Back
              </button>
              <div style={{ flex: 1 }}></div>
              <button className="btn" onClick={next}>
                {step === STEPS.length - 1 ? "Submit application" : "Continue"}{" "}
                <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-palette", t.palette || "premier");
    root.setAttribute("data-density", t.density || "regular");
  }, [t.palette, t.density]);

  const PALETTES = [
    { id: "premier",  swatch: ["#0B2A5B", "#F4B400", "#F5F7FB"], label: "Premier Blue" },
    { id: "emerald",  swatch: ["#0F766E", "#F4B400", "#F5F7FB"], label: "Emerald" },
    { id: "claret",   swatch: ["#9F1239", "#F4B400", "#F5F7FB"], label: "Claret" },
    { id: "midnight", swatch: ["#4F8DEC", "#F4B400", "#0A1A2F"], label: "Midnight" },
  ];

  return (
    <>
      <PageHead showMeta={t.showHeadMeta !== false} />
      <ApplicationForm />

      <TweaksPanel title="PTG · Tweaks">
        <TweakSection label="Brand palette" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {PALETTES.map((p) => {
            const on = (t.palette || "premier") === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTweak("palette", p.id)}
                style={{
                  border: on ? "1.5px solid #29261b" : ".5px solid rgba(0,0,0,.15)",
                  borderRadius: 8,
                  background: "rgba(255,255,255,.6)",
                  padding: "8px 10px",
                  cursor: "pointer",
                  textAlign: "left",
                  font: "inherit",
                }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {p.swatch.map((c, i) => (
                    <span key={i} style={{
                      display: "inline-block", width: 18, height: 18, borderRadius: 4,
                      background: c, border: ".5px solid rgba(0,0,0,.12)"
                    }} />
                  ))}
                </div>
                <div style={{ fontWeight: 600, fontSize: 11 }}>{p.label}</div>
              </button>
            );
          })}
        </div>

        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density || "regular"}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakToggle
          label="Trust pills on header"
          value={t.showHeadMeta !== false}
          onChange={(v) => setTweak("showHeadMeta", v)}
        />

        <TweakSection label="Demo data" />
        <TweakButton
          label="Fill in sample driver"
          onClick={() => window.dispatchEvent(new CustomEvent("ptg:prefill"))}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
