import { useState, useEffect } from "react";
import { Button, PageTitle } from "../../App";

export function Judges() {
  const [judges, setJudges] = useState([]);
  const [name, setName] = useState("");

  const refresh = async () => {
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch('/api/authority/judges', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setJudges(await res.json());
  };

  useEffect(() => { refresh(); }, []);

  const addJudge = async (e) => {
    e.preventDefault();
    if (!name) return;
    const token = localStorage.getItem("nyaya_token");
    await fetch('/api/authority/judges', {
      method: 'POST',
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name })
    });
    setName("");
    refresh();
  };

  return (
    <>
      <PageTitle title="Judges" sub="Manage court officials" />
      <section className="panel form inline-form" style={{marginBottom: "2rem"}}>
        <h2>Add a Judge</h2>
        <form onSubmit={addJudge}>
          <label>Judge Name <input value={name} onChange={e => setName(e.target.value)} required placeholder="Hon. Justice Name" /></label>
          <Button type="submit">Add Judge</Button>
        </form>
      </section>

      <section className="panel">
        <div className="data-table">
          <div className="tr th">
            <span>Name</span>
            <span>Internal ID</span>
          </div>
          {judges.map(j => (
            <div className="tr" key={j.id}>
              <b>{j.name}</b>
              <span className="text-secondary">{j.id}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
