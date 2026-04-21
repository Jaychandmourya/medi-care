import TokenIssueForm from '@/components/opd/TokenIssueForm'
import LiveQueueDisplay from '@/components/opd/LiveQueueDisplay'
import QueueControlPanel from '@/components/opd/QueueControlPanel'
import QueueAnalytics from '@/components/opd/QueueAnalytics'

const ReceptionistOpd = () => {
  return (
    <div>
      <div>
        <div className="mb-8 bg-white rounded-lg p-4 lg:p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">OPD Token Management</h1>
          <p className="text-gray-600 mt-2">Real-time outpatient queue management system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Token Issue and Control */}
          <div className="space-y-6">
            <TokenIssueForm />
            <QueueControlPanel />
          </div>

          {/* Middle Column - Live Queue Display */}
          <div className="lg:col-span-2">
            <LiveQueueDisplay />
          </div>
        </div>

        {/* Bottom Row - Analytics */}
        <div className="mt-6">
          <QueueAnalytics />
        </div>
      </div>
    </div>
  )
}

export default ReceptionistOpd