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
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(
    () => localStorage.getItem(imageKey) || "",
  );
  const [profile, setProfile] = useState({
    name: stored.name || (authority ? "Rajiv Arora" : "Adv. Arjun Rao"),
    id: stored.id || (authority ? "AUTH-0018" : "ADV-2026-418"),
    email: stored.email || "",
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
    setError("");
    if (password && !currentPassword)
      return setError("Enter your current password to set a new password.");
    const token = localStorage.getItem("nyaya_token");
    const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/auth/profile/", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...profile, password: password || undefined, currentPassword: currentPassword || undefined }),
    });
    if (res.ok) {
      const { user } = await res.json();
      setProfile({ ...profile, name: user.name, email: user.email, phone: user.phone || "", court: user.court || "" });
      localStorage.setItem(
        "nyaya_user",
        JSON.stringify({ ...stored, ...user }),
      );
      setPassword("");
      setCurrentPassword("");
      setEditing(false);
      setSaved(true);
    } else setError((await res.json()).detail || "Could not update your profile.");
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
              Email Address
              <input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} required />
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
            <label>
              Current Password
              <div className="password-field">
                <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" placeholder="Required only when changing password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}><Icon name={showPassword ? "EyeOff" : "Eye"} size={18} /></button>
              </div>
            </label>
            <label>
              New Password <small>(leave blank to keep current password)</small>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" autoComplete="new-password" placeholder="Minimum 6 characters" />
            </label>
            <label className="check-label profile-alerts">
              <input type="checkbox" checked={profile.alerts} onChange={(e) => update("alerts", e.target.checked)} /> Receive hearing and schedule notifications
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
              <small>Email</small>
              <b>{profile.email || "Not set"}</b>
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
        {error && <p className="lookup-error">{error}</p>}
      </section>
    </>
  );
}
