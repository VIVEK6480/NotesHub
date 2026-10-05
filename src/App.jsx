import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";
import Analytics from "./pages/dashboard/Analytics";

import AllNotes from "./pages/notes/AllNotes";
import NewNote from "./pages/notes/NewNote";
import NoteDetail from "./pages/notes/NoteDetail";
import Pinned from "./pages/notes/Pinned";
import Archive from "./pages/notes/Archive";
import Trash from "./pages/notes/Trash";

import Profile from "./pages/profile/Profile";

import Sidebar from "./components/layout/Sidebar";

import {
  ThemeProvider,
  useTheme,
} from "./context/ThemeContext";

import { NotesProvider } from "./context/NotesContext";

import {
  AuthProvider,
} from "./context/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

/* =========================================================
   GLOBAL APP STYLES
========================================================= */

const pageStyles = `
  .nh-page {
    min-height: 100vh;

    background:
      radial-gradient(
        circle at 15% 10%,
        rgba(16,185,129,.10),
        transparent 28%
      ),
      radial-gradient(
        circle at 85% 85%,
        rgba(124,92,240,.12),
        transparent 30%
      ),
      var(--nh-page-bg, #080b0d);

    color: var(--nh-text, #f2f6f5);

    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;

    padding: 32px;

    transition:
      background .25s ease,
      color .25s ease;
  }

  .nh-page * {
    box-sizing: border-box;
  }

  .nh-page-shell {
    max-width: 1400px;
    margin: 0 auto;
  }

  .nh-page-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 20px;
    margin-bottom: 28px;
  }

  .nh-page-brand {
    display: flex;
    align-items: center;

    gap: 10px;

    font-size: 22px;
    font-weight: 800;

    letter-spacing: -.5px;
  }

  .nh-page-brand-mark {
    width: 42px;
    height: 42px;

    display: grid;
    place-items: center;

    border-radius: 13px;

    background:
      linear-gradient(
        135deg,
        #6ee7b7,
        #10b981
      );

    color: #052e20;

    box-shadow:
      0 10px 30px
      rgba(16,185,129,.28);
  }

  .nh-page-nav {
    display: flex;
    align-items: center;

    gap: 8px;
  }

  .nh-page-nav a {
    color:
      var(--nh-muted, #91a19b);

    text-decoration: none;

    padding: 9px 13px;

    border-radius: 10px;

    font-size: 13px;
    font-weight: 600;

    transition: .2s ease;
  }

  .nh-page-nav a:hover {
    color:
      var(--nh-text, #f2f6f5);

    background:
      rgba(110,231,183,.08);
  }

  .nh-page-content {
    min-height:
      calc(100vh - 130px);

    display: grid;
    place-items: center;
  }

  .nh-coming {
    width: min(700px, 100%);

    padding: 48px;

    text-align: center;

    border:
      1px solid
      var(
        --nh-border,
        rgba(255,255,255,.08)
      );

    border-radius: 28px;

    background:
      var(
        --nh-card-bg,
        linear-gradient(
          145deg,
          rgba(20,28,33,.94),
          rgba(10,15,18,.94)
        )
      );

    box-shadow:
      0 30px 80px
      rgba(0,0,0,.18);

    animation:
      nhPageRise
      .55s
      cubic-bezier(.2,.7,.2,1);
  }

  .nh-coming-icon {
    width: 76px;
    height: 76px;

    margin: 0 auto 22px;

    display: grid;
    place-items: center;

    border-radius: 22px;

    background:
      linear-gradient(
        135deg,
        rgba(110,231,183,.18),
        rgba(52,211,153,.05)
      );

    border:
      1px solid
      rgba(110,231,183,.22);

    color: #6ee7b7;

    font-size: 32px;
  }

  .nh-coming h1 {
    margin: 0 0 10px;

    font-size: 30px;

    letter-spacing: -.8px;
  }

  .nh-coming p {
    margin: 0 auto;

    max-width: 560px;

    color:
      var(--nh-muted, #8e9b98);

    line-height: 1.7;
  }

  .nh-coming-actions {
    display: flex;

    justify-content: center;

    gap: 12px;

    margin-top: 28px;

    flex-wrap: wrap;
  }

  .nh-btn-primary,
  .nh-btn-secondary {
    min-height: 44px;

    padding: 0 18px;

    border-radius: 12px;

    border: 1px solid transparent;

    font: inherit;

    font-size: 13px;

    font-weight: 700;

    cursor: pointer;

    text-decoration: none;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    transition: .2s ease;
  }

  .nh-btn-primary {
    color: #052e20;

    background:
      linear-gradient(
        135deg,
        #8ff0c9,
        #34d399
      );

    box-shadow:
      0 10px 25px
      rgba(52,211,153,.22);
  }

  .nh-btn-primary:hover {
    transform: translateY(-2px);

    box-shadow:
      0 14px 30px
      rgba(52,211,153,.34);
  }

  .nh-btn-secondary {
    color:
      var(--nh-text, #d9e3df);

    background:
      var(
        --nh-input-bg,
        rgba(255,255,255,.035)
      );

    border-color:
      var(
        --nh-border,
        rgba(255,255,255,.09)
      );
  }

  .nh-btn-secondary:hover {
    background:
      rgba(255,255,255,.07);

    transform:
      translateY(-2px);
  }

  .nh-login {
    width: min(460px, 100%);

    padding: 38px;

    border-radius: 26px;

    border:
      1px solid
      rgba(110,231,183,.15);

    background:
      var(
        --nh-login-bg,
        rgba(15,21,25,.88)
      );

    backdrop-filter: blur(20px);

    box-shadow:
      0 30px 80px
      rgba(0,0,0,.4);

    animation:
      nhPageRise
      .55s
      cubic-bezier(.2,.7,.2,1);
  }

  .nh-login h1 {
    margin: 0;

    font-size: 30px;
  }

  .nh-login-sub {
    margin: 8px 0 28px;

    color:
      var(--nh-muted, #8e9b98);

    line-height: 1.6;
  }

  .nh-field {
    margin-bottom: 16px;
  }

  .nh-field label {
    display: block;

    margin-bottom: 7px;

    color:
      var(--nh-text, #b8c5c0);

    font-size: 12px;

    font-weight: 600;
  }

  .nh-field input {
    width: 100%;
    height: 46px;

    padding: 0 14px;

    border-radius: 12px;

    border:
      1px solid
      var(
        --nh-border,
        rgba(255,255,255,.09)
      );

    outline: none;

    color:
      var(--nh-text, #f2f6f5);

    background:
      var(
        --nh-input-bg,
        #0b1114
      );

    font: inherit;

    transition: .2s ease;
  }

  .nh-field input:focus {
    border-color:
      rgba(52,211,153,.65);

    box-shadow:
      0 0 0 4px
      rgba(52,211,153,.10);
  }

  .nh-login-submit {
    width: 100%;
    height: 48px;

    margin-top: 8px;

    border: 0;

    border-radius: 13px;

    cursor: pointer;

    font: inherit;

    font-weight: 700;

    color: #052e20;

    background:
      linear-gradient(
        135deg,
        #8ff0c9,
        #34d399
      );

    box-shadow:
      0 10px 28px
      rgba(52,211,153,.25);
  }

  @keyframes nhPageRise {
    from {
      opacity: 0;

      transform:
        translateY(18px)
        scale(.985);
    }

    to {
      opacity: 1;

      transform:
        translateY(0)
        scale(1);
    }
  }

  @media (max-width: 700px) {

    .nh-page {
      padding: 18px;
    }

    .nh-page-top {
      align-items: flex-start;
      flex-direction: column;
    }

    .nh-page-nav {
      width: 100%;
      overflow-x: auto;
    }

    .nh-coming {
      padding: 34px 22px;
    }

  }
`;

