import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockIcon, MailIcon, ProfileIcon } from "../components/icons";
import { signupUser } from "../lib/api";
import { saveSession } from "../lib/session";

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Volunteer Contributor",
    location: "Mumbai, India",
    availability: "Weekend availability",
    skills: "Team Coordination, Community Outreach"
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState(
    "Create a working volunteer account and we will take you straight into the web-app."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("Creating your account...");
      const session = await signupUser({
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        rememberMe
      });
      saveSession(session, rememberMe);
      setMessage(`Welcome, ${session.name}. Your account is ready.`);
      navigate("/app");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-rule" />

        <form className="login-panel" onSubmit={handleSubmit}>
          <header className="login-header">
            <h1>Create Account</h1>
            <p className="login-helper">{message}</p>
          </header>

          <label className="login-field">
            <span className="login-field-icon">
              <ProfileIcon className="small-icon" />
            </span>
            <input
              aria-label="Full name"
              placeholder="Full Name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>

          <label className="login-field">
            <span className="login-field-icon">
              <MailIcon className="small-icon" />
            </span>
            <input
              aria-label="Email ID"
              placeholder="Email ID"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label className="login-field">
            <span className="login-field-icon">
              <LockIcon className="small-icon" />
            </span>
            <input
              aria-label="Password"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </label>

          <label className="login-field">
            <span className="login-field-icon">R</span>
            <input
              aria-label="Volunteer role"
              placeholder="Volunteer Role"
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            />
          </label>

          <label className="login-field">
            <span className="login-field-icon">L</span>
            <input
              aria-label="Location"
              placeholder="Location"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
            />
          </label>

          <label className="login-field">
            <span className="login-field-icon">S</span>
            <input
              aria-label="Skills"
              placeholder="Skills, comma separated"
              value={form.skills}
              onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))}
            />
          </label>

          <div className="login-row">
            <label className="login-checkbox">
              <input
                checked={rememberMe}
                type="checkbox"
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>

            <Link className="login-link login-link-anchor" to="/login">
              Already have an account?
            </Link>
          </div>

          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="login-rule" />
      </section>
    </main>
  );
}
