export const FormField = ({ label, value, onChange, required = false, type = "text" }: { label: string, value: string, onChange: (v: string) => void, required?: boolean, type?: string }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-500 transition-colors">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all shadow-sm"
    />
  </div>
);
