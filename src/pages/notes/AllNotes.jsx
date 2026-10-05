import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Filter,
  LayoutGrid,
  List,
  Pin,
  Plus,
  RotateCcw,
  Search,
  ArrowUpDown,
  Trash2,
  X,
  Eraser,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useNotes } from "../../context/NotesContext";

/* =========================================================
   SORTS
========================================================= */

const SORTS = [
  {
    id: "latest",
    label: "Latest first",
  },
  {
    id: "oldest",
    label: "Oldest first",
  },
  {
    id: "az",
    label: "Title A to Z",
  },
  {
    id: "za",
    label: "Title Z to A",
  },
];

const FILTERS = [
  {
    id: "all",
    label: "All Notes",
  },
  {
    id: "pinned",
    label: "Pinned",
  },
  {
    id: "archived",
    label: "Archived",
  },
  {
    id: "trash",
    label: "Trash",
  },
];

/* =========================================================
   STYLES
========================================================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.an{
  --bg:#080b0d;
  --panel:#0f1519;
  --panel2:#141c21;
  --bd:rgba(255,255,255,.08);
  --bd2:rgba(255,255,255,.14);
  --tx:#f2f6f5;
  --mu:#8e9b98;
  --dim:#5f6c69;
  --ac:#6ee7b7;
  --ac2:#34d399;
  --on:#06281c;
  --danger:#fb7185;
  --sh:0 14px 40px rgba(0,0,0,.3);
  --orb:.45;

  position:relative;
  width:100%;
  min-width:0;
  min-height:100vh;

  padding:clamp(16px, 2vw, 28px);

  color:var(--tx);
  background:var(--bg);

  font-family:
    Inter,
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;

  overflow-x:hidden;

  transition:
    background .4s,
    color .4s;
}

.an.light{
  --bg:#eef4f1;
  --panel:#ffffff;
  --panel2:#f3f8f6;
  --bd:rgba(14,48,36,.1);
  --bd2:rgba(14,48,36,.18);
  --tx:#10211b;
  --mu:#566b63;
  --dim:#8a9c95;
  --ac:#0f9f6e;
  --ac2:#10b981;
  --on:#ffffff;
  --danger:#e11d48;
  --sh:0 14px 36px rgba(16,80,58,.1);
  --orb:.3;
}

.an *,
.an *::before,
.an *::after{
  box-sizing:border-box;
}

.an button{
  font-family:inherit;
  color:inherit;
}

.an :focus-visible{
  outline:2px solid var(--ac);
  outline-offset:2px;
}

.an .orb{
  position:fixed;
  border-radius:50%;
  filter:blur(100px);
  opacity:var(--orb);
  pointer-events:none;
  z-index:0;
  animation:drift 16s ease-in-out infinite alternate;
}

.an .o1{
  width:420px;
  height:420px;
  background:#10b981;
  top:-140px;
  left:25%;
}

.an .o2{
  width:360px;
  height:360px;
  background:#7c5cf0;
  bottom:-140px;
  right:-60px;
  animation-delay:-7s;
}

@keyframes drift{
  to{
    transform:
      translate(60px,40px)
      scale(1.15);
  }
}

@keyframes rise{
  from{
    opacity:0;
    transform:translateY(14px);
  }

  to{
    opacity:1;
    transform:none;
  }
}

@keyframes pop{
  from{
    opacity:0;
    transform:
      translateY(-6px)
      scale(.97);
  }

  to{
    opacity:1;
    transform:none;
  }
}

@keyframes shine{
  from{
    transform:
      translateX(-130%)
      skewX(-20deg);
  }

  to{
    transform:
      translateX(330%)
      skewX(-20deg);
  }
}

.an .in{
  animation:
    rise .55s cubic-bezier(.2,.7,.2,1)
    both;

  animation-delay:
    var(--d,0s);
}

.an .shell{
  position:relative;
  z-index:1;
  width:100%;
  max-width:none;
  margin:0;
}

.an .bar{
  border:1px solid var(--bd);
  background:var(--panel);
  border-radius:18px;
  padding:14px;
  box-shadow:var(--sh);
  margin-bottom:16px;
  position:relative;
  z-index:5;
}

.an .row{
  display:flex;
  align-items:center;
  gap:10px;
}

.an .sw{
  position:relative;
  flex:1;
  min-width:180px;
}

.an .sw>svg{
  position:absolute;
  left:14px;
  top:50%;
  transform:translateY(-50%);
  color:var(--mu);
  pointer-events:none;
}

.an .sw input{
  width:100%;
  height:46px;
  border-radius:12px;
  border:1px solid var(--bd);
  background:var(--panel2);
  color:var(--tx);
  padding:
    0
    52px
    0
    42px;

  font:inherit;
  font-size:14px;

  transition:all .25s;
}

.an .sw input::placeholder{
  color:var(--mu);
}

.an .sw input:focus{
  outline:none;
  border-color:var(--ac2);

  box-shadow:
    0 0 0 4px rgba(52,211,153,.12),
    0 0 22px rgba(52,211,153,.15);
}

.an .sw kbd{
  position:absolute;
  right:10px;
  top:50%;
  transform:translateY(-50%);

  font:inherit;
  font-size:11px;

  color:var(--dim);

  border:1px solid var(--bd2);
  border-radius:6px;

  padding:2px 7px;
}

.an .sw .x{
  position:absolute;
  right:8px;
  top:50%;

  transform:translateY(-50%);

  width:28px;
  height:28px;

  border:0;
  border-radius:8px;

  background:none;

  display:grid;
  place-items:center;

  color:var(--mu);
  cursor:pointer;
}

.an .tb{
  position:relative;

  height:46px;

  border-radius:12px;
  border:1px solid var(--bd);

  background:var(--panel2);
  color:var(--mu);

  padding:0 14px;

  display:flex;
  align-items:center;
  gap:8px;

  cursor:pointer;
  white-space:nowrap;

  transition:all .2s;

  font-size:14px;
}

.an .tb:hover,
.an .tb.on{
  color:var(--ac);

  border-color:
    rgba(52,211,153,.4);

  background:
    rgba(52,211,153,.06);
}

.an .tb em{
  font-style:normal;

  min-width:18px;
  height:18px;

  border-radius:9px;

  background:var(--ac2);
  color:var(--on);

  font-size:11px;
  font-weight:800;

  display:grid;
  place-items:center;

  padding:0 5px;
}

.an .dd{
  position:relative;
}

.an .menu{
  position:absolute;

  right:0;
  top:calc(100% + 8px);

  min-width:200px;

  padding:7px;

  border-radius:14px;

  background:var(--panel);
  border:1px solid var(--bd2);

  box-shadow:var(--sh);

  z-index:30;

  animation:
    pop .18s ease;
}

.an .menu button{
  width:100%;

  display:flex;
  align-items:center;
  justify-content:space-between;

  gap:10px;

  border:0;
  background:none;

  color:var(--mu);

  text-align:left;

  padding:10px;

  border-radius:9px;

  cursor:pointer;

  font-size:13.5px;
}

.an .menu button:hover,
.an .menu button.sel{
  background:
    rgba(52,211,153,.1);

  color:var(--ac);
}

.an .menu .lbl{
  padding:
    6px
    10px
    8px;

  font-size:12px;
  color:var(--dim);
  font-weight:600;
}

.an .seg{
  display:flex;
  gap:4px;

  padding:4px;

  border-radius:12px;

  background:var(--panel2);
  border:1px solid var(--bd);
}

.an .seg button{
  width:36px;
  height:36px;

  border:0;
  border-radius:8px;

  background:none;
  color:var(--mu);

  display:grid;
  place-items:center;

  cursor:pointer;

  transition:all .2s;
}

.an .seg button.on{
  background:
    rgba(52,211,153,.14);

  color:var(--ac);

  box-shadow:
    0 0 14px
    rgba(52,211,153,.2);
}

.an .pills{
  display:flex;
  gap:8px;

  margin-top:13px;

  overflow-x:auto;

  scrollbar-width:none;
}

.an .pills::-webkit-scrollbar{
  display:none;
}

.an .pill{
  display:flex;
  align-items:center;
  gap:8px;

  border:1px solid var(--bd);

  background:var(--panel2);
  color:var(--mu);

  border-radius:999px;

  padding:
    8px
    14px;

  font-size:13px;

  cursor:pointer;
  white-space:nowrap;

  transition:all .2s;
}

.an .pill:hover{
  color:var(--tx);

  border-color:
    rgba(52,211,153,.4);
}

.an .pill b{
  font-size:11px;
  font-weight:700;

  opacity:.7;

  font-variant-numeric:
    tabular-nums;
}

.an .pill.on{
  color:var(--on);

  border-color:transparent;

  font-weight:700;

  background:
    linear-gradient(
      135deg,
      #8ff0c9,
      #34d399
    );

  box-shadow:
    0 4px 16px
    rgba(52,211,153,.4);
}

.an .meta{
  display:flex;
  align-items:center;
  justify-content:space-between;

  gap:14px;

  margin:
    18px
    2px
    12px;

  font-size:13px;
  color:var(--mu);
}

.an .meta strong{
  color:var(--tx);
}

.an .meta .r{
  display:flex;
  align-items:center;
  gap:14px;
}

.an .sa{
  display:flex;
  align-items:center;

  gap:9px;

  border:0;
  background:none;

  color:var(--mu);

  cursor:pointer;

  font-size:13px;
}

.an .sa:hover{
  color:var(--tx);
}

.an .cb{
  width:19px;
  height:19px;

  border:
    1px solid
    var(--bd2);

  border-radius:6px;

  display:grid;
  place-items:center;

  background:var(--panel2);

  color:var(--on);

  transition:all .2s;

  flex-shrink:0;

  cursor:pointer;

  padding:0;
}

.an .cb.on{
  background:var(--ac2);

  border-color:var(--ac2);

  box-shadow:
    0 0 12px
    rgba(52,211,153,.5);
}

.an .bulk{
  position:sticky;

  top:12px;

  z-index:10;

  display:flex;
  align-items:center;

  gap:8px;

  padding:
    9px
    10px;

  margin-bottom:14px;

  border-radius:14px;

  border:
    1px solid
    rgba(52,211,153,.3);

  background:
    color-mix(
      in srgb,
      var(--panel) 88%,
      transparent
    );

  backdrop-filter:blur(14px);

  box-shadow:
    0 10px 30px
    rgba(16,185,129,.15);

  animation:
    pop .22s ease;
}

.an .bulk .bi{
  margin-right:auto;

  padding-left:6px;

  font-size:13px;

  color:var(--mu);
}

.an .bulk .bi strong{
  color:var(--ac);
}

.an .sb{
  height:36px;

  border:
    1px solid
    var(--bd);

  background:var(--panel2);
  color:var(--mu);

  border-radius:10px;

  padding:
    0
    12px;

  display:flex;
  align-items:center;

  gap:6px;

  cursor:pointer;

  font-size:13px;

  transition:all .2s;
}

.an .sb:hover{
  color:var(--tx);

  border-color:var(--bd2);
}

.an .sb.d:hover{
  color:var(--danger);

  border-color:
    var(--danger);
}

.an .cta{
  position:relative;

  overflow:hidden;

  display:flex;
  align-items:center;

  gap:8px;

  height:44px;

  padding:
    0
    20px;

  border:0;
  border-radius:13px;

  font-weight:700;
  font-size:14px;

  cursor:pointer;

  color:var(--on);

  background:
    linear-gradient(
      135deg,
      #8ff0c9,
      #34d399
    );

  box-shadow:
    0 8px 26px
    rgba(52,211,153,.35);

  transition:
    transform .2s,
    box-shadow .2s;

  white-space:nowrap;
}

.an .cta:hover{
  transform:translateY(-2px);

  box-shadow:
    0 12px 34px
    rgba(52,211,153,.5);
}

.an .cta::after{
  content:"";

  position:absolute;

  top:0;
  bottom:0;

  width:28px;

  background:
    rgba(255,255,255,.55);

  filter:blur(6px);

  animation:
    shine 3.6s
    ease-in-out
    infinite;
}

.an .grid{
  display:grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0,1fr)
    );

  gap:16px;

  width:100%;
}

.an .grid.list{
  grid-template-columns:1fr;
  gap:10px;
}

.an .card{
  --mx:50%;
  --my:50%;

  position:relative;

  overflow:hidden;

  display:flex;
  flex-direction:column;

  gap:12px;

  min-height:218px;
  min-width:0;

  padding:18px;

  border-radius:17px;

  border:
    1px solid
    var(--bd);

  background:
    linear-gradient(
      150deg,
      var(--panel),
      var(--panel2)
    );

  transition:
    transform .25s,
    border-color .25s,
    box-shadow .25s;
}

.an .card::before{
  content:"";

  position:absolute;
  inset:0;

  opacity:0;

  pointer-events:none;

  transition:opacity .3s;

  background:
    radial-gradient(
      280px circle at
      var(--mx)
      var(--my),
      rgba(52,211,153,.17),
      transparent 70%
    );
}

.an .card:hover{
  transform:translateY(-4px);

  border-color:
    rgba(52,211,153,.45);

  box-shadow:
    0 18px 40px
    rgba(16,185,129,.15);
}

.an .card:hover::before{
  opacity:1;
}

.an .card.sel{
  border-color:var(--ac2);

  box-shadow:
    0 0 0 1px
    rgba(52,211,153,.35),
    0 0 28px
    rgba(52,211,153,.18);
}

.an .card.pin::after{
  content:"";

  position:absolute;

  top:0;

  left:14%;
  right:14%;

  height:2px;

  border-radius:2px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--ac),
      transparent
    );
}

.an .top{
  display:flex;

  align-items:center;

  justify-content:space-between;
}

.an .ico{
  width:38px;
  height:38px;

  border-radius:11px;

  display:grid;
  place-items:center;

  color:var(--ac);

  background:
    rgba(52,211,153,.1);

  box-shadow:
    inset 0 0 0 1px
    rgba(52,211,153,.15);
}

.an .body{
  cursor:pointer;

  min-width:0;

  flex:1;

  outline-offset:6px;
}

.an .body-main{
  min-width:0;

  display:flex;

  align-items:flex-start;

  justify-content:space-between;

  gap:14px;
}

.an .body-content{
  min-width:0;

  flex:1;
}

/* =========================================================
   SAFE IMAGE THUMBNAIL
========================================================= */

