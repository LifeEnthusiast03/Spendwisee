import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, Bot, Sparkles, CheckCircle2, AlertCircle, Info,
  Lightbulb, List, Trash2, ArrowRight, RotateCcw,
  TrendingUp, Wallet, Target, PiggyBank
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { API_BASE } from '../store/api'
import Logo from '../components/Logo'
import type { AgentResponse, SseEvent } from '../types/types'

/* ═══════════════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════════════ */
type MessageRole = 'user' | 'bot'
type StreamingState = 'idle' | 'status' | 'streaming' | 'done' | 'error'

interface ChatMessage {
  id: string
  role: MessageRole
  text?: string
  response?: AgentResponse
  timestamp: Date
  /** If this is a streaming bot message, tracks its live state */
  streaming?: { state: StreamingState; statusText?: string; partial: string }
  isError?: boolean
}

/* ═══════════════════════════════════════════════════════════════════
   Constants
═══════════════════════════════════════════════════════════════════ */
const uid = () => Math.random().toString(36).slice(2, 10)

const SUGGESTIONS = [
  { icon: TrendingUp,  text: 'How is my spending this month?' },
  { icon: Wallet,      text: "What's my current balance?" },
  { icon: Target,      text: 'Am I on track with my budget?' },
  { icon: PiggyBank,   text: 'Give me saving tips' },
]

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  response: {
    type: 'info',
    title: 'SpendWise AI',
    summary: 'Your personal finance advisor. Ask me about spending, budgets, savings goals, or anything money-related.',
  },
  timestamp: new Date(),
}

let persistentMessages: ChatMessage[] = [WELCOME]

