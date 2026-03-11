interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="text-sm font-bold text-[#f1f5f9]">{title}</p>
      <p className="text-xs text-[#64748b]">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-xs font-bold text-[#3b86f7] border border-[#3b86f7]/40 bg-[#3b86f7]/10 px-4 py-1.5 rounded-lg hover:bg-[#3b86f7]/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
