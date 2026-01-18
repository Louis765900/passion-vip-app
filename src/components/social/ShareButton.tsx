'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Download, Twitter, Copy, Check, X, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import { Match, PronosticResponse } from '@/types'
import { TicketTemplate } from './TicketTemplate'

interface ShareButtonProps {
  match: Match
  pronostic: PronosticResponse
  ticketType: 'safe' | 'fun'
  homeLogo?: string
  awayLogo?: string
  leagueLogo?: string
}

export function ShareButton({
  match,
  pronostic,
  ticketType,
  homeLogo,
  awayLogo,
  leagueLogo
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  // Utiliser les logos du match si non fournis en props
  const homeLogoUrl = homeLogo || match.homeTeamLogo
  const awayLogoUrl = awayLogo || match.awayTeamLogo
  const leagueLogoUrl = leagueLogo || match.leagueLogo

  const generateImage = async () => {
    if (!ticketRef.current) return

    setIsGenerating(true)
    try {
      // Attendre que les images soient chargees
      const images = ticketRef.current.querySelectorAll('img')
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve // Continue meme si une image echoue
          })
        })
      )

      // Petit delai pour s'assurer que le rendu est termine
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0a0a0a', // Fond noir explicite
        scale: 2, // Haute resolution
        logging: false,
        useCORS: true, // Permettre les images cross-origin
        allowTaint: true, // Permettre les images "tainted"
        foreignObjectRendering: false, // Plus compatible
        imageTimeout: 5000, // Timeout pour les images
        onclone: (clonedDoc) => {
          // S'assurer que le conteneur clone est visible
          const clonedElement = clonedDoc.querySelector('[data-ticket-template]')
          if (clonedElement) {
            (clonedElement as HTMLElement).style.position = 'static'
            ;(clonedElement as HTMLElement).style.left = 'auto'
          }
        }
      })

      const dataUrl = canvas.toDataURL('image/png')
      setGeneratedImage(dataUrl)
    } catch (error) {
      console.error('Error generating image:', error)
      toast.error('Erreur lors de la generation de l\'image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenModal = async () => {
    setShowModal(true)
    setGeneratedImage(null)
    // Wait for modal to render, then generate
    setTimeout(() => {
      generateImage()
    }, 200)
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    const safeName = `${match.homeTeam}_vs_${match.awayTeam}`.replace(/[^a-zA-Z0-9]/g, '_')
    link.download = `pronostic_${safeName}_${ticketType}.png`
    link.href = generatedImage
    link.click()

    toast.success('Image telechargee !')
  }

  const handleCopyToClipboard = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Image copiee dans le presse-papiers !')
    } catch (error) {
      // Fallback: copy text instead
      const text = `${match.homeTeam} vs ${match.awayTeam}\n${pronostic.vip_tickets[ticketType].market}: ${pronostic.vip_tickets[ticketType].selection}\nCote: ${pronostic.vip_tickets[ticketType].odds_estimated}\n\nGenere par La Passion VIP`
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Texte copie dans le presse-papiers !')
    }
  }

  const handleShareTwitter = () => {
    const ticket = pronostic.vip_tickets[ticketType]
    const text = encodeURIComponent(
      `${match.homeTeam} vs ${match.awayTeam}\n${ticket.market}: ${ticket.selection} @ ${ticket.odds_estimated}\n\nAnalyse par La Passion VIP`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  return (
    <>
      <motion.button
        onClick={handleOpenModal}
        className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white/80 hover:text-white rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Share2 className="w-4 h-4" />
        Partager
      </motion.button>

      {/* Share Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-dark-800 rounded-2xl border border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Partager le pronostic</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {/* Preview */}
              <div className="p-6 flex flex-col items-center">
                {/* Hidden template for rendering - position absolue hors ecran */}
                <div
                  className="absolute"
                  style={{ left: '-9999px', top: 0 }}
                  data-ticket-template
                >
                  <TicketTemplate
                    ref={ticketRef}
                    match={match}
                    pronostic={pronostic}
                    ticketType={ticketType}
                    homeLogo={homeLogoUrl}
                    awayLogo={awayLogoUrl}
                    leagueLogo={leagueLogoUrl}
                  />
                </div>

                {/* Image Preview */}
                <div className="relative w-full max-w-[350px] aspect-[4/5] bg-dark-700 rounded-xl overflow-hidden mb-6">
                  {isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-neon-green animate-spin mb-2" />
                      <span className="text-white/50 text-sm">Generation en cours...</span>
                    </div>
                  ) : generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="Ticket preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/30">
                      Apercu non disponible
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3 w-full">
                  <motion.button
                    onClick={handleDownload}
                    disabled={!generatedImage || isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-900 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Telecharger
                  </motion.button>

                  <motion.button
                    onClick={handleCopyToClipboard}
                    disabled={!generatedImage || isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        Copie !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copier
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
