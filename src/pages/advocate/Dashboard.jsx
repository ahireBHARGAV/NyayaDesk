import { useContext } from "react";
import {
  Badge,
  Button,
  DataContext,
  Icon,
  openCaseDetails,
  PageTitle,
  Stat,
} from "../../App";
import { AIAssistant } from "./AIAssistant";
import { Calendar } from "./Calendar";
import { CaseDetail } from "./CaseDetail";
import { Cases } from "./Cases";
import { Documents } from "./Documents";
import { Filing } from "./Filing";
import { LawSearch } from "./LawSearch";
import { Notifications } from "./Notifications";
import { Profile } from "./Profile";

export function Advocate({ page, setPage, clear }) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("nyaya_user")) || {};
    } catch {
      return {};
    }
  })();
  const name = user.name
    ? `Adv. ${user.name.replace(/^Adv\.\s*/, "")}`
    : "Adv. Arjun Rao";
  if (page === "Dashboard")
    return (
      <>
        <PageTitle
          title={`Good Morning, ${name}`}
          sub="Here's your court activity for today."
        />
        <div className="stat-grid">
          <Stat
            icon="BriefcaseBusiness"
            value="24"
            label="My Cases"
            sub="Active cases"
          />
          <Stat
            icon="CalendarDays"
            value="4"
            label="Today's Hearings"
            sub="Across 3 courtrooms"
          />
          <Stat
            icon="ListTodo"
            value="7"
            label="Pending Activities"
            sub="2 due today"
          />
          <Stat
            icon="AlarmClock"
            value="3"
            label="Upcoming Deadlines"
            sub="Next 7 days"
          />
        </div>
        <div className="two-col">
          <Timeline setPage={setPage} />
          <Activities setPage={setPage} />
        </div>
        <Quick setPage={setPage} />
      </>
    );
  if (page === "My Cases") return <Cases setPage={setPage} />;
  if (page === "Calendar") return <Calendar />;
  if (page === "e-Filing") return <Filing />;
  if (page === "Documents") return <Documents />;
  if (page === "AI Document Assistant") return <AIAssistant />;
  if (page === "Case Law Search") return <LawSearch />;
  if (page === "Notifications")
    return <Notifications clear={clear} authority={false} />;
  if (page === "Profile") return <Profile authority={false} />;
  return <CaseDetail setPage={setPage} />;
}
export function Timeline({ setPage }) {
  const { hearings } = useContext(DataContext);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingHearings = hearings.filter(h => h.date >= todayStr).slice(0, 5);

  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>Today's Timeline</h2>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        {upcomingHearings.length > 0 && (
          <Button variant="text" onClick={() => setPage("Calendar")}>
            Full calendar <Icon name="ArrowRight" size={15} />
          </Button>
        )}
      </div>
      <div className="timeline">
        {upcomingHearings.length > 0 ? (
          upcomingHearings.map((h, i) => (
            <button
              key={i}
              className="timeline-row case-link"
              onClick={() => openCaseDetails(setPage, h.case)}
            >
              <b>{h.time}</b>
              <span className="line-dot"></span>
              <div>
                <h3>{h.case}</h3>
                <p>{h.room} · {h.judgeName || h.judge}</p>
              </div>
              <Badge>{h.status}</Badge>
            </button>
          ))
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-light)" }}>
            <p>No hearings scheduled for today.</p>
          </div>
        )}
      </div>
    </section>
  );
}
export function Activities({ setPage }) {
  const { cases } = useContext(DataContext);
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>Pending Activities</h2>
          <p>Items needing attention</p>
        </div>
      </div>
      {[
        ["HIGH", "Reply Filing", cases[0]?.title || "Pending Document", "Due Today", cases[0]?.id],
        ["MEDIUM", "Document Submission", cases[1]?.title || "Pending Document", "Due Tomorrow", cases[1]?.id],
        ["LOW", "Hearing Preparation", cases[2]?.title || "Pending Document", "Due 12 September", cases[2]?.id],
      ].filter(x => x[4]).map((x) => (
        <button
          key={x[4]}
          className="activity case-link"
          onClick={() => openCaseDetails(setPage, x[4])}
        >
          <Badge>{x[0]}</Badge>
          <div>
            <h3>{x[1]}</h3>
            <p>{x[2]}</p>
          </div>
          <small>{x[3]}</small>
        </button>
      ))}
      {cases.length === 0 && <p style={{padding: '1rem', color: '#666'}}>No pending activities.</p>}
    </section>
  );
}
export function Quick({ setPage }) {
  const x = [
    ["BriefcaseBusiness", "View Cases", "My Cases"],
    ["CalendarDays", "Open Calendar", "Calendar"],
    ["FileUp", "Start e-Filing", "e-Filing"],
    ["Sparkles", "Generate Document", "AI Document Assistant"],
    ["Scale", "Search Case Law", "Case Law Search"],
  ];
  return (
    <section>
      <h2 className="section-h">Quick Actions</h2>
      <div className="quick">
        {x.map((a) => (
          <button onClick={() => setPage(a[2])}>
            <Icon name={a[0]} />
            <span>{a[1]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
