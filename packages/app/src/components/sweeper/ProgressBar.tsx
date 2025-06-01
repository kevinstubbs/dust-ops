import { CheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ProgressBarProps {
  steps: string[]
  stepUrls: string[]
  currentStep: number
}

export function ProgressBar({ steps, stepUrls, currentStep }: ProgressBarProps) {
  return (
    <div className='max-w-6xl mx-auto px-6 py-6'>
      <div className='flex items-center justify-between mb-2'>
        {steps.map((step, index) => (
          <div key={index} className='flex items-center'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                index <= currentStep ? 'bg-purple-500' : 'bg-slate-600'
              }`}>
              {index < currentStep ? <CheckIcon className='w-4 h-4' /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${index < currentStep ? 'bg-purple-500' : 'bg-slate-600'}`}></div>
            )}
          </div>
        ))}
      </div>
      <div className='flex justify-between text-xs text-slate-400 cursor-pointer'>
        {steps.map((step, index) => (
          <Link
            key={index}
            href={index <= currentStep ? stepUrls[index] : '#'}
            className={index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}>
            <span className={index <= currentStep ? 'text-purple-300' : ''}>{step}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
