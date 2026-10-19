
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebase";
import "./Auth.css";

export default function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await setPersistence(
        auth,
        remember
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      const result = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      if (typeof onLogin === "function") {
        onLogin({
          email: result.user.email,
          remember,
        });
      }
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Incorrect email or password, or account not registered.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Check your internet connection.");
          break;
        default:
          setError("Login failed. Please try again.");
          console.error("Firebase login error:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address first to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setError("Password reset email sent. Check your inbox.");
    } catch (err) {
      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Could not send the reset email. Check the email and try again.");
      }
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
            Bring intelligent agents together, explore different
            perspectives, and discover better negotiation outcomes.
          </p>

          <img
            className="auth-hero-image"
            src="/images/hero-ai.png"
            alt="AI assistant helping a professional negotiate"
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

          <span className="auth-form-eyebrow">WELCOME BACK</span>

          <h2>Sign in to your workspace</h2>

          <p className="auth-form-description">
            Enter your details to continue your negotiation journey.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
            />

            <div className="auth-password-heading">
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                className="auth-text-button"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <div className="auth-password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
              />

              <button
                type="button"
                className="auth-show-password"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label className="auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Remember me</span>
            </label>

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
              {loading ? "Signing in..." : "Sign in to workspace"}
              {!loading && <span> →</span>}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <button
              className="auth-text-button"
              type="button"
              onClick={() => {
                setError("");
                if (typeof onShowRegister === "function") {
                  onShowRegister();
                } else {
                  setError("Registration page is not connected yet.");
                }
              }}
            >
              Create account
            </button>
          </p>

          <p className="auth-legal">
            By continuing, you agree to use the workspace responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}
