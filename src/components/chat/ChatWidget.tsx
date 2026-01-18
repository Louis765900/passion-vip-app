'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Loader2, Bot, User } from 'lucide-react'
import { Match, PronosticResponse, ChatMessage } from '@/types'

interface ChatWidgetProps {
  match: Match
  pronostic: PronosticResponse
}

export function ChatWidget({ match, pronostic }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match,
          pronostic,
          question: userMessage.content,
          history: messages
        })
      })

      const data = await response.json()

      if (data.success && data.message) {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Erreur de reponse')
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Desole, une erreur est survenue. Veuillez reessayer.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    'Quel est le meilleur pari pour ce match ?',
    'Quels sont les risques principaux ?',
    'Y a-t-il des joueurs cles absents ?'
  ]

  return (
    <div className="border-t border-white/10">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-3 text-white/70 hover:text-white transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">Une question sur ce match ?</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs"
        >
          ▼
        </motion.span>
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-dark-800/50">
              {/* Messages */}
              <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-4">
                    <Bot className="w-8 h-8 text-neon-green mx-auto mb-2" />
                    <p className="text-white/50 text-sm mb-4">
                      Posez une question sur ce match
                    </p>
                    {/* Suggested Questions */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(question)}
                          className="px-3 py-1.5 text-xs bg-dark-700 hover:bg-dark-600 text-white/70 hover:text-white rounded-full transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-neon-green" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                          message.role === 'user'
                            ? 'bg-neon-green/20 text-white'
                            : 'bg-dark-700 text-white/90'
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-neon-green" />
                    </div>
                    <div className="px-3 py-2 bg-dark-700 rounded-xl">
                      <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-dark-700 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-neon-green/50 disabled:opacity-50"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-neon-green text-dark-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
