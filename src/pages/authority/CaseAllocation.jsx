import { useState } from "react";
import { Button, PageTitle, getTodayKey } from "../../App";

export function CaseAllocation({ setPage }) {
  const [form, setForm] = useState({
    caseNumber: "ABC/2026",
    caseTitle: "ABC vs XYZ",
    courtroom: "Courtroom 1",
    judge: "Justice A. Mehra",
    date: getTodayKey(),
    time: "09:30 AM",
  });
  const update = (key, value) => setForm({ ...form, [key]: value });
  const save = async () => {
    const assignment = { ...form, status: "Scheduled" };
    const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/assignments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assignment),
    });
    if (res.ok) {
      localStorage.setItem(
        "nyaya_latest_assignment",
        JSON.stringify(assignment),
      );
      setPage("Court Schedule");
    }
  };
  return (
    <>
      <PageTitle
        title="Case Allocation"
        sub="Assign a case to a courtroom and hearing slot."
      />
      <section className="panel form">
        <h2>Assign Case to Courtroom</h2>
        <label>
          Case Number
          <input
            value={form.caseNumber}
            onChange={(e) => update("caseNumber", e.target.value)}
          />
        </label>
        <label>
          Case Title
          <input
            value={form.caseTitle}
            onChange={(e) => update("caseTitle", e.target.value)}
          />
        </label>
        <label>
          Courtroom
          <select
            value={form.courtroom}
            onChange={(e) => update("courtroom", e.target.value)}
          >
            {["Courtroom 1", "Courtroom 2", "Courtroom 3", "Courtroom 4"].map(
              (room) => (
                <option>{room}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Judge
          <select
            value={form.judge}
            onChange={(e) => update("judge", e.target.value)}
          >
            {[
              "Justice A. Mehra",
              "Justice B. Rao",
              "Justice C. Shah",
              "Justice D. Sen",
            ].map((judge) => (
              <option>{judge}</option>
            ))}
          </select>
        </label>
        <label>
          Hearing Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </label>
        <label>
          Hearing Time
          <input
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
          />
        </label>
        <Button onClick={save}>Assign Case</Button>
      </section>
    </>
  );
}
