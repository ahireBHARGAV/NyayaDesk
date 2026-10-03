import { useState } from "react";
import { Badge, Button, Icon, PageTitle, getTodayKey } from "../../App";

const MOCK_DB = {
  "MHNS030080582025": "State vs Sharma (Criminal Appeal)",
  "MHNS030112342025": "Singh vs Pvt Ltd (Corporate Dispute)",
  "MHNS030299992025": "Deshmukh vs BMC (Civil Writ)",
  "MHNS111111112025": "Rao vs State (Bail Application)",
};

const INITIAL_COURTROOMS = [
  { id: 'cr1', room: 'Courtroom 1 (Ground Floor)', judgeId: 'j1' },
  { id: 'cr2', room: 'Courtroom 2 (Ground Floor)', judgeId: 'j2' },
  { id: 'cr3', room: 'Courtroom 3 (First Floor)', judgeId: 'j3' },
  { id: 'cr4', room: 'Courtroom 4 (First Floor)', judgeId: '' },
];

const INITIAL_JUDGES = [
  { id: 'j1', name: 'Justice A. Mehra' },
  { id: 'j2', name: 'Justice B. Rao' },
  { id: 'j3', name: 'Justice C. Shah' },
  { id: 'j4', name: 'Justice D. Sen' },
];

const getInitialHearings = () => [
  { id: 'h1', date: getTodayKey(), time: '10:30', courtroomId: 'cr1', cnr: 'MHNS030080582025', title: 'State vs Sharma', status: 'Scheduled' }
];

export function CourtSchedule() {
  const [date, setDate] = useState(getTodayKey);
  const [courtrooms, setCourtrooms] = useState(INITIAL_COURTROOMS);
  const [judges] = useState(INITIAL_JUDGES);
  const [hearings, setHearings] = useState(getInitialHearings);
  
  const [allocatingRoom, setAllocatingRoom] = useState(null);
  const [allocForm, setAllocForm] = useState({ cnr: "", title: "", time: "10:00" });

  const handleJudgeChange = (courtroomId, judgeId) => {
    setCourtrooms(prev => prev.map(cr => cr.id === courtroomId ? { ...cr, judgeId } : cr));
  };

  const handleFetchCase = () => {
    if (!allocForm.cnr) return alert("Please enter a CNR number first.");
    const found = MOCK_DB[allocForm.cnr.toUpperCase()];
    if (found) {
      setAllocForm({ ...allocForm, title: found });
    } else {
      setAllocForm({ ...allocForm, title: "Unknown Case (Manual Entry)" });
    }
  };

  const allocateCase = (courtroomId) => {
    if (!allocForm.cnr || !allocForm.title || !allocForm.time) return alert("Please fetch a case and specify time.");
    
    const newHearing = {
      id: 'h' + Date.now(),
      date,
      time: allocForm.time,
      courtroomId,
      cnr: allocForm.cnr.toUpperCase(),
      title: allocForm.title,
      status: 'Scheduled'
    };
    
    setHearings([...hearings, newHearing]);
    setAllocatingRoom(null);
    setAllocForm({ cnr: "", title: "", time: "10:00" });
  };

  const addCourtroom = () => {
    const name = prompt("Enter new courtroom name (e.g. Courtroom 5 (Second Floor)):");
    if (name) {
      setCourtrooms([...courtrooms, { id: 'cr' + Date.now(), room: name, judgeId: '' }]);
    }
  };

  const hearingsByRoom = {};
  courtrooms.forEach(cr => { hearingsByRoom[cr.id] = []; });
  
  hearings.filter(h => h.date === date).forEach(h => {
    if (hearingsByRoom[h.courtroomId]) {
      hearingsByRoom[h.courtroomId].push(h);
    }
  });
  
  Object.keys(hearingsByRoom).forEach(id => {
    hearingsByRoom[id].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  });

  return (
    <>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem"}}>
        <PageTitle title="Courtroom Management" sub="Automated Schedule & Allocation System" />
        <Button onClick={addCourtroom}><Icon name="Plus" size={16} /> Add Courtroom</Button>
      </div>
      
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
                          <div style={{fontWeight: "500", color: "#0f172a"}}>{h.title}</div>
                          {h.cnr && <div style={{fontSize: "0.8rem", color: "#64748b"}}>CNR: {h.cnr}</div>}
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
                <div style={{backgroundColor: "#f1f5f9", padding: "1.5rem", borderRadius: "6px", marginTop: "1rem"}}>
                  <h4 style={{marginTop: 0, marginBottom: "1rem", color: "#0f172a"}}>Allot Case to {cr.room}</h4>
                  <div style={{display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "1rem"}}>
                    <div style={{flex: 1}}>
                      <label style={{display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "4px"}}>CNR Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. MHNS030080582025"
                        value={allocForm.cnr} 
                        onChange={e => setAllocForm({...allocForm, cnr: e.target.value})}
                        style={{width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px"}}
                      />
                    </div>
                    <Button variant="secondary" onClick={handleFetchCase}>Fetch Details</Button>
                  </div>
                  
                  <div style={{display: "flex", gap: "10px", alignItems: "flex-end"}}>
                    <div style={{flex: 2}}>
                      <label style={{display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "4px"}}>Case Title</label>
                      <input 
                        type="text" 
                        value={allocForm.title} 
                        onChange={e => setAllocForm({...allocForm, title: e.target.value})}
                        style={{width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px"}}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "4px"}}>Time</label>
                      <input 
                        type="time" 
                        value={allocForm.time} 
                        onChange={e => setAllocForm({...allocForm, time: e.target.value})}
                        style={{width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px"}}
                      />
                    </div>
                  </div>
                  
                  <div style={{display: "flex", gap: "10px", marginTop: "1.5rem"}}>
                    <Button onClick={() => allocateCase(cr.id)}>Confirm Allotment</Button>
                    <Button variant="secondary" onClick={() => setAllocatingRoom(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div style={{marginTop: "1rem"}}>
                  <Button variant="secondary" onClick={() => {
                    setAllocatingRoom(cr.id);
                    setAllocForm({ cnr: "", title: "", time: "10:00" });
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
