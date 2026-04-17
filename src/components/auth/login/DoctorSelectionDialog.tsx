import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, User, MapPin, Stethoscope as StethoscopeIcon } from "lucide-react";
import type { LocalDoctor } from "@/types/doctors/doctorType";

interface DoctorSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoctor: (doctor: LocalDoctor) => void;
  doctors: LocalDoctor[];
  loadingDoctors: boolean;
}

export const DoctorSelectionDialog = ({
  isOpen,
  onClose,
  onSelectDoctor,
  doctors,
  loadingDoctors,
}: DoctorSelectionDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(isOpen);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Track isOpen changes for search reset logic
  useEffect(() => {
    const wasClosed = !prevIsOpenRef.current;
    const nowOpen = isOpen;
    prevIsOpenRef.current = isOpen;

    if (nowOpen && wasClosed) {
      // Modal just opened - schedule state reset for next tick to avoid sync setState
      const timeoutId = setTimeout(() => setSearchQuery(""), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Filter doctors based on search query
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const query = searchQuery.toLowerCase();
    return doctors.filter(
      (doc) =>
        doc.firstName?.toLowerCase().includes(query) ||
        doc.lastName?.toLowerCase().includes(query) ||
        doc.specialty?.toLowerCase().includes(query) ||
        doc.department?.toLowerCase().includes(query)
    );
  }, [doctors, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Select Doctor</h2>
            <p className="text-green-100 text-sm mt-1">Choose a doctor to continue</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name, specialty, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Doctor List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingDoctors ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <StethoscopeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No doctors found</p>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => onSelectDoctor(doctor)}
                  className="w-full text-left p-4 rounded-xl cursor-pointer border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-green-600" />
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                        {doctor.firstName} {doctor.lastName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {doctor.specialty && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <StethoscopeIcon className="w-3 h-3" />
                            {doctor.specialty}
                          </span>
                        )}
                        {doctor.department && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {doctor.department}
                          </span>
                        )}
                      </div>

                      {(doctor.city || doctor.state) && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {doctor.city}
                            {doctor.city && doctor.state ? ", " : ""}
                            {doctor.state}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Select Indicator */}
                    <div className="self-center">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-green-500 group-hover:bg-green-500 transition-colors flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </p>
        </div>
      </div>
    </div>
  );
};
