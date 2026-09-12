import { useState, useEffect } from "react";
import { Badge, Button, Icon, PageTitle } from "../../App";

export function CaseDetail({ setPage }) {
  const selected = sessionStorage.getItem("authority_selected_case");
  const [item, setItem] = useState(null);
  const [courtrooms, setCourtrooms] = useState([]);
  const [judges, setJudges] = useState([]);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const refresh = async () => {
    if (!selected) return;
    const token = localStorage.getItem("nyaya_token");
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const res = await fetch(`/api/authority/cases/${encodeURIComponent(selected)}`, { headers });
      if (res.ok) setItem(await res.json());
      
      const crs = await fetch('/api/authority/courtrooms', { headers });
      if (crs.ok) setCourtrooms(await crs.json());
      
      const js = await fetch('/api/authority/judges', { headers });
      if (js.ok) setJudges(await js.json());
    } catch(e) { console.error(e); }
  };

  useEffect(() => { refresh(); }, [selected]);

  const scheduleHearing = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    const fd = new FormData(e.currentTarget);
    const data = {
      caseId: selected,
      date: fd.get("date"),
      time: fd.get("time"),
      courtroomId: fd.get("courtroomId"),
      judgeId: fd.get("judgeId")
    };
    
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch("/api/authority/hearings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    
    if (res.ok) {
      setMsg({ text: "Hearing scheduled successfully!", type: "success" });
      e.target.reset();
      refresh();
    } else {
      const err = await res.json();
      setMsg({ text: err.detail || "Failed to schedule", type: "error" });
    }
  };

  if (!item) return <div style={{padding: "2rem"}}>Loading...</div>;

  return (
    <>
      <PageTitle title={item.title} sub={`Manage Case ${item.id}`} action={
        <Button variant="secondary" onClick={() => setPage("Cases")}>
          <Icon name="ArrowLeft" /> Back
        </Button>
      }/>
      
      <section className="panel" style={{marginBottom: "2rem"}}>
        <h2>Official Information</h2>
        <div className="info-grid">
          <p><small>CNR</small><b>{item.id}</b></p>
          <p><small>Case Number</small><b>{item.caseNumber || 'N/A'}</b></p>
          <p><small>Type</small><b>{item.type}</b></p>
          <p><small>Status</small><Badge>{item.status}</Badge></p>
        </div>
      </section>

      <section className="panel" style={{marginBottom: "2rem"}}>
        <h2>Schedule Hearing</h2>
        <form onSubmit={scheduleHearing} className="form inline-form">
          <label>Date <input type="date" name="date" required /></label>
          <label>Time <input type="time" name="time" required /></label>
          <label>Courtroom
            <select name="courtroomId">
              <option value="">-- Assign later --</option>
              {courtrooms.map(c => <option key={c.id} value={c.id}>{c.room}</option>)}
            </select>
          </label>
          <label>Judge
            <select name="judgeId">
              <option value="">-- Assign later --</option>
              {judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </label>
          <Button type="submit">Schedule</Button>
        </form>
        {msg.text && <p className={msg.type} style={{marginTop: '1rem', color: msg.type==='error'?'var(--danger)':'var(--success)'}}>{msg.text}</p>}
      </section>

      <section className="panel">
        <h2>Hearing History</h2>
        <div className="data-table">
          <div className="tr th">
            <span>Date & Time</span>
            <span>Courtroom</span>
            <span>Judge</span>
            <span>Status</span>
          </div>
          {item.hearings?.map(h => (
            <div className="tr" key={h.id}>
              <b>{h.date} {h.time && `@ ${h.time}`}</b>
              <span>{h.courtroom?.room || 'Unassigned'}</span>
              <span>{h.judge?.name || 'Unassigned'}</span>
              <Badge>{h.status}</Badge>
            </div>
          ))}
          {(!item.hearings || item.hearings.length === 0) && (
            <div style={{padding: '1rem', color: '#666'}}>No hearings scheduled yet.</div>
          )}
        </div>
      </section>
    </>
  );
}
