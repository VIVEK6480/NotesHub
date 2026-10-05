import React, {
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Pin,
  Archive,
  Trash2,
  FileText,
  ChevronDown,
  LayoutGrid,
  List,
  MoreVertical,
  TrendingUp,
  Image as ImageIcon,
  Clock,
  Calendar,
  Pencil,
  ArrowUp,
  Leaf,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNotes } from "../../context/NotesContext";

const NOTES = [
  {
    id: 1,
    title: "Project Ideas",
    tags: ["#ideas", "#work"],
    content:
      "Build a real-time collaboration tool with WebSockets and AI features...",
    date: "Sep 29, 2025",
    pinned: true,
    s: "all",
  },
  {
    id: 2,
    title: "Meeting Notes",
    tags: ["#work", "#meeting"],
    content:
      "Discussed the new API architecture and database optimization...",
    date: "Sep 28, 2025",
    pinned: false,
    s: "all",
  },
  {
    id: 3,
    title: "Personal Goals",
    tags: ["#life", "#goals"],
    content:
      "Learn system design, contribute to open source and build amazing...",
    date: "Sep 27, 2025",
    pinned: false,
    s: "all",
  },
  {
    id: 4,
    title: "Code Snippets",
    tags: ["#code", "#development"],
    content:
      "Useful React hooks and utility functions for daily development...",
    date: "Sep 26, 2025",
    pinned: false,
    s: "all",
  },
  {
    id: 5,
    title: "Notes on PostgreSQL",
    tags: ["#database", "#postgres"],
    content:
      "Indexes, query optimization and performance tuning tips...",
    date: "Sep 25, 2025",
    pinned: false,
    s: "all",
  },
  {
    id: 6,
    title: "Workout Plan",
    tags: ["#health", "#fitness"],
    content:
      "Monday: Chest & Triceps | Tuesday: Back & Biceps...",
    date: "Sep 24, 2025",
    pinned: false,
    s: "all",
  },
  {
    id: 7,
    title: "Reading List",
    tags: ["#books", "#life"],
    content:
      "Designing Data-Intensive Applications, Clean Architecture...",
    date: "Sep 20, 2025",
    pinned: false,
    s: "archived",
  },
  {
    id: 8,
    title: "Old Notes",
    tags: ["#misc"],
    content:
      "Outdated sprint planning draft, safe to delete...",
    date: "Sep 12, 2025",
    pinned: false,
    s: "trash",
  },
];

function useCount(to, ms = 900) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let raf;
    let t0;

    const step = (t) => {
      t0 = t0 || t;
      const p = Math.min((t - t0) / ms, 1);
      setV(
        Math.round(
          to * (1 - Math.pow(1 - p, 3))
        )
      );

      if (p < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);

  return v;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

html,
body,
#root {
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: none;
  height: auto;
  min-height: 100vh;
  text-align: left;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
}

body {
  display: block;
  place-items: initial;
  min-width: 320px;
}

.nh {
  --bg: #080b0d;
  --sb1: #123428;
  --sb2: #0a110f;
  --card: #0f1519;
  --card2: #141c21;
  --bd: rgba(255, 255, 255, 0.07);
  --tx: #f2f6f5;
  --mu: #8e9b98;
  --dim: #5f6c69;
  --ac: #6ee7b7;
  --ac2: #34d399;
  --on: #06281c;
  --sh: 0 10px 30px rgba(0, 0, 0, 0.35);
  --orb: 0.5;

  position: relative;
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-height: 100vh;
  background: var(--bg);
  color: var(--tx);
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  overflow-x: hidden;
  overflow-y: visible;
  transition: background 0.4s, color 0.4s;
}

.nh.light {
  --bg: #eef4f1;
  --sb1: #d5f2e5;
  --sb2: #f4faf7;
  --card: #ffffff;
  --card2: #f3f8f6;
  --bd: rgba(14, 48, 36, 0.1);
  --tx: #10211b;
  --mu: #566b63;
  --dim: #8a9c95;
  --ac: #0f9f6e;
  --ac2: #10b981;
  --on: #ffffff;
  --sh: 0 10px 28px rgba(16, 80, 58, 0.1);
  --orb: 0.35;
}

.nh * {
  box-sizing: border-box;
}

.nh button {
  font-family: inherit;
  color: inherit;
}

.nh :focus-visible {
  outline: 2px solid var(--ac);
  outline-offset: 2px;
}

