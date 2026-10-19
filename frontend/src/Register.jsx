import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import "./Auth.css";

export default function Register({ onShowLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, cleanEmail, password);
      // Firebase signs in the newly registered user automatically.
      // App.jsx detects the signed-in user and displays the dashboard.
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Please choose a stronger password (at least 6 characters).");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Email/password sign-up is not enabled in Firebase Authentication.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">
          <span className="auth-brand-icon">✧</span>
          <span>
            <strong>Multi-Agent</strong>
            <small>Negotiation Simulator</small>
          </span>
        </div>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">
            INTELLIGENCE MEETS COLLABORATION
          </span>
          <h1>
            Better negotiations.
            <br />
            <span>Smarter decisions.</span>
          </h1>
          <p>
            Create your account and discover better negotiation outcomes.
          </p>
          <img
            className="auth-hero-image"
            src="/images/hero-ai.png"
            alt="AI negotiation workspace"
          />
          <div className="auth-trust-note">
            <span>✦</span>
            Your intelligent negotiation workspace
          </div>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <span className="auth-brand-icon">✧</span>
            <strong>Multi-Agent</strong>
          </div>

          <span className="auth-form-eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="auth-form-description">
            Register to access your negotiation workspace.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
            />

            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Enter your password again"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
            />

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <button
              className="auth-text-button"
              type="button"
              onClick={onShowLogin}
            >
              Sign in
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
