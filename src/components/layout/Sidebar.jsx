import React, { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  Home,
  FileText,
  Pin,
  Archive,
  Trash2,
  BarChart3,
  User,
  LogOut,
  Search,
  Moon,
  Sun,
  Rocket,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
   MENU
========================================================= */

const primaryMenu = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "All Notes", path: "/notes", icon: FileText },
  { label: "Pinned", path: "/pinned", icon: Pin },
  { label: "Archive", path: "/archive", icon: Archive },
  { label: "Trash", path: "/trash", icon: Trash2 },
];

const secondaryMenu = [
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Profile", path: "/profile", icon: User },
];

/* =========================================================
   STYLES
========================================================= */

const sidebarStyles = `
  .nh-sidebar-root {
    --bg: #080b0d;
    --sb1: #123428;
    --sb2: #0a110f;
    --card: #0f1519;
    --card2: #141c21;
    --bd: rgba(255,255,255,.07);
    --tx: #f2f6f5;
    --mu: #8e9b98;
    --dim: #5f6c69;
    --ac: #6ee7b7;
    --ac2: #34d399;
    --on: #06281c;

    position: relative;

    font-family:
      Inter,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .nh-sidebar-root.light {
    --bg: #eef4f1;
    --sb1: #d5f2e5;
    --sb2: #f4faf7;
    --card: #ffffff;
    --card2: #f3f8f6;
    --bd: rgba(14,48,36,.1);
    --tx: #10211b;
    --mu: #566b63;
    --dim: #8a9c95;
    --ac: #0f9f6e;
    --ac2: #10b981;
    --on: #ffffff;
  }

  .nh-sidebar-root *,
  .nh-sidebar-root *::before,
  .nh-sidebar-root *::after {
    box-sizing: border-box;
  }

  .nh-sidebar-root button:focus-visible,
  .nh-sidebar-root input:focus-visible {
    outline: 2px solid var(--ac);
    outline-offset: 2px;
  }

  /* ---------- SIDEBAR ---------- */

  .nh-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;

    width: 262px;

    z-index: 1000;

    display: flex;
    flex-direction: column;

    padding: 22px 16px;

    background:
      linear-gradient(
        170deg,
        var(--sb1) 0%,
        var(--sb2) 55%
      );

    border-right: 1px solid var(--bd);

    color: var(--tx);

    overflow-y: auto;
    overflow-x: hidden;

    transition:
      background .4s ease,
      color .4s ease,
      border-color .4s ease,
      transform .3s ease;
  }

  .nh-sidebar::-webkit-scrollbar {
    width: 5px;
  }

  .nh-sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .nh-sidebar::-webkit-scrollbar-thumb {
    background: rgba(110,231,183,.12);
    border-radius: 20px;
  }

  .nh-sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;

    padding: 2px 10px 28px;

    border: 0;
    background: transparent;

    color: var(--tx);

    font-family: inherit;
    font-size: 21px;
    font-weight: 700;

    letter-spacing: -.4px;

    cursor: pointer;
    text-align: left;

    width: 100%;
  }

  .nh-sidebar-brand svg {
    color: var(--ac);

    filter:
      drop-shadow(
        0 0 8px rgba(52,211,153,.6)
      );
  }

  /* ---------- MOBILE CLOSE ---------- */

  .nh-sidebar-close {
    display: none;

    position: absolute;

    top: 18px;
    right: 14px;

    width: 36px;
    height: 36px;

    border-radius: 10px;

    border: 1px solid var(--bd);

    background: rgba(255,255,255,.04);

    color: var(--tx);

    cursor: pointer;

    align-items: center;
    justify-content: center;
  }

  .nh-sidebar-close:hover {
    background: rgba(110,231,183,.1);
    color: var(--ac);
  }

  .nh-sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nh-sidebar-item {
    position: relative;

    display: flex;
    align-items: center;

    gap: 14px;

    width: 100%;

    padding: 12px 14px;

    border: 0;
    border-radius: 12px;

    background: none;

    color: var(--mu);

    font-family: inherit;
    font-size: 14px;
    font-weight: 500;

    cursor: pointer;
    text-align: left;

    transition: all .2s ease;
  }

  .nh-sidebar-item:hover {
    color: var(--tx);

    background:
      rgba(110,231,183,.08);

    transform:
      translateX(3px);
  }

  .nh-sidebar-item.active {
    color: var(--tx);

    background:
      linear-gradient(
        90deg,
        rgba(52,211,153,.45),
        rgba(52,211,153,.18)
      );

    box-shadow:
      inset 0 0 0 1px
        rgba(110,231,183,.25),
      0 6px 20px
        rgba(16,185,129,.18);
  }

  .nh-sidebar-root.light
  .nh-sidebar-item.active {
    color: #064e3b;
  }

  .nh-sidebar-divider {
    height: 1px;

    background: var(--bd);

    margin: 16px 6px;
  }

  /* ---------- PROMO ---------- */

  .nh-sidebar-promo {
    position: relative;

    margin-top: auto;

    overflow: hidden;

    border-radius: 16px;

    padding: 18px;

    border:
      1px solid
      rgba(110,231,183,.2);

    background:
      linear-gradient(
        160deg,
        rgba(52,211,153,.18),
        rgba(8,20,16,.2) 70%
      );
  }

  .nh-sidebar-root.light
  .nh-sidebar-promo {
    background:
      linear-gradient(
        160deg,
        rgba(16,185,129,.2),
        rgba(255,255,255,.6)
      );
  }

  .nh-sidebar-promo-icon {
    width: 36px;
    height: 36px;

    border-radius: 10px;

    display: grid;
    place-items: center;

    background:
      rgba(110,231,183,.18);

    color: var(--ac);

    margin-bottom: 14px;
  }

  .nh-sidebar-promo h4 {
    margin: 0;

    font-size: 15px;
    font-weight: 700;

    line-height: 1.3;
  }

  .nh-sidebar-promo p {
    margin: 8px 0 34px;

    font-size: 12px;

    color: var(--mu);
  }

  .nh-sidebar-promo-wave {
    position: absolute;

    left: 0;
    bottom: -2px;

    width: 140%;

    animation:
      nhWave 6s linear infinite alternate;
  }

  @keyframes nhWave {
    to {
      transform:
        translateX(-30px);
    }
  }

  /* ---------- MOBILE MENU BUTTON ---------- */

  .nh-mobile-menu-btn {
    display: none;

    width: 40px;
    height: 40px;

    flex-shrink: 0;

    border-radius: 11px;

    border:
      1px solid var(--bd);

    background: var(--card);

    color: var(--tx);

    cursor: pointer;

    align-items: center;
    justify-content: center;

    transition:
      background .2s ease,
      border-color .2s ease,
      color .2s ease;
  }

  .nh-mobile-menu-btn:hover {
    border-color: var(--ac2);

    background:
      rgba(52,211,153,.08);

    color: var(--ac);
  }

  /* ---------- MOBILE OVERLAY ---------- */

  .nh-sidebar-overlay {
    display: none;

    position: fixed;

    inset: 0;

    z-index: 950;

    background:
      rgba(0,0,0,.52);

    backdrop-filter:
      blur(3px);
  }

  /* ---------- HEADER ---------- */

  .nh-common-header {
    position: fixed;

    top: 0;

    left: 262px;
    right: 0;

    height: 76px;

    z-index: 900;

    display: flex;

    align-items: center;

    gap: 16px;

    padding: 0 32px;

    border-bottom:
      1px solid var(--bd);

    background:
      color-mix(
        in srgb,
        var(--bg) 70%,
        transparent
      );

    backdrop-filter:
      blur(14px);

    color: var(--tx);

    transition:
      background .4s ease,
      color .4s ease,
      border-color .4s ease;
  }

  .nh-common-header-search {
    position: relative;

    flex: 1;

    max-width: 632px;
  }

  .nh-common-header-search svg {
    position: absolute;

    left: 16px;
    top: 13px;

    color: var(--mu);

    pointer-events: none;
  }

  .nh-common-header-search input {
    width: 100%;

    height: 42px;

    border-radius: 14px;

    border:
      1px solid var(--bd);

    background: var(--card);

    padding:
      0 16px 0 44px;

    color: var(--tx);

    font-family: inherit;

    font-size: 13.5px;

    outline: none;

    transition: all .25s;
  }

  .nh-common-header-search input::placeholder {
    color: var(--mu);
  }

  .nh-common-header-search input:focus {
    border-color: var(--ac2);

    box-shadow:
      0 0 0 4px
        rgba(52,211,153,.14),
      0 0 24px
        rgba(52,211,153,.18);
  }

  /* ---------- THEME TOGGLE ---------- */

  .nh-common-header .tg {
    position: relative;

    width: 62px;
    height: 32px;

    flex-shrink: 0;

    border-radius: 20px;

    border:
      1px solid var(--bd);

    background: var(--card);

    cursor: pointer;

    margin-left: auto;

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 0 8px;

    color: var(--mu);

    transition:
      border-color .25s,
      box-shadow .25s;
  }

  .nh-common-header .tg:hover {
    border-color: var(--ac2);

    box-shadow:
      0 0 14px
      rgba(52,211,153,.25);
  }

  .nh-common-header .tg i {
    position: absolute;

    top: 3px;
    left: 3px;

    width: 24px;
    height: 24px;

    border-radius: 50%;

    background:
      linear-gradient(
        140deg,
        #6ee7b7,
        #10b981
      );

    box-shadow:
      0 0 14px
      rgba(52,211,153,.6);

    transition:
      transform .35s cubic-bezier(.3,1.4,.5,1),
      background .35s,
      box-shadow .35s;

    display: grid;
    place-items: center;

    color: #06281c;

    pointer-events: none;
  }

  .nh-common-header .tg.light i {
    transform:
      translateX(30px);

    background:
      linear-gradient(
        140deg,
        #fcd34d,
        #f59e0b
      );

    box-shadow:
      0 0 14px
      rgba(245,158,11,.6);
  }

  /* ---------- USER / PROFILE ---------- */

  .nh-common-header .user {
    display: flex;

    align-items: center;

    gap: 10px;

    font-weight: 600;

    font-size: 13.5px;

    color: var(--tx);

    border: 0;

    background: transparent;

    padding: 0;

    font-family: inherit;

    cursor: pointer;

    text-align: left;
  }

  .nh-common-header .user:hover {
    color: var(--ac);
  }

  .nh-common-header .av {
    width: 38px;
    height: 38px;

    border-radius: 50%;

    display: grid;
    place-items: center;

    font-weight: 800;
    font-size: 13px;

    color: #06281c;

    background:
      linear-gradient(
        140deg,
        #6ee7b7,
        #38bdf8
      );

    box-shadow:
      0 0 0 2px var(--bg),
      0 0 0 3.5px
        rgba(110,231,183,.6);

    transition:
      transform .2s ease;

    overflow: hidden;

    flex-shrink: 0;
  }

  .nh-common-header .av img {
    width: 100%;
    height: 100%;

    display: block;

    object-fit: cover;

    border-radius: 50%;
  }

  .nh-common-header .user:hover .av {
    transform:
      translateY(-1px);
  }

  /* ---------- RESPONSIVE ---------- */

  @media (max-width: 900px) {
    .nh-sidebar {
      width: 240px;
    }

    .nh-common-header {
      left: 240px;
    }
  }

  @media (max-width: 700px) {
    .nh-sidebar {
      display: flex;

      width: min(280px, 84vw);

      transform:
        translateX(-105%);

      box-shadow:
        18px 0 45px
        rgba(0,0,0,.3);
    }

    .nh-sidebar.open {
      transform:
        translateX(0);
    }

    .nh-sidebar-close {
      display: flex;
    }

    .nh-sidebar-brand {
      padding-right: 52px;
    }

    .nh-sidebar-overlay {
      display: block;
    }

    .nh-common-header {
      left: 0;

      padding: 0 16px;

      z-index: 970;
    }

    .nh-mobile-menu-btn {
      display: flex;
    }

    .nh-common-header .user span {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nh-sidebar-root *,
    .nh-sidebar-root *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;

/* =========================================================
   ACTIVE ROUTE
========================================================= */

function isRouteActive(locationPath, itemPath) {
  if (itemPath === "/dashboard") {
    return locationPath === "/dashboard";
  }

  if (itemPath === "/notes") {
    return (
      locationPath === "/notes" ||
      locationPath.startsWith("/notes/")
    );
  }

  return locationPath === itemPath;
}

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar() {
  const navigate = useNavigate();

  const location = useLocation();

  const { light, toggleTheme } = useTheme();

  const { logout, user } = useAuth();

  const [search, setSearch] = useState("");

  /* MOBILE MENU STATE */
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /*
    Backend:

    http://localhost:5000/api

    Avatar:

    /uploads/avatars/filename.jpg

    Isliye server base:

    http://localhost:5000
  */

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  const SERVER_BASE_URL =
    API_BASE_URL.replace(
      /\/api\/?$/,
      ""
    );

  /*
    user.avatarUrl examples:

    /uploads/avatars/abc.jpg

    =>
    http://localhost:5000/uploads/avatars/abc.jpg

    Agar backend full URL bheje:

    https://example.com/avatar.jpg

    =>
    same full URL preserve rahega.
  */

  const avatarSrc = user?.avatarUrl
    ? new URL(
        user.avatarUrl,
        SERVER_BASE_URL
      ).toString()
    : "";

  /*
    Name backend se.
  */

  const displayName =
    user?.name?.trim() ||
    "Vivek Kumar";

  /*
    Initial fallback.
  */

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("") || "VK";

  /* =========================================================
     MOBILE CLOSE HELPER
  ========================================================= */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /* =========================================================
     MENU ITEM
  ========================================================= */

  const renderItem = ({
    label,
    path,
    icon: Icon,
  }) => {
    const active = isRouteActive(
      location.pathname,
      path
    );

    return (
      <button
        key={path}
        type="button"
        className={`nh-sidebar-item${
          active ? " active" : ""
        }`}
        onClick={() => {
          navigate(path);
          closeMobileMenu();
        }}
        aria-current={
          active ? "page" : undefined
        }
      >
        <Icon size={19} />

        <span>{label}</span>
      </button>
    );
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    closeMobileMenu();

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div
      className={`nh-sidebar-root${
        light ? " light" : ""
      }`}
    >
      <style>
        {sidebarStyles}
      </style>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="nh-sidebar-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`nh-sidebar${
          mobileMenuOpen ? " open" : ""
        }`}
      >
        {/* MOBILE CLOSE BUTTON */}

        <button
          type="button"
          className="nh-sidebar-close"
          onClick={closeMobileMenu}
          aria-label="Close menu"
          title="Close menu"
        >
          <X size={19} />
        </button>

        <button
          type="button"
          className="nh-sidebar-brand"
          onClick={() => {
            navigate("/dashboard");
            closeMobileMenu();
          }}
        >
          <LeafIcon />

          <span>NotesHub</span>
        </button>

        <nav
          className="nh-sidebar-nav"
          aria-label="Main"
        >
          {primaryMenu.map(renderItem)}

          <div className="nh-sidebar-divider" />

          {secondaryMenu.map(renderItem)}

          {/* LOGOUT */}

          <button
            type="button"
            className="nh-sidebar-item"
            onClick={handleLogout}
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </nav>

        {/* =================================================
            PROMO
        ================================================= */}

        <div className="nh-sidebar-promo">
          <div className="nh-sidebar-promo-icon">
            <Rocket size={19} />
          </div>

          <h4>
            Better Notes
            <br />
            Bigger Ideas
          </h4>

          <p>
            Stay organized, stay productive.
          </p>

          <svg
            className="nh-sidebar-promo-wave"
            viewBox="0 0 280 60"
            fill="none"
            preserveAspectRatio="none"
            height="50"
            aria-hidden="true"
          >
            <path
              d="M0 40 C40 10 80 55 120 30 S200 5 240 30 S280 45 320 20 V60 H0Z"
              fill="rgba(52,211,153,.22)"
            />
          </svg>
        </div>
      </aside>

      {/* =====================================================
          COMMON TOP HEADER
      ===================================================== */}

      <header className="nh-common-header">

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className="nh-mobile-menu-btn"
          onClick={() =>
            setMobileMenuOpen(true)
          }
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          title="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* SEARCH */}

        <div className="nh-common-header-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search notes, tags, or content..."
            aria-label="Search notes"
          />
        </div>

        {/* THEME TOGGLE */}

        <button
          type="button"
          className={`tg${
            light ? " light" : ""
          }`}
          onClick={toggleTheme}
          aria-pressed={light}
          aria-label={
            light
              ? "Switch to dark theme"
              : "Switch to light theme"
          }
          title={
            light
              ? "Switch to dark theme"
              : "Switch to light theme"
          }
        >
          <Sun size={13} />

          <Moon size={13} />

          <i>
            {light ? (
              <Sun size={13} />
            ) : (
              <Moon size={13} />
            )}
          </i>
        </button>

        {/* PROFILE */}

        <button
          type="button"
          className="user"
          onClick={() =>
            navigate("/profile")
          }
          aria-label="Open profile"
          title="Open Profile"
        >
          <div className="av">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={`${displayName} profile`}
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              initials
            )}
          </div>

          <span>{displayName}</span>

          <ChevronDown
            size={14}
            color={
              light
                ? "#566b63"
                : "#8e9b98"
            }
          />
        </button>
      </header>
    </div>
  );
}

/* =========================================================
   LEAF ICON
========================================================= */

function LeafIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />

      <path d="M12 5.67 8.5 9.17" />
    </svg>
  );
}