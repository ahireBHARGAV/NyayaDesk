import { useContext, useState } from "react";
import {
  Badge,
  Button,
  DataContext,
  Icon,
  PageTitle,
  getTodayKey,
} from "../../App";

export function JudgePresence({ setPage }) {
  const { courtrooms } = useContext(DataContext);
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>Judge Availability</h2>
          <p>Today's presence status</p>
        </div>
      </div>
      {courtrooms.slice(0, 3).map((x, i) => (
        <div className="judge-row">
          <span
            className={`presence ${x.status === "Absent" ? "absent" : ""}`}
          ></span>
          <div>
            <b>{x.judge}</b>
            <p>{x.room}</p>
          </div>
          <Badge>{x.status}</Badge>
          {x.status === "Absent" && (
            <Button
              variant="small"
              onClick={() => {
                sessionStorage.setItem("nyaya_replacement_room", x.room);
                setPage?.("Replacement Assignment");
              }}
            >
              Assign Replacement Judge
            </Button>
          )}
        </div>
      ))}
    </section>
  );
}
export function JudgeAllocation({ setPage, replacement = false }) {
  const [judge, setJudge] = useState("Justice A. Mehra");
  const [courtroom, setCourtroom] = useState(() =>
    replacement
      ? sessionStorage.getItem("nyaya_replacement_room") || "Courtroom 3"
      : "Courtroom 1",
  );
  const [date, setDate] = useState(getTodayKey);
  const [time, setTime] = useState("09:30");
  const save = async () => {
    const assignment = { judge, courtroom, date, time };
    const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/assignments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assignment),
    });
    if (res.ok) {
      sessionStorage.removeItem("nyaya_replacement_room");
      setPage("Courtroom Management");
    }
  };
  return (
    <>
      <PageTitle
        title={replacement ? "Replacement Judge" : "Judge Allocation"}
        sub={
          replacement
            ? "Assign a replacement judge to the selected courtroom."
            : "Assign a judge to a courtroom schedule."
        }
      />
      <section className="panel form">
        <h2>{replacement ? "Assign Replacement Judge" : "Assign Judge"}</h2>
        <label>
          Judge
          <select value={judge} onChange={(e) => setJudge(e.target.value)}>
            <option>Justice A. Mehra</option>
            <option>Justice B. Rao</option>
            <option>Justice C. Shah</option>
            <option>Justice D. Sen</option>
          </select>
        </label>
        <label>
          Courtroom
          <select
            value={courtroom}
            onChange={(e) => setCourtroom(e.target.value)}
          >
            {["Courtroom 1", "Courtroom 2", "Courtroom 3", "Courtroom 4"].map(
              (room) => (
                <option>{room}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Time
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
        <Button onClick={save}>
          {replacement ? "Assign Replacement" : "Assign Judge"}
        </Button>
      </section>
      {!replacement && <JudgePresence setPage={setPage} />}
    </>
  );
}

export function ReplacementAssignment({ setPage }) {
  return <JudgeAllocation setPage={setPage} replacement />;
}