/* =========================================================
   COMMON SIDEBAR LAYOUT
========================================================= */

function SidebarLayout({ children }) {

  const { light } = useTheme();

  return (
    <div
      className={
        `nh-app-layout ${
          light
            ? "nh-app-light"
            : "nh-app-dark"
        }`
      }

      style={{
        minHeight: "100vh",

        width: "100%",

        background:
          light
            ? "#eef4f1"
            : "#080b0d",

        color:
          light
            ? "#10211b"
            : "#f2f6f5",

        transition:
          "background .25s ease, color .25s ease",
      }}
    >

      <Sidebar />

      <main
        className="nh-sidebar-layout-main"

        style={{
          marginLeft: "262px",

          width:
            "calc(100% - 262px)",

          minHeight: "100vh",

          overflowX: "hidden",

          paddingTop: "68px",

          transition:
            "background .25s ease, color .25s ease",
        }}
      >

        {children}

      </main>

      <style>{`
        @media (max-width: 900px) {

          .nh-sidebar-layout-main {
            margin-left: 0 !important;
            width: 100% !important;
          }

        }
      `}</style>

    </div>
  );
}

/* =========================================================
   GENERIC PAGE
========================================================= */

function PageLayout({
  title,
  description,
  icon,
  children,
}) {

  return (
    <div className="nh-page">

      <style>
        {pageStyles}
      </style>

      <div className="nh-page-shell">

        <header className="nh-page-top">

          <Link
            to="/dashboard"
            className="nh-page-brand"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >

            <div className="nh-page-brand-mark">
              N
            </div>

            NotesHub

          </Link>

          <nav className="nh-page-nav">

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/notes">
              All Notes
            </Link>

            <Link to="/analytics">
              Analytics
            </Link>

            <Link to="/profile">
              Profile
            </Link>

            <Link to="/settings">
              Settings
            </Link>

          </nav>

        </header>

        <main className="nh-page-content">

          {children || (

            <section className="nh-coming">

              <div className="nh-coming-icon">
                {icon}
              </div>

              <h1>
                {title}
              </h1>

              <p>
                {description}
              </p>

              <div className="nh-coming-actions">

                <Link
                  className="nh-btn-primary"
                  to="/dashboard"
                >
                  Back to Dashboard
                </Link>

                <Link
                  className="nh-btn-secondary"
                  to="/notes/new"
                >
                  Create Note
                </Link>

              </div>

            </section>

          )}

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function Settings() {

  return (
    <PageLayout
      title="Settings"
      description="Configure appearance, notifications, editor preferences, privacy and account settings."
      icon="⚙"
    />
  );
}

/* =========================================================
   NOT FOUND
========================================================= */

function NotFound() {

  return (
    <PageLayout
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      icon="?"
    />
  );
}

/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {

  return (
    <Routes>

      {/* =================================================
          LOGIN - PUBLIC
      ================================================= */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />

      {/* =================================================
          SIGNUP - PUBLIC
      ================================================= */}

      <Route
        path="/signup"
        element={
          <Signup />
        }
      />

      {/* =================================================
          FORGOT PASSWORD - PUBLIC
      ================================================= */}

      <Route
        path="/forgot-password"
        element={
          <ForgotPassword />
        }
      />

      {/* =================================================
          RESET PASSWORD - PUBLIC
          
          IMPORTANT:
          Backend email sends:
          /reset-password?token=xxxxx
          
          So route must be /reset-password
          and ResetPassword.jsx will read
          the token from the query string.
      ================================================= */}

      <Route
        path="/reset-password"
        element={
          <ResetPassword />
        }
      />

      {/* =================================================
          DASHBOARD - PROTECTED
      ================================================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <Dashboard />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          ALL NOTES - PROTECTED
      ================================================= */}

      <Route
        path="/notes"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <AllNotes />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          CREATE NOTE - PROTECTED
      ================================================= */}

      <Route
        path="/notes/new"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <NewNote />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          NOTE DETAILS - PROTECTED
      ================================================= */}

      <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <NoteDetail />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          PINNED - PROTECTED
      ================================================= */}

      <Route
        path="/pinned"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <Pinned />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          ARCHIVE - PROTECTED
      ================================================= */}

      <Route
        path="/archive"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <Archive />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          TRASH - PROTECTED
      ================================================= */}

      <Route
        path="/trash"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <Trash />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          ANALYTICS - PROTECTED
      ================================================= */}

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <Analytics />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          PROFILE - PROTECTED
      ================================================= */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <Profile />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          SETTINGS - PROTECTED
      ================================================= */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>

            <SidebarLayout>
              <Settings />
            </SidebarLayout>

          </ProtectedRoute>
        }
      />

      {/* =================================================
          ROOT
      ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* =================================================
          404
      ================================================= */}

      <Route
        path="*"
        element={
          <SidebarLayout>
            <NotFound />
          </SidebarLayout>
        }
      />

    </Routes>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {

  return (

    <AuthProvider>

      <ThemeProvider>

        <NotesProvider>

          <BrowserRouter>

            <AppRoutes />

          </BrowserRouter>

        </NotesProvider>

      </ThemeProvider>

    </AuthProvider>

  );
}