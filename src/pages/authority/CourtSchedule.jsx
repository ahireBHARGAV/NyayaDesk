import { Badge, PageTitle } from "../../App";

export function CourtSchedule() {
  const latest = (() => {
    try {
      return JSON.parse(localStorage.getItem("nyaya_latest_assignment"));
    } catch {
      return null;
    }
  })();
  const rows = [
    [
      "09:30 AM",
      "Courtroom 1",
      "Justice A. Mehra",
      "ABC/2026",
      "ABC vs XYZ",
      "Scheduled",
    ],
    [
      "10:00 AM",
      "Courtroom 2",
      "Justice B. Rao",
      "DEF/2026",
      "DEF vs GHI",
      "Ongoing",
    ],
    [
      "11:00 AM",
      "Courtroom 3",
      "Justice D. Sen",
      "GHI/2026",
      "GHI vs JKL",
      "Updated",
    ],
  ];
  if (latest)
    rows.unshift([
      latest.time,
      latest.courtroom,
      latest.judge,
      latest.caseNumber,
      latest.caseTitle,
      latest.status,
    ]);
  return (
    <>
      <PageTitle
        title="Court Schedule"
        sub="Detailed courtroom schedule for 03 September 2026."
      />
      <section className="panel">
        <div className="data-table schedule-table">
          <div className="tr th">
            <span>Time</span>
            <span>Courtroom</span>
            <span>Judge</span>
            <span>Case Number</span>
            <span>Case Title</span>
            <span>Status</span>
          </div>
          {rows.map((x) => (
            <div className="tr">
              {x.map((v, i) =>
                i === 5 ? <Badge>{v}</Badge> : <span>{v}</span>,
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