.nh .orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: var(--orb);
  pointer-events: none;
  animation: drift 18s ease-in-out infinite alternate;
}

.nh .o1 {
  width: 420px;
  height: 420px;
  background: #10b981;
  top: -120px;
  left: 30%;
}

.nh .o2 {
  width: 380px;
  height: 380px;
  background: #7c5cf0;
  bottom: -140px;
  right: 8%;
  animation-delay: -8s;
}

@keyframes drift {
  to {
    transform: translate(60px, 40px) scale(1.15);
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes shine {
  from {
    transform: translateX(-120%) skewX(-20deg);
  }
  to {
    transform: translateX(320%) skewX(-20deg);
  }
}

@keyframes ring {
  0%, 88%, 100% {
    transform: rotate(0);
  }
  91% {
    transform: rotate(14deg);
  }
  94% {
    transform: rotate(-12deg);
  }
  97% {
    transform: rotate(8deg);
  }
}

@keyframes fill {
  from {
    width: 0;
  }
}

.nh.light .promo {
  background: linear-gradient(
    160deg,
    rgba(16, 185, 129, 0.2),
    rgba(255, 255, 255, 0.6)
  );
}

.nh .main {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  overflow: visible;
}

.nh .body {
  width: 100%;
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: minmax(0, 1fr) clamp(300px, 22vw, 420px);
  gap: clamp(18px, 2vw, 32px);
  padding: clamp(18px, 2vw, 32px)
    clamp(16px, 2.2vw, 40px)
    clamp(18px, 2vw, 28px);
}

.nh .hello {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.nh h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.8px;
}

.nh h1 em {
  font-style: normal;
  background: linear-gradient(
    90deg,
    var(--ac),
    #38bdf8
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nh .wave {
  display: inline-block;
  transform-origin: 70% 70%;
  animation: ring 3s ease-in-out infinite;
}

.nh .sub {
  margin: 6px 0 0;
  color: var(--mu);
  font-size: 14.5px;
}

.nh .cta {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 24px;
  border: 0;
  border-radius: 13px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #effff8;
  background: linear-gradient(
    135deg,
    #86d9b6,
    #5cb893
  );
  box-shadow: 0 8px 26px rgba(52, 211, 153, 0.32);
  transition: transform 0.2s, box-shadow 0.2s;
}

.nh .cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 34px rgba(52, 211, 153, 0.55);
}

.nh .cta::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 30px;
  background: rgba(255, 255, 255, 0.55);
  filter: blur(6px);
  animation: shine 3.5s ease-in-out infinite;
}

.nh .stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin: 26px 0;
}

.nh .st {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(var(--r), 0.45);
  background:
    linear-gradient(
      150deg,
      rgba(var(--r), 0.34),
      rgba(var(--r), 0.04) 75%
    ),
    var(--card);
  box-shadow: var(--sh);
  transition: transform 0.25s, box-shadow 0.25s;
}

.nh .st:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 40px rgba(var(--r), 0.28);
}

.nh .st .ic {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(var(--r), 0.4);
  color: #fff;
  margin-bottom: 18px;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 0 18px rgba(var(--r), 0.5);
}

.nh.light .st .ic {
  color: rgb(var(--r));
}

.nh .st span {
  font-size: 13.5px;
  color: var(--mu);
}

.nh .st b {
  display: block;
  font-size: 30px;
  font-weight: 700;
  margin: 2px 0 8px;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}

.nh .st small {
  font-size: 12px;
  color: rgb(var(--r));
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}

.nh.light .st small {
  filter: brightness(0.8);
}

.nh .panel {
  border: 1px solid var(--bd);
  border-radius: 20px;
  padding: 22px;
  background: linear-gradient(
    180deg,
    var(--card2),
    var(--card)
  );
  box-shadow: var(--sh);
}

.nh .ph {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nh .ph h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
}

.nh .sortw {
  position: relative;
}

.nh .smenu {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  min-width: 150px;
  padding: 6px;
  border-radius: 12px;
  background: var(--card);
  border: 1px solid var(--bd);
  box-shadow: var(--sh);
  z-index: 20;
  animation: rise 0.18s ease both;
}

.nh .smenu button {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: none;
  color: var(--mu);
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  cursor: pointer;
}

.nh .smenu button:hover,
.nh .smenu button.on {
  background: rgba(52, 211, 153, 0.12);
  color: var(--ac);
}

.nh button.sort {
  cursor: pointer;
}

