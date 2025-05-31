import { ArrowPathIcon } from '@heroicons/react/24/outline'

export function SweepProcessing() {
  return (
    <div className="py-20 text-center">
      <div className="w-20 h-20 mx-auto mb-8">
        <ArrowPathIcon className="w-full h-full animate-spin text-purple-400" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Processing Your Sweep</h2>
      <p className="text-slate-300 mb-8">
        Executing cross-chain swaps and depositing to Railgun for privacy...
      </p>
      <div className="max-w-md mx-auto">
        <div className="bg-slate-700 rounded-full h-3 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full animate-pulse w-2/3"></div>
        </div>
        <p className="text-sm text-slate-400">Step 2 of 3: Depositing to Railgun...</p>
      </div>
    </div>
  )
} 