import React, { useMemo, useState } from "react";
import {
  Activity,
  Archive,
  BarChart3,
  FileText,
  FolderOpen,
  Lightbulb,
  Pin,
  RefreshCw,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNotes } from "../../context/NotesContext";

const getDate = (note) => {
  const value =
    note?.updatedAt ||
    note?.createdAt ||
    note?.date;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const formatDate = (date) => {
  if (!date) return "No date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMonthName = (date) => {
  if (!date) return "";

  return date.toLocaleDateString("en-IN", {
    month: "short",
  });
};

export default function Analytics() {
  const { light } = useTheme();

  const {
    notes,
    loading,
    fetchNotes,
  } = useNotes();

  const [refreshing, setRefreshing] = useState(false);

  const refreshAnalytics = async () => {
    setRefreshing(true);

    try {
      await fetchNotes();
    } catch (error) {
      console.error(
        "Failed to refresh analytics:",
        error
      );
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 450);
    }
  };

  /* =====================================================
     BASIC STATISTICS
  ===================================================== */

  const stats = useMemo(() => {
    const total = notes.length;

    const active = notes.filter(
      (note) =>
        !note.status ||
        note.status === "active"
    ).length;

    const pinned = notes.filter(
      (note) =>
        note.pinned === true ||
        note.isPinned === true
    ).length;

    const archived = notes.filter(
      (note) =>
        note.status === "archived" ||
        note.isArchived === true
    ).length;

    const trash = notes.filter(
      (note) =>
        note.status === "trash" ||
        note.isTrashed === true
    ).length;

    const withTags = notes.filter(
      (note) =>
        Array.isArray(note.tags) &&
        note.tags.length > 0
    ).length;

    return {
      total,
      active,
      pinned,
      archived,
      trash,
      withTags,
    };
  }, [notes]);

  /* =====================================================
     TAG ANALYTICS
  ===================================================== */

  const tagStats = useMemo(() => {
    const counter = {};

    notes.forEach((note) => {
      if (!Array.isArray(note.tags)) return;

      note.tags.forEach((tag) => {
        const cleanTag = String(tag || "").trim();

        if (!cleanTag) return;

        const key = cleanTag.toLowerCase();

        if (!counter[key]) {
          counter[key] = {
            name: cleanTag,
            count: 0,
          };
        }

        counter[key].count += 1;
      });
    });

    return Object.values(counter)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [notes]);

  /* =====================================================
     MONTHLY ACTIVITY
  ===================================================== */

  const monthlyStats = useMemo(() => {
    const now = new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: getMonthName(date),
        count: 0,
      });
    }

    notes.forEach((note) => {
      const date = getDate(note);

      if (!date) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const month = months.find(
        (item) => item.key === key
      );

      if (month) {
        month.count += 1;
      }
    });

    return months;
  }, [notes]);

  const maxMonthlyCount = Math.max(
    ...monthlyStats.map(
      (item) => item.count
    ),
    1
  );

  /* =====================================================
     NOTE DISTRIBUTION
  ===================================================== */

  const distribution = useMemo(() => {
    const total = Math.max(
      stats.total,
      1
    );

    return [
      {
        label: "Active",
        value: stats.active,
        percent: Math.round(
          (stats.active / total) * 100
        ),
        icon: FileText,
        className: "active",
      },
      {
        label: "Pinned",
        value: stats.pinned,
        percent: Math.round(
          (stats.pinned / total) * 100
        ),
        icon: Pin,
        className: "pinned",
      },
      {
        label: "Archived",
        value: stats.archived,
        percent: Math.round(
          (stats.archived / total) * 100
        ),
        icon: Archive,
        className: "archived",
      },
      {
        label: "Trash",
        value: stats.trash,
        percent: Math.round(
          (stats.trash / total) * 100
        ),
        icon: Trash2,
        className: "trash",
      },
    ];
  }, [stats]);

  /* =====================================================
     RECENT NOTES
  ===================================================== */

  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => {
        const dateA =
          getDate(a)?.getTime() || 0;

        const dateB =
          getDate(b)?.getTime() || 0;

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [notes]);

  return (
    <div
      className={`analytics-page ${
        light ? "analytics-light" : ""
      }`}
    >
      {/* =================================================
          BACKGROUND EFFECTS
      ================================================= */}

      <div className="analytics-glow analytics-glow-one" />
      <div className="analytics-glow analytics-glow-two" />

      <div className="analytics-shell">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="analytics-header">

          <div className="analytics-heading">

            <div className="analytics-title-icon">
              <BarChart3 size={23} />
            </div>

            <div>
              <h1>Analytics</h1>

              <p>
                Understand your notes, activity and
                organization at a glance.
              </p>
            </div>

          </div>

          <button
            className={`refresh-btn ${
              refreshing ? "refreshing" : ""
            }`}
            onClick={refreshAnalytics}
            disabled={refreshing || loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </header>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="analytics-stats">

          <div className="analytics-stat-card">

            <div className="stat-icon green">
              <FileText size={20} />
            </div>

            <div className="stat-content">
              <span>Total Notes</span>
              <strong>{stats.total}</strong>
              <small>
                All notes in workspace
              </small>
            </div>

          </div>

          <div className="analytics-stat-card">

            <div className="stat-icon blue">
              <Activity size={20} />
            </div>

            <div className="stat-content">
              <span>Active Notes</span>
              <strong>{stats.active}</strong>
              <small>
                Currently available
              </small>
            </div>

          </div>

          <div className="analytics-stat-card">

            <div className="stat-icon yellow">
              <Pin size={20} />
            </div>

            <div className="stat-content">
              <span>Pinned Notes</span>
              <strong>{stats.pinned}</strong>
              <small>
                Quick-access notes
              </small>
            </div>

          </div>

          <div className="analytics-stat-card">

            <div className="stat-icon purple">
              <Archive size={20} />
            </div>

            <div className="stat-content">
              <span>Archived</span>
              <strong>{stats.archived}</strong>
              <small>
                Stored away
              </small>
            </div>

          </div>

        </section>

        {/* =================================================
            MAIN ANALYTICS GRID
        ================================================= */}

        <section className="analytics-main-grid">

          {/* =================================================
              ACTIVITY CHART
          ================================================= */}

          <div className="analytics-panel activity-panel">

            <div className="panel-header">

              <div>
                <h2>Note Activity</h2>

                <p>
                  Notes created or updated over
                  the last six months.
                </p>
              </div>

              <div className="panel-header-icon">
                <TrendingUp size={18} />
              </div>

            </div>

            <div className="activity-chart">

              <div className="chart-y-axis">
                <span>{maxMonthlyCount}</span>

                <span>
                  {Math.ceil(
                    maxMonthlyCount / 2
                  )}
                </span>

                <span>0</span>
              </div>

              <div className="chart-area">

                <div className="chart-lines">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="chart-bars">

                  {monthlyStats.map(
                    (month, index) => {

                      const height =
                        month.count === 0
                          ? 6
                          : Math.max(
                              10,
                              (month.count /
                                maxMonthlyCount) *
                                100
                            );

                      return (
                        <div
                          className="chart-column"
                          key={month.key}
                        >

                          <div className="chart-value">
                            {month.count}
                          </div>

                          <div
                            className="chart-bar"
                            style={{
                              height: `${height}%`,
                              animationDelay:
                                `${index * 80}ms`,
                            }}
                          />

                          <span className="chart-label">
                            {month.label}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              DISTRIBUTION
          ================================================= */}

          <div className="analytics-panel distribution-panel">

            <div className="panel-header">

              <div>
                <h2>Note Distribution</h2>

                <p>
                  Current workspace breakdown.
                </p>
              </div>

              <div className="panel-header-icon">
                <FolderOpen size={18} />
              </div>

            </div>

            <div className="distribution-list">

              {distribution.map((item) => {

                const Icon = item.icon;

                return (
                  <div
                    className="distribution-item"
                    key={item.label}
                  >

                    <div
                      className={`distribution-icon ${item.className}`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="distribution-info">

                      <div className="distribution-top">

                        <span>
                          {item.label}
                        </span>

                        <strong>
                          {item.value}
                        </strong>

                      </div>

                      <div className="progress-track">

                        <div
                          className={`progress-fill ${item.className}`}
                          style={{
                            width: `${item.percent}%`,
                          }}
                        />

                      </div>

                    </div>

                    <span className="distribution-percent">
                      {item.percent}%
                    </span>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

        {/* =================================================
            LOWER GRID
        ================================================= */}

        <section className="analytics-lower-grid">

          {/* =================================================
              TAGS
          ================================================= */}

          <div className="analytics-panel tags-panel">

            <div className="panel-header">

              <div>
                <h2>Popular Tags</h2>

                <p>
                  Most frequently used note tags.
                </p>
              </div>

              <div className="panel-header-icon">
                <Tag size={18} />
              </div>

            </div>

            {tagStats.length === 0 ? (

              <div className="analytics-empty-small">

                <Tag size={24} />

                <span>
                  No tags available yet.
                </span>

              </div>

            ) : (

              <div className="tag-analytics-list">

                {tagStats.map((tag, index) => {

                  const width =
                    Math.max(
                      15,
                      (tag.count /
                        tagStats[0].count) *
                        100
                    );

                  return (
                    <div
                      className="tag-row"
                      key={tag.name}
                    >

                      <div className="tag-row-top">

                        <div className="tag-name">

                          <span className="tag-rank">
                            {index + 1}
                          </span>

                          <span>
                            #{tag.name}
                          </span>

                        </div>

                        <strong>
                          {tag.count}
                        </strong>

                      </div>

                      <div className="tag-progress">

                        <div
                          style={{
                            width: `${width}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <div className="analytics-panel recent-panel">

            <div className="panel-header">

              <div>
                <h2>Recent Activity</h2>

                <p>
                  Your latest note activity.
                </p>
              </div>

              <div className="panel-header-icon">
                <Activity size={18} />
              </div>

            </div>

            {recentNotes.length === 0 ? (

              <div className="analytics-empty-small">

                <FileText size={24} />

                <span>
                  No notes available yet.
                </span>

              </div>

            ) : (

              <div className="recent-list">

                {recentNotes.map((note) => {

                  const date = getDate(note);

                  const status =
                    note.status ||
                    (note.isTrashed
                      ? "trash"
                      : note.isArchived
                      ? "archived"
                      : "active");

                  return (
                    <div
                      className="recent-item"
                      key={note.id}
                    >

                      <div className="recent-item-icon">
                        <FileText size={16} />
                      </div>

                      <div className="recent-item-info">

                        <strong>
                          {note.title ||
                            "Untitled Note"}
                        </strong>

                        <span>
                          {formatDate(date)}
                        </span>

                      </div>

                      <span
                        className={`recent-status ${status}`}
                      >
                        {status}
                      </span>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            INSIGHT CARD
        ================================================= */}

        <section className="analytics-insight">

          <div className="insight-icon">
            <Lightbulb size={22} />
          </div>

          <div className="insight-content">

            <span>Workspace Insight</span>

            <h3>
              {stats.total === 0
                ? "Start creating notes to see your analytics."
                : stats.pinned > 0
                ? `You currently have ${stats.pinned} pinned ${
                    stats.pinned === 1
                      ? "note"
                      : "notes"
                  } for quick access.`
                : "Pin important notes to keep them easily accessible."}
            </h3>

            <p>
              Keep your notes organized with tags,
              pinned items and regular cleanup of
              archived or deleted notes.
            </p>

          </div>

          <div className="insight-decoration">
            <BarChart3 size={70} />
          </div>

        </section>

      </div>

      <style>{`

        /* =================================================
           BASE
        ================================================= */

        .analytics-page {
          --bg: #080b0d;
          --panel: #0f1519;
          --panel2: #141c21;

          --bd: rgba(255,255,255,.08);
          --bd2: rgba(255,255,255,.14);

          --tx: #f2f6f5;
          --mu: #8e9b98;
          --dim: #5f6c69;

          --ac: #6ee7b7;
          --ac2: #34d399;

          min-height: calc(100vh - 68px);

          width: 100%;

          padding:
            clamp(18px, 2vw, 28px);

          color: var(--tx);

          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(16,185,129,.10),
              transparent 27%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(124,92,240,.11),
              transparent 30%
            ),
            var(--bg);

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          overflow: hidden;

          position: relative;

          transition:
            background .25s ease,
            color .25s ease;
        }

        .analytics-page *,
        .analytics-page *::before,
        .analytics-page *::after {
          box-sizing: border-box;
        }


        /* =================================================
           AMBIENT EFFECT
        ================================================= */

        .analytics-page::before {
          content: "";

          position: absolute;

          width: 520px;
          height: 520px;

          left: 38%;
          top: 18%;

          border-radius: 50%;

          pointer-events: none;

          background:
            radial-gradient(
              circle,
              rgba(52,211,153,.035),
              transparent 68%
            );

          filter: blur(35px);

          animation:
            analyticsAmbientGlow
            12s
            ease-in-out
            infinite;

          z-index: 0;
        }


        /* =================================================
           BACKGROUND GLOW
        ================================================= */

        .analytics-glow {
          position: fixed;

          pointer-events: none;

          border-radius: 50%;

          filter: blur(25px);

          z-index: 0;
        }

        .analytics-glow-one {
          width: 430px;
          height: 430px;

          right: 70px;
          top: 40px;

          background:
            radial-gradient(
              circle,
              rgba(16,185,129,.08),
              transparent 68%
            );

          animation:
            analyticsGlowOne
            8s
            ease-in-out
            infinite;
        }

        .analytics-glow-two {
          width: 360px;
          height: 360px;

          left: 30px;
          bottom: 0;

          background:
            radial-gradient(
              circle,
              rgba(124,92,240,.08),
              transparent 68%
            );

          animation:
            analyticsGlowTwo
            10s
            ease-in-out
            infinite;
        }


        /* =================================================
           SHELL
        ================================================= */

        .analytics-shell {
          position: relative;

          z-index: 1;

          width: 100%;

          animation:
            analyticsPageEnter
            .55s
            cubic-bezier(.2,.7,.2,1);
        }


        /* =================================================
           HEADER
        ================================================= */

        .analytics-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          margin-bottom: 24px;

          animation:
            analyticsHeaderEnter
            .5s
            ease-out;
        }

        .analytics-heading {
          display: flex;

          align-items: center;

          gap: 14px;
        }

        .analytics-title-icon {
          width: 48px;
          height: 48px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          border-radius: 14px;

          color: var(--ac);

          background:
            rgba(110,231,183,.08);

          border:
            1px solid
            rgba(110,231,183,.16);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .analytics-heading:hover
        .analytics-title-icon {
          transform:
            translateY(-2px)
            rotate(-3deg);

          box-shadow:
            0 12px 30px
            rgba(52,211,153,.10);
        }

        .analytics-header h1 {
          margin:
            0 0 5px;

          font-size:
            clamp(25px, 2.2vw, 32px);

          line-height: 1.1;

          letter-spacing:
            -.5px;
        }

        .analytics-header p {
          margin: 0;

          color: var(--mu);

          font-size: 14px;

          line-height: 1.5;
        }


        /* =================================================
           REFRESH BUTTON
        ================================================= */

        .refresh-btn {
          position: relative;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          padding:
            10px 15px;

          border:
            1px solid
            var(--bd2);

          border-radius: 10px;

          background:
            rgba(255,255,255,.035);

          color: var(--tx);

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;

          overflow: hidden;

          transition:
            transform .2s ease,
            background .2s ease,
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .refresh-btn::before {
          content: "";

          position: absolute;

          top: 0;
          left: -100%;

          width: 60%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.10),
              transparent
            );

          transform:
            skewX(-18deg);

          transition:
            left .55s ease;
        }

        .refresh-btn:hover::before {
          left: 135%;
        }

        .refresh-btn:hover {
          transform:
            translateY(-2px);

          background:
            rgba(110,231,183,.07);

          border-color:
            rgba(110,231,183,.22);

          box-shadow:
            0 10px 25px
            rgba(52,211,153,.08);
        }

        .refresh-btn:active {
          transform:
            translateY(0)
            scale(.97);
        }

        .refresh-btn.refreshing svg {
          animation:
            refreshSpin
            .7s
            linear
            infinite;
        }


        /* =================================================
           STATS
        ================================================= */

        .analytics-stats {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 14px;

          margin-bottom: 16px;
        }

        .analytics-stat-card {
          position: relative;

          display: flex;

          align-items: center;

          gap: 13px;

          min-width: 0;

          padding: 17px;

          overflow: hidden;

          isolation: isolate;

          border:
            1px solid
            var(--bd);

          border-radius: 15px;

          background:
            linear-gradient(
              180deg,
              rgba(20,28,33,.9),
              rgba(15,21,25,.9)
            );

          box-shadow:
            0 10px 30px
            rgba(0,0,0,.14);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;

          animation:
            statCardEnter
            .55s
            cubic-bezier(.2,.7,.2,1)
            both;
        }

        .analytics-stat-card::before {
          content: "";

          position: absolute;

          top: 0;
          left: -120%;

          width: 70%;
          height: 100%;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.055),
              transparent
            );

          transform:
            skewX(-20deg);

          transition:
            left .65s ease;
        }

        .analytics-stat-card:hover::before {
          left: 145%;
        }

        .analytics-stat-card:nth-child(1) {
          animation-delay: .05s;
        }

        .analytics-stat-card:nth-child(2) {
          animation-delay: .10s;
        }

        .analytics-stat-card:nth-child(3) {
          animation-delay: .15s;
        }

        .analytics-stat-card:nth-child(4) {
          animation-delay: .20s;
        }

        .analytics-stat-card:hover {
          transform:
            translateY(-5px)
            scale(1.008);

          border-color:
            rgba(110,231,183,.22);

          box-shadow:
            0 20px 45px
            rgba(0,0,0,.23),
            0 0 0 1px
            rgba(110,231,183,.035);
        }

        .stat-icon {
          width: 42px;
          height: 42px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          border-radius: 12px;

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .analytics-stat-card:hover
        .stat-icon {
          transform:
            translateY(-2px)
            scale(1.06);
        }

        .analytics-stat-card:hover
        .stat-icon.green {
          box-shadow:
            0 8px 22px
            rgba(52,211,153,.12);
        }

        .analytics-stat-card:hover
        .stat-icon.blue {
          box-shadow:
            0 8px 22px
            rgba(96,165,250,.12);
        }

        .analytics-stat-card:hover
        .stat-icon.yellow {
          box-shadow:
            0 8px 22px
            rgba(251,191,36,.12);
        }

        .analytics-stat-card:hover
        .stat-icon.purple {
          box-shadow:
            0 8px 22px
            rgba(167,139,250,.12);
        }

        .stat-icon.green {
          color: var(--ac);

          background:
            rgba(110,231,183,.09);
        }

        .stat-icon.blue {
          color: #60a5fa;

          background:
            rgba(96,165,250,.09);
        }

        .stat-icon.yellow {
          color: #fbbf24;

          background:
            rgba(251,191,36,.09);
        }

        .stat-icon.purple {
          color: #a78bfa;

          background:
            rgba(167,139,250,.09);
        }

        .stat-content {
          min-width: 0;

          display: flex;

          flex-direction: column;
        }

        .stat-content span {
          color: var(--mu);

          font-size: 11px;
        }

        .stat-content strong {
          margin-top: 3px;

          font-size: 23px;

          line-height: 1.1;
        }

        .stat-content small {
          margin-top: 4px;

          color: var(--dim);

          font-size: 10px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        /* =================================================
           MAIN GRID
        ================================================= */

        .analytics-main-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.6fr)
            minmax(320px, .9fr);

          gap: 16px;

          margin-bottom: 16px;
        }


        /* =================================================
           PANEL
        ================================================= */

        .analytics-panel {
          position: relative;

          min-width: 0;

          padding: 19px;

          overflow: hidden;

          border:
            1px solid
            var(--bd);

          border-radius: 16px;

          background:
            linear-gradient(
              180deg,
              rgba(20,28,33,.9),
              rgba(15,21,25,.9)
            );

          box-shadow:
            0 12px 35px
            rgba(0,0,0,.15);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;

          animation:
            panelEnter
            .6s
            cubic-bezier(.2,.7,.2,1)
            both;
        }

        .analytics-panel::before {
          content: "";

          position: absolute;

          inset: 0;

          pointer-events: none;

          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(110,231,183,.045),
              transparent 30%
            );

          opacity: .45;

          transition:
            opacity .3s ease;
        }

        .analytics-panel:hover::before {
          opacity: .85;
        }

        .analytics-panel:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(110,231,183,.15);

          box-shadow:
            0 18px 42px
            rgba(0,0,0,.19);
        }

        .panel-header,
        .activity-chart,
        .distribution-list,
        .tag-analytics-list,
        .recent-list,
        .analytics-empty-small {
          position: relative;

          z-index: 1;
        }

        .panel-header {
          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          gap: 12px;

          margin-bottom: 22px;
        }

        .panel-header h2 {
          margin:
            0 0 5px;

          font-size: 16px;

          letter-spacing:
            -.15px;
        }

        .panel-header p {
          margin: 0;

          color: var(--mu);

          font-size: 11px;

          line-height: 1.5;
        }

        .panel-header-icon {
          width: 34px;
          height: 34px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          border-radius: 9px;

          color: var(--ac);

          background:
            rgba(110,231,183,.07);

          border:
            1px solid
            rgba(110,231,183,.11);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .analytics-panel:hover
        .panel-header-icon {
          transform:
            translateY(-2px)
            rotate(3deg);

          box-shadow:
            0 8px 20px
            rgba(52,211,153,.10);
        }


        /* =================================================
           ACTIVITY CHART
        ================================================= */

        .activity-chart {
          display: flex;

          height: 245px;

          gap: 12px;
        }

        .chart-y-axis {
          width: 25px;

          display: flex;

          flex-direction: column;

          justify-content:
            space-between;

          padding:
            2px 0 24px;

          color: var(--dim);

          font-size: 9px;

          text-align: right;
        }

        .chart-area {
          position: relative;

          flex: 1;

          min-width: 0;
        }

        .chart-lines {
          position: absolute;

          inset:
            0 0 24px;

          display: flex;

          flex-direction: column;

          justify-content:
            space-between;

          pointer-events:
            none;
        }

        .chart-lines span {
          display: block;

          width: 100%;

          border-top:
            1px dashed
            rgba(255,255,255,.06);
        }

        .chart-bars {
          position: relative;

          height: 100%;

          display: grid;

          grid-template-columns:
            repeat(6, 1fr);

          gap: 12px;

          align-items:
            flex-end;

          padding:
            0 4px;
        }

        .chart-column {
          position: relative;

          height: 100%;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content:
            flex-end;

          gap: 7px;

          transition:
            transform .22s ease;
        }

        .chart-column:hover {
          transform:
            translateY(-3px);
        }

        .chart-value {
          min-height: 14px;

          color: var(--mu);

          font-size: 9px;

          transition:
            color .2s ease,
            transform .2s ease;
        }

        .chart-column:hover
        .chart-value {
          color: var(--ac);

          transform:
            translateY(-2px);
        }

        .chart-bar {
          position: relative;

          width:
            min(32px, 65%);

          min-height: 5px;

          overflow: hidden;

          border-radius:
            7px 7px 3px 3px;

          background:
            linear-gradient(
              180deg,
              #6ee7b7,
              #059669
            );

          box-shadow:
            0 8px 18px
            rgba(16,185,129,.12);

          transform-origin:
            bottom;

          animation:
            chartBarGrow
            .7s
            cubic-bezier(.2,.8,.2,1)
            both;
        }

        .chart-bar::after {
          content: "";

          position: absolute;

          top: -20%;
          left: -80%;

          width: 45%;
          height: 140%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.22),
              transparent
            );

          transform:
            skewX(-18deg);

          transition:
            left .55s ease;
        }

        .chart-column:hover
        .chart-bar::after {
          left: 145%;
        }

        .chart-column:hover
        .chart-bar {
          filter:
            brightness(1.12);

          box-shadow:
            0 10px 25px
            rgba(16,185,129,.20);
        }

        .chart-label {
          height: 18px;

          color: var(--dim);

          font-size: 9px;
        }


        /* =================================================
           DISTRIBUTION
        ================================================= */

        .distribution-list {
          display: flex;

          flex-direction: column;

          gap: 18px;
        }

        .distribution-item {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 6px;

          margin: -6px;

          border-radius: 10px;

          transition:
            transform .22s ease,
            background .22s ease;
        }

        .distribution-item:hover {
          transform:
            translateX(4px);

          background:
            rgba(255,255,255,.025);
        }

        .distribution-icon {
          width: 34px;
          height: 34px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          border-radius: 9px;

          transition:
            transform .22s ease,
            box-shadow .22s ease;
        }

        .distribution-item:hover
        .distribution-icon {
          transform:
            scale(1.08);
        }

        .distribution-icon.active {
          color: var(--ac);

          background:
            rgba(110,231,183,.08);
        }

        .distribution-icon.pinned {
          color: #fbbf24;

          background:
            rgba(251,191,36,.08);
        }

        .distribution-icon.archived {
          color: #a78bfa;

          background:
            rgba(167,139,250,.08);
        }

        .distribution-icon.trash {
          color: #fb7185;

          background:
            rgba(251,113,133,.08);
        }

        .distribution-info {
          flex: 1;

          min-width: 0;
        }

        .distribution-top {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          margin-bottom: 7px;

          color: var(--mu);

          font-size: 11px;
        }

        .distribution-top strong {
          color: var(--tx);

          font-size: 11px;
        }

        .progress-track {
          width: 100%;

          height: 5px;

          overflow: hidden;

          border-radius: 99px;

          background:
            rgba(255,255,255,.06);
        }

        .progress-fill {
          position: relative;

          height: 100%;

          overflow: hidden;

          border-radius: inherit;

          transition:
            width .7s
            cubic-bezier(.2,.8,.2,1);
        }

        .progress-fill::after {
          content: "";

          position: absolute;

          inset: 0;

          width: 45%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.18),
              transparent
            );

          animation:
            progressShine
            3.5s
            ease-in-out
            infinite;
        }

        .progress-fill.active {
          background: #34d399;
        }

        .progress-fill.pinned {
          background: #fbbf24;
        }

        .progress-fill.archived {
          background: #a78bfa;
        }

        .progress-fill.trash {
          background: #fb7185;
        }

        .distribution-percent {
          width: 32px;

          color: var(--dim);

          font-size: 10px;

          text-align: right;
        }


        /* =================================================
           LOWER GRID
        ================================================= */

        .analytics-lower-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          gap: 16px;

          margin-bottom: 16px;
        }


        /* =================================================
           TAGS
        ================================================= */

        .tag-analytics-list {
          display: flex;

          flex-direction: column;

          gap: 15px;
        }

        .tag-row {
          padding: 7px;

          margin: -7px;

          border-radius: 10px;

          transition:
            background .2s ease,
            transform .2s ease;
        }

        .tag-row:hover {
          transform:
            translateX(4px);

          background:
            rgba(110,231,183,.025);
        }

        .tag-row-top {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          margin-bottom: 7px;
        }

        .tag-name {
          display: flex;

          align-items: center;

          gap: 8px;

          color: var(--mu);

          font-size: 12px;
        }

        .tag-rank {
          width: 20px;
          height: 20px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 6px;

          color: var(--dim);

          background:
            rgba(255,255,255,.04);

          font-size: 9px;

          transition:
            color .2s ease,
            background .2s ease,
            transform .2s ease;
        }

        .tag-row:hover
        .tag-rank {
          color: var(--ac);

          background:
            rgba(110,231,183,.08);

          transform:
            scale(1.08);
        }

        .tag-row-top strong {
          color: var(--tx);

          font-size: 11px;
        }

        .tag-progress {
          height: 5px;

          overflow: hidden;

          border-radius: 99px;

          background:
            rgba(255,255,255,.05);
        }

        .tag-progress div {
          position: relative;

          height: 100%;

          overflow: hidden;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #34d399,
              #6ee7b7
            );

          transition:
            width .7s
            cubic-bezier(.2,.8,.2,1);
        }

        .tag-progress div::after {
          content: "";

          position: absolute;

          top: 0;
          left: -80%;

          width: 45%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.20),
              transparent
            );

          transform:
            skewX(-18deg);

          transition:
            left .6s ease;
        }

        .tag-row:hover
        .tag-progress div::after {
          left: 140%;
        }


        /* =================================================
           RECENT
        ================================================= */

        .recent-list {
          display: flex;

          flex-direction: column;

          gap: 10px;
        }

        .recent-item {
          position: relative;

          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 0;

          padding:
            9px 10px;

          overflow: hidden;

          border-radius: 10px;

          background:
            rgba(255,255,255,.025);

          border:
            1px solid
            transparent;

          transition:
            background .2s ease,
            border-color .2s ease,
            transform .2s ease;
        }

        .recent-item::before {
          content: "";

          position: absolute;

          top: 0;
          left: -100%;

          width: 65%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(110,231,183,.045),
              transparent
            );

          transform:
            skewX(-18deg);

          transition:
            left .55s ease;
        }

        .recent-item:hover::before {
          left: 135%;
        }

        .recent-item:hover {
          transform:
            translateX(3px);

          background:
            rgba(110,231,183,.04);

          border-color:
            rgba(110,231,183,.09);
        }

        .recent-item-icon {
          width: 31px;
          height: 31px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          border-radius: 8px;

          color: var(--ac);

          background:
            rgba(110,231,183,.07);

          transition:
            transform .22s ease,
            box-shadow .22s ease;
        }

        .recent-item:hover
        .recent-item-icon {
          transform:
            translateY(-1px)
            scale(1.06);

          box-shadow:
            0 7px 18px
            rgba(52,211,153,.10);
        }

        .recent-item-info {
          flex: 1;

          min-width: 0;

          display: flex;

          flex-direction: column;

          gap: 3px;
        }

        .recent-item-info strong {
          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: var(--tx);

          font-size: 11px;

          transition:
            color .2s ease;
        }

        .recent-item:hover
        .recent-item-info strong {
          color: var(--ac);
        }

        .recent-item-info span {
          color: var(--dim);

          font-size: 9px;
        }

        .recent-status {
          padding:
            4px 7px;

          border-radius: 6px;

          font-size: 8px;

          text-transform:
            capitalize;

          background:
            rgba(255,255,255,.05);

          color: var(--mu);
        }

        .recent-status.active {
          color: #6ee7b7;

          background:
            rgba(110,231,183,.07);
        }

        .recent-status.archived {
          color: #a78bfa;

          background:
            rgba(167,139,250,.07);
        }

        .recent-status.trash {
          color: #fb7185;

          background:
            rgba(251,113,133,.07);
        }


        /* =================================================
           EMPTY SMALL
        ================================================= */

        .analytics-empty-small {
          min-height: 145px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 9px;

          color: var(--dim);

          font-size: 11px;

          animation:
            analyticsEmptyFloat
            4s
            ease-in-out
            infinite;
        }


        /* =================================================
           INSIGHT
        ================================================= */

        .analytics-insight {
          position: relative;

          display: flex;

          align-items: center;

          gap: 15px;

          overflow: hidden;

          padding:
            18px 20px;

          border:
            1px solid
            rgba(110,231,183,.13);

          border-radius: 16px;

          background:
            linear-gradient(
              100deg,
              rgba(110,231,183,.075),
              rgba(20,28,33,.88)
            );

          box-shadow:
            0 12px 35px
            rgba(0,0,0,.12);

          animation:
            panelEnter
            .7s
            ease-out;

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .analytics-insight::before {
          content: "";

          position: absolute;

          top: 0;
          left: -120%;

          width: 65%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.045),
              transparent
            );

          transform:
            skewX(-18deg);

          transition:
            left .8s ease;
        }

        .analytics-insight:hover::before {
          left: 145%;
        }

        .analytics-insight:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(110,231,183,.22);

          box-shadow:
            0 18px 42px
            rgba(0,0,0,.18),
            0 0 30px
            rgba(52,211,153,.035);
        }

        .insight-icon {
          width: 43px;
          height: 43px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          border-radius: 12px;

          color: #fbbf24;

          background:
            rgba(251,191,36,.08);

          border:
            1px solid
            rgba(251,191,36,.12);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .analytics-insight:hover
        .insight-icon {
          transform:
            translateY(-2px)
            rotate(-4deg);

          box-shadow:
            0 10px 24px
            rgba(251,191,36,.10);
        }

        .insight-content {
          position: relative;

          z-index: 1;

          min-width: 0;
        }

        .insight-content > span {
          color: var(--ac);

          font-size: 10px;

          font-weight: 700;

          text-transform:
            uppercase;

          letter-spacing:
            .7px;
        }

        .insight-content h3 {
          margin:
            4px 0 5px;

          font-size: 14px;

          line-height: 1.4;
        }

        .insight-content p {
          margin: 0;

          color: var(--mu);

          font-size: 11px;

          line-height: 1.5;
        }

        .insight-decoration {
          position: absolute;

          right: 25px;

          opacity: .045;

          color: var(--ac);

          transform:
            rotate(-8deg);

          transition:
            transform .5s ease,
            opacity .3s ease;
        }

        .analytics-insight:hover
        .insight-decoration {
          opacity: .075;

          transform:
            rotate(-3deg)
            scale(1.05);
        }


        /* =================================================
           LIGHT THEME
        ================================================= */

        .analytics-light {
          --bg: #f5f8f7;

          --panel: #ffffff;

          --panel2: #f9fbfa;

          --bd:
            rgba(15,23,42,.09);

          --bd2:
            rgba(15,23,42,.15);

          --tx: #17201e;

          --mu: #687570;

          --dim: #899590;

          --ac: #059669;

          --ac2: #047857;

          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(16,185,129,.07),
              transparent 27%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(124,92,240,.06),
              transparent 30%
            ),
            var(--bg);
        }

        .analytics-light
        .analytics-stat-card,
        .analytics-light
        .analytics-panel {
          background:
            rgba(255,255,255,.88);

          box-shadow:
            0 10px 30px
            rgba(15,23,42,.055);
        }

        .analytics-light
        .refresh-btn {
          background:
            rgba(255,255,255,.75);
        }

        .analytics-light
        .chart-lines span {
          border-color:
            rgba(15,23,42,.07);
        }

        .analytics-light
        .progress-track,
        .analytics-light
        .tag-progress {
          background:
            rgba(15,23,42,.06);
        }

        .analytics-light
        .recent-item {
          background:
            rgba(15,23,42,.025);
        }

        .analytics-light
        .analytics-insight {
          background:
            linear-gradient(
              100deg,
              rgba(110,231,183,.08),
              rgba(255,255,255,.88)
            );
        }

        .analytics-light
        .analytics-stat-card:hover,
        .analytics-light
        .analytics-panel:hover {
          box-shadow:
            0 18px 40px
            rgba(15,23,42,.09),
            0 0 0 1px
            rgba(5,150,105,.025);
        }

        .analytics-light
        .analytics-insight:hover {
          box-shadow:
            0 18px 40px
            rgba(15,23,42,.08);
        }


        /* =================================================
           ANIMATIONS
        ================================================= */

        @keyframes analyticsPageEnter {

          from {
            opacity: 0;

            transform:
              translateY(14px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }

        }

        @keyframes analyticsHeaderEnter {

          from {
            opacity: 0;

            transform:
              translateY(-10px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }

        }

        @keyframes statCardEnter {

          from {
            opacity: 0;

            transform:
              translateY(18px)
              scale(.98);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }

        @keyframes panelEnter {

          from {
            opacity: 0;

            transform:
              translateY(18px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }

        }

        @keyframes chartBarGrow {

          from {
            transform:
              scaleY(0);
          }

          to {
            transform:
              scaleY(1);
          }

        }

        @keyframes refreshSpin {

          to {
            transform:
              rotate(360deg);
          }

        }

        @keyframes analyticsGlowOne {

          0%,
          100% {
            transform:
              translate(0,0)
              scale(1);
          }

          50% {
            transform:
              translate(-18px,18px)
              scale(1.08);
          }

        }

        @keyframes analyticsGlowTwo {

          0%,
          100% {
            transform:
              translate(0,0)
              scale(1);
          }

          50% {
            transform:
              translate(18px,-16px)
              scale(1.07);
          }

        }

        @keyframes analyticsAmbientGlow {

          0%,
          100% {
            transform:
              translate3d(0,0,0)
              scale(1);

            opacity: .55;
          }

          50% {
            transform:
              translate3d(-35px,25px,0)
              scale(1.08);

            opacity: .8;
          }

        }

        @keyframes progressShine {

          0% {
            transform:
              translateX(-150%);
          }

          35%,
          100% {
            transform:
              translateX(280%);
          }

        }

        @keyframes analyticsEmptyFloat {

          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-4px);
          }

        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1100px) {

          .analytics-stats {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .analytics-main-grid {
            grid-template-columns:
              1fr;
          }

        }

        @media (max-width: 800px) {

          .analytics-lower-grid {
            grid-template-columns:
              1fr;
          }

        }

        @media (max-width: 650px) {

          .analytics-page {
            padding:
              18px 14px;
          }

          .analytics-header {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .refresh-btn {
            width: 100%;
          }

          .analytics-stats {
            grid-template-columns:
              1fr;
          }

          .analytics-stat-card {
            padding: 15px;
          }

          .activity-chart {
            height: 215px;
          }

          .chart-bars {
            gap: 5px;
          }

          .chart-bar {
            width:
              min(25px, 60%);
          }

          .insight-decoration {
            display: none;
          }

        }

        @media (max-width: 450px) {

          .analytics-page {
            padding:
              15px 10px;
          }

          .analytics-heading {
            align-items:
              flex-start;
          }

          .analytics-title-icon {
            width: 42px;
            height: 42px;
          }

          .analytics-header h1 {
            font-size: 24px;
          }

          .analytics-header p {
            font-size: 12px;
          }

          .analytics-panel {
            padding: 15px;
          }

          .panel-header {
            margin-bottom: 18px;
          }

          .activity-chart {
            height: 190px;
          }

          .chart-y-axis {
            width: 20px;
          }

          .distribution-item {
            gap: 7px;
          }

          .distribution-percent {
            width: 28px;
          }

          .recent-status {
            display: none;
          }

        }


        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

          .analytics-page::before,
          .analytics-glow-one,
          .analytics-glow-two,
          .analytics-shell,
          .analytics-header,
          .analytics-stat-card,
          .analytics-panel,
          .analytics-insight,
          .chart-bar,
          .analytics-empty-small,
          .refresh-btn.refreshing svg,
          .progress-fill::after {
            animation:
              none !important;
          }

          .analytics-stat-card:hover,
          .analytics-panel:hover,
          .analytics-insight:hover,
          .refresh-btn:hover,
          .distribution-item:hover,
          .tag-row:hover,
          .chart-column:hover {
            transform:
              none !important;
          }

          .analytics-stat-card::before,
          .analytics-insight::before,
          .recent-item::before,
          .refresh-btn::before,
          .chart-bar::after,
          .tag-progress div::after {
            display: none !important;
          }

        }

      `}</style>
    </div>
  );
}