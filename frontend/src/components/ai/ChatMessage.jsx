import { motion } from 'framer-motion'

export function ChatMessage({ message }) {
  const isBot = message.role === 'bot'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0 mt-1"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#5b21b6)' }}>
          N
        </div>
      )}

      <div className={`max-w-[78%] ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
          style={isBot
            ? { background: '#f3f4f6', color: '#1f2937', borderBottomLeftRadius: 4 }
            : { background: 'linear-gradient(135deg,#7C3AED,#5b21b6)', color: '#fff', borderBottomRightRadius: 4 }
          }
        >
          {message.content}
        </div>
        <p className="text-[10px] text-gray-400 mt-1 px-1">{message.time}</p>
      </div>
    </motion.div>
  )
}
