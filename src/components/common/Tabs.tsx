import type { LucideIcon } from 'lucide-react'

type TabItem = {
  id: string
  label: string
  icon?: LucideIcon
}

type TabsProps = {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
}

export const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => {
  return (
    <div className="flex gap-1 border-b border-gray-200 -mb-px overflow-x-auto">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center cursor-pointer gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {Icon && <Icon className="w-5 h-5" />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
