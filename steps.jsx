/* global React, Field, Input, Textarea, Select, Choices, Check, Chip, US_STATES, Validators, runValidators */
// Step components for the PTG driver application.
// Each step exports:
//   - title, sub, code (for stepper)
//   - render(props) — returns JSX
//   - validate(data) → {field: errMsg, ...}

// ───────────────────────── Step 1 — Pre-qualification ─────────────────────────
const Step1 = {
  code: "PTG-01 · GATE",
  title: "Pre-Qualification",
  sub: "DOT eligibility",
  validate(d) {
    const e = {};
    const g = d.gate || {};
    if (g.cdl1yr == null) e["gate.cdl1yr"] = "Required";
    if (g.age21 == null) e["gate.age21"] = "Required";
    if (g.workAuth == null) e["gate.workAuth"] = "Required";
    if (g.cdlClassA == null) e["gate.cdlClassA"] = "Required";
    if (g.dotMedical == null) e["gate.dotMedical"] = "Required";
    return e;
  },
  Render({ data, set, errors }) {
    const g = data.gate || {};
    const yn = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    return (
      <>
        <div className="note mb-2">
          <b>Federal Motor Carrier Safety Regulations §391.</b> Before we proceed, confirm baseline eligibility.
          All questions are required and answers are verified during onboarding.
        </div>
        <div className="group">
          <div className="group-label">Eligibility checklist <small>5 questions</small></div>
          <div className="row" style={{ gap: 20 }}>
            <Field label="Do you have at least two (2) years of verifiable CDL Class A driving experience?" required error={errors["gate.cdl1yr"]}>
              <Choices name="cdl1yr" value={g.cdl1yr} onChange={(v) => set("gate.cdl1yr", v)} options={yn} />
            </Field>
            <Field label="Are you 25 years of age or older?" required error={errors["gate.age21"]}>
              <Choices name="age21" value={g.age21} onChange={(v) => set("gate.age21", v)} options={yn} />
            </Field>
            <Field label="Are you legally authorized to work in the United States?" required error={errors["gate.workAuth"]}>
              <Choices name="workAuth" value={g.workAuth} onChange={(v) => set("gate.workAuth", v)} options={yn} />
            </Field>
            <Field label="Do you currently hold a valid CDL Class A?" required error={errors["gate.cdlClassA"]}>
              <Choices name="cdlClassA" value={g.cdlClassA} onChange={(v) => set("gate.cdlClassA", v)} options={yn} />
            </Field>
            <Field label="Do you have a current DOT medical card?" required hint="49 CFR §391.41" error={errors["gate.dotMedical"]}>
              <Choices name="dotMedical" value={g.dotMedical} onChange={(v) => set("gate.dotMedical", v)} options={yn} />
            </Field>
          </div>
        </div>
        {(g.cdl1yr === "no" || g.age21 === "no" || g.workAuth === "no" || g.cdlClassA === "no" || g.dotMedical === "no") && (
          <div className="note" style={{ borderLeftColor: "var(--bad)", marginTop: 20 }}>
            <b>Heads up.</b> One or more answers do not meet our baseline requirements. You can still submit your application —
            our recruiting team will reach out to discuss training programs and timing.
          </div>
        )}
      </>
    );
  }
};

