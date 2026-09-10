import { useContext, useState } from "react";
import { Badge, Button, DataContext, Icon, PageTitle } from "../../App";

export function History() {
  return (
    <div className="history">
      {[
        ["30 Aug 2026", "Reply filed"],
        ["20 Aug 2026", "Hearing conducted"],
        ["05 Aug 2026", "Petition submitted"],
        ["28 Jul 2026", "Case registered"],
      ].map((x) => (
        <div>
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
        <DaySchedule label={selectedLabel} hearings={selectedHearings} />
      </>
    );
  return (
    <>
      <PageTitle
        title="Calendar"
        sub="Select a date to open its hearing schedule."
        action={
          <div className="view-switch">
            {["Day", "Week", "Month"].map((x) => (
              <button
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
              <b>{day}</b>
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
              return (
                <button
                  className={`calendar-date ${events.length ? "has-events" : ""}`}
                  onClick={() => setSelected(dateKey)}
                >
                  <b>{i + 1}</b>
                  {events.slice(0, 2).map((event) => (
                    <small>
                      {event.time} Ã‚Â· {event.case}
                    </small>
                  ))}
                  {events.length > 2 && (
                    <small>+{events.length - 2} more</small>
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
export function DaySchedule({ label, hearings }) {
  return (
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
          {hearings.map((h) => (
            <button
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
                  {h.room} Ã‚Â· {h.judge}
                </p>
              </div>
              <Badge>{h.status}</Badge>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
