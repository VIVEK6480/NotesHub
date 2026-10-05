import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const email = form.email.trim();
    const password = form.password;

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 650));

      const result = await login({
        email,
        password,
        remember: form.remember,
      });

      if (!result.success) {
        setError(
          result.message || "Unable to login. Please try again."
        );

        setSubmitting(false);
        return;
      }

      setSuccess("Login successful. Redirecting...");

      setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
        });
      }, 450);
    } catch (error) {
      console.error("Login submit error:", error);

      setError(
        error?.message ||
          "Unable to login. Please try again."
      );

      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <style>{`
        .auth-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          color: #f2f6f5;
          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(16,185,129,.15),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(124,92,240,.14),
              transparent 32%
            ),
            #070a0c;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .auth-page *,
        .auth-page *::before,
        .auth-page *::after {
          box-sizing: border-box;
        }

        .auth-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(2px);
          pointer-events: none;
          animation: authFloat 8s ease-in-out infinite;
        }

        .auth-orb-one {
          width: 260px;
          height: 260px;
          left: -90px;
          top: 12%;
          background: rgba(16,185,129,.08);
        }

        .auth-orb-two {
          width: 330px;
          height: 330px;
          right: -120px;
          bottom: -80px;
          background: rgba(124,92,240,.08);
          animation-delay: -3s;
        }

        .auth-container {
          width: min(1080px, 100%);
          min-height: 650px;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          position: relative;
          z-index: 2;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 30px;
          background: rgba(12,17,20,.82);
          backdrop-filter: blur(24px);
          box-shadow:
            0 35px 100px rgba(0,0,0,.48),
            inset 0 1px 0 rgba(255,255,255,.04);
          animation: authEnter .65s cubic-bezier(.2,.7,.2,1);
        }

        .auth-brand-panel {
          position: relative;
          overflow: hidden;
          padding: 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid rgba(255,255,255,.07);
          background:
            linear-gradient(
              145deg,
              rgba(16,185,129,.12),
              rgba(7,10,12,.1)
            );
        }

        .auth-brand-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auth-logo {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #052e20;
          font-size: 21px;
          font-weight: 900;
          background: linear-gradient(135deg,#8ff0c9,#34d399);
          box-shadow: 0 14px 35px rgba(52,211,153,.22);
        }

        .auth-brand-name {
          font-size: 21px;
          font-weight: 850;
          letter-spacing: -.5px;
        }

        .auth-brand-copy {
          max-width: 460px;
        }

        .auth-brand-copy .eyebrow {
          margin-bottom: 14px;
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .auth-brand-copy h2 {
          margin: 0;
          max-width: 470px;
          font-size: clamp(32px,4vw,52px);
          line-height: 1.03;
          letter-spacing: -2px;
        }

        .auth-brand-copy h2 span {
          color: #6ee7b7;
        }

        .auth-brand-copy p {
          max-width: 430px;
          margin: 20px 0 0;
          color: #8e9b98;
          font-size: 14px;
          line-height: 1.8;
        }

        .auth-features {
          display: grid;
          gap: 12px;
          margin-top: 30px;
        }

        .auth-feature {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #b8c5c0;
          font-size: 13px;
        }

        .auth-feature-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #6ee7b7;
          background: rgba(110,231,183,.08);
          border: 1px solid rgba(110,231,183,.12);
        }

        .auth-trust {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #65736f;
          font-size: 11px;
        }

        .auth-form-panel {
          padding: 52px 48px;
          display: flex;
          align-items: center;
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .auth-form-header {
          margin-bottom: 30px;
        }

        .auth-form-header h1 {
          margin: 0;
          font-size: 31px;
          letter-spacing: -1px;
        }

        .auth-form-header p {
          margin: 9px 0 0;
          color: #8e9b98;
          font-size: 13px;
          line-height: 1.6;
        }

        .auth-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 13px;
          border-radius: 12px;
          font-size: 12px;
          line-height: 1.5;
          animation: authAlert .25s ease;
        }

        .auth-alert.error {
          color: #fda4af;
          border: 1px solid rgba(251,113,133,.18);
          background: rgba(251,113,133,.07);
        }

        .auth-alert.success {
          color: #86efac;
          border: 1px solid rgba(52,211,153,.18);
          background: rgba(52,211,153,.07);
        }

        .auth-field {
          margin-bottom: 18px;
        }

        .auth-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .auth-label {
          color: #b8c5c0;
          font-size: 12px;
          font-weight: 700;
        }

        .auth-forgot {
          color: #6ee7b7;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
        }

        .auth-forgot:hover {
          color: #a7f3d0;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #667570;
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          height: 50px;
          padding: 0 45px;
          outline: none;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,.09);
          color: #f2f6f5;
          background: rgba(6,11,13,.78);
          font: inherit;
          font-size: 13px;
          transition: .2s ease;
        }

        .auth-input::placeholder {
          color: #52615d;
        }

        .auth-input:focus {
          border-color: rgba(52,211,153,.55);
          box-shadow: 0 0 0 4px rgba(52,211,153,.08);
          background: rgba(7,13,15,.95);
        }

        .auth-password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 8px;
          color: #71807b;
          background: transparent;
          cursor: pointer;
        }

        .auth-password-toggle:hover {
          color: #6ee7b7;
          background: rgba(110,231,183,.07);
        }

        .auth-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin: 4px 0 22px;
        }

        .auth-check {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7e8b87;
          font-size: 11px;
          cursor: pointer;
        }

        .auth-check input {
          accent-color: #34d399;
          cursor: pointer;
        }

        .auth-security {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #596762;
          font-size: 10px;
        }

        .auth-submit {
          width: 100%;
          height: 51px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 13px;
          color: #052e20;
          background: linear-gradient(135deg,#8ff0c9,#34d399);
          box-shadow: 0 13px 32px rgba(52,211,153,.19);
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s ease;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 38px rgba(52,211,153,.28);
        }

        .auth-submit:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .auth-demo {
          margin-top: 18px;
          padding: 12px;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 12px;
          background: rgba(255,255,255,.025);
        }

        .auth-demo-title {
          margin-bottom: 5px;
          color: #667570;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .8px;
        }

        .auth-demo-text {
          color: #899792;
          font-size: 11px;
          line-height: 1.7;
        }

        .auth-demo strong {
          color: #b8c5c0;
        }

        .auth-footer {
          margin-top: 22px;
          text-align: center;
          color: #667570;
          font-size: 11px;
        }

        .auth-footer a {
          color: #6ee7b7;
          font-weight: 700;
          text-decoration: none;
        }

        .auth-footer a:hover {
          color: #a7f3d0;
        }

        .auth-footer-text {
          margin-top: 7px;
          color: #596762;
          font-size: 10.5px;
        }

        .auth-signup-link {
          color: #6ee7b7;
          font-weight: 800;
          text-decoration: none;
          transition: .2s ease;
        }

        .auth-signup-link:hover {
          color: #a7f3d0;
        }

        .auth-spinner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(5,46,32,.25);
          border-top-color: #052e20;
          animation: authSpin .7s linear infinite;
        }

        @keyframes authSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes authEnter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes authFloat {
          0%,100% {
            transform: translate3d(0,0,0);
          }

          50% {
            transform: translate3d(0,-18px,0);
          }
        }

        @keyframes authAlert {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 850px) {
          .auth-container {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .auth-brand-panel {
            display: none;
          }

          .auth-form-panel {
            padding: 42px 30px;
          }
        }

        @media (max-width: 480px) {
          .auth-page {
            padding: 15px;
          }

          .auth-container {
            border-radius: 23px;
          }

          .auth-form-panel {
            padding: 34px 20px;
          }

          .auth-form-header h1 {
            font-size: 27px;
          }

          .auth-options {
            align-items: flex-start;
            flex-direction: column;
          }

          .auth-security {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-page *,
          .auth-page *::before,
          .auth-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />

      <div className="auth-container">

        {/* LEFT PANEL */}
        <section className="auth-brand-panel">

          <div className="auth-brand-top">
            <div className="auth-logo">N</div>

            <div className="auth-brand-name">
              NotesHub
            </div>
          </div>

          <div className="auth-brand-copy">

            <div className="eyebrow">
              Personal Knowledge Workspace
            </div>

            <h2>
              Your ideas.
              <br />
              Your notes.
              <br />
              <span>Organized.</span>
            </h2>

            <p>
              Keep your notes, projects, ideas and important
              information organized inside one focused workspace.
            </p>

            <div className="auth-features">

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <CheckCircle2 size={16} />
                </span>
                Secure account access
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <CheckCircle2 size={16} />
                </span>
                Organized notes and projects
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <CheckCircle2 size={16} />
                </span>
                Fast and distraction-free workspace
              </div>

            </div>

          </div>

          <div className="auth-trust">
            <ShieldCheck size={14} />
            Your workspace is protected
          </div>

        </section>

        {/* RIGHT PANEL */}
        <section className="auth-form-panel">

          <div className="auth-form-wrap">

            <div className="auth-form-header">
              <h1>Welcome back</h1>

              <p>
                Sign in to continue to your NotesHub workspace.
              </p>
            </div>

            {error && (
              <div className="auth-alert error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert success">
                <CheckCircle2 size={17} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}
              <div className="auth-field">

                <div className="auth-label-row">
                  <label
                    className="auth-label"
                    htmlFor="login-email"
                  >
                    Email address
                  </label>
                </div>

                <div className="auth-input-wrap">

                  <Mail
                    className="auth-input-icon"
                    size={17}
                  />

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className="auth-input"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div className="auth-field">

                <div className="auth-label-row">

                  <label
                    className="auth-label"
                    htmlFor="login-password"
                  >
                    Password
                  </label>

                  <Link
                    className="auth-forgot"
                    to="/forgot-password"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="auth-input-wrap">

                  <LockKeyhole
                    className="auth-input-icon"
                    size={17}
                  />

                  <input
                    id="login-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    className="auth-input"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

              </div>

              {/* OPTIONS */}
              <div className="auth-options">

                <label className="auth-check">

                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                  />

                  Remember me

                </label>

                <div className="auth-security">
                  <ShieldCheck size={13} />
                  Protected workspace
                </div>

              </div>

              {/* SUBMIT */}
              <button
                className="auth-submit"
                type="submit"
                disabled={submitting}
              >

                {submitting ? (
                  <>
                    <span className="auth-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}

              </button>

            </form>

            <div className="auth-demo">

              <div className="auth-demo-title">
                Test account
              </div>

              <div className="auth-demo-text">
                Email:{" "}
                <strong>
                  vivek.test@example.com
                </strong>
                <br />
                Password:{" "}
                <strong>
                  Test@123456
                </strong>
              </div>

            </div>

            {/* CREATE ACCOUNT */}
            <div className="auth-footer">

              <div>
                NotesHub authentication panel
              </div>

              <div className="auth-footer-text">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="auth-signup-link"
                >
                  Create account
                </Link>
              </div>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}