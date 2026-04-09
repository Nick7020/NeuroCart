import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Sparkles } from 'lucide-react'
import { aiService } from '../../services'

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm NeuroBot 🤖 Ask me anything about products or deals!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { data } = await aiService.chat({ message: input, history: messages })
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, try again!' }])
    } finally { setLoading(false) }
  }

  return (
    <>
      <motion.button onClick={() => setOpen(!open)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1A3263, #547792)', boxShadow: '0 8px 24px rgba(26,50,99,0.35)' }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Bot size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            style={{ height: 480 }}>

            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #1A3263, #547792)' }}>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">NeuroBot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-white/70 text-xs">AI Assistant • Online</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                <Sparkles size={11} style={{ color: '#FFC570' }} />
                <span className="text-white/80 text-[10px] font-medium">AI</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5" style={{ background: '#1A3263' }}>
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' ? 'text-white rounded-br-sm' : 'bg-white text-gray-700 rounded-bl-sm border border-gray-100 shadow-sm'
                  }`} style={m.role === 'user' ? { background: '#1A3263' } : {}}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2" style={{ background: '#1A3263' }}>
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.span key={i} animate={{ y: [0,-5,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.15 }}
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full block" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 flex gap-2 bg-white">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about products..." className="input text-sm py-2" />
              <motion.button onClick={send} whileTap={{ scale: 0.9 }} disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                style={{ background: '#1A3263' }}>
                <Send size={15} className="text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