// ───────────────────────── Step 2 — Personal info ─────────────────────────
const Step2 = {
  code: "PTG-02 · DRIVER",
  title: "Personal & Contact",
  sub: "Identity, address",
  validate(d) {
    const e = {};
    const p = d.personal || {};
    if (!p.first) e["personal.first"] = "Required";
    if (!p.last) e["personal.last"] = "Required";
    const dobErr = runValidators(p.dob, [Validators.required, Validators.date, Validators.minAge(18)]);
    if (dobErr) e["personal.dob"] = dobErr;
    const ssnErr = runValidators(p.ssn, [Validators.required, Validators.ssn]);
    if (ssnErr) e["personal.ssn"] = ssnErr;
    const phErr = runValidators(p.phone, [Validators.required, Validators.phone]);
    if (phErr) e["personal.phone"] = phErr;
    const emErr = runValidators(p.email, [Validators.required, Validators.email]);
    if (emErr) e["personal.email"] = emErr;
    if (!p.addr1) e["personal.addr1"] = "Required";
    if (!p.city) e["personal.city"] = "Required";
    if (!p.state) e["personal.state"] = "Required";
    const zipErr = runValidators(p.zip, [Validators.required, Validators.zip]);
    if (zipErr) e["personal.zip"] = zipErr;
    if (!p.yearsAtAddr) e["personal.yearsAtAddr"] = "Required";
    return e;
  },
  Render({ data, set, errors }) {
    const p = data.personal || {};
    return (
      <>
        <div className="group">
          <div className="group-label">Legal name <small>as printed on CDL</small></div>
          <div className="row cols-3">
            <Field label="First name" required error={errors["personal.first"]}>
              <Input value={p.first} onChange={(v) => set("personal.first", v)} placeholder="John" />
            </Field>
            <Field label="Middle name" hint="optional">
              <Input value={p.middle} onChange={(v) => set("personal.middle", v)} placeholder="Allen" />
            </Field>
            <Field label="Last name" required error={errors["personal.last"]}>
              <Input value={p.last} onChange={(v) => set("personal.last", v)} placeholder="Reyes" />
            </Field>
          </div>
        </div>

        <div className="group">
          <div className="group-label">Identification <small>encrypted at rest</small></div>
          <div className="row cols-2">
            <Field label="Date of birth" required hint="MM/DD/YYYY" error={errors["personal.dob"]}>
              <Input type="date" mono value={p.dob} onChange={(v) => set("personal.dob", v)} />
            </Field>
            <Field label="Social Security #" required hint="XXX-XX-XXXX" error={errors["personal.ssn"]}>
              <Input mono format="ssn" value={p.ssn} onChange={(v) => set("personal.ssn", v)} placeholder="000-00-0000" />
            </Field>
          </div>
        </div>

        <div className="group">
          <div className="group-label">Contact</div>
          <div className="row cols-2">
            <Field label="Mobile phone" required error={errors["personal.phone"]}>
              <Input mono format="phone" value={p.phone} onChange={(v) => set("personal.phone", v)} placeholder="(555) 123-4567" />
            </Field>
            <Field label="Email" required error={errors["personal.email"]}>
              <Input type="email" value={p.email} onChange={(v) => set("personal.email", v)} placeholder="driver@example.com" />
            </Field>
          </div>
        </div>

        <div className="group">
          <div className="group-label">Current address <small>at least 3 years required by §391.21</small></div>
          <div className="row">
            <Field label="Street address" required error={errors["personal.addr1"]}>
              <Input value={p.addr1} onChange={(v) => set("personal.addr1", v)} placeholder="1245 Industrial Pkwy" />
            </Field>
          </div>
          <div className="row cols-2 mt-2">
            <Field label="Apt / Unit">
              <Input value={p.addr2} onChange={(v) => set("personal.addr2", v)} placeholder="Suite 4B" />
            </Field>
            <Field label="Years at this address" required error={errors["personal.yearsAtAddr"]}>
              <Select value={p.yearsAtAddr} onChange={(v) => set("personal.yearsAtAddr", v)}
                options={["<1","1","2","3","4","5","6","7","8","9","10+"]} placeholder="Select…" />
            </Field>
          </div>
          <div className="row mix-state mt-2">
            <Field label="City" required error={errors["personal.city"]}>
              <Input value={p.city} onChange={(v) => set("personal.city", v)} placeholder="Charlotte" />
            </Field>
            <Field label="State" required error={errors["personal.state"]}>
              <Select mono value={p.state} onChange={(v) => set("personal.state", v)} options={US_STATES} placeholder="Select state" />
            </Field>
            <Field label="ZIP" required error={errors["personal.zip"]}>
              <Input mono value={p.zip} onChange={(v) => set("personal.zip", v)} placeholder="28202" />
            </Field>
          </div>
        </div>
      </>
    );
  }
};

