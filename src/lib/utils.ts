import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function validatePasswordStrength(password: string) {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const strengthCount = Object.values(criteria).filter(Boolean).length

  let score = 0
  let label = "Very Weak"
  let color = "bg-destructive"

  if (password.length > 0) {
    score = strengthCount
    if (score <= 2) {
      label = "Weak"
      color = "bg-destructive"
    } else if (score === 3) {
      label = "Fair"
      color = "bg-orange-400"
    } else if (score === 4) {
      label = "Good"
      color = "bg-blue-400"
    } else {
      label = "Strong"
      color = "bg-emerald-500"
    }
  } else {
    label = ""
    color = "bg-muted"
  }

  return { criteria, score, label, color }
}