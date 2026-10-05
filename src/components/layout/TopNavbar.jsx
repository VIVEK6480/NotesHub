import { Search, Bell, Moon, Plus } from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="flex items-center justify-between mb-8">

      {/* Left */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight">
          Good Morning 👋
        </h2>
        <p className="text-zinc-400 mt-2">
          Welcome back! Manage your notes efficiently.
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="hidden lg:flex items-center gap-3 bg-[#111827] border border-zinc-700 rounded-xl px-4 py-3 w-[320px]">
          <Search size={18} className="text-zinc-500" />
          <input
            type="text"
            placeholder="Search notes..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-zinc-500"
          />
        </div>

        {/* Add Button */}
        <button className="w-11 h-11 rounded-xl bg-teal-500 hover:bg-teal-400 flex items-center justify-center transition">
          <Plus size={20} />
        </button>

        {/* Dark Mode */}
        <button className="w-11 h-11 rounded-xl bg-[#111827] border border-zinc-700 flex items-center justify-center hover:border-teal-500 transition">
          <Moon size={18} />
        </button>

        {/* Notification */}
        <button className="relative w-11 h-11 rounded-xl bg-[#111827] border border-zinc-700 flex items-center justify-center hover:border-teal-500 transition">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-[#111827] border border-zinc-700 rounded-xl px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center font-bold">
            V
          </div>

          <div className="hidden xl:block">
            <h4 className="text-sm font-semibold">Vivek</h4>
            <p className="text-xs text-zinc-400">Developer</p>
          </div>
        </div>

      </div>
    </header>
  );
}