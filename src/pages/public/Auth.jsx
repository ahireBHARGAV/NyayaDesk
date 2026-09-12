import { useState } from "react";
import { Button, Icon } from "../../App";

export function Role({ go }) {
  return (
    <div className="auth-page">
      <button className="back" onClick={() => go("public")}>
        <Icon name="ArrowLeft" /> Back to home
      </button>
      <div className="auth-intro">
        <div className="brand">
          <span className="brand-mark">Ã¢Å¡â€“</span> Nyaya<span>Desk</span>
        </div>
        <p className="eyebrow">SECURE ACCESS</p>
        <h1>
          Welcome to the Court
          <br />
          Management System
        </h1>
        <p>Choose how you want to sign in.</p>
      </div>
      <div className="role-cards">
        <RoleCard
          icon="Scale"
          title="Advocate"
          desc="Manage your cases, hearings, documents and legal activities."
          onClick={() => go("login-advocate")}
        />
        <RoleCard
          icon="Landmark"
          title="Authority"
          desc="Manage courtroom schedules, judge assignments and case allocation."
          onClick={() => go("login-authority")}
        />
      </div>
    </div>
  );
}
export function RoleCard({ icon, title, desc, onClick }) {
  return (
    <article className="role-card">
      <span className="role-icon">
        <Icon name={icon} size={28} />
      </span>
      <h2>{title}</h2>
      <p>{desc}</p>
      <Button onClick={onClick}>
        Sign In as {title} <Icon name="ArrowRight" size={16} />
      </Button>
    </article>
  );
}
export function Login({ role, go }) {
  const authority = role === "Authority";
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const signIn = async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        role,
      }),
    });
    const body = await res.json();
    if (!res.ok) return setMessage(body.detail);
    localStorage.setItem("nyaya_token", body.token);
    localStorage.setItem("nyaya_user", JSON.stringify(body.user));
    go(authority ? "authority" : "advocate");
  };
  return (
    <div className="login-page">
      <button className="back" onClick={() => go("role")}>
        <Icon name="ArrowLeft" /> Choose role
      </button>
      <form className="login-card" onSubmit={signIn}>
        <div className="role-icon">
          <Icon name={authority ? "Landmark" : "Scale"} />
        </div>
        <p className="eyebrow">
          {authority ? "AUTHORITY PORTAL" : "ADVOCATE PORTAL"}
        </p>
        <h1>Sign in as {role}</h1>
        <p>Use your registered credentials to continue to your workspace.</p>
        <label>
          {authority ? "Authority ID / Email" : "Email / User ID"}
          <input
            name="email"
            type="email"
            required
            placeholder={
              authority ? "authority@court.gov" : "advocate@example.com"
            }
          />
        </label>
        <label>
          Password
          <div className="password-field">
            <input name="password" type={showPassword ? "text" : "password"} required placeholder="Enter your password" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
            </button>
          </div>
        </label>
        <Button type="submit">
          Sign In <Icon name="ArrowRight" size={16} />
        </Button>
        {message && <p className="success">{message}</p>}
        <p className="signup-prompt">
          New here?{" "}
          <button
            type="button"
            onClick={() =>
              go(authority ? "signup-authority" : "signup-advocate")
            }
          >
            Create an account
          </button>
        </p>
      </form>
    </div>
  );
}
export function Signup({ role, go }) {
  const authority = role === "Authority";
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const photo = form.profileImage;
    delete form.profileImage;
    const signup = await fetch((import.meta.env.VITE_API_URL || "") + "/api/auth/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    });
    const signupBody = await signup.json();
    if (!signup.ok) return setMessage(signupBody.detail);
    const login = await fetch((import.meta.env.VITE_API_URL || "") + "/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        role,
      }),
    });
    const loginBody = await login.json();
    if (!login.ok)
      return setMessage(loginBody.detail || "Account created. Please sign in.");
    localStorage.setItem("nyaya_token", loginBody.token);
    localStorage.setItem("nyaya_user", JSON.stringify(loginBody.user));
    if (photo?.size) {
      const reader = new FileReader();
      reader.onload = () =>
        localStorage.setItem(
          `nyaya_profile_image_${loginBody.user.id}`,
          String(reader.result),
        );
      reader.readAsDataURL(photo);
    }
    go(authority ? "authority" : "advocate");
  };
  return (
    <div className="login-page">
      <button
        className="back"
        onClick={() => go(authority ? "login-authority" : "login-advocate")}
      >
        <Icon name="ArrowLeft" /> Back to sign in
      </button>
      <form className="login-card" onSubmit={submit}>
        <div className="role-icon">
          <Icon name={authority ? "Landmark" : "Scale"} />
        </div>
        <p className="eyebrow">CREATE {role.toUpperCase()} ACCOUNT</p>
        <h1>Create your account</h1>
        <p>Enter your professional details to set up your workspace.</p>
        <label>
          Profile Photo <small>(optional)</small>
          <input name="profileImage" type="file" accept="image/*" />
        </label>
        <label>
          Full Name
          <input name="name" required placeholder="Your full name" />
        </label>
        <label>
          {authority ? "Authority ID" : "Advocate ID / Bar Registration"}
          <input
            name="id"
            required
            placeholder={authority ? "AUTH-0001" : "ADV-2026-001"}
          />
        </label>
        <label>
          Email Address
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </label>
        <label>
          Mobile Number
          <input name="phone" required placeholder="+91 98765 43210" />
        </label>
        <label>
          Associated Court
          <select name="court" required>
            <option value="High Court of Delhi">High Court of Delhi</option>
            <option value="District Court">District Court</option>
          </select>
        </label>
        {authority && (
          <label>
            Designation
            <input
              name="designation"
              required
              placeholder="Court Schedule Officer"
            />
          </label>
        )}
        <label>
          Password
          <div className="password-field">
            <input name="password" type={showPassword ? "text" : "password"} minLength="6" required placeholder="Minimum 6 characters" autoComplete="new-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
            </button>
          </div>
        </label>
        <Button type="submit">
          Create Account <Icon name="ArrowRight" size={16} />
        </Button>
        {message && <p className="success">{message}</p>}
      </form>
    </div>
  );
}
