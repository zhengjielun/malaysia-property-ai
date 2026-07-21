import Sidebar from "./sidebar";
import { Header } from "./components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f7f9fd]"><Sidebar /><div className="min-h-screen lg:pl-64"><Header />{children}</div></div>;
}