.an .mini-image-wrap{
  width:82px;
  height:72px;

  flex:0 0 82px;

  overflow:hidden;

  border-radius:11px;

  border:
    1px solid
    var(--bd2);

  background:var(--panel2);

  box-shadow:
    0 8px 20px
    rgba(0,0,0,.18);

  position:relative;

  isolation:isolate;
}

.an .mini-image-wrap::after{
  content:"";

  position:absolute;

  inset:0;

  pointer-events:none;

  border-radius:inherit;

  box-shadow:
    inset 0 0 0 1px
    rgba(255,255,255,.05);
}

.an .mini-image{
  display:block;

  width:100%;
  height:100%;

  object-fit:cover;

  transition:
    transform .3s ease,
    filter .3s ease;
}

.an .body:hover .mini-image{
  transform:scale(1.06);
}

.an .tt{
  display:flex;

  align-items:center;

  gap:8px;

  margin:
    0
    0
    8px;

  font-size:16px;

  font-weight:700;

  letter-spacing:-.2px;
}

.an .tt svg{
  color:var(--ac);

  filter:
    drop-shadow(
      0 0 6px
      rgba(52,211,153,.7)
    );

  flex-shrink:0;
}

.an .ct{
  margin:0;

  color:var(--mu);

  font-size:13px;

  line-height:1.65;

  display:-webkit-box;

  -webkit-line-clamp:3;

  -webkit-box-orient:vertical;

  overflow:hidden;
}

