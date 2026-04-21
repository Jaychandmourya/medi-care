import { useMemo } from 'react'

interface UseTextTruncateOptions {
  maxLength: number
  suffix?: string
}

export const useTextTruncate = (text: string, options: UseTextTruncateOptions) => {
  const { maxLength, suffix = '...' } = options

  return useMemo(() => {
    if (!text || text.length <= maxLength) {
      return text
    }
    
    return text.substring(0, maxLength) + suffix
  }, [text, maxLength, suffix])
}
