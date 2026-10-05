import React from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

export default function ProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location =
    useLocation();

  /*
    Authentication state restore hone tak
    loading screen.
  */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#080b0d",
          color: "#6ee7b7",
          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 14px",
              display: "grid",
              placeItems: "center",
              borderRadius: 14,
              color: "#052e20",
              fontSize: 20,
              fontWeight: 900,
              background:
                "linear-gradient(135deg,#8ff0c9,#34d399)",
              boxShadow:
                "0 12px 35px rgba(52,211,153,.25)",
              animation:
                "nhAuthLoader 1.2s ease-in-out infinite",
            }}
          >
            N
          </div>

          <div
            style={{
              color: "#8e9b98",
              fontSize: 13,
            }}
          >
            Loading NotesHub...
          </div>
        </div>

        <style>{`
          @keyframes nhAuthLoader {
            0%,100% {
              opacity: .65;
              transform: translateY(0);
            }

            50% {
              opacity: 1;
              transform: translateY(-4px);
            }
          }
        `}</style>
      </div>
    );
  }

  /*
    User authenticated nahi hai to
    protected page access nahi milega.
  */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
}