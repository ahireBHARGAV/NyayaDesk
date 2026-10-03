import { Dashboard } from "./Dashboard";
import { Cases } from "./Cases";
import { CaseDetail } from "./CaseDetail";
import { Courtrooms } from "./Courtrooms";
import { Judges } from "./Judges";
import { CaseAllocation } from "./CaseAllocation";
import { JudgeAllocation, ReplacementAssignment } from "./JudgeAllocation";
import { CourtSchedule } from "./CourtSchedule";
import { ActivityLog } from "./ActivityLog";
import { Notifications } from "../advocate/Notifications";
import { Profile } from "../advocate/Profile";

export function Authority({ page, setPage, clear }) {
  if (page === "Dashboard") return <Dashboard setPage={setPage} />;
  if (page === "Courtroom Management") return <Courtrooms setPage={setPage} />;
  if (page === "Judge Allocation") return <JudgeAllocation setPage={setPage} />;
  if (page === "Case Allocation") return <CaseAllocation setPage={setPage} />;
  if (page === "Court Schedule") return <CourtSchedule setPage={setPage} />;
  if (page === "Notifications") return <Notifications clear={clear} authority={true} />;
  if (page === "Activity Log") return <ActivityLog />;
  if (page === "Cases") return <Cases setPage={setPage} />;
  if (page === "Case Details") return <CaseDetail setPage={setPage} />;
  if (page === "Profile") return <Profile authority={true} />;
  if (page === "Replacement Assignment") return <ReplacementAssignment setPage={setPage} />;
  return <Dashboard setPage={setPage} />;
}
