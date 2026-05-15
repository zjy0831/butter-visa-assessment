import React from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard, 
  Building2, 
  Settings 
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export const Sidebar = () => {
  const location = useLocation();

  const NavItem = ({ icon, label, to, activeMatch, badge }: { icon: React.ReactNode, label: string, to: string, activeMatch?: string, badge?: string }) => {
    const isActive = activeMatch ? location.pathname.startsWith(activeMatch) : location.pathname === to;
    
    return (
      <Link to={to} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-blue-50 text-brand-blue font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        {badge && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{badge}</span>}
      </Link>
    );
  };

  return (
    <div className="w-60 h-screen fixed left-0 top-0 bg-slate-50 border-r border-slate-200 flex flex-col z-20">
      <div className="p-4 bg-brand-yellow flex items-center gap-2 h-[60px]">
        <div className="w-8 h-8 flex items-center justify-center bg-brand-blue rounded shadow-sm">
          <span className="text-white font-bold text-xl italic">B</span>
        </div>
        <span className="text-brand-blue font-black tracking-tighter text-2xl">BUTTER</span>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-3">
          <NavItem icon={<LayoutDashboard size={18} />} label="Home" to="/" />
          <NavItem icon={<Users size={18} />} label="ChatRooms" to="/chat" />
          <NavItem icon={<CheckCircle2 size={18} />} label="Approvals" to="/approvals" />
          <NavItem icon={<Clock size={18} />} label="Tasks" to="/tasks" />
          <NavItem icon={<FileText size={18} />} label="Requests" to="/requests" activeMatch="/requests" />
          <NavItem icon={<Users size={18} />} label="People" to="/people" />
          <NavItem icon={<LayoutDashboard size={18} />} label="Projects" to="/projects" />
          <NavItem icon={<Building2 size={18} />} label="Service Bundles" to="/services" />
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 mt-auto">
        <nav className="space-y-1">
          <NavItem icon={<Settings size={18} />} label="Settings" to="/settings" />
        </nav>
      </div>
    </div>
  );
};
