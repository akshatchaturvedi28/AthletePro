import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
