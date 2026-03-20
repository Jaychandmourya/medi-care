import { AlertTriangle, X } from 'lucide-react';

interface DeleteDialogProps {
  isOpenDelete: boolean;
  onClose: () => void;
  deleteTitle: string;
  onConfirm?: () => void;
  description?: string;
  itemName?: string;
}

export default function DeleteDialog({
  isOpenDelete,
  onClose,
  deleteTitle,
  onConfirm,
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
}: DeleteDialogProps) {
  if (!isOpenDelete) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 opacity-100 animate-slide-up">

        {/* Header */}
        <div className="flex justify-between items-start p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {deleteTitle || "Delete Item"}
              </h2>
              {itemName && (
                <p className="text-sm text-gray-500 mt-1">{itemName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 group"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Description */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 order-1 sm:order-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
