import { Pin, Calendar, MoreHorizontal } from "lucide-react";

const notes = [
  {
    id: 1,
    title: "AI Project Ideas",
    category: "Work",
    color: "bg-teal-500/20 text-teal-300",
    content:
      "Build an Automated Data Quality & Data Observability Platform using React, FastAPI and Neon PostgreSQL.",
    date: "29 Sep 2026",
    pinned: true,
  },
  {
    id: 2,
    title: "Meeting Notes",
    category: "Team",
    color: "bg-violet-500/20 text-violet-300",
    content:
      "Discuss database schema, authentication flow, and deployment strategy for NotesHub.",
    date: "28 Sep 2026",
    pinned: false,
  },
  {
    id: 3,
    title: "React Snippets",
    category: "Code",
    color: "bg-cyan-500/20 text-cyan-300",
    content:
      "Reusable custom hooks, protected routes, Axios interceptors and component architecture.",
    date: "27 Sep 2026",
    pinned: true,
  },
  {
    id: 4,
    title: "Daily Goals",
    category: "Personal",
    color: "bg-orange-500/20 text-orange-300",
    content:
      "Complete dashboard UI, connect Neon DB, implement authentication and reset password.",
    date: "26 Sep 2026",
    pinned: false,
  },
];

export default function NotesGrid() {
  return (
    <section className="bg-[#111827] border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Recent Notes</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Your latest created and updated notes
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 font-medium transition">
          View All
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group rounded-2xl border border-zinc-700 bg-[#0F172A] p-5 hover:border-teal-500 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${note.color}`}
              >
                {note.category}
              </span>

              <div className="flex items-center gap-2">
                {note.pinned && (
                  <Pin size={15} className="text-teal-400 fill-teal-400" />
                )}

                <MoreHorizontal
                  size={18}
                  className="text-zinc-500 opacity-0 group-hover:opacity-100 transition"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{note.title}</h3>

            <p className="text-zinc-400 text-sm leading-6 mb-5 line-clamp-3">
              {note.content}
            </p>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {note.date}
              </div>

              <span className="text-teal-400 font-medium">Updated</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}