// ───────────────────────── Step 3 — CDL & endorsements ─────────────────────────
const ENDORSEMENTS = [
  { code: "H", label: "Hazmat" },
  { code: "N", label: "Tank" },
  { code: "T", label: "Doubles / Triples" },
  { code: "X", label: "Tank + Hazmat" },
  { code: "P", label: "Passenger" },
  { code: "S", label: "School Bus" },
];
const Step3 = {
  code: "PTG-03 · CDL",
  title: "CDL & Documents",
  sub: "License + uploads",
  validate(d) {
    const e = {};
    const c = d.cdl || {};
    if (!c.number) e["cdl.number"] = "Required";
    if (!c.state) e["cdl.state"] = "Required";
    if (!c.class) e["cdl.class"] = "Required";
    if (!c.exp) e["cdl.exp"] = "Required";
    const docs = c.docs || {};
    if (!docs.cdlFront) e["cdl.docs.cdlFront"] = "Required";
    if (!docs.cdlBack)  e["cdl.docs.cdlBack"]  = "Required";
    if (!docs.medical)  e["cdl.docs.medical"]  = "Required";
    return e;
  },
  Render({ data, set, errors }) {
    const c = data.cdl || {};
    const end = c.endorsements || {};
    const docs = c.docs || {};
    return (
      <>
        <div className="group">
          <div className="group-label">Commercial driver's license</div>
          <div className="row cols-4">
            <Field label="CDL number" required error={errors["cdl.number"]} span={2}>
              <Input mono value={c.number} onChange={(v) => set("cdl.number", v)} placeholder="A0000000000" />
            </Field>
            <Field label="Issuing state" required error={errors["cdl.state"]}>
              <Select mono value={c.state} onChange={(v) => set("cdl.state", v)} options={US_STATES} placeholder="Select state" />
            </Field>
            <Field label="Class" required error={errors["cdl.class"]}>
              <Select value={c.class} onChange={(v) => set("cdl.class", v)} options={["A","B","C"]} placeholder="Select class" />
            </Field>
          </div>
          <div className="row cols-2 mt-2">
            <Field label="Expiration date" required error={errors["cdl.exp"]}>
              <Input type="date" mono value={c.exp} onChange={(v) => set("cdl.exp", v)} />
            </Field>
            <Field label="Restrictions" hint="leave blank if none">
              <Input mono value={c.restrictions} onChange={(v) => set("cdl.restrictions", v)} placeholder="e.g. K, L" />
            </Field>
          </div>
        </div>

        <div className="group">
          <div className="group-label">Endorsements <small>check all that apply</small></div>
          <div className="chips">
            {ENDORSEMENTS.map((en) => (
              <Chip key={en.code} code={en.code} label={en.label}
                checked={!!end[en.code]}
                onChange={(v) => set(`cdl.endorsements.${en.code}`, v)} />
            ))}
          </div>
        </div>

        <div className="group">
          <div className="group-label">Document uploads <small>required · max 10MB each</small></div>
          <div className="note mb-2">
            Upload clear photos or scans of each document. We accept <b>JPG, PNG, and PDF</b>.
            On mobile, tap <b>Take photo</b> to use your camera directly — make sure the entire
            document is in frame and readable.
          </div>
          <div className="docs-grid">
            <DocUpload
              code="DOC-A"
              label="CDL — Front"
              sub="Photo side"
              required
              value={docs.cdlFront}
              onChange={(v) => set("cdl.docs.cdlFront", v)}
              error={errors["cdl.docs.cdlFront"]}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="9" r="3.2"/>
                  <path d="M6 18c1.2-2.4 3.4-3.8 6-3.8s4.8 1.4 6 3.8"/>
                </svg>
              }
            />
            <DocUpload
              code="DOC-B"
              label="CDL — Back"
              sub="Barcode side"
              required
              value={docs.cdlBack}
              onChange={(v) => set("cdl.docs.cdlBack", v)}
              error={errors["cdl.docs.cdlBack"]}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6v12M7 6v12M10 6v12M14 6v12M17 6v12M20 6v12"/>
                </svg>
              }
            />
            <DocUpload
              code="DOC-C"
              label="DOT Medical Card"
              sub="Form MCSA-5876"
              required
              value={docs.medical}
              onChange={(v) => set("cdl.docs.medical", v)}
              error={errors["cdl.docs.medical"]}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="5" width="16" height="14" rx="1.5"/>
                  <path d="M12 9v6M9 12h6"/>
                </svg>
              }
            />
          </div>
        </div>

        <div className="group">
          <div className="group-label">Credentials</div>
          <div className="row cols-2">
            <Field label="TWIC card" hint="Transportation Worker Identification">
              <Choices compact value={c.twic} onChange={(v) => set("cdl.twic", v)}
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "pending", label: "In progress" }]} />
            </Field>
            <Field label="Hazmat clearance" hint="TSA HME">
              <Choices compact value={c.hazmat} onChange={(v) => set("cdl.hazmat", v)}
                options={[{ value: "current", label: "Current" }, { value: "expired", label: "Expired" }, { value: "none", label: "None" }]} />
            </Field>
          </div>
        </div>

        <div className="group">
          <div className="group-label">Military / specialty</div>
          <Check checked={c.military} onChange={(v) => set("cdl.military", v)}>
            <b>U.S. Armed Forces veteran</b>
            <small>We honor military driving experience and partner with the FMCSA Military Driver Program for qualifying veterans.</small>
          </Check>
        </div>
      </>
    );
  }
};

// ───────────────────────── Step 4 — Experience ─────────────────────────
const EQUIPMENT_TYPES = [
  "Dry van","Reefer","Flatbed","Step deck","Tanker","Hopper","Auto hauler",
  "Doubles","Triples","Hazmat","Heavy haul / oversize","Intermodal / container"
];
const REGIONS = ["OTR (48-state)","Regional NE","Regional SE","Regional MW","Regional SW","Regional W","Local / home daily","Canada","Mexico"];

