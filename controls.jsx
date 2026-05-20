/* global React */
// Form control primitives + small helpers.

const { useState, useRef, useEffect, useMemo, useCallback } = React;

// ── US states for selects ──
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
  "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK",
  "OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

// ── validators ──
const Validators = {
  required: (v) => (v == null || v === "" || (Array.isArray(v) && v.length === 0)) ? "Required" : null,
  email: (v) => !v ? null : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email"),
  phone: (v) => !v ? null : (v.replace(/\D/g,"").length >= 10 ? null : "Invalid phone"),
  zip: (v) => !v ? null : (/^\d{5}(-\d{4})?$/.test(v) ? null : "Invalid ZIP"),
  ssn: (v) => !v ? null : (/^\d{3}-?\d{2}-?\d{4}$/.test(v) ? null : "Invalid SSN"),
  date: (v) => !v ? null : (/^\d{4}-\d{2}-\d{2}$/.test(v) ? null : "Invalid date"),
  minAge: (years) => (v) => {
    if (!v) return null;
    const d = new Date(v); if (isNaN(d)) return "Invalid date";
    const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= years ? null : `Must be ${years}+`;
  },
};

// Run a set of validators, return first error
const runValidators = (value, list) => {
  if (!list) return null;
  for (const v of list) { const e = v(value); if (e) return e; }
  return null;
};

// Format helpers
const fmtPhone = (raw) => {
  const d = (raw || "").replace(/\D/g,"").slice(0,10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
};
const fmtSSN = (raw) => {
  const d = (raw || "").replace(/\D/g,"").slice(0,9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,5)}-${d.slice(5)}`;
};

// ── Field wrapper ──
function Field({ label, required, hint, error, children, span }) {
  return (
    <div className="fieldset" style={span ? { gridColumn: `span ${span}` } : null}>
      <label>
        {label}
        {required && <span className="req">*</span>}
        {hint && <span className="hint">{hint}</span>}
      </label>
      {children}
      {error && <div className="err">{error}</div>}
    </div>
  );
}

// ── Input ──
function Input({ value, onChange, error, type = "text", placeholder, mono, format, ...rest }) {
  const handleChange = (e) => {
    let v = e.target.value;
    if (format === "phone") v = fmtPhone(v);
    if (format === "ssn") v = fmtSSN(v);
    onChange(v);
  };
  return (
    <input
      type={type}
      className={`input ${mono ? "mono" : ""} ${error ? "invalid" : ""}`}
      value={value || ""}
      onChange={handleChange}
      placeholder={placeholder}
      {...rest}
    />
  );
}

function Textarea({ value, onChange, error, placeholder, rows, ...rest }) {
  return (
    <textarea
      className={`textarea ${error ? "invalid" : ""}`}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      {...rest}
    />
  );
}

// ── Select ──
function Select({ value, onChange, options, placeholder, error, mono, ...rest }) {
  const empty = !value;
  return (
    <select
      className={`select ${mono ? "mono" : ""} ${error ? "invalid" : ""} ${empty ? "is-placeholder" : ""}`}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      <option value="" disabled hidden>{placeholder || "Select…"}</option>
      {options.map((o) => {
        const isObj = typeof o === "object";
        const val = isObj ? o.value : o;
        const lbl = isObj ? o.label : o;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  );
}

// ── Radio group (big tiles or compact) ──
function Choices({ value, onChange, options, compact, name }) {
  return (
    <div className="choices">
      {options.map((o) => {
        const val = typeof o === "object" ? o.value : o;
        const lbl = typeof o === "object" ? o.label : o;
        const on = value === val;
        return (
          <label key={val} className={`choice ${compact ? "compact" : ""} ${on ? "on" : ""}`}>
            <span className="dot"></span>
            <input
              type="radio"
              name={name}
              checked={on}
              onChange={() => onChange(val)}
            />
            <span>{lbl}</span>
          </label>
        );
      })}
    </div>
  );
}

// ── Checkbox ──
function Check({ checked, onChange, children }) {
  return (
    <label className={`check ${checked ? "on" : ""}`}>
      <span className="box"></span>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

// ── Endorsement chips ──
function Chip({ code, label, checked, onChange }) {
  return (
    <label className={`chip ${checked ? "on" : ""}`}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="badge">{code}</span>
      <span className="lbl">{label}</span>
    </label>
  );
}

// ── Document upload card ──
// Stores file as { name, size, type, dataUrl } so the preview survives state changes.
const fileToObj = (file) => new Promise((resolve) => {
  if (!file) return resolve(null);
  const reader = new FileReader();
  reader.onload = () => resolve({
    name: file.name,
    size: file.size,
    type: file.type,
    dataUrl: file.type.startsWith("image/") ? reader.result : null,
  });
  reader.readAsDataURL(file);
});
const fmtSize = (b) => {
  if (!b && b !== 0) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

function DocUpload({ code, label, sub, required, accept = "image/*,application/pdf", maxMB = 10, value, onChange, icon, error: extError }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = async (files) => {
    setError(null);
    const f = files && files[0];
    if (!f) return;
    if (f.size > maxMB * 1024 * 1024) {
      setError(`File too large — max ${maxMB} MB`);
      return;
    }
    onChange(await fileToObj(f));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const allowsImage = accept.includes("image");
  // Show external (form-level) error when no file has been picked yet.
  const shownError = error || (!value && extError ? extError : null);

  return (
    <div className="doc">
      <div className="doc-hd">
        <span className="doc-code">{code}{required && <span className="req"> *</span>}</span>
        <span className="doc-label">{label}</span>
        {sub && <span className="doc-sub">{sub}</span>}
      </div>
      <div
        className={`doc-zone ${dragging ? "dragging" : ""} ${value ? "filled" : ""} ${shownError ? "err" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {allowsImage && (
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        )}
        {value ? (
          <div className="doc-preview">
            {value.dataUrl
              ? <img src={value.dataUrl} alt={value.name} />
              : <div className="doc-pdf">{(value.type || "").includes("pdf") ? "PDF" : "FILE"}</div>}
            <div className="doc-meta">
              <div className="doc-name" title={value.name}>{value.name}</div>
              <div className="doc-size">{fmtSize(value.size)} · uploaded</div>
            </div>
            <button type="button" className="doc-x" onClick={(e) => { e.stopPropagation(); onChange(null); }}
              aria-label="Remove file">×</button>
          </div>
        ) : (
          <>
            <div className="doc-icon">{icon}</div>
            <div className="doc-buttons">
              {allowsImage && (
                <button type="button" className="doc-btn primary" onClick={() => cameraRef.current?.click()}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Take photo
                </button>
              )}
              <button type="button" className={`doc-btn ${allowsImage ? "ghost" : "primary"}`} onClick={() => fileRef.current?.click()}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload file
              </button>
            </div>
            <div className="doc-fmt">or drag here · JPG · PNG · PDF · up to {maxMB} MB</div>
          </>
        )}
      </div>
      {shownError && (
        <div className="err" style={{ marginTop: 6, fontSize: 12, color: "var(--bad)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 14, height: 14, background: "var(--bad)", color: "#fff", borderRadius: "50%", fontSize: 9, fontWeight: 800 }}>!</span>
          {shownError}
        </div>
      )}
    </div>
  );
}

// expose
Object.assign(window, {
  US_STATES, Validators, runValidators, fmtPhone, fmtSSN,
  Field, Input, Textarea, Select, Choices, Check, Chip, DocUpload,
});
