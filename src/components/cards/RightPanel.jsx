import {
  Plus,
  Upload,
  Archive,
  Search,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

const activities = [
  { text: "Created AI Project note", time: "2 min ago" },
  { text: "Updated Meeting Notes", time: "18 min ago" },
  { text: "Pinned React Snippets", time: "1 hour ago" },
  { text: "Archived Daily Goals", time: "Yesterday" },
];

export default function RightPanel() {
  return (
    <div className="space-y-5">
      {/* Quick Actions */}
      <div className="bg-[#111827] border border-zinc-800 rounded-3xl p-5">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

        <div className="space-y-3">
          <Action icon={Plus} text="Create Note" />
          <Action icon={Upload} text="Upload Image" />
          <Action icon={Search} text="Search Notes" />
          <Action icon={Archive} text="View Archive" />
        </div>
      </div>

      {/* Activity */}
      <div className="bg-[#111827] border border-zinc-800 rounded-3xl p-5">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

        <div className="space-y-4">
          {activities.map((item) => (
            <div key={item.text} className="flex gap-3">
              <div className="mt-1">
                <CheckCircle2 size={18} className="text-teal-400" />
              </div>

              <div>
                <p className="text-sm">{item.text}</p>

                <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                  <Clock size={13} />
                  {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[#111827] border border-zinc-800 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-teal-400" />
          <h3 className="text-lg font-semibold">Storage Usage</h3>
        </div>

        <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full w-[72%] bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"></div>
        </div>

        <div className="flex justify-between mt-3 text-sm">
          <span className="text-zinc-400">720 MB</span>
          <span className="font-semibold text-teal-400">1 GB</span>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20">
          <p className="text-sm text-zinc-300">
            **72%** of your storage is used.
          </p>
        </div>
      </div>
    </div>
  );
}

function Action({ icon: Icon, text }) {
  return (
    <button className="w-full flex items-center gap-3 bg-[#0F172A] hover:bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 transition">
      <Icon size={18} className="text-teal-400" />
      <span className="text-sm">{text}</span>
    </button>
  );
}