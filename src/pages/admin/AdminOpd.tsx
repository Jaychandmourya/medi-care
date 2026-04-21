import TokenIssueForm from '@/components/opd/TokenIssueForm'
import LiveQueueDisplay from '@/components/opd/LiveQueueDisplay'
import QueueControlPanel from '@/components/opd/QueueControlPanel'
import QueueAnalytics from '@/components/opd/QueueAnalytics'

const AdminOpd = () => {
  return (
    <div>
      <div>
        <div className="mb-6 lg:mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">OPD Token Management</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Real-time outpatient queue management system</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Token Issue and Control */}
          <div className="space-y-6">
            <TokenIssueForm />
            <QueueControlPanel />
          </div>

          {/* Middle Column - Live Queue Display */}
          <div className="xl:col-span-2">
            <LiveQueueDisplay />
          </div>
        </div>

        {/* Bottom Row - Analytics */}
        <div className="mt-4 lg:mt-6">
          <QueueAnalytics />
        </div>
      </div>
    </div>
  );
};

export default AdminOpd;