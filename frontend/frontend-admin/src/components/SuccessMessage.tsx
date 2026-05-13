import { CheckCircle, X } from 'lucide-react'

interface SuccessMessageProps {
  message: string
  subtext?: string
  onClose: () => void
}

export default function SuccessMessage({ message, subtext, onClose }: SuccessMessageProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-4 mb-6 border border-emerald-200 bg-emerald-50">
      <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-emerald-900">{message}</p>
        {subtext && <p className="text-xs text-emerald-700 mt-0.5">{subtext}</p>}
      </div>
      <button onClick={onClose} className="text-emerald-600 hover:text-emerald-800">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
