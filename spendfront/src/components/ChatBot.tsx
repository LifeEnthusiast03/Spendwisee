import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Minimize2, Send, Bot } from 'lucide-react'
import api from '../store/api'
import './ChatBot.css'

/* ─────────────────────────────────────────────────────── */
/* Types                                                    */
/* ─────────────────────────────────────────────────────── */
type MessageRole = 'user' | 'bot'

interface ChatMessage {
  id: string
  role: MessageRole
  text: string
  timestamp: Date
}

/* ─────────────────────────────────────────────────────── */
/* Real API call to backend chat route                      */
/* ─────────────────────────────────────────────────────── */
async function getBotResponse(message: string): Promise<string> {
  try {
    const { data } = await api.post<{ result: string }>('/chat', { query: message })
    return data.result
  } catch (err: unknown) {
    console.error('[ChatBot] API error:', err)
    return "Sorry, I couldn't reach the server. Please try again in a moment. 🙁"
  }
}

/* ─────────────────────────────────────────────────────── */
/* Helpers                                                  */
/* ─────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10)

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: "Hey! 👋 I'm SpendWise AI. Ask me anything about your finances!",
  timestamp: new Date(),
}

/* ─────────────────────────────────────────────────────── */
/* Typing indicator                                         */
/* ─────────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="cb-bubble cb-bubble--bot cb-typing">
    <span className="cb-bot-avatar"><Bot size={13} /></span>
    <div className="cb-dots">
      <span /><span /><span />
    </div>
  </div>
)

/* ─────────────────────────────────────────────────────── */
/* Main component                                           */
/* ─────────────────────────────────────────────────────── */
export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll on every new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || thinking) return

    const userMsg: ChatMessage = { id: uid(), role: 'user', text, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setThinking(true)

    const reply = await getBotResponse(text)
    const botMsg: ChatMessage = { id: uid(), role: 'bot', text: reply, timestamp: new Date() }
    setMessages((prev) => [...prev, botMsg])
    setThinking(false)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <>
      {/* ── Chat Panel ────────────────────────────────────── */}
      <div className={`cb-panel ${open ? 'cb-panel--open' : ''}`} role="dialog" aria-label="SpendWise AI chat">
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-brand">
            <span className="cb-header-logo">
              <Bot size={18} />
            </span>
            <div>
              <p className="cb-header-title">SpendWise AI</p>
              <p className="cb-header-sub">Your financial assistant</p>
            </div>
          </div>
          <button
            className="cb-close-btn"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <Minimize2 size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="cb-messages" role="log" aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`cb-bubble ${msg.role === 'user' ? 'cb-bubble--user' : 'cb-bubble--bot'}`}
            >
              {msg.role === 'bot' && (
                <span className="cb-bot-avatar" aria-hidden="true"><Bot size={13} /></span>
              )}
              <div className="cb-bubble-inner">
                <p className="cb-bubble-text">{msg.text}</p>
                <span className="cb-bubble-time">
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {thinking && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="cb-input-row">
          <input
            ref={inputRef}
            id="cb-input"
            className="cb-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your finances…"
            disabled={thinking}
            autoComplete="off"
            aria-label="Chat message input"
          />
          <button
            className="cb-send-btn"
            onClick={sendMessage}
            disabled={thinking || !input.trim()}
            aria-label="Send message"
            id="cb-send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* ── Trigger Button ─────────────────────────────────── */}
      <button
        id="cb-trigger"
        className={`cb-trigger ${open ? 'cb-trigger--active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        aria-expanded={open}
      >
        <span className="cb-trigger-pulse" aria-hidden="true" />
        {!open && <span className="cb-trigger-badge">AI</span>}
        <MessageCircle size={22} />
      </button>
    </>
  )
}
