import { useState, useEffect } from "react";
import { Badge, PageTitle } from "../../App";

export function CourtSchedule({ setPage }) {
  const [hearings, setHearings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    fetch((import.meta.env.VITE_API_URL || "") + "/api/hearings/", {
      headers: token ? { Authorization: "Bearer " + token } : {}
    })
      .then(r => r.ok ? r.json() : [])
      .then(d => setHearings(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <>
      <PageTitle title="Court Schedule" sub={"Schedule for " + today} />
      <section className="panel">
        <div className="data-table schedule-table">
          <div className="tr th">
            <span>Date</span>
            <span>Time</span>
            <span>Courtroom</span>
            <span>Judge</span>
            <span>Case</span>
            <span>Status</span>
          </div>
          {hearings.length > 0 ? hearings.map(h => (
            <div className="tr" key={h.id}>
              <span>{h.date}</span>
              <b>{h.time || "—"}</b>
              <span>{h.room || "Unassigned"}</span>
              <span>{h.judge || "Unassigned"}</span>
              <span>{h.case || "—"}</span>
              <Badge>{h.status}</Badge>
            </div>
          )) : (
            <div style={{padding: "2rem", textAlign: "center", color: "#888"}}>
              No hearings scheduled. Use <b>Case Allocation</b> to schedule hearings.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
