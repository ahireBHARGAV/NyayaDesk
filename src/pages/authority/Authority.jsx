import { Notifications } from "../advocate/Notifications";
import { Profile } from "../advocate/Profile";
import { ActivityLog } from "./ActivityLog";
import { CaseAllocation } from "./CaseAllocation";
import { CourtSchedule } from "./CourtSchedule";
import { Courtrooms } from "./Courtrooms";
import { Dashboard } from "./Dashboard";
import { JudgeAllocation, ReplacementAssignment } from "./JudgeAllocation";

export function Authority({ page, setPage, clear }) {
  if (page === "Dashboard") return <Dashboard setPage={setPage} />;
  if (page === "Courtroom Management") return <Courtrooms setPage={setPage} />;
  if (page === "Judge Allocation") return <JudgeAllocation setPage={setPage} />;
  if (page === "Replacement Assignment")
    return <ReplacementAssignment setPage={setPage} />;
  if (page === "Case Allocation") return <CaseAllocation setPage={setPage} />;
  if (page === "Court Schedule") return <CourtSchedule />;
  if (page === "Notifications")
    return <Notifications clear={clear} authority />;
  if (page === "Activity Log") return <ActivityLog />;
  return <Profile authority />;
}
