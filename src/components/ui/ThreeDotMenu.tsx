import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from './Button'

interface DropdownItem {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  className?: string
}

interface ThreeDotMenuProps {
  items: DropdownItem[]
  position?: 'left' | 'right'
}

export default function ThreeDotMenu({ items, position = 'right' }: ThreeDotMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const positionClasses = position === 'right' ? 'right-0' : 'left-0'

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        title="More options"
        className="p-1"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </Button>

      {isOpen && (
        <div className={`absolute top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 ${positionClasses}`}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick()
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left cursor-pointer text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-150 flex items-center gap-2 ${item.className || ''}`}
            >
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
