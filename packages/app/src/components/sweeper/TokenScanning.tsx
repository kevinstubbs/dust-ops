import { ArrowPathIcon } from '@heroicons/react/24/outline'

export function TokenScanning() {
  return (
    <div className="text-center py-20">
      <ArrowPathIcon className="w-16 h-16 mx-auto mb-6 animate-spin text-purple-400" />
      <h2 className="text-3xl font-bold mb-4">Scanning Your Holdings</h2>
      <p className="text-slate-300 mb-8">
        Analyzing tokens across all EVM chains and checking liquidity...
      </p>
      <div className="max-w-md mx-auto">
        <div className="bg-slate-700 rounded-full h-2 mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
        <p className="text-sm text-slate-400">Checking 15 chains...</p>
      </div>
    </div>
  )
} 