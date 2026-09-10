import { useContext, useState } from "react";
import { Badge, Button, DataContext, Icon, PageTitle } from "../../App";
import { AIAssistant } from "./AIAssistant";
import { History } from "./Calendar";
import { Timeline } from "./Dashboard";

export function CaseDetail({ setPage }) {
  const { cases } = useContext(DataContext);
  const selected = sessionStorage.getItem("nyaya_selected_case");
  const item = cases.find((c) => c.title === selected) ||
    cases[0] || {
      id: "ABC/2026",
      title: "ABC vs XYZ",
      type: "Civil Appeal",
      court: "High Court of Delhi",
      judge: "Justice A. Mehra",
      next: "03 September 2026 Ã‚Â· 09:30 AM",
      status: "Active",
    };
  const [tab, setTab] = useState("Overview");
  return (
    <>
      <PageTitle
        title={item.title}
        sub={`Case no. ${item.id} Ã‚Â· ${item.court}`}
        action={
          <Button variant="secondary" onClick={() => setPage("My Cases")}>
            <Icon name="ArrowLeft" /> Back to cases
          </Button>
        }
      />
      <section className="case-hero">
        <div>
          <Badge>{item.status}</Badge>
          <h2>{item.type}</h2>
          <p>Case information</p>
        </div>
        <div>
          <small>Next hearing</small>
          <b>{item.next}</b>
          <p>
            {item.court} Ã‚Â· {item.judge}
          </p>
        </div>
      </section>
      <div className="tabs">
        {[
          "Overview",
          "History",
          "Hearings",
          "Documents",
          "Activities",
          "e-Filing",
          "AI Assistant",
        ].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <section className="panel tab-content">
        {tab === "History" ? (
          <History />
        ) : tab === "Hearings" ? (
          <Timeline setPage={setPage} />
        ) : tab === "AI Assistant" ? (
          <AIAssistant />
        ) : (
          <>
            <h2>{tab}</h2>
            <div className="info-grid">
              <p>
                <small>Case Number</small>
                <b>{item.id}</b>
              </p>
              <p>
                <small>Case Type</small>
                <b>{item.type}</b>
              </p>
              <p>
                <small>Court</small>
                <b>{item.court}</b>
              </p>
              <p>
                <small>Judge</small>
                <b>{item.judge}</b>
              </p>
              <p>
                <small>Next Hearing</small>
                <b>{item.next}</b>
              </p>
              <p>
                <small>Current Status</small>
                <Badge>{item.status}</Badge>
              </p>
            </div>
          </>
        )}
      </section>
    </>
  );
}
