import { Dashboard } from "./Dashboard";
import { Cases } from "./Cases";
import { CaseDetail } from "./CaseDetail";
import { Hearings } from "./Hearings";
import { Courtrooms } from "./Courtrooms";
import { Judges } from "./Judges";

export function Authority({ page, setPage, clear }) {
  if (page === "Dashboard") return <Dashboard setPage={setPage} />;
  if (page === "Cases") return <Cases setPage={setPage} />;
  if (page === "Case Details") return <CaseDetail setPage={setPage} />;
  if (page === "Hearings") return <Hearings setPage={setPage} />;
  if (page === "Courtrooms") return <Courtrooms setPage={setPage} />;
  if (page === "Judges") return <Judges setPage={setPage} />;
  return <Dashboard setPage={setPage} />;
}
