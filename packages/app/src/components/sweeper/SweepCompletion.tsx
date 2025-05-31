import { useState } from 'react'
import { CheckIcon, ClockIcon, EyeIcon, EyeSlashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

export function SweepCompletion() {
  const [showPrivateKey, setShowPrivateKey] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Sweep Completed!</h2>
        <p className="text-slate-300">
          Your tokens have been successfully swept and deposited into Railgun for privacy.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-purple-400" />
            Privacy Period Active
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Deposited Amount:</span>
              <span className="text-green-400 font-semibold">2.48 ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Withdrawal Available:</span>
              <span>June 3, 2025 at 2:30 PM</span>
            </div>
            <div className="bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full w-1/3"></div>
            </div>
            <p className="text-sm text-slate-400">2 days, 14 hours remaining</p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Fresh Wallet Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Wallet Address</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-700 px-3 py-2 rounded text-sm flex-1">
                  0xA1B2C3D4E5F6789...
                </code>
                <button 
                  onClick={() => copyToClipboard('0xA1B2C3D4E5F6789...')}
                  className="p-2 hover:bg-slate-700 rounded"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Private Key</label>
              <div className="flex items-center space-x-2">
                <code className="bg-slate-700 px-3 py-2 rounded text-sm flex-1">
                  {showPrivateKey ? '0x1234567890abcdef...' : '••••••••••••••••••••'}
                </code>
                <button 
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="p-2 hover:bg-slate-700 rounded"
                >
                  {showPrivateKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => copyToClipboard('0x1234567890abcdef...')}
                  className="p-2 hover:bg-slate-700 rounded"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                ⚠️ Save your private key securely. Funds will be automatically withdrawn to this wallet after the privacy period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 