"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Terminal, Lock, ChevronRight } from 'lucide-react'

interface TerminalLine {
  id: number
  type: 'command' | 'output' | 'error' | 'success' | 'warning' | 'info' | 'table' | 'system'
  content: string
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<TerminalLine[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [lineCounter, setLineCounter] = useState(0)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLineCounter(prev => {
      const newId = prev + 1
      setHistory(h => [...h, { id: newId, type, content }])
      return newId
    })
  }, [])

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [history, scrollToBottom])

  useEffect(() => {
    if (isLoggedIn) {
      inputRef.current?.focus()
    }
  }, [isLoggedIn])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!secret.trim()) return
    setIsLoggedIn(true)
    setHistory([
      { id: 0, type: 'system', content: 'PRONOSCOPE - Admin Terminal v1.0' },
      { id: 1, type: 'system', content: 'Connexion etablie. Tapez "help" pour la liste des commandes.' },
      { id: 2, type: 'system', content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    ])
    setLineCounter(3)
  }

  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    addLine('command', trimmed)
    setCommandHistory(prev => [trimmed, ...prev.slice(0, 49)])
    setHistoryIndex(-1)
    setInput('')

    // Commande locale: clear
    if (trimmed.toLowerCase() === 'clear') {
      setHistory([])
      setLineCounter(0)
      return
    }

    setIsRunning(true)

    try {
      const res = await fetch('/api/admin/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed, secret })
      })

      const data = await res.json()

      if (data.output === '__CLEAR__') {
        setHistory([])
        setLineCounter(0)
      } else {
        const lineType = data.type === 'success' ? 'success'
          : data.type === 'error' ? 'error'
          : data.type === 'warning' ? 'warning'
          : data.type === 'table' ? 'table'
          : 'info'
        addLine(lineType, data.output)
      }
    } catch {
      addLine('error', 'Erreur de connexion au serveur')
    } finally {
      setIsRunning(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      } else {
        setHistoryIndex(-1)
        setInput('')
      }
    }
  }

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-amber-400'
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'warning': return 'text-yellow-300'
      case 'info': return 'text-gray-300'
      case 'table': return 'text-amber-200'
      case 'system': return 'text-amber-500/80'
      default: return 'text-gray-400'
    }
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-gray-900 border border-amber-500/20 rounded-xl overflow-hidden shadow-2xl shadow-amber-900/10">
            <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
            <div className="p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Terminal className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Admin Terminal</h1>
                  <p className="text-xs text-gray-500">PronoScope</p>
                </div>
              </div>

              <form onSubmit={handleLogin}>
                <div className="relative mb-4">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Mot de passe admin"
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Connexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Terminal
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-mono text-amber-400 font-semibold">admin@pronosport</span>
          <span className="text-xs text-gray-600 font-mono">v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500 font-mono">connecte</span>
          </div>
        </div>
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line) => (
          <div key={line.id} className={`${getLineColor(line.type)} whitespace-pre-wrap mb-0.5`}>
            {line.type === 'command' ? (
              <span>
                <span className="text-amber-500">admin&gt;</span>{' '}
                <span className="text-white">{line.content}</span>
              </span>
            ) : line.type === 'system' ? (
              <span className="text-amber-500/70">{line.content}</span>
            ) : (
              <span>{line.content}</span>
            )}
          </div>
        ))}

        {isRunning && (
          <div className="text-gray-500 animate-pulse">Execution en cours...</div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-800 bg-gray-900/50 p-3">
        <div className="flex items-center gap-2 max-w-full">
          <span className="text-amber-500 font-mono text-sm font-semibold shrink-0">admin&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-gray-600 disabled:opacity-50"
            placeholder="Tapez une commande..."
            autoFocus
          />
          <button
            onClick={() => executeCommand(input)}
            disabled={isRunning || !input.trim()}
            className="p-1.5 text-amber-400 hover:text-amber-300 disabled:opacity-30 transition-colors shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