.nh .sort {
  display: flex;
  align-items: center;
  gap: 30px;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--bd);
  background: var(--card);
  font-size: 12.5px;
  color: var(--mu);
}

.nh .sort b {
  color: var(--tx);
  font-weight: 600;
}

.nh .seg {
  display: flex;
  gap: 4px;
}

.nh .seg button {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: none;
  display: grid;
  place-items: center;
  color: var(--dim);
  cursor: pointer;
  transition: all 0.2s;
}

.nh .seg button.on {
  border-color: var(--bd);
  background: var(--card);
  color: var(--tx);
  box-shadow:
    0 0 0 1px rgba(52, 211, 153, 0.35),
    0 0 14px rgba(52, 211, 153, 0.2);
}

.nh .pills {
  display: flex;
  gap: 10px;
  margin: 18px 0 20px;
}

.nh .pill {
  height: 34px;
  padding: 0 20px;
  border-radius: 20px;
  border: 1px solid var(--bd);
  background: var(--card);
  color: var(--tx);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nh .pill:hover {
  border-color: rgba(52, 211, 153, 0.5);
}

.nh .pill.on {
  border-color: transparent;
  color: var(--on);
  font-weight: 700;
  background: linear-gradient(
    135deg,
    #8ff0c9,
    #34d399
  );
  box-shadow: 0 4px 16px rgba(52, 211, 153, 0.4);
}

.nh .grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.nh .grid.list {
  grid-template-columns: 1fr;
}

.nh .card {
  --mx: 50%;
  --my: 50%;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 20px;
  min-height: 186px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--bd);
  background: var(--card);
  transition:
    transform 0.25s,
    border-color 0.25s,
    box-shadow 0.25s;
  cursor: pointer;
}

.nh .card::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
  background:
    radial-gradient(
      260px circle at var(--mx) var(--my),
      rgba(52, 211, 153, 0.18),
      transparent 70%
    );
  pointer-events: none;
}

.nh .card:hover {
  transform: translateY(-4px);
  border-color: rgba(52, 211, 153, 0.5);
  box-shadow: 0 16px 36px rgba(16, 185, 129, 0.16);
}

.nh .card:hover::before {
  opacity: 1;
}

.nh .card.hot {
  border-color: rgba(52, 211, 153, 0.55);
  box-shadow:
    0 0 0 1px rgba(52, 211, 153, 0.2),
    0 0 26px rgba(52, 211, 153, 0.16);
}

.nh .card.hot::after {
  content: "";
  position: absolute;
  top: 0;
  left: 12%;
  right: 12%;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--ac),
    transparent
  );
}

.nh .card h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.nh .chips {
  display: flex;
  gap: 8px;
  margin: 12px 0 14px;
  flex-wrap: wrap;
}

.nh .chip {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--card2);
  border: 1px solid var(--bd);
  color: var(--mu);
}

.nh .card p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--mu);
}

.nh .cf {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  font-size: 11.5px;
  color: var(--dim);
}

.nh .cf span {
  display: flex;
  align-items: center;
  gap: 7px;
}

.nh .pinb:not(.on) {
  opacity: 0;
}

.nh .card:hover .pinb:not(.on),
.nh .pinb:focus-visible {
  opacity: 0.7;
}

.nh .pinb {
  border: 0;
  background: none;
  color: var(--dim);
  cursor: pointer;
  display: grid;
  padding: 2px;
  transition: transform 0.2s;
}

.nh .pinb:hover {
  transform: rotate(-20deg) scale(1.15);
}

.nh .pinb.on {
  color: var(--ac);
  filter: drop-shadow(
    0 0 6px rgba(52, 211, 153, 0.7)
  );
}

.nh .foot {
  grid-column: 1 / -1;
  grid-row: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 34px;
  padding-bottom: 24px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: var(--mu);
}

.nh .foot svg {
  color: var(--ac);
  filter: drop-shadow(
    0 0 6px rgba(52, 211, 153, 0.5)
  );
}

.nh .foot i {
  font-style: normal;
  font-size: 20px;
  line-height: 1;
  opacity: 0.55;
}

.nh .empty {
  grid-column: 1 / -1;
  padding: 44px;
  text-align: center;
  color: var(--mu);
  border: 1px dashed var(--bd);
  border-radius: 14px;
}

.nh .rail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-self: stretch;
  grid-column: 2;
  grid-row: 1;
}

