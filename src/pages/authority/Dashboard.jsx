import { Button, Icon, PageTitle, Stat } from "../../App";
import { ActivityLog } from "./ActivityLog";
import { Courtrooms } from "./Courtrooms";
import { JudgePresence } from "./JudgeAllocation";

export function Dashboard({ setPage }) {
  return (
    <>
      <PageTitle
        title="Courtroom Management"
        sub="Manage today's courtroom and judge schedule."
        action={
          <Button onClick={() => setPage("Judge Allocation")}>
            <Icon name="Plus" /> Assign judge
          </Button>
        }
      />
      <div className="stat-grid">
        <Stat
          icon="Landmark"
          value="12"
          label="Today's Courtrooms"
          sub="4 active now"
        />
        <Stat
          icon="UserCheck"
          value="10"
          label="Judges Present"
          sub="2 unavailable"
        />
        <Stat
          icon="Gavel"
          value="8"
          label="Ongoing Hearings"
          sub="Updated live"
        />
        <Stat
          icon="RefreshCw"
          value="3"
          label="Schedule Updates"
          sub="Require review"
        />
      </div>
      <Courtrooms compact />
      <div className="two-col">
        <JudgePresence setPage={setPage} />
        <ActivityLog compact />
      </div>
    </>
  );
}
