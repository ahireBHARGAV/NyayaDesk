import { useContext, useEffect, useState } from "react";
import {
  Badge,
  Button,
  DataContext,
  Icon,
  PageTitle,
  getTodayKey,
} from "../../App";

export function Courtrooms({ compact = false, setPage }) {
  const { courtrooms, refresh } = useContext(DataContext);
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState("All");
  const [date, setDate] = useState(getTodayKey);
  const [toast, setToast] = useState("");
  useEffect(() => setRooms(courtrooms), [courtrooms]);
  const shown = rooms.filter((x) => filter === "All" || x.status === filter);
  const replace = (room) => {
    sessionStorage.setItem("nyaya_replacement_room", room.room);
    setPage?.("Replacement Assignment");
  };
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>{compact ? "Today's Courtrooms" : "Courtroom Management"}</h2>
          <p>
            {compact
              ? "Current judge and case allocation."
              : `Schedule for ${new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`}
          </p>
        </div>
        {!compact && (
          <label className="date-filter">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        )}
      </div>
      {!compact && (
        <div className="filter-tabs">
          {["All", "Present", "Absent", "Updated"].map((x) => (
            <button
              className={filter === x ? "selected" : ""}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ))}
        </div>
      )}
      <div className="data-table courtroom-table">
        <div className="tr th">
          <span>Courtroom</span>
          <span>Judge</span>
          <span>Status</span>
          <span>Current / Next Case</span>
          {!compact && <span>Action</span>}
        </div>
        {shown.map((r) => (
          <div className="tr">
            <b>{r.room}</b>
            <span>{r.judge}</span>
            <Badge>{r.status}</Badge>
            <strong>{r.current}</strong>
            {!compact && (
              <span>
                {r.status === "Absent" ? (
                  <Button variant="small" onClick={() => replace(r)}>
                    Assign Replacement
                  </Button>
                ) : (
                  <button className="link-btn">View schedule</button>
                )}
              </span>
            )}
          </div>
        ))}
      </div>
      {toast && (
        <p className="success">
          <Icon name="CheckCircle2" /> {toast}{" "}
          <button onClick={() => setToast("")}>Ãƒâ€”</button>
        </p>
      )}
    </section>
  );
}
