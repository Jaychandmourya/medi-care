import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Info, AlertTriangle, CheckCircle, X } from 'lucide-react'
import {
  setSelectedDrug,
  checkDrugRecall
} from '@/features/prescription/prescriptionSlice'
import type { AppDispatch, RootState } from '@/app/store'

const DrugInfoPanel = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedDrug } = useSelector((state: RootState) => state.prescriptions)
  const lastFetchedDrugRef = useRef<string | null>(null)

  useEffect(() => {
    if (selectedDrug && selectedDrug.brandName !== lastFetchedDrugRef.current) {
      lastFetchedDrugRef.current = selectedDrug.brandName
      dispatch(checkDrugRecall(selectedDrug.brandName))
    }
  }, [selectedDrug, dispatch])

  const handleClose = useCallback(() => {
    dispatch(setSelectedDrug(null))
    lastFetchedDrugRef.current = null // Reset to allow re-fetching same drug later
  }, [dispatch])

  // Memoize recall info display to avoid unnecessary re-computation
  const recallInfoDisplay = useMemo(() => {
    if (!selectedDrug?.recallInfo) return null

    const recallInfo = selectedDrug.recallInfo as Record<string, unknown>
    return (
      <div className="mt-2 text-xs text-red-600">
        <p>Reason: {String(recallInfo.reason_for_recall || 'N/A')}</p>
        <p>Date: {String(recallInfo.recall_initiation_date || 'N/A')}</p>
      </div>
    )
  }, [selectedDrug])

  // Memoize adverse reactions display to avoid re-computation on every render
  const adverseReactionsDisplay = useMemo(() => {
    if (!selectedDrug?.adverseReactions || selectedDrug.adverseReactions.length === 0) return null

    const reactionsToShow = selectedDrug.adverseReactions.slice(0, 10)
    const remainingCount = selectedDrug.adverseReactions.length - 10

    return (
      <div>
        <h4 className="font-medium text-gray-900 mb-1">Known Adverse Reactions</h4>
        <div className="flex flex-wrap gap-1">
          {reactionsToShow.map((reaction, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200"
            >
              {reaction}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
              +{remainingCount} more
            </span>
          )}
        </div>
      </div>
    )
  }, [selectedDrug])

  // Memoize warnings display to avoid re-computation
  const warningsDisplay = useMemo(() => {
    if (!selectedDrug?.warnings || selectedDrug.warnings.length === 0) return null

    return (
      <div>
        <h4 className="font-medium text-gray-900 mb-1">Warnings</h4>
        <ul className="text-gray-700 text-sm space-y-1">
          {selectedDrug.warnings.map((warning, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }, [selectedDrug])

  if (!selectedDrug) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Drug Information
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Recall Alert */}
      {selectedDrug.isRecalled && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">Drug Recall Alert</h4>
              <p className="text-red-700 text-sm mt-1">
                This drug has active recalls. Consider alternative medications.
              </p>
              {selectedDrug.recallInfo && recallInfoDisplay}
            </div>
          </div>
        </div>
      )}

      {/* No Recall Badge */}
      {!selectedDrug.isRecalled && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
          <span className="text-green-700 text-sm font-medium">No Active Recalls</span>
        </div>
      )}

      {/* Drug Details */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Brand Name</h4>
          <p className="text-gray-700">{selectedDrug.brandName}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-1">Generic Name</h4>
          <p className="text-gray-700">{selectedDrug.genericName}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-1">Drug Class</h4>
          <p className="text-gray-700">{selectedDrug.drugClass}</p>
        </div>

        {selectedDrug.manufacturer && (
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Manufacturer</h4>
            <p className="text-gray-700">{selectedDrug.manufacturer}</p>
          </div>
        )}

        {selectedDrug.purpose && (
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Purpose</h4>
            <p className="text-gray-700 text-sm">{selectedDrug.purpose}</p>
          </div>
        )}

        {selectedDrug.dosage && (
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Dosage & Administration</h4>
            <p className="text-gray-700 text-sm whitespace-pre-line">{selectedDrug.dosage}</p>
          </div>
        )}

        {warningsDisplay}

        {adverseReactionsDisplay}
      </div>
    </div>
  )
}

export default DrugInfoPanel
