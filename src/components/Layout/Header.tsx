import { useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSD = location.pathname.startsWith('/sd');

  return (
    <header className="h-[60px] bg-brand-blue text-white flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-tight">Visa Assessment Pre-check</h1>
        <div className="h-4 w-px bg-white/20"></div>
        <div className="flex gap-2 text-xs text-white/70 font-medium">
          <span className="px-2 py-0.5 bg-white/10 rounded">IRP-331</span>
          <span>EOR Onboarding</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-black/10 p-1 rounded-lg border border-white/10">
        <button 
          onClick={() => navigate('/requests')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${!isSD ? 'bg-white text-brand-blue shadow-sm' : 'text-white/60 hover:text-white'}`}
        >
          Client View
        </button>
        <button 
          onClick={() => navigate('/sd/review')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${isSD ? 'bg-white text-brand-blue shadow-sm' : 'text-white/60 hover:text-white'}`}
        >
          SD View
        </button>
      </div>
    </header>
  );
};
