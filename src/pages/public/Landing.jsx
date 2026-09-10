import { useState } from "react";
import { Badge, Button, Icon } from "../../App";

export function Public({ go, dashboard }) {
  const [query, setQuery] = useState("");
  const startCaseSearch = (event) => {
    event.preventDefault();
    if (query.trim()) go(dashboard || "role");
  };
  const openDashboard = () => go(dashboard);
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
  const accountAction = dashboard ? (
    <button
      className="profile-nav"
      onClick={openDashboard}
      title="Open profile"
    >
      <span>{initials}</span>
      <b>{displayName}</b>
    </button>
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
        <section className="search-preview" id="about">
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
        </footer>
      </main>
    </>
  );
}
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
