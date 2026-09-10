import { useContext, useState } from "react";
import { Badge, Button, DataContext, Icon, PageTitle } from "../../App";

export function Cases({ setPage }) {
  const { cases, refresh } = useContext(DataContext);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const addCase = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/cases/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await refresh();
      setAdding(false);
      setMessage("New case added successfully.");
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
          <h2>Add a Case</h2>
          <form onSubmit={addCase}>
            <label>
              Case Number
              <input name="id" required placeholder="LMN/2026" />
            </label>
            <label>
              Case Title
              <input name="title" required placeholder="Party A vs Party B" />
            </label>
            <label>
              Case Type
              <input name="type" required placeholder="Civil Appeal" />
            </label>
            <label>
              Court
              <input name="court" required defaultValue="High Court of Delhi" />
            </label>
            <label>
              Judge
              <input name="judge" required placeholder="Justice Name" />
            </label>
            <label>
              Next Hearing
              <input name="next" placeholder="15 Sep, 10:00 AM" />
            </label>
            <Button type="submit">Save Case</Button>
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
                  onClick={() => setPage("Case Details")}
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
