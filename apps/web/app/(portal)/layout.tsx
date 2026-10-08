import { PortalSidebar } from "@/components/shell/portal-sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col md:flex-row bg-ivory">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}