/* ═══════════════════════════════════════════════════════════════════
   SSE streaming fetch
═══════════════════════════════════════════════════════════════════ */
async function streamChat(
  query: string,
  history: { role: string; content: string }[],
  onEvent: (e: SseEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query, chatHistory: history }),
    signal,
  })

  if (!res.ok || !res.body) {
    onEvent({ type: 'error', message: `Server error ${res.status}` })
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // Parse SSE chunks: each message ends with \n\n
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      const lines = part.trim().split('\n')
      let eventType = ''
      let dataLine = ''
      for (const line of lines) {
        if (line.startsWith('event: ')) eventType = line.slice(7).trim()
        if (line.startsWith('data: '))  dataLine  = line.slice(6).trim()
      }
      if (eventType && dataLine) {
        try {
          const payload = JSON.parse(dataLine) as SseEvent
          onEvent(payload)
        } catch { /* malformed chunk — skip */ }
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Card rendering
═══════════════════════════════════════════════════════════════════ */
const TYPE_META = {
  success: { rail: 'cp2-rail--success', icon: CheckCircle2, eyebrow: 'Confirmed' },
  error:   { rail: 'cp2-rail--error',   icon: AlertCircle,  eyebrow: 'Error' },
  info:    { rail: 'cp2-rail--info',    icon: Info,         eyebrow: 'Summary' },
  advice:  { rail: 'cp2-rail--advice',  icon: Lightbulb,    eyebrow: 'Advice' },
  list:    { rail: 'cp2-rail--list',    icon: List,         eyebrow: 'Records' },
} satisfies Record<AgentResponse['type'], { rail: string; icon: React.FC<{ size: number }>; eyebrow: string }>

const AgentCard = ({ response, isWelcome = false }: { response: AgentResponse; isWelcome?: boolean }) => {
  const meta = TYPE_META[response.type] ?? TYPE_META.info
  const Icon = meta.icon

  return (
    <div className={`cp2-card ${meta.rail} ${isWelcome ? 'cp2-card--welcome' : ''}`}>
      <div className="cp2-card-eyebrow">
        <Icon size={11} aria-hidden="true" />
        <span>{meta.eyebrow}</span>
      </div>
      <div className="cp2-card-title">{response.title}</div>
      <div className="cp2-card-summary">{response.summary}</div>

      {response.details && response.details.length > 0 && (
        <dl className="cp2-card-details">
          {response.details.map((d, i) => (
            <div key={i} className="cp2-card-detail-pair">
              <dt className="cp2-card-detail-label">{d.label}</dt>
              <dd className="cp2-card-detail-value">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {response.items && response.items.length > 0 && (
        <ul className="cp2-card-items">
          {response.items.map((item, i) => (
            <li key={i} className="cp2-card-item">{item}</li>
          ))}
        </ul>
      )}

      {response.tips && response.tips.length > 0 && (
        <div className="cp2-card-tips-block">
          <div className="cp2-card-tips-label">
            <Lightbulb size={11} aria-hidden="true" /> Action points
          </div>
          <ol className="cp2-card-tips-list">
            {response.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Streaming in-progress bubble
═══════════════════════════════════════════════════════════════════ */
const StreamingBubble = ({
  partial,
  statusText,
  state,
}: {
  partial: string
  statusText?: string
  state: StreamingState
}) => (
  <div className="cp2-bot-row">
    <BotAvatar streaming={state === 'streaming' || state === 'status'} />
    <div className="cp2-stream-bubble">
      {state === 'status' && !partial && (
        <span className="cp2-status-label">
          <span className="cp2-status-dots">
            <span /><span /><span />
          </span>
          {statusText ?? 'Thinking…'}
        </span>
      )}
      {partial && (
        <span className="cp2-stream-text">
          {partial}
          {state === 'streaming' && <span className="cp2-cursor" aria-hidden="true" />}
        </span>
      )}
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════════════
   Bot avatar
═══════════════════════════════════════════════════════════════════ */
const BotAvatar = ({ streaming = false }: { streaming?: boolean }) => (
  <div className={`cp2-bot-avatar ${streaming ? 'cp2-bot-avatar--active' : ''}`} aria-hidden="true">
    <Bot size={14} />
  </div>
)

/* ═══════════════════════════════════════════════════════════════════
   Message item
═══════════════════════════════════════════════════════════════════ */
const MessageItem = ({ msg, onRetry }: { msg: ChatMessage; onRetry?: () => void }) => {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <div className="cp2-user-row">
        <div className="cp2-user-bubble">{msg.text}</div>
        <time className="cp2-msg-time">
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    )
  }

  // Streaming in-progress
  if (msg.streaming && msg.streaming.state !== 'done' && msg.streaming.state !== 'error') {
    return (
      <StreamingBubble
        partial={msg.streaming.partial}
        statusText={msg.streaming.statusText}
        state={msg.streaming.state}
      />
    )
  }

  // Error inline
  if (msg.isError) {
    return (
      <div className="cp2-bot-row">
        <BotAvatar />
        <div className="cp2-error-inline">
          <AlertCircle size={14} />
          <span>{msg.text}</span>
          {onRetry && (
            <button className="cp2-retry-btn" onClick={onRetry} aria-label="Retry message">
              <RotateCcw size={13} /> Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  // Plain welcome text
  if (!msg.response && msg.text) {
    return (
      <div className="cp2-bot-row">
        <BotAvatar />
        <div className="cp2-bot-text">
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        </div>
      </div>
    )
  }

  // Structured card
  return (
    <div className="cp2-bot-row">
      <BotAvatar />
      <div style={{ minWidth: 0, flex: 1 }}>
        {msg.response && (
          <AgentCard response={msg.response} isWelcome={msg.id === 'welcome'} />
        )}
        <time className="cp2-msg-time">
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Suggestion grid
═══════════════════════════════════════════════════════════════════ */
const Suggestions = ({ onSelect, disabled }: { onSelect: (s: string) => void; disabled: boolean }) => (
  <div className="cp2-suggestions">
    <p className="cp2-suggestions-label">
      <Sparkles size={12} aria-hidden="true" /> Try asking
    </p>
    <div className="cp2-suggestion-grid">
      {SUGGESTIONS.map(({ icon: Icon, text }) => (
        <button
          key={text}
          className="cp2-suggestion-tile"
          onClick={() => onSelect(text)}
          disabled={disabled}
        >
          <Icon size={16} className="cp2-suggestion-icon" aria-hidden="true" />
          <span>{text}</span>
          <ArrowRight size={13} className="cp2-suggestion-arrow" aria-hidden="true" />
        </button>
      ))}
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════════════
   Header
═══════════════════════════════════════════════════════════════════ */
const ChatHeader = ({
  messagesLength,
  onClear,
  streamState,
}: {
  messagesLength: number
  onClear: () => void
  streamState: StreamingState
}) => {
  const statusLabel =
    streamState === 'status'    ? 'Thinking…' :
    streamState === 'streaming' ? 'Responding…' :
    'Online'

  const statusMod =
    streamState === 'status'    ? 'cp2-status--thinking' :
    streamState === 'streaming' ? 'cp2-status--streaming' :
    ''

  return (
    <div className="cp2-header">
      <div className="cp2-header-brand">
        <Logo variant="icon" size={28} theme="dark" />
        <div>
          <h1 className="cp2-header-title">SpendWise AI</h1>
        </div>
      </div>
      <div className="cp2-header-right">
        {messagesLength > 1 && (
          <button className="cp2-clear-btn" onClick={onClear} title="Clear conversation">
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        )}
        <div className={`cp2-status ${statusMod}`}>
          <span className="cp2-status-dot" aria-hidden="true" />
          {statusLabel}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const [messages, setMessagesState] = useState<ChatMessage[]>(persistentMessages)
  const [input, setInput] = useState('')
  const [globalStreamState, setGlobalStreamState] = useState<StreamingState>('idle')
  const [lastUserMsg, setLastUserMsg] = useState<string>('')

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const scrollRef  = useRef<HTMLDivElement>(null)
  const abortRef   = useRef<AbortController | null>(null)
  const isScrolledUp = useRef(false)

  const setMessages = (action: React.SetStateAction<ChatMessage[]>) => {
    setMessagesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      persistentMessages = next
      return next
    })
  }

  const clearChat = () => {
    abortRef.current?.abort()
    setMessages([WELCOME])
    setGlobalStreamState('idle')
  }

  const scrollToBottom = useCallback(() => {
    if (!isScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    isScrolledUp.current = scrollHeight - scrollTop - clientHeight > 60
  }

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim()
    if (!msgText || globalStreamState !== 'idle') return

    setLastUserMsg(msgText)

    const userMsg: ChatMessage = {
      id: uid(), role: 'user', text: msgText, timestamp: new Date(),
    }

    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text ?? (m.response?.summary ?? ''),
      }))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    isScrolledUp.current = false

    // Add a streaming placeholder message
    const botId = uid()
    const placeholder: ChatMessage = {
      id: botId,
      role: 'bot',
      timestamp: new Date(),
      streaming: { state: 'status', statusText: 'Thinking…', partial: '' },
    }
    setMessages(prev => [...prev, placeholder])
    setGlobalStreamState('status')

    const ac = new AbortController()
    abortRef.current = ac

    const updateBot = (updater: (s: ChatMessage['streaming']) => ChatMessage['streaming']) => {
      setMessages(prev =>
        prev.map(m => m.id === botId
          ? { ...m, streaming: updater(m.streaming) }
          : m
        )
      )
    }

    try {
      await streamChat(
        msgText,
        history,
        (event) => {
          if (event.type === 'status') {
            setGlobalStreamState('status')
            updateBot(s => ({ ...s!, state: 'status', statusText: event.text }))
            scrollToBottom()
          } else if (event.type === 'delta') {
            setGlobalStreamState('streaming')
            updateBot(s => ({
              ...s!,
              state: 'streaming',
              partial: (s?.partial ?? '') + event.text,
            }))
            scrollToBottom()
          } else if (event.type === 'done') {
            setGlobalStreamState('done')
            // Replace streaming placeholder with the final structured card
            setMessages(prev =>
              prev.map(m =>
                m.id === botId
                  ? { id: botId, role: 'bot', response: event.response, timestamp: new Date() }
                  : m
              )
            )
            setGlobalStreamState('idle')
            scrollToBottom()
          } else if (event.type === 'error') {
            setMessages(prev =>
              prev.map(m =>
                m.id === botId
                  ? { id: botId, role: 'bot', isError: true, text: event.message, timestamp: new Date() }
                  : m
              )
            )
            setGlobalStreamState('idle')
          }
        },
        ac.signal
      )
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev =>
        prev.map(m =>
          m.id === botId
            ? { id: botId, role: 'bot', isError: true, text: "Couldn't reach the server. Please try again.", timestamp: new Date() }
            : m
        )
      )
      setGlobalStreamState('idle')
    }
  }

  const retryLast = () => sendMessage(lastUserMsg)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
  }

  const isOnlyWelcome = messages.length === 1
  const isStreaming = globalStreamState !== 'idle'

  return (
    <div className="cp2-page">
      <ChatHeader
        messagesLength={messages.length}
        onClear={clearChat}
        streamState={globalStreamState}
      />

      <div className="cp2-chat-body">
        <div
          ref={scrollRef}
          className="cp2-messages"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          onScroll={handleScroll}
        >
          <div className="cp2-messages-inner">
            {messages.map(msg => (
              <MessageItem
                key={msg.id}
                msg={msg}
                onRetry={msg.isError ? retryLast : undefined}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {isOnlyWelcome && (
          <Suggestions onSelect={sendMessage} disabled={isStreaming} />
        )}

        {/* Composer */}
        <div className="cp2-composer">
          <div className={`cp2-input-shell ${isStreaming ? 'cp2-input-shell--active' : ''}`}>
            <textarea
              ref={inputRef}
              className="cp2-textarea"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances…"
              disabled={isStreaming}
              rows={1}
              aria-label="Message input"
            />
            <button
              className="cp2-send-btn"
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="cp2-composer-hint">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
