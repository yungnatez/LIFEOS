export default function Footer() {
  return (
    <footer className="max-w-[1440px] mx-auto px-6 py-8 border-t border-[#1E2D45]/50 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <p className="text-[10px] font-extrabold tracking-widest uppercase text-[#64748b]">
          System Entropy: <span className="text-[#10b981]">LOW</span>
        </p>
        <span className="size-1 bg-[#1E2D45] rounded-full" />
        <p className="text-[10px] font-extrabold tracking-widest uppercase text-[#64748b]">Uptime: 242:14:02</p>
      </div>
      <p className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-[#64748b]/40">
        Continuity protocol established
      </p>
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-extrabold text-[#64748b]">LIFEOS v2.4.0</p>
        <div className="bg-[#3b86f7]/20 px-2 py-0.5 rounded-lg">
          <p className="text-[8px] font-extrabold text-[#3b86f7]">ENCRYPTED</p>
        </div>
      </div>
    </footer>
  );
}
