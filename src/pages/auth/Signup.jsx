import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!name) {
      toast.error("Please enter your name.");
      return;
    }

    if (name.length < 2) {
      toast.error("Name must contain at least 2 characters.");
      return;
    }

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await signup({
        name,
        email,
        password,
      });

      if (!result.success) {
        toast.error(
          result.message || "Unable to create account."
        );
        return;
      }

      toast.success("Account created successfully!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Signup submit error:", error);

      toast.error(
        "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <div style={styles.container}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>N</div>

          <div>
            <div style={styles.brandName}>NotesHub</div>

            <div style={styles.brandSubtitle}>
              Your personal knowledge space
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconWrapper}>
              <UserPlus size={22} strokeWidth={2.2} />
            </div>

            <div>
              <h1 style={styles.title}>Create your account</h1>

              <p style={styles.subtitle}>
                Start organizing your notes with NotesHub.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Full name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={loading}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email address</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>

              <div style={styles.passwordWrapper}>
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  disabled={loading}
                  style={styles.passwordInput}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  disabled={loading}
                  style={styles.eyeButton}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Confirm password
              </label>

              <div style={styles.passwordWrapper}>
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={loading}
                  style={styles.passwordInput}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  disabled={loading}
                  style={styles.eyeButton}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div style={styles.passwordHint}>
              Password must contain at least 8 characters.
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              <span>
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </span>

              {!loading && (
                <ArrowRight
                  size={18}
                  strokeWidth={2.2}
                />
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>OR</span>
            <span style={styles.dividerLine} />
          </div>

          <p style={styles.loginText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.loginLink}>
              Sign in
            </Link>
          </p>
        </div>

        <div style={styles.footer}>
          <span>NotesHub</span>
          <span style={styles.footerDot}>•</span>
          <span>Secure workspace</span>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        input::placeholder {
          color: #65736f;
        }

        input:focus {
          outline: none;
          border-color: rgba(52, 211, 153, 0.65) !important;
          background: rgba(12, 24, 21, 0.88) !important;
          box-shadow:
            0 0 0 3px rgba(52, 211, 153, 0.08),
            0 10px 30px rgba(0, 0, 0, 0.12);
        }

        button {
          font-family: inherit;
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        a:hover {
          color: #8ff0c9 !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background:
      "radial-gradient(circle at 15% 10%, rgba(16,185,129,0.09), transparent 30%), radial-gradient(circle at 85% 85%, rgba(20,184,166,0.07), transparent 30%), #070b0a",
    color: "#eef7f3",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  backgroundGlowOne: {
    position: "absolute",
    width: 420,
    height: 420,
    top: -180,
    left: -180,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(52,211,153,0.12), transparent 68%)",
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "absolute",
    width: 460,
    height: 460,
    right: -220,
    bottom: -220,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(20,184,166,0.09), transparent 68%)",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: 450,
    position: "relative",
    zIndex: 1,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },

  brandIcon: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    borderRadius: 12,
    background:
      "linear-gradient(135deg, #8ff0c9, #34d399)",
    color: "#052e20",
    fontSize: 20,
    fontWeight: 900,
    boxShadow:
      "0 12px 35px rgba(52, 211, 153, 0.2)",
  },

  brandName: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#ecfdf5",
  },

  brandSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#71817c",
  },

  card: {
    width: "100%",
    padding: "30px",
    borderRadius: 24,
    border: "1px solid rgba(148, 163, 184, 0.11)",
    background:
      "linear-gradient(145deg, rgba(17, 27, 24, 0.91), rgba(8, 15, 13, 0.96))",
    boxShadow:
      "0 30px 80px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255,255,255,0.025)",
    backdropFilter: "blur(24px)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },

  iconWrapper: {
    width: 46,
    height: 46,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    background: "rgba(52, 211, 153, 0.09)",
    border:
      "1px solid rgba(52, 211, 153, 0.16)",
    color: "#6ee7b7",
  },

  title: {
    margin: 0,
    fontSize: 23,
    lineHeight: 1.2,
    fontWeight: 750,
    letterSpacing: "-0.025em",
    color: "#f0fdf9",
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: 12.5,
    lineHeight: 1.5,
    color: "#7d8c87",
  },

  field: {
    marginBottom: 18,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 650,
    color: "#b7c5c1",
  },

  input: {
    width: "100%",
    height: 48,
    padding: "0 14px",
    borderRadius: 12,
    border:
      "1px solid rgba(148, 163, 184, 0.13)",
    background: "rgba(7, 15, 13, 0.72)",
    color: "#ecfdf5",
    fontSize: 13.5,
    transition:
      "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
  },

  passwordWrapper: {
    position: "relative",
    width: "100%",
  },

  passwordInput: {
    width: "100%",
    height: 48,
    padding: "0 48px 0 14px",
    borderRadius: 12,
    border:
      "1px solid rgba(148, 163, 184, 0.13)",
    background: "rgba(7, 15, 13, 0.72)",
    color: "#ecfdf5",
    fontSize: 13.5,
    transition:
      "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
  },

  eyeButton: {
    position: "absolute",
    top: "50%",
    right: 5,
    transform: "translateY(-50%)",
    width: 38,
    height: 38,
    display: "grid",
    placeItems: "center",
    border: "none",
    borderRadius: 9,
    background: "transparent",
    color: "#71817c",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },

  passwordHint: {
    marginTop: -7,
    marginBottom: 20,
    fontSize: 11,
    color: "#61706b",
  },

  submitButton: {
    width: "100%",
    height: 49,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    border: "none",
    borderRadius: 12,
    background:
      "linear-gradient(135deg, #8ff0c9, #34d399)",
    color: "#052e20",
    fontSize: 13.5,
    fontWeight: 800,
    boxShadow:
      "0 14px 32px rgba(52, 211, 153, 0.17)",
    transition:
      "transform 0.2s ease, opacity 0.2s ease",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "24px 0 20px",
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background:
      "rgba(148, 163, 184, 0.09)",
  },

  dividerText: {
    fontSize: 10,
    fontWeight: 700,
    color: "#52605c",
    letterSpacing: "0.08em",
  },

  loginText: {
    margin: 0,
    textAlign: "center",
    fontSize: 12.5,
    color: "#71817c",
  },

  loginLink: {
    color: "#6ee7b7",
    fontWeight: 700,
    textDecoration: "none",
    transition: "color 0.2s ease",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    fontSize: 10.5,
    color: "#4f5d59",
  },

  footerDot: {
    color: "#31534a",
  },
};