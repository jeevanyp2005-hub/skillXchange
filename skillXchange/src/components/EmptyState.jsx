export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="border border-slate-200 bg-white p-8 rounded-xl text-center max-w-md mx-auto shadow-sm">
            {Icon && (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 mb-4">
                    <Icon className="w-5 h-5 text-slate-600" />
                </div>
            )}
            <h3 className="text-sm font-semibold text-slate-800 mb-1.5">{title}</h3>
            {description && (
                <p className="text-xs text-slate-600 max-w-xs mx-auto mb-4 leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}
