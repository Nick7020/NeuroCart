export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      {description && <p className="text-gray-400 mt-2 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