.nh .body > section {
  display: flex;
  flex-direction: column;
  min-width: 0;
  grid-column: 1;
  grid-row: 1;
}

.nh .panel.fillp {
  flex: 1;
}

.nh .panel.grow {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nh .evs {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
}

.nh .evs .ev {
  margin: 0;
}

.nh .rail .panel {
  padding: 20px;
}

.nh .rail h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nh .qa {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nh .qb {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 54px;
  padding: 0 8px;
  border-radius: 12px;
  border: 1px solid var(--bd);
  background: var(--card);
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 500;
  width: 100%;
  transition: all 0.2s;
}

.nh .qb:hover {
  transform: translateX(4px);
  border-color: rgba(var(--r), 0.5);
  box-shadow: 0 6px 20px rgba(var(--r), 0.18);
}

.nh .qi {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(
    140deg,
    rgba(var(--r), 0.9),
    rgba(var(--r), 0.55)
  );
  color: #fff;
  box-shadow:
    0 4px 14px rgba(var(--r), 0.4);
}

.nh .ev {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.nh .ev:last-child {
  margin: 0;
}

.nh .ev .qi {
  flex-shrink: 0;
}

.nh .ev div:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.nh .ev p {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
}

.nh .ev small {
  display: block;
  margin-top: 3px;
  font-size: 11.5px;
  color: var(--mu);
}

.nh .ev time {
  font-size: 10.5px;
  color: var(--dim);
  align-self: flex-start;
  margin-top: 3px;
}

.nh .va {
  margin-left: auto;
  font-size: 11.5px;
  color: var(--ac);
  font-weight: 500;
  cursor: pointer;
}

.nh .track {
  height: 8px;
  border-radius: 8px;
  background: var(--card2);
  overflow: hidden;
  margin: 6px 0 12px;
}

.nh .track i {
  display: block;
  height: 100%;
  width: 66%;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    #10b981,
    #6ee7b7
  );
  box-shadow:
    0 0 14px rgba(52, 211, 153, 0.7);
  animation:
    fill 1.4s 0.5s
    cubic-bezier(0.2, 0.7, 0.2, 1)
    both;
}

.nh .latest-note-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
}

.nh .latest-note-main {
  flex: 1;
  min-width: 0;
}

.nh .latest-note-image {
  width: 78px;
  height: 78px;
  flex: 0 0 78px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--bd);
  background: var(--card2);
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.14);
}

.nh .latest-note-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.nh .card:hover .latest-note-image img {
  transform: scale(1.05);
}

.nh .latest-note-click {
  cursor: pointer;
}

.nh .activity-real {
  position: relative;
  z-index: 1;
}

.nh .activity-real .ev {
  cursor: pointer;
}

.nh .activity-real .ev:hover .ev-title {
  color: var(--ac);
}

.nh .ev-title {
  transition: color 0.2s ease;
}

@media (max-width: 1380px) {
  .nh .grid:not(.list) {
    grid-template-columns: repeat(
      2,
      minmax(0, 1fr)
    );
  }
}

@media (max-width: 700px) {
  .nh .grid:not(.list) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .nh .body {
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }
  .nh .body > section,
  .nh .rail,
  .nh .foot {
    grid-column: 1;
    grid-row: auto;
  }
  .nh .rail {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(260px, 1fr)
    );
  }
}

