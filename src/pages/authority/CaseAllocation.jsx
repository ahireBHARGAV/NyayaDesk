import { useState, useEffect } from "react";
import { Button, PageTitle, getTodayKey } from "../../App";

export function CaseAllocation({ setPage }) {
  const [form, setForm] = useState({
    caseNumber: "",
    caseTitle: "",
    courtroom: "",
    judge: "",
    date: getTodayKey(),
    time: "10:00",
  });

  const [courtrooms, setCourtrooms] = useState([]);
  const [judges, setJudges] = useState([]);
  const [cases, setCases] = useState([]);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    const headers = { Authorization: "Bearer " + token };

    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/courtrooms", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setCourtrooms(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/judges", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setJudges(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/cases", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setCases(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const update = (key, value) => setForm({ ...form, [key]: value });

  const selectCase = (caseId) => {
    const c = cases.find(x => x.id === caseId);
    if (c) {
      setForm({ ...form, caseNumber: c.id, caseTitle: c.title });
    }
  };

  const save = async () => {
    if (!form.caseNumber || !form.courtroom || !form.judge || !form.date) {
      return setMsg({ text: "Please fill all required fields.", type: "error" });
    }
    setMsg({ text: "", type: "" });
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/authority/hearings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        caseId: form.caseNumber,
        date: form.date,
        time: form.time,
        courtroomId: form.courtroom,
        judgeId: form.judge,
      }),
    });
    if (res.ok) {
      setMsg({ text: "Case allocated successfully! Hearing scheduled.", type: "success" });
      setForm({ ...form, caseNumber: "", caseTitle: "" });
    } else {
      const err = await res.json().catch(() => ({}));
      setMsg({ text: err.detail || "Failed to allocate case.", type: "error" });
    }
  };

  return (
    <>
      <PageTitle title="Case Allocation" sub="Assign a case to a courtroom and hearing slot." />
      <section className="panel form">
        <h2>Assign Case to Courtroom</h2>
        <label>
          Select Case
          <select value={form.caseNumber} onChange={(e) => selectCase(e.target.value)}>
            <option value="">-- Select a Case --</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>{c.id} — {c.title}</option>
            ))}
          </select>
        </label>
        <label>
          Courtroom
          <select value={form.courtroom} onChange={(e) => update("courtroom", e.target.value)}>
            <option value="">-- Select Courtroom --</option>
            {courtrooms.map(c => (
              <option key={c.id} value={c.id}>{c.room}{c.judge ? " (Judge: " + c.judge.name + ")" : ""}</option>
            ))}
          </select>
        </label>
        <label>
          Presiding Judge
          <select value={form.judge} onChange={(e) => update("judge", e.target.value)}>
            <option value="">-- Select Judge --</option>
            {judges.map(j => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </label>
        <label>
          Hearing Date
          <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
        </label>
        <label>
          Hearing Time
          <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} />
        </label>
        <Button onClick={save}>Allocate Case</Button>
        {msg.text && <p style={{marginTop: "1rem", color: msg.type === "error" ? "var(--danger)" : "var(--success)"}}>{msg.text}</p>}
      </section>
    </>
  );
}