const Step4 = {
  code: "PTG-04 · EXPERIENCE",
  title: "Driving Experience",
  sub: "Equipment & history",
  validate(d) {
    const e = {};
    const x = d.experience || {};
    if (!x.yearsCdl) e["experience.yearsCdl"] = "Required";
    if (!x.totalMiles) e["experience.totalMiles"] = "Required";
    if (!(x.equipment && x.equipment.length)) e["experience.equipment"] = "Select at least one";
    if (!(x.regions && x.regions.length)) e["experience.regions"] = "Select at least one";
    return e;
  },
  Render({ data, set, errors }) {
    const x = data.experience || {};
    const equip = x.equipment || [];
    const regs = x.regions || [];
    const toggleArr = (key, val) => {
      const cur = (x[key] || []).slice();
      const i = cur.indexOf(val);
      if (i >= 0) cur.splice(i, 1); else cur.push(val);
      set(`experience.${key}`, cur);
    };
    return (
      <>
        <div className="group">
          <div className="group-label">Career mileage</div>
          <div className="row cols-3">
            <Field label="Years driving CDL" required error={errors["experience.yearsCdl"]}>
              <Select value={x.yearsCdl} onChange={(v) => set("experience.yearsCdl", v)}
                options={["1","2","3","4","5","6-9","10-14","15-19","20+"]} />
            </Field>
            <Field label="Total career miles" required error={errors["experience.totalMiles"]}>
              <Select value={x.totalMiles} onChange={(v) => set("experience.totalMiles", v)}
                options={["<100,000","100k–250k","250k–500k","500k–1M","1M–2M","2M+"]} />
            </Field>
            <Field label="Longest single run" hint="miles, optional">
              <Input mono value={x.longestRun} onChange={(v) => set("experience.longestRun", v)} placeholder="e.g. 2,800" />
            </Field>
          </div>
        </div>

        <div className="group">
          <div className="group-label">Equipment operated <small>check all</small></div>
          <Field error={errors["experience.equipment"]}>
            <div className="chips">
              {EQUIPMENT_TYPES.map((t) => (
                <Chip key={t} code={t.split(" ")[0].slice(0,1).toUpperCase()} label={t}
                  checked={equip.includes(t)}
                  onChange={() => toggleArr("equipment", t)} />
              ))}
            </div>
          </Field>
        </div>

        <div className="group">
          <div className="group-label">Regions & lanes</div>
          <Field error={errors["experience.regions"]}>
            <div className="chips">
              {REGIONS.map((r) => (
                <Chip key={r} code={r.slice(0,1).toUpperCase()} label={r}
                  checked={regs.includes(r)}
                  onChange={() => toggleArr("regions", r)} />
              ))}
            </div>
          </Field>
        </div>

        <div className="group">
          <div className="group-label">Preferred role with PTG</div>
          <Choices value={x.preferredRole} onChange={(v) => set("experience.preferredRole", v)}
            options={[
              { value: "otr", label: "OTR" },
              { value: "regional", label: "Regional" },
              { value: "dedicated", label: "Dedicated" },
              { value: "local", label: "Local" },
            ]}
          />
        </div>
      </>
    );
  }
};

// ───────────────────────── Step 5 — Employment history ─────────────────────────
const blankJob = () => ({
  company: "", phone: "", city: "", state: "",
  position: "Driver", from: "", to: "",
  equipment: "", reason: "",
  fmcsa: null, contactOk: null,
});

const Step5 = {
  code: "PTG-05 · WORK HISTORY",
  title: "Employment History",
  sub: "Last 10 years · FMCSA",
  validate(d) {
    const e = {};
    const jobs = d.employment || [];
    if (jobs.length === 0) e["employment._"] = "Add at least one position";
    jobs.forEach((j, i) => {
      if (!j.company) e[`employment.${i}.company`] = "Required";
      if (!j.from) e[`employment.${i}.from`] = "Required";
      if (!j.to && !j.current) e[`employment.${i}.to`] = "Required";
      if (j.fmcsa == null) e[`employment.${i}.fmcsa`] = "Required";
    });
    return e;
  },
  Render({ data, set, errors }) {
    const jobs = data.employment || [];
    const setJob = (i, key, val) => {
      const next = jobs.slice();
      next[i] = { ...next[i], [key]: val };
      set("employment", next);
    };
    const addJob = () => set("employment", [...jobs, blankJob()]);
    const removeJob = (i) => set("employment", jobs.filter((_, idx) => idx !== i));

    return (
      <>
        <div className="note mb-2">
          <b>49 CFR §391.21(b)(10–11).</b> List every motor carrier (and other employer)
          in the past <b>10 years</b>. Gaps over 30 days must be explained. Most recent first.
        </div>

        {errors["employment._"] && jobs.length === 0 && (
          <div className="err" style={{ marginBottom: 12 }}>No employers added yet</div>
        )}

        {jobs.map((j, i) => (
          <div key={i} className="entry">
            <div className="entry-hd">
              <div className="tag">Position #{String(i + 1).padStart(2, "0")}{i === 0 ? " · MOST RECENT" : ""}</div>
              <div className="actions">
                <button type="button" onClick={() => removeJob(i)}>Remove</button>
              </div>
            </div>
            <div className="row cols-2">
              <Field label="Company / motor carrier" required error={errors[`employment.${i}.company`]}>
                <Input value={j.company} onChange={(v) => setJob(i, "company", v)} placeholder="ABC Logistics LLC" />
              </Field>
              <Field label="Position / title">
                <Input value={j.position} onChange={(v) => setJob(i, "position", v)} placeholder="CDL-A Driver" />
              </Field>
            </div>
            <div className="row mix-state mt-2">
              <Field label="City">
                <Input value={j.city} onChange={(v) => setJob(i, "city", v)} placeholder="Dallas" />
              </Field>
              <Field label="State">
                <Select mono value={j.state} onChange={(v) => setJob(i, "state", v)} options={US_STATES} placeholder="Select state" />
              </Field>
              <Field label="Phone">
                <Input mono format="phone" value={j.phone} onChange={(v) => setJob(i, "phone", v)} placeholder="(555) 555-5555" />
              </Field>
            </div>
            <div className="row cols-3 mt-2">
              <Field label="From" required error={errors[`employment.${i}.from`]}>
                <Input type="month" mono value={j.from} onChange={(v) => setJob(i, "from", v)} />
              </Field>
              <Field label="To" required error={errors[`employment.${i}.to`]}>
                <Input type="month" mono value={j.to} onChange={(v) => setJob(i, "to", v)} disabled={!!j.current} />
              </Field>
              <Field label=" " hint=" ">
                <Check checked={j.current} onChange={(v) => setJob(i, "current", v)}>
                  I currently work here
                </Check>
              </Field>
            </div>
            <div className="row cols-2 mt-2">
              <Field label="Equipment operated">
                <Input value={j.equipment} onChange={(v) => setJob(i, "equipment", v)} placeholder="Dry van, 53' trailer" />
              </Field>
              <Field label="Reason for leaving">
                <Input value={j.reason} onChange={(v) => setJob(i, "reason", v)} placeholder="Better opportunity" />
              </Field>
            </div>
            <div className="row cols-2 mt-2">
              <Field label="Subject to FMCSA regulations?" required hint="Operated CMV in commerce" error={errors[`employment.${i}.fmcsa`]}>
                <Choices compact name={`fmcsa-${i}`} value={j.fmcsa} onChange={(v) => setJob(i, "fmcsa", v)}
                  options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
              </Field>
              <Field label="May we contact this employer?">
                <Choices compact name={`contact-${i}`} value={j.contactOk} onChange={(v) => setJob(i, "contactOk", v)}
                  options={[{ value: "yes", label: "Yes" }, { value: "later", label: "After interview" }, { value: "no", label: "No" }]} />
              </Field>
            </div>
          </div>
        ))}

        <button type="button" className="add-entry" onClick={addJob}>
          + Add {jobs.length === 0 ? "first" : "another"} employer
        </button>
      </>
    );
  }
};

