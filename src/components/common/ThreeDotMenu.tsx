import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'
import { FormButton } from './FormButton'

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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, right: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedTrigger = triggerRef.current?.contains(event.target as Node)
      const clickedMenu = menuRef.current?.contains(event.target as Node)
      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const menuWidth = 192
        const viewportWidth = window.innerWidth

        let left = rect.left
        if (position === 'right') {
          left = rect.right - menuWidth
        }

        if (left + menuWidth > viewportWidth) {
          left = rect.right - menuWidth
        }
        if (left < 0) {
          left = rect.left
        }

        setMenuPosition({
          top: rect.bottom + window.scrollY + 4,
          left: left + window.scrollX,
          right: rect.right + window.scrollX
        })
      }
    }

    updatePosition()

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, position])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div ref={triggerRef}>
      <FormButton
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        title="More options"
        className="p-1"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </FormButton>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[99999]"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
        >
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
        </div>,
        document.body
      )}
    </div>
  )
}
