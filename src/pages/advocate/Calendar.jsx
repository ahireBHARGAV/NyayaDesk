import { useContext, useState, useEffect } from "react";
import { Badge, Button, DataContext, Icon, PageTitle } from "../../App";

export function History() {
  return (
    <div className="history">
      {[
        ["30 Aug 2026", "Reply filed"],
        ["20 Aug 2026", "Hearing conducted"],
        ["05 Aug 2026", "Petition submitted"],
        ["28 Jul 2026", "Case registered"],
      ].map((x, i) => (
        <div key={i}>
          <span></span>
          <p>{x[0]}</p>
          <b>{x[1]}</b>
        </div>
      ))}
    </div>
  );
}

export function Calendar() {
  const { hearings } = useContext(DataContext);
  const [view, setView] = useState("Month");
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selected, setSelected] = useState(null);
  
  const key = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  
  const firstOffset = (month.getDay() + 6) % 7;
  const total = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  
  const selectedHearings = selected
    ? hearings.filter((item) => item.date === selected)
    : [];
    
  const selectedLabel =
    selected &&
    new Date(`${selected}T12:00:00`).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    
  const changeMonth = (offset) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
    
  if (selected)
    return (
      <>
        <PageTitle
          title="Daily Schedule"
          sub={selectedLabel}
          action={
            <Button variant="secondary" onClick={() => setSelected(null)}>
              <Icon name="ArrowLeft" /> Back to calendar
            </Button>
          }
        />
        <DaySchedule label={selectedLabel} hearings={selectedHearings} dateKey={selected} />
      </>
    );
    
  return (
    <>
      <PageTitle
        title="Calendar"
        sub="Select a date to open its hearing schedule and manage reminders."
        action={
          <div className="view-switch">
            {["Day", "Week", "Month"].map((x) => (
              <button
                key={x}
                className={view === x ? "active" : ""}
                onClick={() => setView(x)}
              >
                {x}
              </button>
            ))}
          </div>
        }
      />
      <section className="panel calendar">
        <div className="calendar-head">
          <button onClick={() => changeMonth(-1)} aria-label="Previous month">
            <Icon name="ChevronLeft" />
          </button>
          <h2>
            {month.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button onClick={() => changeMonth(1)} aria-label="Next month">
            <Icon name="ChevronRight" />
          </button>
        </div>
        <div className="month-grid">
          <div className="weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <b key={day}>{day}</b>
            ))}
          </div>
          <div className="month-days">
            {Array.from({ length: firstOffset }, (_, i) => (
              <span className="empty" key={`e-${i}`} />
            ))}
            {Array.from({ length: total }, (_, i) => {
              const date = new Date(
                month.getFullYear(),
                month.getMonth(),
                i + 1,
              );
              const dateKey = key(date);
              const events = hearings.filter((item) => item.date === dateKey);
              
              let notes = [];
              try {
                notes = JSON.parse(localStorage.getItem("nyaya_notes_" + dateKey) || "[]");
              } catch (e) {}

              const hasNotes = notes.length > 0;

              return (
                <button
                  key={dateKey}
                  className={`calendar-date ${events.length || hasNotes ? "has-events" : ""}`}
                  onClick={() => setSelected(dateKey)}
                >
                  <b>{i + 1} {hasNotes && <span style={{color:'#f59e0b', fontSize:'0.7rem'}}>&bull;</span>}</b>
                  {events.slice(0, 2).map((event, idx) => (
                    <small key={idx}>
                      {event.time} &middot; {event.case}
                    </small>
                  ))}
                  {events.length > 2 && (
                    <small>+${events.length - 2} more hearings</small>
                  )}
                  {events.length <= 1 && notes.length > 0 && (
                     <small style={{color: '#f59e0b'}}>{notes.length} Reminder{notes.length > 1 ? 's': ''}</small>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export function DaySchedule({ label, hearings, dateKey }) {
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nyaya_notes_" + dateKey) || "[]");
    } catch(e) {
      return [];
    }
  });
  const [newNote, setNewNote] = useState("");

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const updatedNotes = [...notes, newNote.trim()];
    setNotes(updatedNotes);
    localStorage.setItem("nyaya_notes_" + dateKey, JSON.stringify(updatedNotes));
    setNewNote("");
  };

  const removeNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    localStorage.setItem("nyaya_notes_" + dateKey, JSON.stringify(updatedNotes));
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      <section className="panel day-schedule">
        <div className="panel-title">
          <div>
            <h2>Schedule for {label}</h2>
            <p>
              {hearings.length
                ? `${hearings.length} hearing${hearings.length > 1 ? "s" : ""} scheduled`
                : "No hearings scheduled for this date."}
            </p>
          </div>
        </div>
        {hearings.length > 0 && (
          <div className="timeline">
            {hearings.map((h, i) => (
              <button
                key={i}
                className="timeline-row case-link"
                onClick={() => {
                  sessionStorage.setItem("nyaya_selected_case", h.case);
                  window.dispatchEvent(new Event("nyaya-open-case"));
                }}
              >
                <b>{h.time}</b>
                <span className="line-dot"></span>
                <div>
                  <h3>{h.case}</h3>
                  <p>
                    {h.room} &middot; {h.judge}
                  </p>
                </div>
                <Badge>{h.status}</Badge>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Reminders & Notes</h2>
            <p>Add personal reminders for this specific date.</p>
          </div>
        </div>
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
          {notes.length === 0 ? (
            <p style={{color: '#666'}}>No reminders set for this date.</p>
          ) : (
            <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {notes.map((note, idx) => (
                <li key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                  <span style={{fontSize: '14px', color: '#1e293b'}}>{note}</span>
                  <button onClick={() => removeNote(idx)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center'}} title="Delete reminder">
                    <Icon name="Trash2" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addNote} style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <input 
              style={{flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Prepare documents for appeal..."
            />
            <Button type="submit">Add Reminder</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
