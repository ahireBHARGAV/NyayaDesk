import { useState, useEffect } from "react";
import { Icon, PageTitle, Stat } from "../../App";

export function Dashboard({ setPage }) {
  const [stats, setStats] = useState({ totalCases: 0, todaysHearings: 0, upcomingHearings: 0, totalCourtrooms: 0, totalJudges: 0 });

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/dashboard", { headers: { Authorization: \`Bearer \${token}\` } })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <>
      <PageTitle title="Authority Dashboard" sub="Overview of court operations and resources" />
      <div className="stat-grid">
        <Stat
          icon="BriefcaseBusiness"
          value={stats.totalCases.toString()}
          label="Total Cases"
          sub="Registered in system"
        />
        <Stat
          icon="CalendarDays"
          value={stats.todaysHearings.toString()}
          label="Today's Hearings"
          sub="Scheduled for today"
        />
        <Stat
          icon="CalendarRange"
          value={stats.upcomingHearings.toString()}
          label="Upcoming Hearings"
          sub="Scheduled for future"
        />
        <Stat
          icon="Landmark"
          value={stats.totalCourtrooms.toString()}
          label="Courtrooms"
          sub="Active rooms"
        />
        <Stat
          icon="UserRoundCog"
          value={stats.totalJudges.toString()}
          label="Judges"
          sub="Allocated judges"
        />
      </div>
    </>
  );
}