.an .tags{
  display:flex;

  gap:6px;

  flex-wrap:wrap;

  margin-top:12px;
}

.an .tag{
  color:var(--ac);

  background:
    rgba(52,211,153,.08);

  border:
    1px solid
    rgba(52,211,153,.16);

  padding:
    3px
    9px;

  border-radius:999px;

  font-size:11px;
}

.an .foot{
  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:10px;

  padding-top:12px;

  border-top:
    1px solid
    var(--bd);
}

.an .dt{
  display:flex;

  align-items:center;

  gap:6px;

  color:var(--dim);

  font-size:11.5px;
}

.an .acts{
  display:flex;

  gap:4px;

  opacity:.55;

  transition:opacity .2s;
}

.an .card:hover .acts,
.an .card:focus-within .acts{
  opacity:1;
}

.an .ib{
  width:31px;
  height:31px;

  border:0;

  border-radius:8px;

  background:none;

  color:var(--mu);

  display:grid;

  place-items:center;

  cursor:pointer;

  transition:all .2s;
}

.an .ib:hover{
  background:var(--panel2);

  color:var(--tx);

  transform:scale(1.1);
}

.an .ib.on{
  color:var(--ac);
}

.an .ib.d:hover{
  color:var(--danger);
}

/* LIST VIEW */

.an .list .card{
  min-height:0;

  display:grid;

  grid-template-columns:
    auto
    minmax(0,1fr)
    auto;

  align-items:center;

  gap:16px;

  padding:
    14px
    18px;
}

.an .list .top{
  display:contents;
}

.an .list .ico{
  display:none;
}

.an .list .top .cb{
  order:-1;
}

.an .list .body-main{
  align-items:center;
}

.an .list .mini-image-wrap{
  width:70px;
  height:56px;

  flex-basis:70px;

  border-radius:9px;
}

.an .list .ct{
  -webkit-line-clamp:1;
}

.an .list .tt{
  margin-bottom:4px;
}

.an .list .tags{
  margin-top:8px;
}

.an .list .foot{
  border:0;

  padding:0;

  gap:18px;
}

.an .empty{
  border:
    1px dashed
    var(--bd2);

  background:var(--panel);

  border-radius:20px;

  padding:
    64px
    20px;

  text-align:center;
}

.an .empty .ei{
  width:64px;
  height:64px;

  border-radius:18px;

  margin:
    0
    auto
    18px;

  display:grid;
  place-items:center;

  color:var(--ac);

  background:
    rgba(52,211,153,.1);

  box-shadow:
    0 0 30px
    rgba(52,211,153,.18);
}

