import { useState, useEffect } from "react";
import { Badge, Button, Icon, PageTitle } from "../../App";

export function Cases({ setPage }) {
  const [cases, setCases] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/cases", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setCases)
      .catch(console.error);
  }, []);

  const result = cases.filter(c => 
    c.id.toLowerCase().includes(query.toLowerCase()) || 
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <PageTitle title="All Cases" sub="Court-wide registry of all cases" />
      <section className="panel">
        <div className="filters">
          <div className="top-search">
            <Icon name="Search" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by case number or title..." />
          </div>
        </div>
        <div className="data-table cases-table">
          <div className="tr th">
            <span>CNR / Case Number</span>
            <span>Case Title</span>
            <span>Type</span>
            <span>Next Hearing</span>
            <span>Status</span>
            <span></span>
          </div>
          {result.map(c => (
            <div className="tr" key={c.id}>
              <b>{c.id}</b>
              <strong>{c.title}</strong>
              <span>{c.type}</span>
              <span>{c.next}</span>
              <Badge>{c.status}</Badge>
              <span>
                <Button variant="small secondary" onClick={() => {
                  sessionStorage.setItem("authority_selected_case", c.id);
                  setPage("Case Details");
                }}>Manage</Button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
