import { useState, useEffect } from "react";
import { Badge, Button, Icon, PageTitle, getTodayKey } from "../../App";

export function CourtSchedule({ setPage }) {
  const [date, setDate] = useState(getTodayKey());
  const [courtrooms, setCourtrooms] = useState([]);
  const [judges, setJudges] = useState([]);
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  
  const [allocatingRoom, setAllocatingRoom] = useState(null);
  const [allocForm, setAllocForm] = useState({ caseId: "", time: "10:00" });

  const fetchData = () => {
    const token = localStorage.getItem("nyaya_token");
    const headers = { Authorization: "Bearer " + token };
    
    Promise.all([
      fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/courtrooms", { headers }).then(r => r.json()),
      fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/judges", { headers }).then(r => r.json()),
      fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/cases", { headers }).then(r => r.json()),
      fetch((import.meta.env.VITE_API_URL || "") + "/api/hearings/", { headers }).then(r => r.json())
    ]).then(([cr, j, c, h]) => {
      setCourtrooms(Array.isArray(cr) ? cr : []);
      setJudges(Array.isArray(j) ? j : []);
      setCases(Array.isArray(c) ? c : []);
      setHearings(Array.isArray(h) ? h : []);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJudgeChange = async (courtroomId, judgeId) => {
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/courtrooms/" + courtroomId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ judgeId: judgeId || null })
    });
    if (res.ok) fetchData();
  };

  const allocateCase = async (courtroomId, judgeId) => {
    if (!allocForm.caseId || !allocForm.time) return alert("Please select a case and time.");
    if (!judgeId) return alert("Please assign a judge to this courtroom first.");
    
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/hearings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        caseId: allocForm.caseId,
        date: date,
        time: allocForm.time,
        courtroomId: courtroomId,
        judgeId: judgeId
      })
    });
    
    if (res.ok) {
      setAllocatingRoom(null);
      setAllocForm({ caseId: "", time: "10:00" });
      fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || "Failed to allocate case.");
    }
  };

  const hearingsByRoom = {};
  courtrooms.forEach(cr => { hearingsByRoom[cr.id] = []; });
  
  hearings.filter(h => h.date === date).forEach(h => {
    const cr = courtrooms.find(c => c.room === h.room);
    if (cr) hearingsByRoom[cr.id].push(h);
  });
  
  Object.keys(hearingsByRoom).forEach(id => {
    hearingsByRoom[id].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  });

  return (
    <>
      <PageTitle title="Courtroom Management" sub="Automated Schedule & Allocation System" />
      
      <section className="panel" style={{marginBottom: "2rem"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <h2 style={{margin: 0}}>Schedule for</h2>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            style={{padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px"}}
          />
        </div>
      </section>

      <div style={{display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "3rem"}}>
        {courtrooms.map(cr => (
          <div key={cr.id} style={{backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)"}}>
            
            <div style={{backgroundColor: "#f8fafc", padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <Icon name="Building2" size={24} color="#0f766e" />
                <h3 style={{margin: 0, fontSize: "1.2rem", color: "#0f172a"}}>{cr.room}</h3>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <small style={{color: "#64748b"}}>Presiding Judge:</small>
                <select 
                  value={cr.judgeId || ""} 
                  onChange={(e) => handleJudgeChange(cr.id, e.target.value)}
                  style={{padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", backgroundColor: "white", minWidth: "200px"}}
                >
                  <option value="">-- Assign Judge --</option>
                  {judges.map(j => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{padding: "1.5rem"}}>
              {hearingsByRoom[cr.id].length > 0 ? (
                <table style={{width: "100%", borderCollapse: "collapse", textAlign: "left", marginBottom: "1rem"}}>
                  <thead>
                    <tr style={{borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase"}}>
                      <th style={{padding: "8px", width: "100px"}}>Time</th>
                      <th style={{padding: "8px"}}>Case Details</th>
                      <th style={{padding: "8px", width: "120px"}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hearingsByRoom[cr.id].map(h => (
                      <tr key={h.id} style={{borderBottom: "1px solid #f1f5f9"}}>
                        <td style={{padding: "12px 8px", fontWeight: "600", color: "#0f766e"}}>{h.time}</td>
                        <td style={{padding: "12px 8px"}}>
                          <div style={{fontWeight: "500", color: "#0f172a"}}>{h.case}</div>
                          {h.caseId && <div style={{fontSize: "0.8rem", color: "#64748b"}}>CNR: {h.caseId}</div>}
                        </td>
                        <td style={{padding: "12px 8px"}}><Badge>{h.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{padding: "1rem 0", color: "#94a3b8", textAlign: "center", fontStyle: "italic"}}>
                  No cases allotted for this date.
                </div>
              )}

              {allocatingRoom === cr.id ? (
                <div style={{backgroundColor: "#f1f5f9", padding: "1rem", borderRadius: "6px", display: "flex", gap: "10px", alignItems: "center", marginTop: "1rem"}}>
                  <input 
                    type="time" 
                    value={allocForm.time} 
                    onChange={e => setAllocForm({...allocForm, time: e.target.value})}
                    style={{padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px"}}
                  />
                  <select 
                    value={allocForm.caseId}
                    onChange={e => setAllocForm({...allocForm, caseId: e.target.value})}
                    style={{flex: 1, padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px"}}
                  >
                    <option value="">-- Select Case to Allot --</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.id} - {c.title}</option>
                    ))}
                  </select>
                  <Button onClick={() => allocateCase(cr.id, cr.judgeId)}>Allot</Button>
                  <Button variant="secondary" onClick={() => setAllocatingRoom(null)}>Cancel</Button>
                </div>
              ) : (
                <div style={{marginTop: "1rem"}}>
                  <Button variant="secondary" onClick={() => {
                    setAllocatingRoom(cr.id);
                    setAllocForm({ caseId: "", time: "10:00" });
                  }}>
                    <Icon name="Plus" size={16} /> Allot Case to {cr.room}
                  </Button>
                </div>
              )}
            </div>
            
          </div>
        ))}
        {courtrooms.length === 0 && (
          <p style={{textAlign: "center", color: "#888", padding: "2rem"}}>No courtrooms found.</p>
        )}
      </div>
    </>
  );
}
