import { useEffect, useRef, useState } from "react";
import { Badge, Button, Icon } from "../../App";

export function Public({ go, dashboard, onCaseSearch }) {
  const [query, setQuery] = useState("");
  const [cnr, setCnr] = useState("");
  const [profileMenu, setProfileMenu] = useState(false);
  const startCaseSearch = (event) => {
    event.preventDefault();
    if (query.trim()) go(dashboard || "role");
  };
  const openDashboard = () => go(dashboard);
  const startCnrSearch = (event) => {
    event.preventDefault();
    if (cnr.trim()) onCaseSearch(cnr.trim());
  };
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("nyaya_user")) || {};
    } catch {
      return {};
    }
  })();
  const displayName =
    dashboard === "advocate" && user.name && !user.name.startsWith("Adv.")
      ? `Adv. ${user.name}`
      : user.name || "Profile";
  const initials = displayName
    .replace("Adv. ", "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const profileImage = localStorage.getItem(`nyaya_profile_image_${user.id}`) || "";
  const signOut = async () => {
    const token = localStorage.getItem("nyaya_token");
    if (token) await fetch("/api/auth/logout/", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    localStorage.removeItem("nyaya_token");
    localStorage.removeItem("nyaya_user");
    window.location.reload();
  };
  const accountAction = dashboard ? (
    <div className="public-account-menu" onMouseEnter={() => setProfileMenu(true)}>
      <button className="profile-nav" onClick={() => setProfileMenu(!profileMenu)} title="Account menu" aria-expanded={profileMenu}>
        <span className="profile-photo">{profileImage ? <img src={profileImage} alt="Profile" /> : initials}</span>
        <b>{displayName}</b><Icon name="ChevronDown" size={15} />
      </button>
      {profileMenu && <div className="public-account-dropdown">
        <button onClick={signOut}><Icon name="LogOut" size={16} /> Sign Out</button>
      </div>}
    </div>
  ) : (
    <Button onClick={() => go("role")}>
      Sign In <Icon name="ArrowRight" size={15} />
    </Button>
  );
  return (
    <>
      <nav className="public-nav">
        <div className="brand">
          <span className="brand-mark">Ã¢Å¡â€“</span> Nyaya<span>Desk</span>
        </div>
        <div className="navlinks">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#help">Help</a>
        </div>
        {accountAction}
      </nav>
      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">AI-ASSISTED COURT MANAGEMENT</p>
            <h1>
              Manage Your Cases.
              <br />
              <em>Stay Ahead</em> of Every Hearing.
            </h1>
            <p>
              A simple centralized platform for advocates and court authorities
              to manage cases, hearings, documents and courtroom schedules.
            </p>
            <div className="hero-actions">
              {dashboard ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    document
                      .querySelector("#features")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore Features
                </Button>
              ) : (
                <>
                  <Button onClick={() => go("role")}>
                    Sign In <Icon name="ArrowRight" size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      document
                        .querySelector("#features")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Explore Features
                  </Button>
                </>
              )}
            </div>
            <div className="trust">
              <span>
                <Icon name="ShieldCheck" /> Secure workspace
              </span>
              <span>
                <Icon name="Clock3" /> Always in sync
              </span>
            </div>
          </div>
          <DashboardArt />
        </section>
        <section className="case-search-preview" id="about">
          <div>
            <p className="eyebrow">PUBLIC CASE STATUS</p>
            <h2>Find your case by CNR number</h2>
            <p>
              View the current case status, parties, court and hearing history.
              No sign-in is required.
            </p>
          </div>
          <form className="searchbox cnr-searchbox" onSubmit={startCnrSearch}>
            <Icon name="FileSearch" />
            <input
              value={cnr}
              onChange={(event) => setCnr(event.target.value.toUpperCase())}
              placeholder="Enter 16-character CNR number"
              aria-label="CNR number"
              maxLength={24}
            />
            <Button type="submit">Track case</Button>
          </form>
          <small className="cnr-help">Example: MHNS030080582025</small>
        </section>
        <section className="search-preview">
          <div>
            <p className="eyebrow">CASE LAW RESEARCH</p>
            <h2>Find Relevant Case Laws</h2>
            <p>
              Search trusted legal precedents with natural-language questions.
            </p>
          </div>
          <form className="searchbox" onSubmit={startCaseSearch}>
            <Icon name="Search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by legal issue, section, keyword or question..."
            />
            <Button type="submit">Search</Button>
          </form>
        </section>
        <section className="features" id="features">
          <p className="eyebrow center">ONE CLEAR WORKSPACE</p>
          <h2>Everything that matters, simply organized.</h2>
          <div className="feature-grid">
            {[
              [
                "BriefcaseBusiness",
                "Case Management",
                "Manage case information, hearings, history, documents and activities in one place.",
              ],
              [
                "CalendarDays",
                "Smart Calendar",
                "View hearings, important dates and daily schedules.",
              ],
              [
                "Sparkles",
                "AI-Assisted Documents",
                "Prepare document and form drafts using case information and approved templates.",
              ],
              [
                "Scale",
                "Case Law Search",
                "Search relevant case laws using natural-language queries.",
              ],
              [
                "Landmark",
                "Courtroom Management",
                "Manage schedules, judge assignments and case allocation.",
              ],
              [
                "Bell",
                "Notifications",
                "Stay updated about hearings, deadlines and courtroom changes.",
              ],
            ].map(([i, t, d]) => (
              <article className="feature-card" key={t}>
                <span className="feature-icon">
                  <Icon name={i} />
                </span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="steps" id="how">
          <p className="eyebrow center">HOW IT WORKS</p>
          <h2>Made for a smoother court day.</h2>
          <div>
            {[
              ["01", "Sign In", "Choose Advocate or Authority."],
              [
                "02",
                "Access Your Workspace",
                "See information relevant to your role.",
              ],
              [
                "03",
                "Manage Court Activities",
                "Manage cases or courtroom information.",
              ],
              ["04", "Stay Updated", "Receive important schedule updates."],
            ].map((x) => (
              <article key={x[0]}>
                <b>{x[0]}</b>
                <h3>{x[1]}</h3>
                <p>{x[2]}</p>
              </article>
            ))}
          </div>
        </section>
        <footer id="help">
          <div className="brand">
            <span className="brand-mark">Ã¢Å¡â€“</span> Nyaya<span>Desk</span>
          </div>
          <p>Clearer days in court.</p>
          {!dashboard && (
            <Button onClick={() => go("role")}>Get started</Button>
          )}
          {dashboard && <Button variant="secondary" onClick={signOut}><Icon name="LogOut" size={16} /> Sign Out</Button>}
        </footer>
      </main>
    </>
  );
}

const dateLabel = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`))
    : "Not available";

const caseTitle = (item) =>
  `${item.petitioners?.[0] || "Petitioner"} v. ${item.respondents?.[0] || "Respondent"}`;

export function CaseLookup({ initialQuery, back }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeHearing, setActiveHearing] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState("");
  const swipeStart = useRef(null);

  const goBackWithinLookup = () => {
    if (activeHearing) return setActiveHearing(null);
    if (selected) return setSelected(null);
    back();
  };
  const beginEdgeSwipe = (event) => {
    const touch = event.touches[0];
    swipeStart.current = touch.clientX <= 36 ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const finishEdgeSwipe = (event) => {
    if (!swipeStart.current) return;
    const touch = event.changedTouches[0];
    const { x, y } = swipeStart.current;
    swipeStart.current = null;
    if (touch.clientX - x > 82 && Math.abs(touch.clientY - y) < 70) goBackWithinLookup();
  };

  const search = async (event, requestedCnr = query) => {
    event?.preventDefault();
    const cnr = requestedCnr.trim();
    if (!cnr) return;
    setLoading(true); setError(""); setSelected(null); setActiveHearing(null);
    try {
      const response = await fetch(`/api/public/cases/search?cnr=${encodeURIComponent(cnr)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Could not search cases.");
      setResults(payload.results || []);
      if (!payload.results?.length) setError("No case was found for that CNR number. Check the number and try again.");
    } catch (err) {
      setResults([]); setError(err.message || "Case lookup is temporarily unavailable.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (initialQuery) search(null, initialQuery);
  }, [initialQuery]);

  const downloadHearing = () => {
    const hearing = activeHearing;
    if (!selected || !hearing) return;
    const rows = [
      ["CNR number", selected.cnr], ["Case", caseTitle(selected)], ["Court", selected.courtName],
      ["Hearing date", dateLabel(hearing.date)], ["Judge", selected.judges?.join(", ") || "Not available"],
      ["Purpose / next step", hearing.purpose], ["Reason for adjournment", hearing.reason],
      ["Petitioner and advocate", `${selected.petitioners?.join(", ") || "Not available"}${selected.petitionerAdvocates?.length ? ` — ${selected.petitionerAdvocates.join(", ")}` : ""}`],
      ["Respondent and advocate", `${selected.respondents?.join(", ") || "Not available"}${selected.respondentAdvocates?.length ? ` — ${selected.respondentAdvocates.join(", ")}` : ""}`],
    ];
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Hearing record ${selected.cnr}</title><style>body{font:14px Arial;margin:40px;color:#142d4a}h1{font-size:22px}table{border-collapse:collapse;width:100%;margin-top:22px}th,td{border:1px solid #cbd5df;padding:10px;text-align:left}th{width:32%;background:#edf5f4}</style></head><body><h1>NyayaDesk hearing record</h1><p>This document is a summary of the case data available in NyayaDesk. Verify it with the official court record.</p><table>${rows.map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join("")}</table></body></html>`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    link.download = `hearing-record-${selected.cnr}-${hearing.date}.html`;
    link.click(); URL.revokeObjectURL(link.href);
  };

  const hearingEntries = (item) => [
    item.nextHearingDate && { date: item.nextHearingDate, purpose: item.caseStatus === "PENDING" ? "Next hearing / case progress" : "Final listed date", reason: "The imported case record does not include the presiding judge's detailed order or adjournment reason." },
    item.lastHearingDate && item.lastHearingDate !== item.nextHearingDate && { date: item.lastHearingDate, purpose: "Previous hearing", reason: "The detailed hearing order is not included in the imported case record." },
    item.firstHearingDate && item.firstHearingDate !== item.lastHearingDate && { date: item.firstHearingDate, purpose: "First hearing", reason: "The detailed hearing order is not included in the imported case record." },
  ].filter(Boolean);

  return <main className="case-lookup-page" onTouchStart={beginEdgeSwipe} onTouchEnd={finishEdgeSwipe}>
    <nav className="public-nav"><div className="brand">Nyaya<span>Desk</span></div><Button variant="secondary" onClick={goBackWithinLookup}><Icon name="ArrowLeft" size={16} /> Back</Button></nav>
    <section className="case-lookup-hero">
      <p className="eyebrow">PUBLIC CASE LOOKUP</p><h1>Track a case with its CNR number</h1>
      <form className="searchbox" onSubmit={search}><Icon name="FileSearch" /><input value={query} onChange={(event) => setQuery(event.target.value.toUpperCase())} placeholder="Enter CNR number" /><Button type="submit">Search</Button></form>
    </section>
    <section className="case-lookup-content">
      {loading && <p className="lookup-message">Looking up the case…</p>}
      {error && <p className="lookup-error">{error}</p>}
      {!selected && results.map((item) => <button className="case-result" key={item.cnr} onClick={() => setSelected(item)}><div><small>CNR: {item.cnr}</small><h2>{caseTitle(item)}</h2><p>{item.courtName}</p></div><div><Badge>{item.caseStatus}</Badge><span>View case <Icon name="ChevronRight" size={16} /></span></div></button>)}
      {selected && !activeHearing && <CaseDetails item={selected} hearings={hearingEntries(selected)} onHearing={setActiveHearing} onBack={() => setSelected(null)} />}
      {selected && activeHearing && <HearingDetails item={selected} hearing={activeHearing} onBack={() => setActiveHearing(null)} onDownload={downloadHearing} />}
    </section>
  </main>;
}

const actDetails = (caseCategory) => {
  const source = caseCategory || "Not available";
  const [actName, section = "Not available"] = source.split(/\s+-\s+/);
  const normalised = actName.toUpperCase();
  const explanations = {
    "CODE OF CIVIL PROCEDURE": "The Code of Civil Procedure, 1908 sets out the process courts follow for civil suits and appeals.",
    "CODE OF CRIMINAL PROCEDURE": "The Code of Criminal Procedure, 1973 sets out procedure for investigation, trial, bail and other criminal-court proceedings.",
    "MOTOR VEHICLES ACT": "The Motor Vehicles Act, 1988 regulates motor vehicles and provides compensation routes for accident claims.",
    "INDIAN DIVORCE ACT": "The Indian Divorce Act, 1869 governs specified matrimonial remedies, including dissolution of marriage.",
    "CO OPERATIVE SOCIETIES ACT (MAHARASHTRA)": "The Maharashtra Co-operative Societies Act regulates registered co-operative societies and related remedies.",
  };
  const key = Object.keys(explanations).find((name) => normalised.startsWith(name));
  const recordedSection = normalised === "INDIAN DIVORCE ACT" && section === "1869" ? "Not specified in imported record" : section;
  const sectionExplanations = {
    "439": "Section 439 gives the High Court and Court of Session special powers to grant bail in specified criminal cases, subject to the court's conditions.",
    "438": "Section 438 provides for anticipatory bail: a person who expects arrest for a non-bailable offence may ask the High Court or Court of Session for protection.",
    "166": "Section 166 allows a person seeking compensation for a motor-vehicle accident to apply before the Motor Accident Claims Tribunal.",
    "107": "Section 107 concerns offences and penalties relating to a co-operative society under the Maharashtra Co-operative Societies Act.",
  };
  return { act: actName, section: recordedSection, explanation: explanations[key] || "This is the statute or legal category recorded in the imported case data. Consult the official text or a qualified legal professional for its application.", sectionExplanation: sectionExplanations[recordedSection] || "A plain-language meaning for this section is not included in the imported record. Refer to the official statute or a qualified legal professional for its current interpretation." };
};

function CaseDetails({ item, hearings, onHearing, onBack }) {
  const [showActExplanation, setShowActExplanation] = useState(false);
  const [showSectionExplanation, setShowSectionExplanation] = useState(false);
  const act = actDetails(item.act);
  const activeHearing = null;
  return <article className="public-case-details">
    <button className="back-results" onClick={onBack}><Icon name="ArrowLeft" size={15} /> Search results</button>
    <div className="case-details-heading"><div><p className="eyebrow">CASE DETAILS</p><h1>{caseTitle(item)}</h1><p>{item.courtName}</p></div><Badge>{item.caseStatus}</Badge></div>
    <div className="case-summary-grid"><Detail label="CNR number" value={item.cnr} /><Detail label="Case type" value={item.caseType} /><Detail label="Registration no." value={item.registrationNumber} /><Detail label="Filing date" value={dateLabel(item.filingDate)} /><Detail label="Current judge" value={item.judges?.join(", ") || "Not available"} /><Detail label="Next / final date" value={dateLabel(item.nextHearingDate)} /></div>
    <div className="party-grid"><section><h2>Petitioner & advocate</h2><p>{item.petitioners?.join(", ") || "Not available"}</p><small>{item.petitionerAdvocates?.length ? `Advocate: ${item.petitionerAdvocates.join(", ")}` : "Advocate not available"}</small></section><section><h2>Respondent & advocate</h2><p>{item.respondents?.join(", ") || "Not available"}</p><small>{item.respondentAdvocates?.length ? `Advocate: ${item.respondentAdvocates.join(", ")}` : "Advocate not available"}</small></section></div>
    <section className="acts-section"><p className="eyebrow">ACTS</p><h2>Applicable act and section</h2><div className="acts-grid"><button onClick={() => setShowActExplanation(!showActExplanation)}><small>Under Act</small><b>{act.act}</b><span>Read meaning <Icon name="ChevronDown" size={15} /></span></button><button onClick={() => setShowSectionExplanation(!showSectionExplanation)}><small>Under Section(s)</small><b>{act.section}</b><span>Read meaning <Icon name="ChevronDown" size={15} /></span></button></div>{showActExplanation && <div className="act-explanation"><Icon name="Info" size={18} /><p><b>{act.act}:</b> {act.explanation}</p></div>}{showSectionExplanation && <div className="act-explanation"><Icon name="Info" size={18} /><p><b>Section {act.section}:</b> {act.sectionExplanation}</p></div>}</section>
    <section className="hearing-history"><div><p className="eyebrow">HEARING HISTORY</p><h2>Open a hearing for its available details</h2><p className="record-note">The imported record reports {item.hearingCount || "no"} hearing{item.hearingCount === 1 ? "" : "s"}. Only the dates below are currently available; official orders can add the judge’s detailed reasons.</p></div>{hearings.map((hearing) => <button key={`${hearing.date}-${hearing.purpose}`} className={activeHearing === hearing ? "hearing-item selected" : "hearing-item"} onClick={() => onHearing(hearing)}><span><b>{dateLabel(hearing.date)}</b><small>{hearing.purpose}</small></span><Icon name="ChevronRight" size={18} /></button>)}</section>
    {activeHearing && <section className="hearing-detail-card"><div><p className="eyebrow">HEARING DETAILS</p><h2>{dateLabel(activeHearing.date)}</h2><Detail label="Purpose / next step" value={activeHearing.purpose} /><Detail label="Why this date was given" value={activeHearing.reason} /></div><Button onClick={onDownload}><Icon name="Download" size={16} /> Download record</Button></section>}
  </article>;
}

function HearingDetails({ item, hearing, onBack, onDownload }) {
  return <article className="daily-status-page">
    <button className="back-results" onClick={onBack}><Icon name="ArrowLeft" size={15} /> Back to case details</button>
    <p className="eyebrow">HEARING DETAILS</p><h1>Daily Status</h1>
    <div className="daily-case-meta"><b>{item.courtName}</b><span>In the court of: {item.judges?.join(", ") || "Not available"}</span><span>CNR Number: {item.cnr}</span><span>Case: {caseTitle(item)}</span><span>Date: {dateLabel(hearing.date)}</span></div>
    <div className="daily-status-grid"><Detail label="Business" value={hearing.purpose} /><Detail label="Next purpose" value={hearing.purpose} /><Detail label="Next hearing date" value={dateLabel(item.nextHearingDate)} /><Detail label="Why this date was given" value={hearing.reason} /></div>
    <div className="daily-judge">Presiding judge: {item.judges?.join(", ") || "Not available"}</div>
    <div className="daily-actions"><Button variant="secondary" onClick={() => window.print()}><Icon name="Printer" size={16} /> Print</Button><Button onClick={onDownload}><Icon name="Download" size={16} /> Download record</Button></div>
  </article>;
}

function Detail({ label, value }) { return <div className="detail"><small>{label}</small><b>{value || "Not available"}</b></div>; }
export function DashboardArt() {
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  return (
    <div className="dashboard-art">
      <div className="art-top">
        <span>Today's schedule</span>
        <Badge>3 hearings</Badge>
      </div>
      <div className="art-calendar">
        <b>
          {today.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </b>
        <div className="week">
          {["M", "T", "W", "T", "F", "S", "S"].map((x) => (
            <span>{x}</span>
          ))}
        </div>
        <div className="days">
          {Array.from({ length: daysInMonth }, (_, i) => (
            <i className={i + 1 === today.getDate() ? "selected" : ""}>
              {i + 1}
            </i>
          ))}
        </div>
      </div>
      <div className="art-hearing">
        <span className="dot"></span>
        <div>
          <b>ABC vs XYZ</b>
          <small>09:30 AM Ã‚Â· Courtroom 3</small>
        </div>
        <Icon name="ChevronRight" size={16} />
      </div>
      <div className="art-hearing faint">
        <span className="dot blue"></span>
        <div>
          <b>DEF vs GHI</b>
          <small>11:00 AM Ã‚Â· Courtroom 5</small>
        </div>
      </div>
    </div>
  );
}
