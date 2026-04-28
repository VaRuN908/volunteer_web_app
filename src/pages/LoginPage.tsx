import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockIcon, MailIcon } from "../components/icons";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [helperMessage, setHelperMessage] = useState(
    "Use your account details to enter the volunteer dashboard."
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHelperMessage(`Welcome back${email ? `, ${email}` : ""}. Opening your dashboard now.`);
    navigate("/app");
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-rule" />

        <form className="login-panel" onSubmit={handleSubmit}>
          <header className="login-header">
            <h1>User Login</h1>
            <p className="login-helper">{helperMessage}</p>
          </header>

          <label className="login-field">
            <span className="login-field-icon">
              <MailIcon className="small-icon" />
            </span>
            <input
              aria-label="Email ID"
              autoComplete="email"
              placeholder="Email ID"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="login-field">
            <span className="login-field-icon">
              <LockIcon className="small-icon" />
            </span>
            <input
              aria-label="Password"
              autoComplete="current-password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <div className="login-row">
            <label className="login-checkbox">
              <input
                checked={rememberMe}
                type="checkbox"
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              className="login-link"
              type="button"
              onClick={() => {
                setEmail("riya@volunteerconnect.org");
                setPassword("demo-access");
                setHelperMessage("Demo credentials added. You can login directly.");
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button className="login-button" type="submit">
            Login
          </button>
        </form>

        <div className="login-rule" />
      </section>
    </main>
  );
}
