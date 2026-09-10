import { useEffect, useState } from "react";
import { Button, Icon, PageTitle } from "../../App";

export function Profile({ authority }) {
  const role = authority ? "authority" : "advocate";
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem("nyaya_user")) || {};
    } catch {
      return {};
    }
  })();
  const imageKey = `nyaya_profile_image_${stored.id || role}`;
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [image, setImage] = useState(
    () => localStorage.getItem(imageKey) || "",
  );
  const [profile, setProfile] = useState({
    name: stored.name || (authority ? "Rajiv Arora" : "Adv. Arjun Rao"),
    id: stored.id || (authority ? "AUTH-0018" : "ADV-2026-418"),
    phone: stored.phone || "+91 98765 43210",
    court: stored.court || "High Court of Delhi",
    alerts: true,
  });
  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const update = (key, value) => setProfile({ ...profile, [key]: value });
  const uploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result);
      setImage(value);
      localStorage.setItem(imageKey, value);
    };
    reader.readAsDataURL(file);
  };
  const save = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/profiles/${role}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) {
      setProfile(await res.json());
      localStorage.setItem(
        "nyaya_user",
        JSON.stringify({ ...stored, ...profile }),
      );
      setEditing(false);
      setSaved(true);
    }
  };
  return (
    <>
      <PageTitle
        title="Profile"
        sub="Manage your account and notification preferences."
      />
      <section className="panel profile">
        <div className="profile-top">
          <div className="big-avatar profile-photo">
            {image ? (
              <img src={image} alt={`${profile.name}'s profile`} />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2>{profile.name}</h2>
            <p>{authority ? "Court Authority" : "Advocate"}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => (editing ? setEditing(false) : setEditing(true))}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
        {editing ? (
          <form className="form profile-form" onSubmit={save}>
            <label>
              Profile Photo
              <input type="file" accept="image/*" onChange={uploadImage} />
            </label>
            <label>
              Full Name
              <input
                value={profile.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            <label>
              {authority ? "Authority ID" : "Advocate ID"}
              <input
                value={profile.id}
                onChange={(e) => update("id", e.target.value)}
              />
            </label>
            <label>
              Contact Number
              <input
                value={profile.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </label>
            <label>
              Associated Court
              <select
                value={profile.court}
                onChange={(e) => update("court", e.target.value)}
              >
                <option>High Court of Delhi</option>
                <option>District Court</option>
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={profile.alerts}
                onChange={(e) => update("alerts", e.target.checked)}
              />{" "}
              Receive hearing and schedule notifications
            </label>
            <Button type="submit">Save Changes</Button>
          </form>
        ) : (
          <div className="info-grid">
            <p>
              <small>{authority ? "Authority ID" : "Advocate ID"}</small>
              <b>{profile.id}</b>
            </p>
            <p>
              <small>Contact</small>
              <b>{profile.phone}</b>
            </p>
            <p>
              <small>Associated Court</small>
              <b>{profile.court}</b>
            </p>
            <p>
              <small>Notification Settings</small>
              <b>
                {profile.alerts
                  ? "Hearing & schedule alerts enabled"
                  : "Notifications paused"}
              </b>
            </p>
          </div>
        )}
        {saved && (
          <p className="success">
            <Icon name="CheckCircle2" /> Profile updated and stored.
          </p>
        )}
      </section>
    </>
  );
}
