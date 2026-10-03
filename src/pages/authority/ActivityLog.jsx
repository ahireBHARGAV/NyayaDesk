import { useState, useEffect } from "react";
import { Badge, PageTitle } from "../../App";

export function ActivityLog({ compact = false }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || "") + "/api/hearings/")
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        const items = (Array.isArray(d) ? d : []).map(h => ({
          action: "Hearing scheduled",
          room: h.room || "Unassigned",
          judge: h.judge || "Unassigned",
          caseTitle: h.case || "—",
          time: h.date + (h.time ? " " + h.time : ""),
          status: h.status || "Scheduled",
        }));
        setLogs(items);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>Activity Log</h2>
          <p>Recent schedule changes</p>
        </div>
      </div>
      <div className="data-table activity-table">
        {!compact && (
          <div className="tr th">
            <span>Action</span>
            <span>Courtroom</span>
            <span>Judge</span>
            <span>Case</span>
            <span>Date / Time</span>
            <span>Status</span>
          </div>
        )}
        {logs.length > 0 ? logs.slice(0, compact ? 3 : 20).map((r, i) => (
          <div className="tr" key={i}>
            <span>{r.action}</span>
            <span>{r.room}</span>
            <span>{r.judge}</span>
            <span>{r.caseTitle}</span>
            <span>{r.time}</span>
            <Badge>{r.status}</Badge>
          </div>
        )) : (
          <div style={{padding: "1rem", color: "#888"}}>No activity recorded yet.</div>
        )}
      </div>
    </section>
  );
}
