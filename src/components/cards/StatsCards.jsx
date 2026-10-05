import {
  FileText,
  Pin,
  Archive,
  Trash2,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Total Notes",
    value: "128",
    change: "+12%",
    icon: FileText,
    color: "from-teal-500 to-cyan-500",
  },
  {
    title: "Pinned",
    value: "24",
    change: "+4%",
    icon: Pin,
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Archived",
    value: "37",
    change: "+8%",
    icon: Archive,
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "Deleted",
    value: "09",
    change: "-2%",
    icon: Trash2,
    color: "from-rose-500 to-pink-600",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#111827] p-5 hover:border-teal-500/40 transition-all duration-300 group"
          >
            <div
              className={`absolute inset-0 opacity-10 bg-gradient-to-br ${item.color}`}
            />

            <div className="relative flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
              >
                <Icon size={22} />
              </div>

              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <TrendingUp size={15} />
                {item.change}
              </div>
            </div>

            <div className="relative mt-5">
              <p className="text-zinc-400 text-sm">{item.title}</p>

              <h2 className="text-4xl font-bold mt-1">{item.value}</h2>
            </div>
          </div>
        );
      })}
    </div>
  );
}