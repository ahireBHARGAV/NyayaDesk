import { useState, useEffect } from "react";
import { Badge, Button, PageTitle } from "../../App";

export function Courtrooms() {
  const [courtrooms, setCourtrooms] = useState([]);
  const [judges, setJudges] = useState([]);

  const refresh = async () => {
    const token = localStorage.getItem("nyaya_token");
    const headers = { Authorization: `Bearer ${token}` };
    
    const crs = await fetch('/api/authority/courtrooms', { headers });
    if (crs.ok) setCourtrooms(await crs.json());
    
    const js = await fetch('/api/authority/judges', { headers });
    if (js.ok) setJudges(await js.json());
  };

  useEffect(() => { refresh(); }, []);

  const updateCourtroom = async (id, data) => {
    const token = localStorage.getItem("nyaya_token");
    await fetch(`/api/authority/courtrooms/${id}`, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    refresh();
  };

  return (
    <>
      <PageTitle title="Courtroom Management" sub="Manage physical courtroom resources" />
      <section className="panel">
        <div className="data-table">
          <div className="tr th">
            <span>Room</span>
            <span>Status</span>
            <span>Assigned Judge</span>
            <span>Actions</span>
          </div>
          {courtrooms.map(c => (
            <div className="tr" key={c.id}>
              <b>{c.room}</b>
              <Badge>{c.status}</Badge>
              <span>
                <select 
                  value={c.judgeId || ""} 
                  onChange={e => updateCourtroom(c.id, { judgeId: e.target.value || null })}
                  style={{padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px'}}
                >
                  <option value="">Unassigned</option>
                  {judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </span>
              <span>
                <Button variant="small secondary" onClick={() => updateCourtroom(c.id, { status: c.status === 'Available' ? 'Unavailable' : 'Available' })}>
                  Toggle Status
                </Button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