// ───────────────────────── Step 6 — Accidents & violations ─────────────────────────
const Step6 = {
  code: "PTG-06 · RECORD",
  title: "Accidents & Violations",
  sub: "Last 3 years",
  validate(d) {
    const e = {};
    const inc = d.incidents || {};
    if (inc.hasAccidents == null) e["incidents.hasAccidents"] = "Required";
    if (inc.hasViolations == null) e["incidents.hasViolations"] = "Required";
    if (inc.hasSuspensions == null) e["incidents.hasSuspensions"] = "Required";
    if (inc.hasDenial == null) e["incidents.hasDenial"] = "Required";
    return e;
  },
  Render({ data, set, errors }) {
    const inc = data.incidents || {};
    const yn = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    const list = (key) => {
      const arr = inc[key] || [];
      const setArr = (next) => set(`incidents.${key}`, next);
      const setItem = (i, field, val) => {
        const next = arr.slice();
        next[i] = { ...next[i], [field]: val };
        setArr(next);
      };
      const add = () => setArr([...arr, {}]);
      const remove = (i) => setArr(arr.filter((_, idx) => idx !== i));
      return { arr, add, remove, setItem };
    };

    const acc = list("accidents");
    const vio = list("violations");

    return (
      <>
        <div className="note mb-2">
          <b>49 CFR §391.21(b)(12–13).</b> Disclose all accidents (regardless of fault) in the past 3 years
          and all moving violations in commercial motor vehicles. Records are verified through the
          FMCSA Pre-Employment Screening Program.
        </div>

        <div className="group">
          <div className="group-label">Accidents</div>
          <Field label="Have you been involved in any accidents in the past 3 years?" required error={errors["incidents.hasAccidents"]}>
            <Choices name="hasAcc" value={inc.hasAccidents} onChange={(v) => set("incidents.hasAccidents", v)} options={yn} />
          </Field>
          {inc.hasAccidents === "yes" && (
            <>
              {acc.arr.map((a, i) => (
                <div key={i} className="entry mt-2">
                  <div className="entry-hd">
                    <div className="tag">Accident #{String(i + 1).padStart(2, "0")}</div>
                    <div className="actions"><button type="button" onClick={() => acc.remove(i)}>Remove</button></div>
                  </div>
                  <div className="row cols-3">
                    <Field label="Date"><Input type="date" mono value={a.date} onChange={(v) => acc.setItem(i, "date", v)} /></Field>
                    <Field label="Location"><Input value={a.location} onChange={(v) => acc.setItem(i, "location", v)} placeholder="I-40 nr Greensboro, NC" /></Field>
                    <Field label="Type">
                      <Select value={a.type} onChange={(v) => acc.setItem(i, "type", v)}
                        options={["Rear-end","Sideswipe","Roll-over","Jackknife","Fixed object","Animal","Other"]} placeholder="Select…" />
                    </Field>
                  </div>
                  <div className="row cols-2 mt-2">
                    <Field label="Injuries / fatalities">
                      <Select value={a.injuries} onChange={(v) => acc.setItem(i, "injuries", v)}
                        options={["None","Injury","Fatality"]} placeholder="Select…" />
                    </Field>
                    <Field label="Preventable?">
                      <Choices compact name={`prev-${i}`} value={a.preventable} onChange={(v) => acc.setItem(i, "preventable", v)}
                        options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unk", label: "Undetermined" }]} />
                    </Field>
                  </div>
                  <div className="row mt-2">
                    <Field label="Description" hint="optional">
                      <Textarea value={a.desc} onChange={(v) => acc.setItem(i, "desc", v)} placeholder="Briefly describe what happened, road/weather conditions, and outcome." />
                    </Field>
                  </div>
                </div>
              ))}
              <button type="button" className="add-entry" onClick={acc.add}>+ Add accident</button>
            </>
          )}
        </div>

        <div className="group">
          <div className="group-label">Moving violations <small>commercial vehicle only</small></div>
          <Field label="Have you received any moving violations while operating a CMV in the past 3 years?" required error={errors["incidents.hasViolations"]}>
            <Choices name="hasVio" value={inc.hasViolations} onChange={(v) => set("incidents.hasViolations", v)} options={yn} />
          </Field>
          {inc.hasViolations === "yes" && (
            <>
              {vio.arr.map((a, i) => (
                <div key={i} className="entry mt-2">
                  <div className="entry-hd">
                    <div className="tag">Violation #{String(i + 1).padStart(2, "0")}</div>
                    <div className="actions"><button type="button" onClick={() => vio.remove(i)}>Remove</button></div>
                  </div>
                  <div className="row cols-3">
                    <Field label="Date"><Input type="date" mono value={a.date} onChange={(v) => vio.setItem(i, "date", v)} /></Field>
                    <Field label="State">
                      <Select mono value={a.state} onChange={(v) => vio.setItem(i, "state", v)} options={US_STATES} placeholder="Select state" />
                    </Field>
                    <Field label="Charge">
                      <Input value={a.charge} onChange={(v) => vio.setItem(i, "charge", v)} placeholder="Speeding 11+" />
                    </Field>
                  </div>
                  <div className="row cols-2 mt-2">
                    <Field label="Penalty">
                      <Input value={a.penalty} onChange={(v) => vio.setItem(i, "penalty", v)} placeholder="$235 fine, 2 points" />
                    </Field>
                    <Field label="Conviction status">
                      <Select value={a.status} onChange={(v) => vio.setItem(i, "status", v)}
                        options={["Convicted","Dismissed","Pending","Reduced"]} placeholder="Select…" />
                    </Field>
                  </div>
                </div>
              ))}
              <button type="button" className="add-entry" onClick={vio.add}>+ Add violation</button>
            </>
          )}
        </div>

        <div className="group">
          <div className="group-label">License history</div>
          <div className="row" style={{ gap: 20 }}>
            <Field label="Has your license ever been suspended, revoked, or cancelled?" required error={errors["incidents.hasSuspensions"]}>
              <Choices name="hasSus" value={inc.hasSuspensions} onChange={(v) => set("incidents.hasSuspensions", v)} options={yn} />
            </Field>
            <Field label="Have you ever been denied a license or permit to operate a CMV?" required error={errors["incidents.hasDenial"]}>
              <Choices name="hasDen" value={inc.hasDenial} onChange={(v) => set("incidents.hasDenial", v)} options={yn} />
            </Field>
          </div>
          {(inc.hasSuspensions === "yes" || inc.hasDenial === "yes") && (
            <Field label="Please describe" hint="dates, jurisdictions, reason, and resolution">
              <Textarea value={inc.suspensionsDesc} onChange={(v) => set("incidents.suspensionsDesc", v)} rows={4} />
            </Field>
          )}
        </div>
      </>
    );
  }
};

