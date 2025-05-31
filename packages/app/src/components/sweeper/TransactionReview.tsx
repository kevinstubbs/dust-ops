import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import type { Token } from '@/app/page'

interface TransactionReviewProps {
  selectedTokens: number[]
  tokens: Token[]
  totalValue: number
  onStartSweep: () => void
}

export function TransactionReview({ 
  selectedTokens, 
  tokens, // eslint-disable-line @typescript-eslint/no-unused-vars
  totalValue, 
  onStartSweep 
}: TransactionReviewProps) {
  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-8">Review Sweep Transaction</h2>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Transaction Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Tokens:</span>
                <span>{selectedTokens.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Value:</span>
                <span className="text-green-400 font-semibold">${totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Gas:</span>
                <span>$45.20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Slippage:</span>
                <span>0.5%</span>
              </div>
              <hr className="border-slate-600" />
              <div className="flex justify-between font-semibold">
                <span>Net Amount (ETH):</span>
                <span className="text-green-400">~2.48 ETH</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-purple-400" />
              Privacy Settings
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Railgun Deposit:</span>
                <span className="text-green-400">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Withdrawal Delay:</span>
                <span>3 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fresh Wallet:</span>
                <span>Auto-generated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Processing Steps</h3>
            <div className="space-y-3">
              {[
                'Cross-chain token swaps',
                'Consolidate to ETH',
                'Deposit to Railgun',
                '3-day privacy delay',
                'Withdraw to fresh wallet'
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs">
                    {index + 1}
                  </div>
                  <span className="text-slate-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={onStartSweep}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 py-4 rounded-xl font-semibold transition-all text-lg"
          >
            Confirm & Start Sweep
          </button>
        </div>
      </div>
    </div>
  )
} 