.an .empty h3{
  margin:
    0
    0
    8px;

  font-size:18px;
}

.an .empty p{
  margin:
    0
    auto
    20px;

  max-width:420px;

  color:var(--mu);

  font-size:13.5px;

  line-height:1.6;
}

.an .empty .cta{
  margin:
    0
    auto;
}

@media(max-width:1100px){

  .an .grid{
    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );
  }
}

@media(max-width:760px){

  .an{
    padding:
      16px
      12px;
  }

  .an .cta span{
    display:none;
  }

  .an .cta{
    width:44px;

    padding:0;

    justify-content:center;
  }

  .an .row{
    flex-wrap:wrap;
  }

  .an .sw{
    flex-basis:100%;
  }

  .an .tb{
    flex:1;

    justify-content:center;
  }

  .an .seg{
    display:none;
  }

  .an .grid{
    grid-template-columns:1fr;
  }

  .an .list .card{
    grid-template-columns:
      auto
      minmax(0,1fr);
  }

  .an .list .foot{
    grid-column:2;

    justify-content:
      space-between;
  }

  .an .bulk{
    flex-wrap:wrap;
  }

  .an .bulk .bi{
    flex-basis:100%;
  }

  .an .sb{
    flex:1;

    justify-content:center;
  }

  .an .mini-image-wrap{
    width:74px;
    height:66px;

    flex-basis:74px;
  }
}

@media(max-width:450px){

  .an .body-main{
    gap:10px;
  }

  .an .mini-image-wrap{
    width:64px;
    height:58px;

    flex-basis:64px;
  }
}