// ───────────────────────── Step 7 — Position & Referral ─────────────────────────
const Step7 = {
  code: "PTG-07 · POSITION",
  title: "Position & Referral",
  sub: "Role, truck info, source",
  validate(d) {
    const e = {};
    const p = d.position || {};
    if (!p.type) e["position.type"] = "Required";
    if (p.type === "owner") {
      const t = p.truck || {};
      const yearErr = runValidators(t.year, [Validators.required]);
      if (yearErr) e["position.truck.year"] = yearErr;
      else if (!/^\d{4}$/.test(String(t.year).trim()) || +t.year < 1990 || +t.year > new Date().getFullYear() + 1) {
        e["position.truck.year"] = "Enter a valid 4-digit year";
      }
      if (!t.make) e["position.truck.make"] = "Required";
      if (!t.model) e["position.truck.model"] = "Required";
      if (!t.picture) e["position.truck.picture"] = "Required";
      if (!t.dotInspection) e["position.truck.dotInspection"] = "Required";
    }
    if (!p.source) e["position.source"] = "Required";
    return e;
  },
  Render({ data, set, errors }) {
    const p = data.position || {};
    const t = p.truck || {};
    const sources = [
      "Indeed", "Google Search", "Facebook",
      "Driver Referral", "LinkedIn", "Other",
    ];
    return (
      <>
        <div className="note mb-2">
          <b>Tell us about the role and how you found us.</b> Owner Operators please attach a current
          truck photo and the latest annual DOT inspection (49 CFR §396.17).
        </div>

        <div className="group">
          <div className="group-label">Position type</div>
          <Field label="Are you applying as a Company Driver or Owner Operator?" required error={errors["position.type"]}>
            <Choices
              name="positionType"
              value={p.type}
              onChange={(v) => set("position.type", v)}
              options={[
                { value: "company", label: "Company Driver" },
                { value: "owner",   label: "Owner Operator" },
              ]}
            />
          </Field>
        </div>

        {p.type === "owner" && (
          <div className="group">
            <div className="group-label">Truck information <small>required for owner operators</small></div>
            <div className="row cols-3">
              <Field label="Truck Year" required error={errors["position.truck.year"]}>
                <Input mono value={t.year} onChange={(v) => set("position.truck.year", v)} placeholder="e.g., 2022" />
              </Field>
              <Field label="Truck Make" required error={errors["position.truck.make"]}>
                <Input value={t.make} onChange={(v) => set("position.truck.make", v)} placeholder="e.g., Freightliner" />
              </Field>
              <Field label="Truck Model" required error={errors["position.truck.model"]}>
                <Input value={t.model} onChange={(v) => set("position.truck.model", v)} placeholder="e.g., Cascadia" />
              </Field>
            </div>
            <div className="docs-grid mt-3">
              <DocUpload
                code="DOC-T1"
                label="Truck Picture"
                sub="Exterior — side or 3/4 view"
                required
                value={t.picture}
                onChange={(v) => set("position.truck.picture", v)}
                error={errors["position.truck.picture"]}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="7" width="13" height="9" rx="1.5"/>
                    <path d="M16 10h4l1 3v3h-5z"/>
                    <circle cx="7.5" cy="17.5" r="1.8"/>
                    <circle cx="17.5" cy="17.5" r="1.8"/>
                  </svg>
                }
              />
              <DocUpload
                code="DOC-T2"
                label="DOT Inspection"
                sub="Latest annual — Form MCS-150 / sticker"
                required
                value={t.dotInspection}
                onChange={(v) => set("position.truck.dotInspection", v)}
                error={errors["position.truck.dotInspection"]}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="14 3 14 9 20 9"/>
                    <path d="M9 14l2 2 4-4"/>
                  </svg>
                }
              />
            </div>
          </div>
        )}

        <div className="group">
          <div className="group-label">Additional details</div>
          <Field label="Additional message" hint="optional">
            <Textarea
              rows={4}
              value={p.message}
              onChange={(v) => set("position.message", v)}
              placeholder="Any additional information you'd like to share…"
            />
          </Field>
          <div className="mt-3">
            <Field label="How did you hear about us?" required error={errors["position.source"]}>
              <Select
                value={p.source}
                onChange={(v) => set("position.source", v)}
                options={sources}
                placeholder="Select source"
              />
            </Field>
          </div>
        </div>
      </>
    );
  }
};

