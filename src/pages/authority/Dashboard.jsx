import { useState, useEffect } from "react";
import { Icon, PageTitle } from "../../App";

export function Dashboard({ setPage }) {
  const [stats, setStats] = useState({ totalCases: 0, todaysHearings: 0, upcomingHearings: 0, totalCourtrooms: 0, totalJudges: 0 });

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    fetch("/api/authority/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <>
      <PageTitle title="Authority Dashboard" sub="Overview of court operations and resources" />
      <div className="grid">
        <div className="card">
          <Icon name="Briefcase" size={32} />
          <div className="value">{stats.totalCases}</div>
          <div className="label">Total Cases</div>
        </div>
        <div className="card">
          <Icon name="Calendar" size={32} />
          <div className="value">{stats.todaysHearings}</div>
          <div className="label">Today's Hearings</div>
        </div>
        <div className="card">
          <Icon name="CalendarRange" size={32} />
          <div className="value">{stats.upcomingHearings}</div>
          <div className="label">Upcoming Hearings</div>
        </div>
        <div className="card">
          <Icon name="Landmark" size={32} />
          <div className="value">{stats.totalCourtrooms}</div>
          <div className="label">Courtrooms</div>
        </div>
        <div className="card">
          <Icon name="UserRoundCog" size={32} />
          <div className="value">{stats.totalJudges}</div>
          <div className="label">Judges</div>
        </div>
      </div>
    </>
  );
}
