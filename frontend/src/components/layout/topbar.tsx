export default function Topbar() {
  return (
    <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="glass rounded-2xl px-4 py-2 text-sm text-zinc-300">
          Balance: $120
        </div>

        <div className="h-10 w-10 rounded-2xl bg-indigo-500 glow" />
      </div>
    </header>
  );
}