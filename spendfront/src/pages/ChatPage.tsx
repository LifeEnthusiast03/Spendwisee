import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, Sparkles, CheckCircle2, AlertCircle, Info, Lightbulb, List, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import api from '../store/api'
import Logo from '../components/Logo'

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
  text: "Hey! 👋 I'm **SpendWise AI**. \n\nAsk me anything about your finances — budgets, spending trends, savings goals, and more!",
  timestamp: new Date(),
}

const SUGGESTIONS = [
  'How is my spending this month?',
  'Am I on track with my budget?',
  'What are my biggest expenses?',
  'Give me saving tips',
]

let persistentMessages: ChatMessage[] = [WELCOME]

/* ─────────────────────────────────────────────────────── */
/* Sub-Components                                           */
/* ─────────────────────────────────────────────────────── */

const ChatHeader = ({ messagesLength, onClear }: { messagesLength: number, onClear: () => void }) => (
  <div className="cp-page-header">
    <div className="cp-page-header-brand">
      <Logo variant="icon" size={32} theme="dark" />
      <div>
        <h1 className="cp-page-title">SpendWise AI</h1>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {messagesLength > 1 && (
        <button 
          onClick={onClear}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'transparent', border: 'none', color: 'var(--sw-text-4)',
            cursor: 'pointer', fontSize: '0.85rem', padding: '6px 10px',
            borderRadius: '6px', transition: 'all 0.2s ease', fontWeight: 500
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'var(--sw-expense)'; e.currentTarget.style.background = 'rgba(232, 68, 90, 0.1)' }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--sw-text-4)'; e.currentTarget.style.background = 'transparent' }}
          title="Clear chat history"
        >
          <Trash2 size={15} />
          <span className="hidden sm:inline">Clear</span>
        </button>
      )}
      <div className="cp-status-badge">
        <span className="cp-status-dot" />
        Online
      </div>
    </div>
  </div>
)

const TypingIndicator = () => (
  <div className="cp-bubble cp-bubble--bot cp-typing">
    <span className="cp-bot-avatar" aria-hidden="true"><Bot size={16} /></span>
    <div className="cp-bubble-inner">
      <div className="cp-dots">
        <span /><span /><span />
      </div>
    </div>
  </div>
)

const SuggestionChips = ({ onSelect, disabled }: { onSelect: (s: string) => void, disabled: boolean }) => (
  <div className="cp-suggestions">
    <p className="cp-suggestions-label"><Sparkles size={14} /> Try asking…</p>
    <div className="cp-suggestion-chips">
      {SUGGESTIONS.map((s) => (
        <button key={s} className="cp-chip" onClick={() => onSelect(s)} disabled={disabled}>
          {s}
        </button>
      ))}
    </div>
  </div>
)

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

const ChatMessageItem = ({ msg }: { msg: ChatMessage }) => {
  const isUser = msg.role === 'user'
  return (
    <div className={`cp-bubble ${isUser ? 'cp-bubble--user' : 'cp-bubble--bot'}`}>
      {!isUser && (
        <span className="cp-bot-avatar" aria-hidden="true">
          <Bot size={18} />
        </span>
      )}
      <div className="cp-bubble-inner">
        {msg.text && (
          <div className="cp-bubble-text">
            {isUser ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
          </div>
        )}
        {msg.response && <AgentResponseCard response={msg.response} />}
        <span className="cp-bubble-time">
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────── */
/* Main Page                                                */
/* ─────────────────────────────────────────────────────── */
export default function ChatPage() {
  const [messages, setMessagesState] = useState<ChatMessage[]>(persistentMessages)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isScrolledUp = useRef(false)

  const setMessages = (action: React.SetStateAction<ChatMessage[]>) => {
    setMessagesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      persistentMessages = next
      return next
    })
  }

  const clearChat = () => setMessages([WELCOME])

  // Scroll logic
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    isScrolledUp.current = scrollHeight - scrollTop - clientHeight > 20
  }

  useEffect(() => {
    if (!isScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, thinking])

  useEffect(() => {
    // Focus input on mount, slight delay for transitions
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim()
    if (!msgText || thinking) return

    const userMsg: ChatMessage = { id: uid(), role: 'user', text: msgText, timestamp: new Date() }
    
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text || (m.response ? m.response.summary : '')
      }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto' // reset textarea height
    setThinking(true)

    // Force scroll to bottom on user send regardless of scroll position
    isScrolledUp.current = false

    const reply = await getBotResponse(msgText, history)
    
    const botMsg: ChatMessage = { 
      id: uid(), role: 'bot', 
      text: typeof reply === 'string' ? reply : undefined,
      response: typeof reply === 'object' ? reply : undefined,
      timestamp: new Date() 
    }
    setMessages((prev) => [...prev, botMsg])
    setThinking(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // prevent newline
      sendMessage()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
  }

  const isOnlyWelcome = messages.length === 1

  return (
    <div className="cp-page">
      <ChatHeader messagesLength={messages.length} onClear={clearChat} />

      <div className="cp-chat-container">
        <div className="cp-messages" role="log" aria-live="polite" onScroll={handleScroll}>
          <div className="cp-messages-inner">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} msg={msg} />
            ))}
            {thinking && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        {isOnlyWelcome && <SuggestionChips onSelect={sendMessage} disabled={thinking} />}

        <div className="cp-composer-container">
          <div className="cp-input-row">
            <textarea
              ref={inputRef}
              className="cp-input"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances…"
              disabled={thinking}
              rows={1}
            />
            <button
              className="cp-send-btn"
              onClick={() => sendMessage()}
              disabled={thinking || !input.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
