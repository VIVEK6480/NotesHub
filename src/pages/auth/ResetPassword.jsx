import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function ResetPassword() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    resetPassword,
  } = useAuth();

  const [token, setToken] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  /* =====================================================
     GET RESET TOKEN FROM URL
  ===================================================== */

  useEffect(() => {
    const params =
      new URLSearchParams(
        location.search
      );

    let resetToken =
      params.get("token");

    /*
      Also support:
      /reset-password/:token
    */

    if (!resetToken) {
      const pathParts =
        location.pathname
          .split("/")
          .filter(Boolean);

      const resetIndex =
        pathParts.findIndex(
          (part) =>
            part ===
            "reset-password"
        );

      if (
        resetIndex !== -1 &&
        pathParts[
          resetIndex + 1
        ]
      ) {
        resetToken =
          decodeURIComponent(
            pathParts[
              resetIndex + 1
            ]
          );
      }
    }

    if (!resetToken) {
      setError(
        "This password reset link is invalid or missing."
      );

      return;
    }

    setToken(resetToken);
  }, [location]);

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "Invalid or missing reset token."
      );

      return;
    }

    if (!newPassword) {
      setError(
        "Please enter a new password."
      );

      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * resetPassword is async.
       * We MUST await it.
       */
      const result =
        await resetPassword({
          token,
          newPassword,
          confirmPassword,
        });

      if (!result.success) {
        setError(
          result.message ||
            "Unable to reset password."
        );

        return;
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (error) {
      console.error(
        "Reset password submit error:",
        error
      );

      setError(
        "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SUCCESS
  ===================================================== */

  if (success) {
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
              margin:
                "0 auto 20px",
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
              margin:
                "0 0 10px",
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            Password Reset Successful
          </h1>

          <p
            style={{
              margin: 0,
              color: "#8e9b98",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            Your password has
            been updated.
            Redirecting you to
            the login page...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     RESET FORM
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
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: "8px",
            marginBottom:
              "28px",
            color:
              "#8e9b98",
            textDecoration:
              "none",
            fontSize:
              "13px",
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
            marginBottom:
              "18px",
            borderRadius:
              "16px",
            background:
              "rgba(52,211,153,.12)",
            color:
              "#6ee7b7",
          }}
        >
          <Lock size={25} />
        </div>

        <h1
          style={{
            margin:
              "0 0 10px",
            fontSize:
              "28px",
            fontWeight: 800,
          }}
        >
          Reset Password
        </h1>

        <p
          style={{
            margin:
              "0 0 26px",
            color:
              "#8e9b98",
            fontSize:
              "14px",
            lineHeight:
              1.7,
          }}
        >
          Create a new password
          for your NotesHub
          account.
        </p>

        {!token && (
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
            This reset link is
            invalid or missing.
            Please request a new
            password reset link.
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              color:
                "#d1d5db",
              fontSize:
                "13px",
              fontWeight: 600,
            }}
          >
            New Password
          </label>

          <div
            style={{
              position:
                "relative",
              marginBottom:
                "16px",
            }}
          >
            <Lock
              size={17}
              style={{
                position:
                  "absolute",
                left: "15px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                color:
                  "#6b7280",
              }}
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={
                newPassword
              }
              onChange={(
                event
              ) =>
                setNewPassword(
                  event.target
                    .value
                )
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={!token}
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                padding:
                  "14px 46px 14px 44px",
                borderRadius:
                  "13px",
                border:
                  "1px solid rgba(255,255,255,.09)",
                outline:
                  "none",
                background:
                  "#0d1314",
                color:
                  "#ffffff",
                fontSize:
                  "14px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              disabled={!token}
              style={{
                position:
                  "absolute",
                right:
                  "13px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                border:
                  "none",
                background:
                  "transparent",
                color:
                  "#6b7280",
                cursor:
                  "pointer",
                padding:
                  "4px",
              }}
            >
              {showPassword ? (
                <EyeOff
                  size={18}
                />
              ) : (
                <Eye
                  size={18}
                />
              )}
            </button>
          </div>

          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              color:
                "#d1d5db",
              fontSize:
                "13px",
              fontWeight: 600,
            }}
          >
            Confirm Password
          </label>

          <div
            style={{
              position:
                "relative",
              marginBottom:
                "16px",
            }}
          >
            <Lock
              size={17}
              style={{
                position:
                  "absolute",
                left: "15px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                color:
                  "#6b7280",
              }}
            />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={
                confirmPassword
              }
              onChange={(
                event
              ) =>
                setConfirmPassword(
                  event.target
                    .value
                )
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={!token}
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                padding:
                  "14px 46px 14px 44px",
                borderRadius:
                  "13px",
                border:
                  "1px solid rgba(255,255,255,.09)",
                outline:
                  "none",
                background:
                  "#0d1314",
                color:
                  "#ffffff",
                fontSize:
                  "14px",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              disabled={!token}
              style={{
                position:
                  "absolute",
                right:
                  "13px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                border:
                  "none",
                background:
                  "transparent",
                color:
                  "#6b7280",
                cursor:
                  "pointer",
                padding:
                  "4px",
              }}
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={18}
                />
              ) : (
                <Eye
                  size={18}
                />
              )}
            </button>
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
            disabled={
              loading ||
              !token
            }
            style={{
              width:
                "100%",
              padding:
                "14px",
              border:
                "none",
              borderRadius:
                "13px",
              background:
                "linear-gradient(135deg, #8ff0c9, #34d399)",
              color:
                "#052e20",
              fontSize:
                "14px",
              fontWeight:
                800,
              cursor:
                loading ||
                !token
                  ? "not-allowed"
                  : "pointer",
              opacity:
                loading ||
                !token
                  ? 0.7
                  : 1,
            }}
          >
            {loading
              ? "Updating Password..."
              : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}