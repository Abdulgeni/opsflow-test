export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-in bg-white rounded-lg border border-surface-container-highest shadow-card p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="font-serif text-xl text-primary">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}