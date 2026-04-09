import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export const NotificationContext = createContext(null)

const STYLES = {
  success: { bg: '#f0fdf4', border: '#86efac', text: '#15803d', icon: <CheckCircle size={16} /> },
  error:   { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', icon: <XCircle size={16} /> },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: <AlertCircle size={16} /> },
  info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: <Info size={16} /> },
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const notify = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000)
  }, [])

  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <NotificationContext.Provider value={{ notify, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        <AnimatePresence>
          {notifications.map(n => {
            const s = STYLES[n.type] || STYLES.info
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                onClick={() => dismiss(n.id)}
                className="flex items-start gap-3 p-4 rounded-2xl shadow-lg cursor-pointer border"
                style={{ background: s.bg, borderColor: s.border }}>
                <span style={{ color: s.text, marginTop: 1 }}>{s.icon}</span>
                <span className="text-sm font-medium flex-1" style={{ color: s.text }}>{n.message}</span>
                <X size={14} style={{ color: s.text, opacity: 0.6 }} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
