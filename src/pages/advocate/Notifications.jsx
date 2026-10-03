import { useState, useEffect } from "react";
import { Badge, Button, Icon, PageTitle } from "../../App";

export function Notifications({ clear, authority }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    clear();
    fetch((import.meta.env.VITE_API_URL || "") + "/api/notifications/")
      .then(r => r.ok ? r.json() : [])
      .then(d => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const markRead = async (id) => {
    await fetch((import.meta.env.VITE_API_URL || "") + "/api/notifications/" + id + "/", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const iconForType = (type) => {
    if (type === "hearing") return "BellRing";
    if (type === "action") return "AlertCircle";
    return "Landmark";
  };

  return (
    <>
      <PageTitle title="Notifications" sub="Updates that need your attention." />
      <section className="panel notifications">
        {notifications.length > 0 ? notifications.map((n) => (
          <article key={n.id} style={{opacity: n.read ? 0.6 : 1}}>
            <span>
              <Icon name={iconForType(n.type)} />
            </span>
            <div>
              <h3>{n.type ? n.type.charAt(0).toUpperCase() + n.type.slice(1) : "Update"}</h3>
              <p>{n.message}</p>
            </div>
            {!n.read && (
              <Button variant="small secondary" onClick={() => markRead(n.id)}>
                Mark as Read
              </Button>
            )}
          </article>
        )) : (
          <div style={{padding: "2rem", textAlign: "center", color: "#888"}}>
            <Icon name="BellOff" size={32} />
            <p style={{marginTop: "0.5rem"}}>No notifications at this time.</p>
          </div>
        )}
      </section>
    </>
  );
}
