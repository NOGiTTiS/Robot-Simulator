'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Minus, Plus } from 'lucide-react'

interface NumberStepperProps {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  className?: string
  disabled?: boolean
}

export function NumberStepper({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit,
  className = '',
  disabled = false
}: NumberStepperProps) {
  const [textValue, setTextValue] = useState<string>(String(value ?? 0))

  useEffect(() => {
    // Only synchronize if the numeric values actually differ and user isn't currently typing '-'
    if (textValue !== '-' && textValue !== '' && Number(textValue) !== value) {
      setTextValue(String(value))
    }
  }, [value])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim()

    // Allow user to type empty or minus sign without overriding
    if (raw === '' || raw === '-') {
      setTextValue(raw)
      return
    }

    // Check if it's a valid integer or float string
    if (/^-?\d*(\.\d*)?$/.test(raw)) {
      setTextValue(raw)
      const num = Number(raw)
      if (!isNaN(num)) {
        // Clamp value within bounds
        const clamped = Math.min(max, Math.max(min, num))
        onChange(clamped)
      }
    }
  }

  const handleBlur = () => {
    if (textValue === '' || textValue === '-' || isNaN(Number(textValue))) {
      const fallback = Math.min(max, Math.max(min, 0))
      setTextValue(String(fallback))
      onChange(fallback)
    } else {
      const num = Number(textValue)
      const clamped = Math.min(max, Math.max(min, num))
      setTextValue(String(clamped))
      onChange(clamped)
    }
  }

  const handleDecrement = () => {
    if (disabled) return
    const current = textValue === '' || textValue === '-' ? 0 : Number(textValue) || 0
    const next = Math.max(min, current - step)
    setTextValue(String(next))
    onChange(next)
  }

  const handleIncrement = () => {
    if (disabled) return
    const current = textValue === '' || textValue === '-' ? 0 : Number(textValue) || 0
    const next = Math.min(max, current + step)
    setTextValue(String(next))
    onChange(next)
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          <span>{label}</span>
          {unit && <span className="text-slate-400 dark:text-slate-500 font-normal">{unit}</span>}
        </div>
      )}
      <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs focus-within:border-brand-500 transition-all overflow-hidden">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== -Infinity && value <= min)}
          className="p-1.5 px-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 active:bg-slate-200 dark:active:bg-slate-700 transition-all flex items-center justify-center shrink-0 select-none touch-manipulation disabled:opacity-30 disabled:pointer-events-none"
          title={`ลดค่า (-${step})`}
        >
          <Minus className="w-3 h-3" />
        </button>

        <input
          type="text"
          inputMode="text"
          value={textValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          className="w-full text-center bg-transparent py-1 px-1 text-xs text-slate-900 dark:text-slate-100 outline-none font-mono min-w-0"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== Infinity && value >= max)}
          className="p-1.5 px-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 active:bg-slate-200 dark:active:bg-slate-700 transition-all flex items-center justify-center shrink-0 select-none touch-manipulation disabled:opacity-30 disabled:pointer-events-none"
          title={`เพิ่มค่า (+${step})`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
