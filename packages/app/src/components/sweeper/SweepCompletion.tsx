import { useState, useEffect } from 'react'
import { CheckIcon, ClockIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import type { Token } from '@/atoms/walletAtoms'

interface SweepCompletionProps {
  usedPrivacy?: boolean
  selectedTokens?: Token[]
  railgunAddress?: string
}

export function SweepCompletion({ usedPrivacy = false, selectedTokens = [], railgunAddress = '' }: SweepCompletionProps) {
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [withdrawalDate, setWithdrawalDate] = useState('')
  const router = useRouter()

  // Calculate total deposited amount from selected tokens
  const depositedAmount = selectedTokens.reduce((sum, token) => {
    const value = parseFloat(token.value.replace('$', '').replace(',', '') || '0')
    return sum + value
  }, 0)

  // Convert to ETH (using same rate as TransactionReview)
  const ethPrice = 3200
  const depositedEth = depositedAmount / ethPrice

  useEffect(() => {
    if (!usedPrivacy) return

    // Set withdrawal date to 3 days from now
    const now = new Date()
    const withdrawalTime = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))
    setWithdrawalDate(withdrawalTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }))

    // Update countdown every second
    const updateCountdown = () => {
      const now = new Date()
      const timeLeft = withdrawalTime.getTime() - now.getTime()
      
      if (timeLeft <= 0) {
        setTimeRemaining('Withdrawal available')
        setProgress(100)
        return
      }

      const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000))
      const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))

      setTimeRemaining(`${days} days, ${hours} hours, ${minutes} minutes remaining`)
      
      // Calculate progress: 3 days = 0%, 0 days = 100%
      const totalDuration = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      const elapsed = totalDuration - timeLeft
      const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
      setProgress(progressPercent)
    }

    // Initial update
    updateCountdown()
    
    // Update every minute
    const interval = setInterval(updateCountdown, 60000)
    
    return () => clearInterval(interval)
  }, [usedPrivacy])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleReturnHome = () => {
    router.push('/')
  }

  // Non-privacy completion screen (centered with gradient background)
  if (!usedPrivacy) {
    return (
      <div className="py-8 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{
              background: 'linear-gradient(90deg, #7841B1 0%, #C6233D 40%, #CA871E 75%, #BBB424 100%)'
            }}>
            <CheckIcon className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4 font-tanklager">Completion</h2>
          <p className="text-slate-300 text-lg font-tanklager mb-8">
            Your tokens have been successfully swept!
          </p>
        </div>
        
        <button
          onClick={handleReturnHome}
          className='px-8 py-4 font-semibold transition-all text-lg btn-review-sweep'
          style={{ borderRadius: '0.75rem' }}>
          <span className='uppercase text-white font-bold'>START NEW SWEEP</span>
        </button>
      </div>
    )
  }

  // Privacy completion screen (original layout)
  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#BBB424' }}>
          <CheckIcon className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-3xl font-bold mb-4 font-tanklager">Completion x Privacy</h2>
        <p className="text-slate-300 font-tanklager">
          Your tokens have been successfully swept and deposited into Railgun for privacy.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2" style={{ color: '#BBB424' }} />
            Privacy Period Active
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Deposited Amount:</span>
              <span className="font-semibold" style={{ color: '#BBB424' }}>~{depositedEth.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Withdrawal Available:</span>
              <span>{withdrawalDate}</span>
            </div>
            <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #000000 0%, #7841B1 30%, #C6233D 60%, #CA871E 85%, #BBB424 100%)'
                }}
              ></div>
            </div>
            <p className="text-sm text-slate-400">{timeRemaining}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">0ZK Address Used</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Railgun Address</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-700 px-3 py-2 rounded text-sm flex-1 break-all">
                  {railgunAddress || '0x...(no address provided)'}
                </code>
                {railgunAddress && (
                  <button 
                    onClick={() => copyToClipboard(railgunAddress)}
                    className="p-2 hover:bg-slate-700 rounded"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div 
              className="border rounded-lg p-3"
              style={{ 
                backgroundColor: 'rgba(187, 180, 36, 0.1)', 
                borderColor: 'rgba(187, 180, 36, 0.2)' 
              }}>
              <p className="text-sm" style={{ color: '#BBB424' }}>
                ⚠️ Funds will be automatically withdrawn to your fresh wallet after the privacy period.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleReturnHome}
          className='px-8 py-4 font-semibold transition-all text-lg btn-review-sweep'
          style={{ borderRadius: '0.75rem' }}>
          <span className='uppercase text-white font-bold'>START NEW SWEEP</span>
        </button>
      </div>
    </div>
  )
} 