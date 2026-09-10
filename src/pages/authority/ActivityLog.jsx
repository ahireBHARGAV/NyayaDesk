import { Badge, PageTitle } from "../../App";

export function ActivityLog({ compact = false }) {
  const rows = [
    [
      "Judge assigned",
      "Courtroom 2",
      "Justice B. Rao",
      "Ã¢â‚¬â€",
      "09:10 AM",
      "Completed",
    ],
    [
      "Case assigned",
      "Courtroom 1",
      "Justice A. Mehra",
      "ABC/2026",
      "08:55 AM",
      "Completed",
    ],
    [
      "Judge marked absent",
      "Courtroom 3",
      "Justice C. Shah",
      "GHI/2026",
      "08:30 AM",
      "Updated",
    ],
    [
      "Replacement assigned",
      "Courtroom 3",
      "Justice D. Sen",
      "GHI/2026",
      "08:42 AM",
      "Completed",
    ],
  ];
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
        {rows.slice(0, compact ? 3 : 4).map((r) => (
          <div className="tr">
            {r.map((v, i) => (i === 5 ? <Badge>{v}</Badge> : <span>{v}</span>))}
          </div>
        ))}
      </div>
    </section>
  );
}
