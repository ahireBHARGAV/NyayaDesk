import { useState, useEffect } from "react";
import { Badge, Button, Icon, PageTitle } from "../../App";
import { AIAssistant } from "./AIAssistant";
import { History } from "./Calendar";
import { Timeline } from "./Dashboard";

export function CaseDetail({ setPage }) {
  const selected = sessionStorage.getItem("nyaya_selected_case");
  const [item, setItem] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [advocates, setAdvocates] = useState([]);
  const [partnerId, setPartnerId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [loadingError, setLoadingError] = useState(false);

  const refreshData = async () => {
    if (!selected) return;
    const token = localStorage.getItem("nyaya_token");
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const res = await fetch(`/api/advocate/portfolio/cases/${encodeURIComponent(selected)}`, { headers });
      if (res.ok) {
        setItem(await res.json());
      } else {
        setLoadingError(true);
      }
      
      const advRes = await fetch('/api/advocates', { headers });
      if (advRes.ok) {
        setAdvocates(await advRes.json());
      }
    } catch (e) {
      console.error(e);
      setLoadingError(true);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selected]);

  const addPartner = async (e) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    if (!partnerId) return;
    
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch(`/api/advocate/portfolio/cases/${encodeURIComponent(selected)}/partners`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ partnerId })
    });
    
    if (res.ok) {
      setSuccessMsg("Partner added successfully!");
      setPartnerId("");
      refreshData();
    } else {
      const err = await res.json();
      setErrorMsg(err.detail || "Failed to add partner");
    }
  };

  if (loadingError) return <div style={{padding: "2rem", color: "var(--danger)"}}>Error loading case details. It may not exist in your portfolio.</div>;
  if (!item) return <div style={{padding: "2rem"}}>Loading case details...</div>;

  return (
    <>
      <PageTitle
        title={item.title}
        sub={`Case no. ${item.id} · ${item.court}`}
        action={
          <Button variant="secondary" onClick={() => setPage("My Cases")}>
            <Icon name="ArrowLeft" /> Back to portfolio
          </Button>
        }
      />
      <section className="case-hero">
        <div>
          <Badge>{item.status}</Badge>
          <h2>{item.type}</h2>
          <p>Case information</p>
        </div>
        <div>
          <small>Next hearing</small>
          <b>{item.next}</b>
          <p>
            {item.court} · {item.judge}
          </p>
        </div>
      </section>
      <div className="tabs">
        {[
          "Overview",
          "Partners",
          "History",
          "Hearings",
          "Documents",
          "Activities",
          "e-Filing",
          "AI Assistant",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <section className="panel tab-content">
        {tab === "History" ? (
          <History />
        ) : tab === "Hearings" ? (
          <Timeline setPage={setPage} />
        ) : tab === "AI Assistant" ? (
          <AIAssistant />
        ) : tab === "Partners" ? (
          <>
            <h2>Partner Advocates</h2>
            <p className="text-secondary" style={{marginBottom: "2rem"}}>These advocates also have access to this case in their portfolio.</p>
            
            <div className="data-table" style={{marginBottom: "2rem"}}>
              <div className="tr th">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
              </div>
              {item.partners?.map(p => (
                <div className="tr" key={p.id}>
                  <strong>{p.name}</strong>
                  <span>{p.email}</span>
                  <Badge>{p.role || "Partner Counsel"}</Badge>
                </div>
              ))}
              {(!item.partners || item.partners.length === 0) && (
                <div style={{padding: "1rem", color: "#666"}}>No partners added yet.</div>
              )}
            </div>
            
            <h3>Add a Partner</h3>
            <form onSubmit={addPartner} className="form inline-form" style={{maxWidth: "500px", marginTop: "1rem"}}>
              <label>
                Select Advocate
                <select value={partnerId} onChange={e => setPartnerId(e.target.value)} required>
                  <option value="">-- Choose an advocate --</option>
                  {advocates.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                  ))}
                </select>
              </label>
              <Button type="submit">Add to Case</Button>
            </form>
            {errorMsg && <p className="error" style={{color: "var(--danger)", marginTop: "1rem"}}>{errorMsg}</p>}
            {successMsg && <p className="success" style={{color: "var(--success)", marginTop: "1rem"}}>{successMsg}</p>}
          </>
        ) : (
          <>
            <h2>{tab}</h2>
            <div className="info-grid">
              <p>
                <small>Case Number</small>
                <b>{item.id}</b>
              </p>
              <p>
                <small>Case Type</small>
                <b>{item.type}</b>
              </p>
              <p>
                <small>Court</small>
                <b>{item.court}</b>
              </p>
              <p>
                <small>Judge</small>
                <b>{item.judge}</b>
              </p>
              <p>
                <small>Next Hearing</small>
                <b>{item.next}</b>
              </p>
              <p>
                <small>Current Status</small>
                <Badge>{item.status}</Badge>
              </p>
            </div>
          </>
        )}
      </section>
    </>
  );
}