@media (max-width: 900px) {
  .nh .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .nh .top,
  .nh .body {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 560px) {
  .nh .hello {
    flex-direction: column;
    gap: 14px;
  }
  .nh .latest-note-image {
    width: 72px;
    height: 72px;
    flex-basis: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nh *,
  .nh *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function useSidebarOffset(ref) {
  const [off, setOff] = useState({
    left: 0,
    top: 0,
  });

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;

      const sb = document.querySelector(".nh-sidebar");
      const hd = document.querySelector(".nh-common-header");
      const r = el.getBoundingClientRect();

      const left = sb
        ? Math.max(
            0,
            Math.round(
              sb.getBoundingClientRect().right - r.left
            )
          )
        : 0;

      const top = hd
        ? Math.max(
            0,
            Math.round(
              hd.getBoundingClientRect().bottom -
                (r.top + window.scrollY)
            )
          )
        : 0;

      setOff((o) =>
        o.left === left && o.top === top
          ? o
          : { left, top }
      );
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const t = setTimeout(measure, 150);
    window.addEventListener("resize", measure);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      const sb = document.querySelector(".nh-sidebar");
      if (sb) {
        ro.observe(sb);
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      ro && ro.disconnect();
    };
  }, [ref]);

  return window.innerWidth <= 768
    ? { left: 0, top: 0 }
    : off;
}

function Stat({ t, n, sub, Icon, r, d }) {
  const v = useCount(n);

  return (
    <div
      className="st in"
      style={{
        "--r": r,
        "--d": d + "s",
      }}
    >
      <div className="ic">
        <Icon size={19} />
      </div>
      <span>{t}</span>
      <b>{v}</b>
      <small>
        <ArrowUp size={11} /> {sub}
      </small>
    </div>
  );
}

function formatNoteDate(note) {
  if (note?.date) return note.date;
  if (note?.updatedAt) {
    const date = new Date(note.updatedAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  if (note?.createdAt) {
    const date = new Date(note.createdAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return "No date";
}

const IMAGE_FIELDS = [
  "imageData",
  "imageUrl",
  "imageURL",
  "image",
  "image_url",
  "attachmentUrl",
  "attachmentURL",
  "coverImage",
  "coverImageUrl",
];

function getNoteImageValue(note) {
  if (!note || typeof note !== "object") return null;
  for (const field of IMAGE_FIELDS) {
    const value = note[field];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

function isDataImage(value) {
  return (
    typeof value === "string" &&
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(
      value.trim()
    )
  );
}

function isHttpUrl(value) {
  return (
    typeof value === "string" &&
    /^https?:\/\//i.test(value.trim())
  );
}

function isBlobUrl(value) {
  return (
    typeof value === "string" &&
    /^blob:/i.test(value.trim())
  );
}

function looksLikeBase64(value) {
  if (typeof value !== "string") return false;
  const normalized = value.replace(/\s+/g, "").trim();
  if (normalized.length < 32) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(normalized);
}

function base64ToDataUrl(value, mimeType = "image/jpeg") {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, "").trim();
  if (!looksLikeBase64(normalized)) return null;
  return `data:${mimeType};base64,${normalized}`;
}

function arrayBufferToDataUrl(data, mimeType = "image/jpeg") {
  try {
    if (!Array.isArray(data) || data.length === 0) return null;
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

function getSafeImageUrl(value, note) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (
    isDataImage(trimmed) ||
    isHttpUrl(trimmed) ||
    isBlobUrl(trimmed)
  ) {
    return trimmed;
  }
  if (looksLikeBase64(trimmed)) {
    return base64ToDataUrl(
      trimmed,
      note?.imageMimeType || "image/jpeg"
    );
  }
  if (trimmed.startsWith("/")) return trimmed;
  return null;
}

function NoteThumbnail({ note }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;
    const value = getNoteImageValue(note);

    if (!value) {
      setSrc(null);
      return;
    }

    if (
      typeof File !== "undefined" &&
      value instanceof File
    ) {
      objectUrl = URL.createObjectURL(value);
      if (!cancelled) setSrc(objectUrl);
      return () => {
        cancelled = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    if (
      typeof Blob !== "undefined" &&
      value instanceof Blob
    ) {
      objectUrl = URL.createObjectURL(value);
      if (!cancelled) setSrc(objectUrl);
      return () => {
        cancelled = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    if (
      typeof value === "object" &&
      value !== null
    ) {
      if (
        value.type === "Buffer" &&
        Array.isArray(value.data)
      ) {
        const result = arrayBufferToDataUrl(
          value.data,
          value.mimeType ||
            value.contentType ||
            note?.imageMimeType ||
            "image/jpeg"
        );
        if (!cancelled) setSrc(result);
        return;
      }

      if (Array.isArray(value.data)) {
        const result = arrayBufferToDataUrl(
          value.data,
          value.mimeType ||
            value.contentType ||
            note?.imageMimeType ||
            "image/jpeg"
        );
        if (!cancelled) setSrc(result);
        return;
      }

      if (typeof value.url === "string") {
        if (!cancelled)
          setSrc(getSafeImageUrl(value.url, note));
        return;
      }

      if (typeof value.href === "string") {
        if (!cancelled)
          setSrc(getSafeImageUrl(value.href, note));
        return;
      }

      setSrc(null);
      return;
    }

    if (typeof value === "string") {
      if (!cancelled)
        setSrc(getSafeImageUrl(value, note));
      return;
    }

    setSrc(null);
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [note]);

  if (!src) return null;

  return (
    <div
      className="latest-note-image"
      onClick={(event) => event.stopPropagation()}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={(event) => {
          const wrapper =
            event.currentTarget.parentElement;
          if (wrapper) wrapper.style.display = "none";
        }}
      />
    </div>
  );
}

function activityTime(dateValue) {
  if (!dateValue) return "Recently";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { light } = useTheme();
  const { notes, setNotes } = useNotes();
  const rootRef = useRef(null);
  const off = useSidebarOffset(rootRef);

  const [tab, setTab] = useState("All");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("latest");
  const [sm, setSm] = useState(false);

  const totalNotes = notes.length;
  const pinnedNotes = notes.filter(
    (note) => note.pinned && note.status === "active"
  ).length;
  const archivedNotes = notes.filter(
    (note) => note.status === "archived"
  ).length;
  const trashNotes = notes.filter(
    (note) => note.status === "trash"
  ).length;

  const STATS = [
    [
      "Total Notes",
      totalNotes,
      "Live count",
      FileText,
      "52,211,153",
    ],
    [
      "Pinned Notes",
      pinnedNotes,
      "Live count",
      Pin,
      "139,92,246",
    ],
    [
      "Archived Notes",
      archivedNotes,
      "Live count",
      Archive,
      "245,158,11",
    ],
    [
      "Trash Notes",
      trashNotes,
      "Live count",
      Trash2,
      "244,63,94",
    ],
  ];

  const shown = useMemo(() => {
    let list = [];
    if (tab === "All") {
      list = notes.filter(
        (n) => n.status === "active"
      );
    } else if (tab === "Pinned") {
      list = notes.filter(
        (n) => n.pinned && n.status === "active"
      );
    } else if (tab === "Archived") {
      list = notes.filter(
        (n) => n.status === "archived"
      );
    } else if (tab === "Trash") {
      list = notes.filter(
        (n) => n.status === "trash"
      );
    }

    return [...list].sort((a, b) => {
      if (sort === "az") {
        return a.title.localeCompare(b.title);
      }
      const dateA = new Date(
        a.updatedAt || a.date || 0
      );
      const dateB = new Date(
        b.updatedAt || b.date || 0
      );
      if (sort === "oldest") {
        return dateA - dateB;
      }
      return dateB - dateA;
    });
  }, [notes, tab, sort]);

  const latestSix = useMemo(() => {
    return [...shown]
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt ||
            a.createdAt ||
            a.date ||
            0
        );
        const dateB = new Date(
          b.updatedAt ||
            b.createdAt ||
            b.date ||
            0
        );
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [shown]);

  const recentActivity = useMemo(() => {
    return [...notes]
      .filter(
        (note) =>
          note &&
          (note.updatedAt || note.createdAt)
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt || a.createdAt || 0
        );
        const dateB = new Date(
          b.updatedAt || b.createdAt || 0
        );
        return dateB - dateA;
      })
      .slice(0, 4)
      .map((note) => {
        const updated = note.updatedAt
          ? new Date(note.updatedAt)
          : null;
        const created = note.createdAt
          ? new Date(note.createdAt)
          : null;
        const activityDate =
          updated &&
          !Number.isNaN(updated.getTime())
            ? updated
            : created;

        let Icon = Pencil;
        let action = "You updated a note";

        if (note.status === "trash") {
          Icon = Trash2;
          action = "Note is in trash";
        } else if (note.status === "archived") {
          Icon = Archive;
          action = "Note was archived";
        } else if (note.pinned) {
          Icon = Pin;
          action = "You pinned a note";
        } else if (
          created &&
          updated &&
          Math.abs(
            updated.getTime() -
              created.getTime()
          ) < 2000
        ) {
          Icon = Plus;
          action = "You created a new note";
        }

        return {
          note,
          Icon,
          action,
          date: activityDate,
        };
      });
  }, [notes]);

  const spot = (e) => {
    const b =
      e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--mx",
      e.clientX - b.left + "px"
    );
    e.currentTarget.style.setProperty(
      "--my",
      e.clientY - b.top + "px"
    );
  };

  const togglePin = (id) => {
    setNotes((ns) =>
      ns.map((n) =>
        n.id === id
          ? { ...n, pinned: !n.pinned }
          : n
      )
    );
  };

  const qa = [
    [
      Plus,
      "New Note",
      "52,211,153",
      () => navigate("/notes/new"),
    ],
    [
      ImageIcon,
      "Upload Image",
      "45,170,160",
      () => navigate("/notes/new"),
    ],
    [
      Search,
      "Search Notes",
      "99,102,241",
      () => navigate("/notes"),
    ],
    [
      Archive,
      "View Archive",
      "217,119,6",
      () => navigate("/archive"),
    ],
  ];

  return (
    <div
      ref={rootRef}
      className={
        "nh" + (light ? " light" : "")
      }
      style={{
        paddingLeft: off.left,
        paddingTop: off.top,
      }}
    >
      <style>{CSS}</style>

      <div className="orb o1" />
      <div className="orb o2" />

      <div className="main">
        <div className="body">
          <section>
            <div className="hello in">
              <div>
                <h1>
                  Good Morning,{" "}
                  <em>Vivek</em>{" "}
                  <span className="wave">👋</span>
                </h1>
                <p className="sub">
                  Here's what's happening with your notes today.
                </p>
              </div>

              <button
                className="cta"
                onClick={() =>
                  navigate("/notes/new")
                }
              >
                <Plus size={18} />
                Create Note
              </button>
            </div>

            <div className="stats">
              {STATS.map(
                (
                  [t, n, sub, I, r],
                  i
                ) => (
                  <Stat
                    key={t}
                    t={t}
                    n={n}
                    sub={sub}
                    Icon={I}
                    r={r}
                    d={
                      0.15 + i * 0.08
                    }
                  />
                )
              )}
            </div>

            <div
              className="panel fillp in"
              style={{
                "--d": ".4s",
              }}
            >
              <div className="ph">
                <h2>My Notes</h2>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <div className="sortw">
                    <button
                      className="sort"
                      onClick={() =>
                        setSm((v) => !v)
                      }
                      onBlur={() =>
                        setTimeout(
                          () =>
                            setSm(false),
                          120
                        )
                      }
                      aria-haspopup="listbox"
                      aria-expanded={sm}
                    >
                      <span>
                        Sort by:{" "}
                        <b>
                          {
                            {
                              latest: "Latest",
                              oldest: "Oldest",
                              az: "A to Z",
                            }[sort]
                          }
                        </b>
                      </span>

                      <ChevronDown
                        size={14}
                      />
                    </button>

                    {sm && (
                      <div
                        className="smenu"
                        role="listbox"
                      >
                        {[
                          ["latest", "Latest"],
                          ["oldest", "Oldest"],
                          ["az", "A to Z"],
                        ].map(([k, l]) => (
                          <button
                            key={k}
                            className={
                              sort === k
                                ? "on"
                                : ""
                            }
                            onMouseDown={() => {
                              setSort(k);
                              setSm(false);
                            }}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="seg">
                    <button
                      className={
                        view === "grid"
                          ? "on"
                          : ""
                      }
                      onClick={() =>
                        setView("grid")
                      }
                      aria-label="Grid view"
                    >
                      <LayoutGrid
                        size={16}
                      />
                    </button>

                    <button
                      className={
                        view === "list"
                          ? "on"
                          : ""
                      }
                      onClick={() =>
                        setView("list")
                      }
                      aria-label="List view"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pills">
                {[
                  "All",
                  "Pinned",
                  "Archived",
                  "Trash",
                ].map((t) => (
                  <button
                    key={t}
                    className={
                      "pill" +
                      (tab === t ? " on" : "")
                    }
                    onClick={() =>
                      setTab(t)
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div
                className={
                  "grid" +
                  (view === "list"
                    ? " list"
                    : "")
                }
              >
                {latestSix.length ===
                  0 && (
                  <div className="empty">
                    No notes in{" "}
                    {tab.toLowerCase()}{" "}
                    yet.
                  </div>
                )}

                {latestSix.map(
                  (n, i) => (
                    <article
                      key={n.id}
                      className={
                        "card in latest-note-click" +
                        (i === 0 &&
                        tab === "All"
                          ? " hot"
                          : "")
                      }
                      style={{
                        "--d":
                          0.5 +
                          i * 0.06 +
                          "s",
                      }}
                      onMouseMove={spot}
                      onClick={() =>
                        navigate(
                          `/notes/${n.id}`
                        )
                      }
                    >
                      <div>
                        <div className="latest-note-row">
                          <div className="latest-note-main">
                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                alignItems:
                                  "center",
                              }}
                            >
                              <h3>
                                {n.title}
                              </h3>

                              <button
                                className={
                                  "pinb" +
                                  (n.pinned
                                    ? " on"
                                    : "")
                                }
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();
                                  togglePin(
                                    n.id
                                  );
                                }}
                                aria-label={
                                  n.pinned
                                    ? "Unpin"
                                    : "Pin"
                                }
                              >
                                <Pin
                                  size={
                                    15
                                  }
                                />
                              </button>
                            </div>

                            <div className="chips">
                              {(
                                n.tags || []
                              ).map((t) => (
                                <span
                                  className="chip"
                                  key={t}
                                >
                                  {String(
                                    t
                                  ).startsWith(
                                    "#"
                                  )
                                    ? t
                                    : `#${t}`}
                                </span>
                              ))}
                            </div>

                            <p>
                              {n.content}
                            </p>
                          </div>

                          <NoteThumbnail
                            note={n}
                          />
                        </div>
                      </div>

                      <div className="cf">
                        <span>
                          <Calendar
                            size={
                              13
                            }
                          />
                          {formatNoteDate(
                            n
                          )}
                        </span>

                        <MoreVertical
                          size={
                            15
                          }
                          style={{
                            cursor:
                              "pointer",
                          }}
                        />
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>
          </section>

          <aside className="rail">
            <div
              className="panel in"
              style={{
                "--d": ".2s",
              }}
            >
              <h3>Quick Actions</h3>

              <div className="qa">
                {qa.map(
                  ([
                    I,
                    t,
                    r,
                    go,
                  ]) => (
                    <button
                      className="qb"
                      key={t}
                      style={{
                        "--r": r,
                      }}
                      onClick={go}
                    >
                      <div className="qi">
                        <I
                          size={
                            17
                          }
                        />
                      </div>
                      {t}
                    </button>
                  )
                )}
              </div>
            </div>

            <div
              className="panel grow in"
              style={{
                "--d": ".3s",
              }}
            >
              <h3>
                <Clock
                  size={17}
                  color="#8e9b98"
                />
                Recent Activity
                <span className="va">
                  View All
                </span>
              </h3>

              <div className="evs activity-real">
                {recentActivity.length ===
                0 ? (
                  <div
                    style={{
                      color:
                        "var(--mu)",
                      fontSize: 12,
                      padding:
                        "10px 0",
                    }}
                  >
                    No recent activity yet.
                  </div>
                ) : (
                  recentActivity.map(
                    ({
                      note,
                      Icon,
                      action,
                      date,
                    }) => (
                      <div
                        className="ev"
                        key={
                          note.id
                        }
                        onClick={() =>
                          navigate(
                            `/notes/${note.id}`
                          )
                        }
                      >
                        <div
                          className="qi"
                          style={{
                            "--r":
                              note.status ===
                              "trash"
                                ? "244,63,94"
                                : note.status ===
                                  "archived"
                                ? "217,119,6"
                                : note.pinned
                                ? "139,92,246"
                                : "52,211,153",
                          }}
                        >
                          <Icon
                            size={16}
                          />
                        </div>

                        <div>
                          <p className="ev-title">
                            {action}
                          </p>
                          <small>
                            {note.title ||
                              "Untitled note"}
                          </small>
                        </div>

                        <time>
                          {activityTime(
                            date
                          )}
                        </time>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            <div
              className="panel in"
              style={{
                "--d": ".4s",
              }}
            >
              <h3>
                <TrendingUp
                  size={17}
                  color="#8e9b98"
                />
                Your Progress
              </h3>

              <div className="track">
                <i />
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  fontSize: 11.5,
                  color:
                    "var(--mu)",
                }}
              >
                <span>
                  8/12 notes this week
                </span>
                <span
                  style={{
                    color:
                      "var(--ac)",
                    fontWeight:
                      600,
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 2,
                  }}
                >
                  <ArrowUp
                    size={11}
                  />
                  33%
                </span>
              </div>
            </div>
          </aside>

          <footer
            className="foot in"
            style={{
              "--d": ".9s",
            }}
          >
            <Leaf size={28} />
            <span>NotesHub</span>
            <i>•</i>
            <span>Organize</span>
            <i>•</i>
            <span>Focus</span>
            <i>•</i>
            <span>Achieve</span>
            <i>•</i>
            <span
              style={{
                color:
                  "var(--ac)",
                fontWeight:
                  "600",
              }}
            >
              Made with 💖 by Vivek Kumar 😘
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}