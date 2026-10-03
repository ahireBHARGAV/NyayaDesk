import { useEffect, useState } from "react";
import { Badge, Button, Icon, PageTitle, getTodayKey } from "../../App";

export function JudgePresence({ setPage }) {
  const [courtrooms, setCourtrooms] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/courtrooms", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(r => r.ok ? r.json() : [])
      .then(d => setCourtrooms(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>Judge Availability</h2>
          <p>Courtroom status overview</p>
        </div>
      </div>
      {courtrooms.length > 0 ? courtrooms.map((x) => (
        <div className="judge-row" key={x.id}>
          <span className={"presence " + (x.status === "Unavailable" ? "absent" : "")}></span>
          <div>
            <b>{x.judge?.name || "Unassigned"}</b>
            <p>{x.room}</p>
          </div>
          <Badge>{x.status}</Badge>
          {x.status === "Unavailable" && (
            <Button variant="small" onClick={() => {
              sessionStorage.setItem("nyaya_replacement_room", x.id);
              setPage("Replacement Assignment");
            }}>
              Assign Replacement
            </Button>
          )}
        </div>
      )) : (
        <p style={{padding: "1rem", color: "#888"}}>No courtrooms configured yet.</p>
      )}
    </section>
  );
}

export function JudgeAllocation({ setPage, replacement = false }) {
  const [judges, setJudges] = useState([]);
  const [courtrooms, setCourtrooms] = useState([]);
  const [judgeId, setJudgeId] = useState("");
  const [courtroomId, setCourtroomId] = useState(() =>
    replacement ? sessionStorage.getItem("nyaya_replacement_room") || "" : ""
  );
  const [date, setDate] = useState(getTodayKey);
  const [time, setTime] = useState("09:30");
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    const headers = { Authorization: "Bearer " + token };

    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/judges", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setJudges(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/courtrooms", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setCourtrooms(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const save = async () => {
    if (!judgeId || !courtroomId) {
      return setMsg({ text: "Please select both a judge and a courtroom.", type: "error" });
    }
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/courtrooms/" + courtroomId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ judgeId, status: "Available" }),
    });
    if (res.ok) {
      sessionStorage.removeItem("nyaya_replacement_room");
      setMsg({ text: "Judge assigned successfully!", type: "success" });
      setTimeout(() => setPage("Courtroom Management"), 1000);
    } else {
      setMsg({ text: "Failed to assign judge.", type: "error" });
    }
  };

  return (
    <>
      <PageTitle
        title={replacement ? "Replacement Judge" : "Judge Allocation"}
        sub={replacement ? "Assign a replacement judge to the selected courtroom." : "Assign a judge to a courtroom."}
      />
      <section className="panel form">
        <h2>{replacement ? "Assign Replacement Judge" : "Assign Judge"}</h2>
        <label>
          Judge
          <select value={judgeId} onChange={(e) => setJudgeId(e.target.value)}>
            <option value="">-- Select Judge --</option>
            {judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
        </label>
        <label>
          Courtroom
          <select value={courtroomId} onChange={(e) => setCourtroomId(e.target.value)}>
            <option value="">-- Select Courtroom --</option>
            {courtrooms.map(c => <option key={c.id} value={c.id}>{c.room}</option>)}
          </select>
        </label>
        <Button onClick={save}>
          {replacement ? "Assign Replacement" : "Assign Judge"}
        </Button>
        {msg.text && <p style={{marginTop: "1rem", color: msg.type === "error" ? "var(--danger)" : "var(--success)"}}>{msg.text}</p>}
      </section>
      {!replacement && <JudgePresence setPage={setPage} />}
    </>
  );
}

export function ReplacementAssignment({ setPage }) {
  return <JudgeAllocation setPage={setPage} replacement />;
}