@media(prefers-reduced-motion:reduce){

  .an *,
  .an *::before,
  .an *::after{
    animation:none!important;
    transition:none!important;
  }
}
`;

/* =========================================================
   DATE HELPERS
========================================================= */

const fmtDate = (d) => {
  const date = new Date(d);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ago = (d) => {
  const date = new Date(d);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const m = Math.round(
    (Date.now() - date.getTime()) / 60000
  );

  if (m < 1) {
    return "Just now";
  }

  if (m < 60) {
    return `${m} min ago`;
  }

  const h = Math.round(m / 60);

  if (h < 24) {
    return `${h} hr ago`;
  }

  const days = Math.round(h / 24);

  return days < 30
    ? `${days} day${days > 1 ? "s" : ""} ago`
    : fmtDate(d);
};

/* =========================================================
   SAFE IMAGE HELPERS
========================================================= */

/*
  IMPORTANT FIX:

  The previous implementation treated EVERY string beginning
  with "/" as a URL.

  Base64 strings can also begin with "/" because "/" is a valid
  Base64 character.

  Example:

      /9j/4AAQSkZJRg...

  The browser could therefore interpret a huge Base64 image as:

      http://localhost:5173/9j/4AAQ...

  which can cause Vite:

      431 Request Header Fields Too Large

  This resolver carefully distinguishes:

  - data URLs
  - http/https URLs
  - blob URLs
  - normal small local paths
  - Base64
  - Buffer objects
*/

const BASE64_IMAGE_REGEX =
  /^[A-Za-z0-9+/]+={0,2}$/;

const isProbablyBase64 = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const clean = value.trim();

  if (!clean) {
    return false;
  }

  /*
    Base64 images are generally much longer than a normal
    frontend path.
  */
  if (clean.length < 80) {
    return false;
  }

  /*
    Base64 must not contain URL separators such as "://".
  */
  if (
    clean.includes("://") ||
    clean.includes("\\")
  ) {
    return false;
  }

  return BASE64_IMAGE_REGEX.test(clean);
};

const makeDataUrl = (
  base64,
  mimeType = "image/jpeg"
) => {
  if (!base64) {
    return null;
  }

  const clean = String(base64)
    .trim()
    .replace(/^["']|["']$/g, "");

  if (!clean) {
    return null;
  }

  /*
    If it is already a data URL, never wrap it again.
  */
  if (clean.startsWith("data:image/")) {
    return clean;
  }

  /*
    Remove accidental data-url prefix if backend contains
    it in a slightly different form.
  */
  const commaIndex = clean.indexOf(",");

  if (
    clean.startsWith("data:") &&
    commaIndex !== -1
  ) {
    return clean;
  }

  return `data:${mimeType};base64,${clean}`;
};

const bufferToDataUrl = (
  imageData,
  mimeType = "image/jpeg"
) => {
  try {
    if (
      !imageData ||
      !Array.isArray(imageData)
    ) {
      return null;
    }

    let binary = "";

    const chunkSize = 0x8000;

    for (
      let i = 0;
      i < imageData.length;
      i += chunkSize
    ) {
      const chunk = imageData.slice(
        i,
        i + chunkSize
      );

      binary += String.fromCharCode(
        ...chunk
      );
    }

    const base64 = btoa(binary);

    return makeDataUrl(
      base64,
      mimeType
    );
  } catch (error) {
    console.error(
      "Unable to convert image buffer:",
      error
    );

    return null;
  }
};

/*
  Only accept a local URL when it looks like an actual
  application path.

  This prevents a giant Base64 string beginning with "/"
  from becoming a localhost request.
*/
const isSafeLocalImagePath = (value) => {
  if (
    typeof value !== "string" ||
    !value.startsWith("/")
  ) {
    return false;
  }

  /*
    Very long "/" strings are almost certainly Base64
    rather than an actual route.
  */
  if (value.length > 2000) {
    return false;
  }

  /*
    Avoid accepting suspicious data as a path.
  */
  if (
    value.includes("data:image") ||
    value.includes("base64,")
  ) {
    return false;
  }

  return true;
};

const getNoteImageSrc = (note) => {
  if (!note) {
    return null;
  }

  /*
    Support the possible image fields used by the project.
  */
  const imageData =
    note.imageData ??
    note.imageUrl ??
    note.imageURL ??
    note.image ??
    note.image_url ??
    note.attachmentUrl ??
    note.attachmentURL ??
    note.coverImage ??
    note.coverImageUrl ??
    null;

  if (!imageData) {
    return null;
  }

  const mimeType =
    note.imageMimeType ||
    note.imageType ||
    note.mimeType ||
    "image/jpeg";

  /* -----------------------------------------------
     File
  ------------------------------------------------ */
  if (
    typeof File !== "undefined" &&
    imageData instanceof File
  ) {
    try {
      return URL.createObjectURL(
        imageData
      );
    } catch (error) {
      console.error(
        "Unable to create File URL:",
        error
      );

      return null;
    }
  }

  /* -----------------------------------------------
     Blob
  ------------------------------------------------ */
  if (
    typeof Blob !== "undefined" &&
    imageData instanceof Blob
  ) {
    try {
      return URL.createObjectURL(
        imageData
      );
    } catch (error) {
      console.error(
        "Unable to create Blob URL:",
        error
      );

      return null;
    }
  }

  /* -----------------------------------------------
     Buffer style object
  ------------------------------------------------ */
  if (
    typeof imageData === "object" &&
    imageData.type === "Buffer" &&
    Array.isArray(imageData.data)
  ) {
    return bufferToDataUrl(
      imageData.data,
      mimeType
    );
  }

  /* -----------------------------------------------
     Generic { data: [] }
  ------------------------------------------------ */
  if (
    typeof imageData === "object" &&
    Array.isArray(imageData.data)
  ) {
    return bufferToDataUrl(
      imageData.data,
      mimeType
    );
  }

  /* -----------------------------------------------
     Object with URL
  ------------------------------------------------ */
  if (
    typeof imageData === "object" &&
    typeof imageData.url === "string"
  ) {
    return getNoteImageSrc({
      ...note,
      imageData: imageData.url,
    });
  }

  /* -----------------------------------------------
     Object with href
  ------------------------------------------------ */
  if (
    typeof imageData === "object" &&
    typeof imageData.href === "string"
  ) {
    return getNoteImageSrc({
      ...note,
      imageData: imageData.href,
    });
  }

  /*
    Anything else that isn't a string is not directly
    renderable.
  */
  if (
    typeof imageData !== "string"
  ) {
    return null;
  }

  const value = imageData.trim();

  if (!value) {
    return null;
  }

  /* -----------------------------------------------
     Existing data URL
  ------------------------------------------------ */
  if (
    value.startsWith("data:image/")
  ) {
    return value;
  }

  /*
    Generic data URL.

    Example:
      data:image/png;base64,...
  */
  if (
    value.startsWith("data:")
  ) {
    return value;
  }

  /* -----------------------------------------------
     Blob URL
  ------------------------------------------------ */
  if (
    value.startsWith("blob:")
  ) {
    return value;
  }

  /* -----------------------------------------------
     HTTP / HTTPS URL
  ------------------------------------------------ */
  if (
    value.startsWith("https://") ||
    value.startsWith("http://")
  ) {
    return value;
  }

  /*
    IMPORTANT:

    Check Base64 BEFORE checking "/".

    This is the main fix for the 431 problem.
  */
  if (isProbablyBase64(value)) {
    return makeDataUrl(
      value,
      mimeType
    );
  }

  /*
    Safe small local public path.

    Example:
      /uploads/image.jpg
      /images/note.png

    A huge Base64 value beginning with "/" will NOT
    reach this branch.
  */
  if (
    isSafeLocalImagePath(value)
  ) {
    return value;
  }

  /*
    If the string isn't a URL/path but looks like Base64,
    convert it.

    This also handles shorter valid Base64 values.
  */
  if (
    BASE64_IMAGE_REGEX.test(value)
  ) {
    return makeDataUrl(
      value,
      mimeType
    );
  }

  return null;
};

/* =========================================================
   NOTE CARD
========================================================= */

function NoteCard({
  note,
  selected,
  index,
  onSelect,
  onOpen,
  onPin,
  onArchive,
  onTrash,
  onRestore,
  onDelete,
}) {
  const trash =
    note.status === "trash";

  const archived =
    note.status === "archived";

  const imageSrc =
    getNoteImageSrc(note);

  const spot = (e) => {
    const b =
      e.currentTarget.getBoundingClientRect();

    e.currentTarget.style.setProperty(
      "--mx",
      `${e.clientX - b.left}px`
    );

    e.currentTarget.style.setProperty(
      "--my",
      `${e.clientY - b.top}px`
    );
  };

  return (
    <article
      className={`card in${
        selected ? " sel" : ""
      }${
        note.pinned ? " pin" : ""
      }`}
      style={{
        "--d":
          `${Math.min(index, 12) * 0.045}s`,
      }}
      onMouseMove={spot}
    >
      <div className="top">
        <div className="ico">
          <FileText size={18} />
        </div>

        <button
          type="button"
          className={`cb${
            selected ? " on" : ""
          }`}
          onClick={() =>
            onSelect(note.id)
          }
          aria-label={`Select ${note.title}`}
          aria-pressed={selected}
        >
          {selected && (
            <Check
              size={12}
              strokeWidth={3}
            />
          )}
        </button>
      </div>

      <div
        className="body"
        role="button"
        tabIndex={0}
        onClick={() =>
          onOpen(note.id)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onOpen(note.id);
          }
        }}
      >
        <div className="body-main">
          <div className="body-content">
            <h3 className="tt">
              {note.title}

              {note.pinned && (
                <Pin
                  size={14}
                  fill="currentColor"
                />
              )}
            </h3>

            <p className="ct">
              {note.content}
            </p>

            <div className="tags">
              {(note.tags || []).map(
                (t) => (
                  <span
                    className="tag"
                    key={t}
                  >
                    #{t}
                  </span>
                )
              )}
            </div>
          </div>

          {imageSrc && (
            <div
              className="mini-image-wrap"
              title="Attached image"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <img
                className="mini-image"
                src={imageSrc}
                alt={`${note.title} attachment`}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const wrapper =
                    e.currentTarget
                      .parentElement;

                  if (wrapper) {
                    wrapper.style.display =
                      "none";
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="foot">
        <div
          className="dt"
          title={fmtDate(
            note.updatedAt
          )}
        >
          <Clock3 size={13} />
          {ago(note.updatedAt)}
        </div>

        <div className="acts">
          {!trash && !archived && (
            <button
              type="button"
              className={`ib${
                note.pinned
                  ? " on"
                  : ""
              }`}
              onClick={() =>
                onPin(note.id)
              }
              title={
                note.pinned
                  ? "Unpin"
                  : "Pin"
              }
              aria-label={
                note.pinned
                  ? "Unpin note"
                  : "Pin note"
              }
            >
              <Pin
                size={15}
                fill={
                  note.pinned
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          )}

          {trash || archived ? (
            <button
              type="button"
              className="ib"
              onClick={() =>
                onRestore(note.id)
              }
              title="Restore"
              aria-label="Restore note"
            >
              {trash ? (
                <RotateCcw size={15} />
              ) : (
                <ArchiveRestore
                  size={15}
                />
              )}
            </button>
          ) : (
            <button
              type="button"
              className="ib"
              onClick={() =>
                onArchive(note.id)
              }
              title="Archive"
              aria-label="Archive note"
            >
              <Archive size={15} />
            </button>
          )}

          {trash ? (
            <button
              type="button"
              className="ib d"
              onClick={() =>
                onDelete(note.id)
              }
              title="Delete forever"
              aria-label="Delete forever"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="ib d"
              onClick={() =>
                onTrash(note.id)
              }
              title="Move to trash"
              aria-label="Move to trash"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AllNotes() {
  const navigate = useNavigate();

  const { light } =
    useTheme();

  const {
    notes,
    togglePin,
    toggleArchive,
    toggleTrash,
    restoreNote,
    deleteNote,
  } = useNotes();

  const searchRef =
    useRef(null);

  const barRef =
    useRef(null);

  const [query, setQuery] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [sort, setSort] =
    useState("latest");

  const [view, setView] =
    useState("grid");

  const [tagFilter, setTagFilter] =
    useState([]);

  const [selected, setSelected] =
    useState([]);

  const [menu, setMenu] =
    useState(null);

  /* =======================================================
     KEYBOARD + OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const onKey = (e) => {
      const typing = [
        "INPUT",
        "TEXTAREA",
      ].includes(
        document.activeElement?.tagName
      );

      if (
        e.key === "/" &&
        !typing
      ) {
        e.preventDefault();

        searchRef.current?.focus();
      }

      if (
        e.key === "Escape"
      ) {
        setMenu(null);
        setSelected([]);
      }
    };

    const onClick = (e) => {
      if (
        barRef.current &&
        !barRef.current.contains(
          e.target
        )
      ) {
        setMenu(null);
      }
    };

    window.addEventListener(
      "keydown",
      onKey
    );

    document.addEventListener(
      "mousedown",
      onClick
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKey
      );

      document.removeEventListener(
        "mousedown",
        onClick
      );
    };
  }, []);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(
    () => ({
      all: notes.filter(
        (n) =>
          n.status === "active"
      ).length,

      pinned: notes.filter(
        (n) =>
          n.pinned &&
          n.status === "active"
      ).length,

      archived: notes.filter(
        (n) =>
          n.status === "archived"
      ).length,

      trash: notes.filter(
        (n) =>
          n.status === "trash"
      ).length,
    }),
    [notes]
  );

  /* =======================================================
     TAGS
  ======================================================= */

  const allTags = useMemo(
    () =>
      [
        ...new Set(
          notes.flatMap(
            (n) => n.tags || []
          )
        ),
      ].sort(),
    [notes]
  );

  /* =======================================================
     FILTER + SEARCH + SORT
  ======================================================= */

  const visible = useMemo(() => {
    const q =
      query
        .trim()
        .toLowerCase();

    const list = notes.filter(
      (n) => {
        const inTab =
          filter === "all"
            ? n.status ===
              "active"
            : filter ===
              "pinned"
            ? n.pinned &&
              n.status ===
                "active"
            : n.status ===
              filter;

        if (!inTab) {
          return false;
        }

        if (
          tagFilter.length &&
          !tagFilter.some(
            (t) =>
              (n.tags || [])
                .includes(t)
          )
        ) {
          return false;
        }

        return (
          !q ||
          (n.title || "")
            .toLowerCase()
            .includes(q) ||
          (n.content || "")
            .toLowerCase()
            .includes(q) ||
          (n.tags || []).some(
            (t) =>
              t
                .toLowerCase()
                .includes(q)
          )
        );
      }
    );

    return list.sort(
      (a, b) => {
        if (
          sort === "oldest"
        ) {
          return (
            new Date(
              a.updatedAt
            ) -
            new Date(
              b.updatedAt
            )
          );
        }

        if (sort === "az") {
          return (
            a.title || ""
          ).localeCompare(
            b.title || ""
          );
        }

        if (sort === "za") {
          return (
            b.title || ""
          ).localeCompare(
            a.title || ""
          );
        }

        return (
          new Date(
            b.updatedAt
          ) -
          new Date(
            a.updatedAt
          )
        );
      }
    );
  }, [
    notes,
    filter,
    query,
    sort,
    tagFilter,
  ]);

  const visibleIds =
    visible.map(
      (n) => n.id
    );

  const allSelected =
    visibleIds.length > 0 &&
    visibleIds.every(
      (id) =>
        selected.includes(id)
    );

  /* =======================================================
     SELECTION
  ======================================================= */

  const toggleSelect = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter(
            (x) => x !== id
          )
        : [
            ...current,
            id,
          ]
    );
  };

  const toggleAll = () => {
    setSelected((current) =>
      allSelected
        ? current.filter(
            (id) =>
              !visibleIds.includes(
                id
              )
          )
        : [
            ...new Set([
              ...current,
              ...visibleIds,
            ]),
          ]
    );
  };

  /* =======================================================
     PIN
  ======================================================= */

  const pin = async (id) => {
    const note = notes.find(
      (x) => String(x.id) === String(id)
    );

    if (!note) return;

    const nextPinned = !Boolean(note.pinned);

    try {
      await togglePin(id);

      toast.success(
        nextPinned ? "Note pinned" : "Note unpinned"
      );
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to update note."
      );
    }
  };

  /* =======================================================
     ARCHIVE
  ======================================================= */

  const archive = async (ids) => {
    const list = [].concat(ids);

    // Context performs the optimistic UI update immediately.
    setSelected([]);

    try {
      await Promise.all(
        list.map((id) => toggleArchive(id))
      );

      toast.success(
        list.length > 1
          ? `${list.length} notes archived`
          : "Note archived"
      );
    } catch (error) {
      console.error("Failed to archive notes:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to archive note."
      );
    }
  };

  /* =======================================================
     TRASH
  ======================================================= */

  const trash = async (ids) => {
    const list = [].concat(ids);

    // Context performs the optimistic UI update immediately.
    setSelected([]);

    try {
      await Promise.all(
        list.map((id) => toggleTrash(id))
      );

      toast.success(
        list.length > 1
          ? `${list.length} notes moved to trash`
          : "Moved to trash"
      );
    } catch (error) {
      console.error("Failed to move notes to trash:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to move note to trash."
      );
    }
  };

  /* =======================================================
     RESTORE
  ======================================================= */

  const restore = async (ids) => {
    const list = [].concat(ids);

    // Clear selection immediately. Context moves the note to
    // active status before the restore API request starts.
    setSelected([]);

    try {
      await Promise.all(
        list.map((id) => restoreNote(id))
      );

      toast.success(
        list.length > 1
          ? `${list.length} notes restored`
          : "Note restored"
      );
    } catch (error) {
      console.error("Failed to restore notes:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to restore note."
      );
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const remove = async (
    ids
  ) => {
    const list =
      [].concat(ids);

    if (
      !window.confirm(
        `Permanently delete ${
          list.length
        } note${
          list.length > 1
            ? "s"
            : ""
        }? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        list.map(
          (id) =>
            deleteNote(id)
        )
      );

      setSelected([]);

      toast.success(
        "Permanently deleted"
      );
    } catch (error) {
      console.error(
        "Failed to permanently delete notes:",
        error
      );

      toast.error(
        error?.response?.data
          ?.message ||
          "Unable to delete note."
      );
    }
  };

  /* =======================================================
     EMPTY TRASH
  ======================================================= */

  const emptyTrash = () => {
    const trashIds =
      notes
        .filter(
          (n) =>
            n.status ===
            "trash"
        )
        .map(
          (n) => n.id
        );

    if (!trashIds.length) {
      return;
    }

    remove(trashIds);
  };

  /* =======================================================
     TAG
  ======================================================= */

  const toggleTag = (tag) => {
    setTagFilter(
      (current) =>
        current.includes(tag)
          ? current.filter(
              (x) =>
                x !== tag
            )
          : [
              ...current,
              tag,
            ]
    );
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetAll = () => {
    setQuery("");
    setTagFilter([]);
  };

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  const emptyText =
    query ||
    tagFilter.length
      ? [
          "No matching notes",
          "Try a different keyword, title or tag.",
        ]
      : {
          trash: [
            "Trash is empty",
            "Deleted notes show up here until you remove them for good.",
          ],

          archived: [
            "No archived notes",
            "Archive notes you want to keep but don't need every day.",
          ],

          pinned: [
            "No pinned notes",
            "Pin important notes to find them quickly.",
          ],
        }[filter] || [
          "No notes yet",
          "Create your first note and start organizing your ideas.",
        ];

  const sortLabel =
    SORTS.find(
      (s) =>
        s.id === sort
    )?.label ||
    "Latest first";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>
        {CSS}
      </style>

      <main
        className={`an${
          light
            ? " light"
            : ""
        }`}
      >
        <div className="orb o1" />
        <div className="orb o2" />

        <div className="shell">

          {/* =============================================
              SEARCH / FILTER BAR
          ============================================= */}

          <section
            className="bar in"
            ref={barRef}
            style={{
              "--d": ".08s",
            }}
          >
            <div className="row">

              {/* SEARCH */}

              <div className="sw">
                <Search size={17} />

                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) =>
                    setQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search notes, content or tags..."
                  aria-label="Search notes"
                />

                {query ? (
                  <button
                    type="button"
                    className="x"
                    onClick={() =>
                      setQuery("")
                    }
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                ) : (
                  <kbd>/</kbd>
                )}
              </div>

              {/* SORT */}

              <div className="dd">
                <button
                  type="button"
                  className={`tb${
                    menu === "sort"
                      ? " on"
                      : ""
                  }`}
                  onClick={() =>
                    setMenu(
                      menu ===
                        "sort"
                        ? null
                        : "sort"
                    )
                  }
                  aria-expanded={
                    menu ===
                    "sort"
                  }
                >
                  <ArrowUpDown
                    size={16}
                  />

                  {sortLabel}

                  <ChevronDown
                    size={14}
                  />
                </button>

                {menu === "sort" && (
                  <div className="menu">
                    {SORTS.map(
                      (s) => (
                        <button
                          type="button"
                          key={s.id}
                          className={
                            sort ===
                            s.id
                              ? "sel"
                              : ""
                          }
                          onClick={() => {
                            setSort(
                              s.id
                            );

                            setMenu(
                              null
                            );
                          }}
                        >
                          {s.label}

                          {sort ===
                            s.id && (
                            <Check
                              size={
                                14
                              }
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* TAGS */}

              <div className="dd">
                <button
                  type="button"
                  className={`tb${
                    menu ===
                      "tags" ||
                    tagFilter.length
                      ? " on"
                      : ""
                  }`}
                  onClick={() =>
                    setMenu(
                      menu ===
                        "tags"
                        ? null
                        : "tags"
                    )
                  }
                  aria-expanded={
                    menu ===
                    "tags"
                  }
                >
                  <Filter size={16} />

                  Tags

                  {tagFilter.length >
                    0 && (
                    <em>
                      {
                        tagFilter.length
                      }
                    </em>
                  )}
                </button>

                {menu === "tags" && (
                  <div
                    className="menu"
                    style={{
                      maxHeight:300,
                      overflowY:
                        "auto",
                    }}
                  >
                    <div className="lbl">
                      Filter by tag
                    </div>

                    {allTags.map(
                      (tag) => (
                        <button
                          type="button"
                          key={tag}
                          className={
                            tagFilter.includes(
                              tag
                            )
                              ? "sel"
                              : ""
                          }
                          onClick={() =>
                            toggleTag(
                              tag
                            )
                          }
                        >
                          #{tag}

                          {tagFilter.includes(
                            tag
                          ) && (
                            <Check
                              size={
                                14
                              }
                            />
                          )}
                        </button>
                      )
                    )}

                    {tagFilter.length >
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setTagFilter(
                            []
                          )
                        }
                      >
                        Clear tags
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* VIEW */}

              <div className="seg">
                <button
                  type="button"
                  className={
                    view ===
                    "grid"
                      ? "on"
                      : ""
                  }
                  onClick={() =>
                    setView(
                      "grid"
                    )
                  }
                  aria-label="Grid view"
                >
                  <LayoutGrid
                    size={16}
                  />
                </button>

                <button
                  type="button"
                  className={
                    view ===
                    "list"
                      ? "on"
                      : ""
                  }
                  onClick={() =>
                    setView(
                      "list"
                    )
                  }
                  aria-label="List view"
                >
                  <List
                    size={17}
                  />
                </button>
              </div>
            </div>

            {/* FILTER PILLS */}

            <div
              className="pills"
              role="tablist"
            >
              {FILTERS.map(
                (f) => (
                  <button
                    type="button"
                    key={f.id}
                    role="tab"
                    aria-selected={
                      filter ===
                      f.id
                    }
                    className={`pill${
                      filter ===
                      f.id
                        ? " on"
                        : ""
                    }`}
                    onClick={() => {
                      setFilter(
                        f.id
                      );

                      setSelected(
                        []
                      );
                    }}
                  >
                    {f.label}

                    <b>
                      {
                        counts[
                          f.id
                        ]
                      }
                    </b>
                  </button>
                )
              )}
            </div>
          </section>

          {/* =============================================
              META
          ============================================= */}

          <div
            className="meta in"
            style={{
              "--d": ".14s",
            }}
          >
            <div>
              Showing{" "}
              <strong>
                {
                  visible.length
                }
              </strong>{" "}
              {visible.length ===
              1
                ? "note"
                : "notes"}

              {query && (
                <>
                  {" "}
                  for “{query}”
                </>
              )}
            </div>

            <div className="r">

              {filter ===
                "trash" &&
                counts.trash >
                  0 && (
                  <button
                    type="button"
                    className="sb d"
                    onClick={
                      emptyTrash
                    }
                  >
                    <Eraser
                      size={14}
                    />
                    Empty trash
                  </button>
                )}

              {visible.length >
                0 && (
                <button
                  type="button"
                  className="sa"
                  onClick={
                    toggleAll
                  }
                >
                  <span
                    className={`cb${
                      allSelected
                        ? " on"
                        : ""
                    }`}
                  >
                    {allSelected && (
                      <Check
                        size={12}
                        strokeWidth={
                          3
                        }
                      />
                    )}
                  </span>

                  Select all
                </button>
              )}
            </div>
          </div>

          {/* =============================================
              BULK ACTIONS
          ============================================= */}

          {selected.length >
            0 && (
            <div className="bulk">

              <div className="bi">
                <strong>
                  {
                    selected.length
                  }
                </strong>{" "}
                {selected.length ===
                1
                  ? "note"
                  : "notes"}{" "}
                selected
              </div>

              {filter ===
                "trash" ||
              filter ===
                "archived" ? (
                <button
                  type="button"
                  className="sb"
                  onClick={() =>
                    restore(
                      selected
                    )
                  }
                >
                  <RotateCcw
                    size={14}
                  />
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  className="sb"
                  onClick={() =>
                    archive(
                      selected
                    )
                  }
                >
                  <Archive
                    size={14}
                  />
                  Archive
                </button>
              )}

              {filter ===
                "trash" ? (
                <button
                  type="button"
                  className="sb d"
                  onClick={() =>
                    remove(
                      selected
                    )
                  }
                >
                  <Trash2
                    size={14}
                  />
                  Delete forever
                </button>
              ) : (
                <button
                  type="button"
                  className="sb d"
                  onClick={() =>
                    trash(
                      selected
                    )
                  }
                >
                  <Trash2
                    size={14}
                  />
                  Trash
                </button>
              )}

              <button
                type="button"
                className="sb"
                onClick={() =>
                  setSelected([])
                }
              >
                <X size={14} />
                Clear
              </button>
            </div>
          )}

          {/* =============================================
              NOTES
          ============================================= */}

          {visible.length >
          0 ? (
            <section
              className={`grid${
                view ===
                "list"
                  ? " list"
                  : ""
              }`}
            >
              {visible.map(
                (note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    index={index}
                    selected={selected.includes(
                      note.id
                    )}
                    onSelect={
                      toggleSelect
                    }
                    onOpen={(id) =>
                      navigate(
                        `/notes/${id}`
                      )
                    }
                    onPin={pin}
                    onArchive={
                      archive
                    }
                    onTrash={
                      trash
                    }
                    onRestore={
                      restore
                    }
                    onDelete={
                      remove
                    }
                  />
                )
              )}
            </section>
          ) : (
            <section className="empty in">

              <div className="ei">
                {query ? (
                  <Search size={26} />
                ) : filter ===
                  "trash" ? (
                  <Trash2 size={26} />
                ) : filter ===
                  "archived" ? (
                  <Archive
                    size={26}
                  />
                ) : (
                  <FileText
                    size={26}
                  />
                )}
              </div>

              <h3>
                {emptyText[0]}
              </h3>

              <p>
                {emptyText[1]}
              </p>

              {query ||
              tagFilter.length ? (
                <button
                  type="button"
                  className="sb"
                  style={{
                    margin:
                      "0 auto",
                  }}
                  onClick={
                    resetAll
                  }
                >
                  Clear search and
                  tags
                </button>
              ) : filter ===
                "all" ? (
                <button
                  type="button"
                  className="cta"
                  onClick={() =>
                    navigate(
                      "/notes/new"
                    )
                  }
                >
                  <Plus size={17} />
                  <span>
                    Create Note
                  </span>
                </button>
              ) : null}
            </section>
          )}
        </div>
      </main>
    </>
  );
}