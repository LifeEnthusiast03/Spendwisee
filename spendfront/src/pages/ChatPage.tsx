import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, Sparkles, CheckCircle2, AlertCircle, Info, Lightbulb, List } from 'lucide-react'
import api from '../store/api'

/* ─────────────────────────────────────────────────────── */
/* Types                                                    */
/* ─────────────────────────────────────────────────────── */
type MessageRole = 'user' | 'bot'

export interface AgentResponse {
  type: "success" | "error" | "info" | "advice" | "list"
  title: string
  summary: string
  details?: { label: string, value: string }[]
  items?: string[]
  tips?: string[]
}

interface ChatMessage {
  id: string
  role: MessageRole
  text?: string
  response?: AgentResponse
  timestamp: Date
}

/* ─────────────────────────────────────────────────────── */
/* Real API call to backend chat route                      */
/* ─────────────────────────────────────────────────────── */
async function getBotResponse(message: string, history: {role: string, content: string}[]): Promise<AgentResponse | string> {
  try {
    const { data } = await api.post<AgentResponse>('/chat', { query: message, chatHistory: history })
    return data
  } catch (err: unknown) {
    console.error('[ChatPage] API error:', err)
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
  text: "Hey! 👋 I'm SpendWise AI. Ask me anything about your finances — budgets, spending trends, savings goals, and more!",
  timestamp: new Date(),
}

const SUGGESTIONS = [
  'How is my spending this month?',
  'Am I on track with my budget?',
  'What are my biggest expenses?',
  'Give me saving tips',
]

/* ─────────────────────────────────────────────────────── */
/* Typing indicator                                         */
/* ─────────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="cp-bubble cp-bubble--bot cp-typing">
    <span className="cp-bot-avatar" aria-hidden="true">
      <Bot size={14} />
    </span>
    <div className="cp-dots">
      <span />
      <span />
      <span />
    </div>
  </div>
)

/* ─────────────────────────────────────────────────────── */
/* Agent Response Card Component                            */
/* ─────────────────────────────────────────────────────── */
const AgentResponseCard = ({ response }: { response: AgentResponse }) => {
  let colorClass = 'cp-card--info'
  let Icon = Info
  
  if (response.type === 'success') { colorClass = 'cp-card--success'; Icon = CheckCircle2 }
  else if (response.type === 'error') { colorClass = 'cp-card--error'; Icon = AlertCircle }
  else if (response.type === 'advice') { colorClass = 'cp-card--advice'; Icon = Lightbulb }
  else if (response.type === 'list') { colorClass = 'cp-card--list'; Icon = List }

  return (
    <div className={`cp-response-card ${colorClass}`}>
      <div className="cp-response-card-title">
        <Icon size={18} /> {response.title}
      </div>
      <div className="cp-response-card-summary">{response.summary}</div>
      
      {response.details && response.details.length > 0 && (
        <div className="cp-response-card-details">
          {response.details.map((d, i) => (
            <div key={i} className="cp-response-card-detail">
              <div className="cp-response-card-detail-label">{d.label}</div>
              <div className="cp-response-card-detail-value">{d.value}</div>
            </div>
          ))}
        </div>
      )}

      {response.items && response.items.length > 0 && (
        <ul className="cp-response-card-items">
          {response.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )}

      {response.tips && response.tips.length > 0 && (
        <div className="cp-response-card-tips-wrap">
          <div className="cp-response-card-tips-header">
            <Lightbulb size={12} /> Tips
          </div>
          <ul className="cp-response-card-tips">
            {response.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────── */
/* Main page                                               */
/* ─────────────────────────────────────────────────────── */
export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll on every new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim()
    if (!msgText || thinking) return

    const userMsg: ChatMessage = { id: uid(), role: 'user', text: msgText, timestamp: new Date() }
    
    // Extract history before adding the new message to state so we have a clean array
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text || (m.response ? m.response.summary : '')
      }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setThinking(true)

    const reply = await getBotResponse(msgText, history)
    
    const botMsg: ChatMessage = { 
      id: uid(), 
      role: 'bot', 
      text: typeof reply === 'string' ? reply : undefined,
      response: typeof reply === 'object' ? reply : undefined,
      timestamp: new Date() 
    }
    setMessages((prev) => [...prev, botMsg])
    setThinking(false)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  const isOnlyWelcome = messages.length === 1

  return (
    <div className="cp-page">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="cp-page-header">
        <div className="cp-page-header-brand">
          <div className="cp-page-header-icon">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="cp-page-title">SpendWise AI</h1>
            <p className="cp-page-subtitle">Your intelligent financial assistant</p>
          </div>
        </div>
        <div className="cp-status-badge">
          <span className="cp-status-dot" />
          Online
        </div>
      </div>

      {/* ── Chat container ──────────────────────────────── */}
      <div className="cp-chat-container">
        {/* Messages area */}
        <div className="cp-messages" role="log" aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`cp-bubble ${msg.role === 'user' ? 'cp-bubble--user' : 'cp-bubble--bot'}`}
            >
              {msg.role === 'bot' && (
                <span className="cp-bot-avatar" aria-hidden="true">
                  <Bot size={14} />
                </span>
              )}
              <div className="cp-bubble-inner">
                {msg.text && <p className="cp-bubble-text">{msg.text}</p>}
                {msg.response && <AgentResponseCard response={msg.response} />}
                <span className="cp-bubble-time">
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {thinking && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips — show only before any user message */}
        {isOnlyWelcome && (
          <div className="cp-suggestions">
            <p className="cp-suggestions-label">
              <Sparkles size={12} /> Try asking…
            </p>
            <div className="cp-suggestion-chips">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="cp-chip"
                  onClick={() => sendMessage(s)}
                  disabled={thinking}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="cp-input-row">
          <input
            ref={inputRef}
            id="cp-input"
            className="cp-input"
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
            className="cp-send-btn"
            onClick={() => sendMessage()}
            disabled={thinking || !input.trim()}
            aria-label="Send message"
            id="cp-send"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
