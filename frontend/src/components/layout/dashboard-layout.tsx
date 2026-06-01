import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex text-white">
      <Sidebar />

      <div className="flex-1 p-4">
        <div className="glass rounded-3xl overflow-hidden min-h-[95vh]">
          <Topbar />

          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}