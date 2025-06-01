import { useEffect, useState } from 'react'

export function SweepProcessing() {
  const [progress, setProgress] = useState(0)

  // Animate progress bar with variable speed (same as scan holdings)
  useEffect(() => {
    const startTime = Date.now()
    const duration = 4000 // 4 seconds total
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1) // normalized time (0 to 1)
      
      // Custom easing: slow start, fast finish
      // Using exponential ease-in function
      const easedProgress = Math.pow(t, 0.3) * 100
      
      setProgress(easedProgress)
      
      if (t < 1) {
        requestAnimationFrame(animateProgress)
      }
    }
    
    requestAnimationFrame(animateProgress)
  }, [])

  return (
    <div className="py-20 text-center">
      <h2 className="text-3xl font-bold mb-4 font-tanklager">Processing Your Sweep</h2>
      <p className="text-slate-300 mb-8 font-tanklager">
        Executing cross-chain swaps and depositing to Railgun for privacy...
      </p>
      <div className="max-w-md mx-auto">
        <div className="bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="scan-progress-bar h-3 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-400 font-tanklager">Step 2 of 3: Depositing to Railgun...</p>
      </div>
    </div>
  )
} 