import { useContext, useState } from "react";
import { Badge, Button, DataContext, Icon, PageTitle } from "../../App";

export function Cases({ setPage }) {
  const { cases, refresh } = useContext(DataContext);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const addCase = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch("/api/advocate/portfolio/cases", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
    
    if (res.ok) {
      await refresh();
      setAdding(false);
      setMessage("Case added to portfolio successfully.");
    } else {
      const err = await res.json();
      setErrorMsg(err.detail || "Failed to add case.");
    }
  };
  const remove = async (id) => {
    if (!window.confirm(`Delete case ${id}? This cannot be undone.`)) return;
    const res = await fetch(`/api/cases/${encodeURIComponent(id)}/`, {
      method: "DELETE",
    });
    if (res.ok) {
      await refresh();
      setMessage(`Case ${id} deleted successfully.`);
    }
  };
  const result = cases.filter(
    (c) =>
      (filter === "All" || c.status === filter) &&
      (c.id.toLowerCase().includes(query.toLowerCase()) ||
        c.title.toLowerCase().includes(query.toLowerCase())),
  );
  return (
    <>
      <PageTitle
        title="My Cases"
        sub="Track every case, hearing and activity in one place."
        action={
          <div className="title-actions">
            <Button variant="secondary" onClick={() => setAdding(!adding)}>
              <Icon name="Plus" /> Add Case
            </Button>
            <Button onClick={() => setPage("e-Filing")}>
              <Icon name="FileUp" /> New filing
            </Button>
          </div>
        }
      />
      {adding && (
        <section className="panel form inline-form">
          <h2>Add Existing Case</h2>
          <p className="text-secondary" style={{marginBottom: "1rem"}}>Enter the 16-character CNR number to add an existing official case to your portfolio.</p>
          <form onSubmit={addCase}>
            <label>
              CNR Number
              <input name="cnr" required placeholder="e.g. MHNS030080582025" />
            </label>
            <Button type="submit">Add to Portfolio</Button>
            {errorMsg && <p className="error" style={{color: "var(--danger)", marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center"}}><Icon name="AlertCircle" size={16} /> {errorMsg}</p>}
          </form>
        </section>
      )}
      {message && (
        <p className="success">
          <Icon name="CheckCircle2" /> {message}
        </p>
      )}
      <section className="panel">
        <div className="filters">
          <div className="top-search">
            <Icon name="Search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case number or party name..."
            />
          </div>
          <div className="filter-tabs">
            {["All", "Active", "Pending", "Closed", "Upcoming Hearing"].map(
              (f) => (
                <button
                  className={filter === f ? "selected" : ""}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="data-table cases-table">
          <div className="tr th">
            <span>Case Number</span>
            <span>Case Title</span>
            <span>Case Type</span>
            <span>Court</span>
            <span>Judge</span>
            <span>Next Hearing</span>
            <span>Status</span>
            <span></span>
          </div>
          {result.map((c) => (
            <div className="tr">
              <b>{c.id}</b>
              <strong>{c.title}</strong>
              <span>{c.type}</span>
              <span>{c.court}</span>
              <span>{c.judge}</span>
              <span>{c.next}</span>
              <Badge>{c.status}</Badge>
              <span>
                <Button
                  variant="small secondary"
                  onClick={() => { sessionStorage.setItem("nyaya_selected_case", c.id); setPage("Case Details"); }}
                >
                  View
                </Button>
                <button
                  className="icon-btn delete-btn"
                  title="Delete case"
                  onClick={() => remove(c.id)}
                >
                  <Icon name="Trash2" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
