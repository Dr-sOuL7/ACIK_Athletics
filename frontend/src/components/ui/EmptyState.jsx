import { cn } from "../../utils/cn";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-surface-elevated border-dashed bg-surface/50", className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mb-4 text-text-muted">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-text-muted max-w-sm mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}
