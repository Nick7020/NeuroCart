import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const notify = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000)
  }, [])

  const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id))

  return (
    <NotificationContext.Provider value={{ notify, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => dismiss(n.id)}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 border ${
              n.type === 'success' ? 'bg-green-900/80 border-green-700 text-green-100' :
              n.type === 'error'   ? 'bg-red-900/80 border-red-700 text-red-100' :
              n.type === 'warning' ? 'bg-yellow-900/80 border-yellow-700 text-yellow-100' :
              'bg-indigo-900/80 border-indigo-700 text-indigo-100'
            }`}
          >
            <span className="text-sm">{n.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
