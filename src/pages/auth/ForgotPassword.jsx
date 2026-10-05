import React, {
  useState,
} from "react";

import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const {
    verifyResetEmail,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [emailSent, setEmailSent] =
    useState(false);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * verifyResetEmail is async.
       * We MUST await it.
       */
      const result =
        await verifyResetEmail(
          cleanEmail
        );

      if (!result.success) {
        setError(
          result.message ||
            "Unable to send reset email."
        );

        setLoading(false);

        return;
      }

      /*
       * Email successfully requested.
       * Do NOT navigate to reset-password here.
       *
       * User will open the reset link
       * from their email.
       */
      setEmailSent(true);
    } catch (error) {
      console.error(
        "Forgot password submit error:",
        error
      );

      setError(
        "Unable to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     EMAIL SENT SCREEN
  ===================================================== */

  if (emailSent) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background:
            "radial-gradient(circle at top left, rgba(52,211,153,.12), transparent 35%), #080b0d",
          color: "#ffffff",
          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "38px",
            textAlign: "center",
            borderRadius: "24px",
            border:
              "1px solid rgba(255,255,255,.08)",
            background:
              "rgba(17,24,24,.88)",
            boxShadow:
              "0 24px 70px rgba(0,0,0,.35)",
            backdropFilter:
              "blur(20px)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 20px",
              borderRadius: "20px",
              background:
                "rgba(52,211,153,.12)",
              color: "#6ee7b7",
            }}
          >
            <CheckCircle2
              size={34}
            />
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            Check Your Email
          </h1>

          <p
            style={{
              margin: "0 0 10px",
              color: "#d1d5db",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            If an account exists for:
          </p>

          <p
            style={{
              margin: "0 0 18px",
              color: "#6ee7b7",
              fontSize: "15px",
              fontWeight: 700,
              wordBreak:
                "break-word",
            }}
          >
            {email}
          </p>

          <p
            style={{
              margin: "0 0 24px",
              color: "#8e9b98",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            We've sent password reset
            instructions to your email.
            Open the link in that email
            to create a new password.
          </p>

          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent:
                "center",
              width: "100%",
              boxSizing:
                "border-box",
              padding: "14px",
              borderRadius: "13px",
              background:
                "linear-gradient(135deg, #8ff0c9, #34d399)",
              color: "#052e20",
              fontSize: "14px",
              fontWeight: 800,
              textDecoration:
                "none",
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  /* =====================================================
     FORGOT PASSWORD FORM
  ===================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at top left, rgba(52,211,153,.12), transparent 35%), #080b0d",
        color: "#ffffff",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "34px",
          borderRadius: "24px",
          border:
            "1px solid rgba(255,255,255,.08)",
          background:
            "rgba(17,24,24,.88)",
          boxShadow:
            "0 24px 70px rgba(0,0,0,.35)",
          backdropFilter:
            "blur(20px)",
        }}
      >
        <Link
          to="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "28px",
            color: "#8e9b98",
            textDecoration:
              "none",
            fontSize: "13px",
          }}
        >
          <ArrowLeft size={16} />

          Back to Login
        </Link>

        <div
          style={{
            width: "52px",
            height: "52px",
            display: "grid",
            placeItems: "center",
            marginBottom: "18px",
            borderRadius: "16px",
            background:
              "rgba(52,211,153,.12)",
            color: "#6ee7b7",
          }}
        >
          <ShieldCheck
            size={25}
          />
        </div>

        <h1
          style={{
            margin:
              "0 0 10px",
            fontSize: "28px",
            fontWeight: 800,
          }}
        >
          Forgot Password?
        </h1>

        <p
          style={{
            margin:
              "0 0 26px",
            color: "#8e9b98",
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          Enter your registered
          email address to receive
          a password reset link.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#d1d5db",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Email Address
          </label>

          <div
            style={{
              position:
                "relative",
              marginBottom:
                "16px",
            }}
          >
            <Mail
              size={18}
              style={{
                position:
                  "absolute",
                left: "15px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                color: "#6b7280",
              }}
            />

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target
                    .value
                )
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "14px 15px 14px 44px",
                borderRadius:
                  "13px",
                border:
                  "1px solid rgba(255,255,255,.09)",
                outline: "none",
                background:
                  "#0d1314",
                color:
                  "#ffffff",
                fontSize:
                  "14px",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom:
                  "16px",
                padding:
                  "12px 14px",
                borderRadius:
                  "11px",
                background:
                  "rgba(239,68,68,.10)",
                border:
                  "1px solid rgba(239,68,68,.18)",
                color:
                  "#fca5a5",
                fontSize:
                  "13px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius:
                "13px",
              background:
                "linear-gradient(135deg, #8ff0c9, #34d399)",
              color: "#052e20",
              fontSize:
                "14px",
              fontWeight: 800,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading
                ? 0.7
                : 1,
            }}
          >
            {loading
              ? "Sending Reset Link..."
              : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}