// ───────────── Signature block (Type / Draw tabs) ─────────────
function SignatureBlock({ c, set, errors, fullName, today }) {
  const mode = c.sigMode || "type";
  const setMode = (m) => set("consents.sigMode", m);

  const canvasRef = React.useRef(null);
  const drawingRef = React.useRef(false);
  const ratioRef = React.useRef(1);

  const initCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    ratioRef.current = ratio;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0B2A5B";
    if (c.sigDataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = c.sigDataUrl;
    }
  }, [c.sigDataUrl]);

  React.useEffect(() => {
    if (mode === "draw") initCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const xy = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onDown = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    const { x, y } = xy(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    try { canvasRef.current.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const onMove = (e) => {
    if (!drawingRef.current) return;
    const { x, y } = xy(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const onUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    set("consents.sigDataUrl", canvasRef.current.toDataURL("image/png"));
  };
  const clearDraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    set("consents.sigDataUrl", "");
  };

  const tabBtn = (id, label) => ({
    onClick: () => setMode(id),
    type: "button",
    style: {
      flex: 1,
      padding: "8px 12px",
      border: "1px solid var(--rule-2, #d6dae3)",
      background: mode === id ? "var(--ink, #0B2A5B)" : "transparent",
      color: mode === id ? "#fff" : "var(--ink, #0B2A5B)",
      fontWeight: 600,
      cursor: "pointer",
      borderRadius: 6,
    },
    "aria-pressed": mode === id,
    children: label,
  });

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, maxWidth: 280 }}>
        <button {...tabBtn("type", "Type")} />
        <button {...tabBtn("draw", "Draw")} />
      </div>

      <div className="row cols-2">
        {mode === "type" ? (
          <Field label="Type your full legal name" required hint={fullName ? `must match "${fullName}"` : "as it appears on your CDL"} error={errors["consents.sigName"]}>
            <Input value={c.sigName} onChange={(v) => set("consents.sigName", v)} placeholder={fullName || "First Last"} />
          </Field>
        ) : (
          <Field label="Printed name (optional)" hint={fullName ? `as on CDL: ${fullName}` : "as it appears on your CDL"}>
            <Input value={c.sigName} onChange={(v) => set("consents.sigName", v)} placeholder={fullName || "First Last"} />
          </Field>
        )}
        <Field label="Date" required error={errors["consents.sigDate"]}>
          <Input type="date" mono value={c.sigDate || today} onChange={(v) => set("consents.sigDate", v)} />
        </Field>
      </div>

      {mode === "type" ? (
        <div className="mt-3">
          <div className={`sig-box ${!c.sigName ? "empty" : ""}`}>
            {c.sigName ? c.sigName : "your signature appears here"}
            <span className="sig-x"></span>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="sig-box" style={{ padding: 0, display: "block" }}>
            <canvas
              ref={canvasRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
              onPointerCancel={onUp}
              style={{ width: "100%", height: "100%", display: "block", touchAction: "none", cursor: "crosshair" }}
            />
            <span className="sig-x"></span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <small style={{ color: "var(--muted-2, #6b7280)" }}>Sign above with mouse or finger</small>
            <button type="button" onClick={clearDraw}
              style={{ padding: "6px 12px", border: "1px solid var(--rule-2, #d6dae3)", background: "transparent", borderRadius: 6, cursor: "pointer" }}>
              Clear
            </button>
          </div>
          {errors["consents.sigDraw"] && <div className="err mt-2">{errors["consents.sigDraw"]}</div>}
        </div>
      )}
    </>
  );
}

// ───────────────────────── Step 8 — Consents ─────────────────────────
const Step8 = {
  code: "PTG-08 · CONSENT",
  title: "Consents & Signature",
  sub: "Authorizations",
  validate(d) {
    const e = {};
    const c = d.consents || {};
    ["psp", "mvr", "clearinghouse", "fcra", "drug", "truthful"].forEach((k) => {
      if (!c[k]) e[`consents.${k}`] = "Required";
    });
    if (!c.sigDate) e["consents.sigDate"] = "Required";
    const mode = c.sigMode || "type";
    if (mode === "draw") {
      if (!c.sigDataUrl) e["consents.sigDraw"] = "Please draw your signature";
    } else {
      if (!c.sigName) e["consents.sigName"] = "Required";
      if (d.personal && d.personal.first && d.personal.last && c.sigName &&
          c.sigName.trim().toLowerCase() !== `${d.personal.first} ${d.personal.last}`.trim().toLowerCase()) {
        e["consents.sigName"] = `Type exactly: ${d.personal.first} ${d.personal.last}`;
      }
    }
    return e;
  },
  Render({ data, set, errors }) {
    const c = data.consents || {};
    const p = data.personal || {};
    const fullName = `${p.first || ""} ${p.last || ""}`.trim();
    const today = new Date().toISOString().slice(0,10);

    // Auto-seed today's date the first time this step renders — the input
    // visually shows today by default, so we keep state in sync so validation
    // doesn't trip on an "empty" sigDate.
    React.useEffect(() => {
      if (!c.sigDate) set("consents.sigDate", today);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <>
        <div className="note mb-2">
          <b>Authorizations.</b> By checking each box below, you authorize PTG and its agents
          to obtain and use the following records solely for evaluating your application
          in accordance with the Fair Credit Reporting Act (15 U.S.C. §1681 et seq.).
        </div>

        <div className="group">
          <div className="group-label">Background & records</div>
          <div className="row" style={{ gap: 10 }}>
            <Check checked={c.psp} onChange={(v) => set("consents.psp", v)}>
              <b>FMCSA Pre-Employment Screening Program (PSP)</b>
              <small>Authorize retrieval of crash and inspection history from the FMCSA Motor Carrier Management Information System.</small>
            </Check>
            <Check checked={c.mvr} onChange={(v) => set("consents.mvr", v)}>
              <b>Motor Vehicle Record (MVR)</b>
              <small>Authorize PTG to obtain your driving record from each state you have been licensed in for the past 3 years.</small>
            </Check>
            <Check checked={c.clearinghouse} onChange={(v) => set("consents.clearinghouse", v)}>
              <b>FMCSA Drug & Alcohol Clearinghouse</b>
              <small>Authorize a full query for prior drug & alcohol program violations, per 49 CFR §382.701.</small>
            </Check>
            <Check checked={c.fcra} onChange={(v) => set("consents.fcra", v)}>
              <b>Consumer report (FCRA disclosure)</b>
              <small>I have read the separate FCRA disclosure and authorize a background check including criminal history.</small>
            </Check>
            <Check checked={c.drug} onChange={(v) => set("consents.drug", v)}>
              <b>Pre-employment drug screen</b>
              <small>Agree to submit to a DOT-regulated urine drug test prior to operating a commercial motor vehicle for PTG.</small>
            </Check>
            <Check checked={c.truthful} onChange={(v) => set("consents.truthful", v)}>
              <b>Truthful & complete statements</b>
              <small>I certify that all statements above are true and complete. False or omitted information is grounds for rejection or termination.</small>
            </Check>
          </div>
          {(errors["consents.psp"] || errors["consents.mvr"] || errors["consents.clearinghouse"] ||
            errors["consents.fcra"] || errors["consents.drug"] || errors["consents.truthful"]) && (
            <div className="err mt-2">All authorizations are required to submit</div>
          )}
        </div>

        <div className="group">
          <div className="group-label">Electronic signature</div>
          <SignatureBlock c={c} set={set} errors={errors} fullName={fullName} today={today} />
        </div>
      </>
    );
  }
};

const STEPS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8];

Object.assign(window, { STEPS });
