import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Copy, Check, MessageCircle } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { QuickOptions } from './QuickOptions'
import { TicketForm } from './TicketForm'
import { getBotReply, getTimestamp, QUICK_OPTIONS } from '../../utils/chatbot'
import { aiService } from '../../services'

const CHAT_ID = 'NC-' + Math.random().toString(36).slice(2, 8).toUpperCase()

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'bot',
    content: "Hi there! 👋 I'm NeuroBot, your NeuroCart support assistant.\n\nHow can I help you today?",
    time: getTimestamp(),
  }
]

export function Chatbot() {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState(INITIAL_MESSAGES)
  const [input, setInput]         = useState('')
  const [typing, setTyping]       = useState(false)
  const [options, setOptions]     = useState(QUICK_OPTIONS)
  const [showTicket, setShowTicket] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [closed, setClosed]       = useState(false)
  const bottomRef                 = useRef(null)
  const inactivityRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing, showTicket])

  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityRef.current)
    if (closed) return
    inactivityRef.current = setTimeout(() => {
      addBotMessage("⏰ Seems like you are inactive. We are ending this chat...")
      setTimeout(() => {
        addBotMessage("🔒 This conversation is marked as Closed.")
        setClosed(true)
        setOptions([])
      }, 2000)
    }, 60000) // 60 seconds
  }, [closed])

  useEffect(() => {
    if (open) resetInactivity()
    return () => clearTimeout(inactivityRef.current)
  }, [open, resetInactivity])

  const addBotMessage = (content, opts = null, action = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'bot',
      content,
      time: getTimestamp(),
    }])
    if (opts) setOptions(opts)
    if (action === 'ticket') setShowTicket(true)
  }

  const sendMessage = (text) => {
    if (!text.trim() || closed) return
    resetInactivity()
    setShowTicket(false)
    setOptions([])

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: text,
      time: getTimestamp(),
    }])
    setInput('')

    // Typing indicator
    setTyping(true)

    aiService.chat({ message: text })
      .then(response => {
        setTyping(false)
        const replyText = response.data?.reply
        if (replyText) {
          addBotMessage(replyText, QUICK_OPTIONS)
        } else {
          const reply = getBotReply(text)
          addBotMessage(reply.text, reply.options, reply.action)
        }
      })
      .catch(() => {
        setTyping(false)
        const reply = getBotReply(text)
        addBotMessage(reply.text, reply.options, reply.action)
      })
  }

  const handleOptionClick = (opt) => {
    sendMessage(opt.label)
  }

  const handleTicketSubmit = (ticket) => {
    setTimeout(() => {
      addBotMessage(`✅ Ticket #${ticket.ticketId} raised successfully!\n\nIssue: ${ticket.type}\nStatus: Open\n\nOur team will get back to you within 24 hours.`, QUICK_OPTIONS)
      setShowTicket(false)
    }, 500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(CHAT_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReopen = () => {
    setClosed(false)
    setMessages(INITIAL_MESSAGES)
    setOptions(QUICK_OPTIONS)
    setShowTicket(false)
    resetInactivity()
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#7C3AED,#5b21b6)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            style={{ height: 560 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5b21b6)' }}>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-sm">N</div>
              <div className="flex-1">
                <p className="font-bold text-sm">NeuroBot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-white/70 text-xs">Online • Support</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                <span className="text-[10px] text-white/70 font-mono">{CHAT_ID}</span>
                <button onClick={handleCopy} className="text-white/70 hover:text-white transition-colors ml-1">
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1" style={{ background: '#fafafa' }}>
              {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

              {/* Typing indicator */}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#5b21b6)' }}>N</div>
                  <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.span key={i} animate={{ y: [0,-4,0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i*0.15 }}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full block" />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quick Options */}
              {!typing && options.length > 0 && (
                <QuickOptions options={options} onSelect={handleOptionClick} />
              )}

              {/* Ticket Form */}
              {showTicket && <TicketForm onSubmit={handleTicketSubmit} />}

              {/* Closed state */}
              {closed && (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400 mb-3">Still have an issue?</p>
                  <button onClick={handleReopen}
                    className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-all"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#5b21b6)' }}>
                    💬 Chat with us
                  </button>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {!closed && (
              <div className="px-3 py-3 border-t border-gray-100 flex gap-2 bg-white flex-shrink-0">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#5b21b6)' }}
                >
                  <Send size={15} className="text-white" />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
