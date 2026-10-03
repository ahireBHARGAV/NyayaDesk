import { useState, useEffect } from "react";
import { Icon, PageTitle, Stat } from "../../App";

export function Dashboard({ setPage }) {
  const [stats, setStats] = useState({
    totalCases: 0,
    todaysHearings: 0,
    upcomingHearings: 0,
    totalCourtrooms: 0,
    totalJudges: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    const headers = { Authorization: "Bearer " + token };
    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/dashboard", { headers })
      .then(r => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then(data => {
        if (data && typeof data === "object" && !data.detail) {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageTitle title="Authority Dashboard" sub="Overview of court operations and resources" />
      <div className="stat-grid">
        <Stat
          icon="BriefcaseBusiness"
          value={String(stats.totalCases || 0)}
          label="Total Cases"
          sub="Registered in system"
        />
        <Stat
          icon="CalendarDays"
          value={String(stats.todaysHearings || 0)}
          label="Today's Hearings"
          sub="Scheduled for today"
        />
        <Stat
          icon="CalendarRange"
          value={String(stats.upcomingHearings || 0)}
          label="Upcoming Hearings"
          sub="Scheduled for future"
        />
        <Stat
          icon="Landmark"
          value={String(stats.totalCourtrooms || 0)}
          label="Courtrooms"
          sub="Active rooms"
        />
        <Stat
          icon="UserRoundCog"
          value={String(stats.totalJudges || 0)}
          label="Judges"
          sub="Allocated judges"
        />
      </div>
      <div className="two-col" style={{marginTop: "2rem"}}>
        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage court operations</p>
            </div>
          </div>
          <div className="quick">
            <button onClick={() => setPage("Case Allocation")}>
              <Icon name="ListPlus" /> <span>Allocate Case</span>
            </button>
            <button onClick={() => setPage("Judge Allocation")}>
              <Icon name="UserRoundCog" /> <span>Assign Judge</span>
            </button>
            <button onClick={() => setPage("Court Schedule")}>
              <Icon name="CalendarRange" /> <span>View Schedule</span>
            </button>
            <button onClick={() => setPage("Courtroom Management")}>
              <Icon name="Landmark" /> <span>Courtrooms</span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
