import { useState, useEffect, useMemo } from "react";
import { Search, User, MapPin, Stethoscope as StethoscopeIcon } from "lucide-react";
import type { LocalDoctor } from "@/types/doctors/doctorType";
import FormDialog from "@/components/common/dialog/FormDialog";
import Input from "@/components/common/Input";

interface DoctorSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoctor: (doctor: LocalDoctor) => void;
  doctors: LocalDoctor[];
  loadingDoctors: boolean;
}

export const DoctorSelection = ({
  isOpen,
  onClose,
  onSelectDoctor,
  doctors,
  loadingDoctors,
}: DoctorSelectionDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
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

  // Custom header with green gradient
  const customHeader = (
    <div className="flex items-center justify-between w-full">
      <div>
        <h2 className="text-xl font-bold text-white">Select Doctor</h2>
        <p className="text-green-100 text-sm mt-1">Choose a doctor to continue</p>
      </div>
    </div>
  );

  // Custom footer with count
  const customFooter = (
    <p className="text-xs text-gray-500 text-center">
      Showing {filteredDoctors.length} of {doctors.length} doctors
    </p>
  );

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[80vh]"
      showHeader={true}
      header={customHeader}
      headerClass="bg-gradient-to-r from-green-500 to-emerald-600"
      showCloseButton={true}
      showFooter={true}
      showDefaultButtons={false}
      footer={customFooter}
      backdropClass="bg-black/50 backdrop-blur-sm"
      containerClass="p-4"
      dialogClass="rounded-2xl overflow-hidden"
    >
      {/* Search Bar */}
      <div className="pb-4 border-b border-gray-200">
        <Input
          type="text"
          placeholder="Search doctors by name, specialty, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
          iconPosition="left"
        />
      </div>

      {/* Doctor List */}
      <div className="flex-1 overflow-y-auto pt-4 -mx-6 px-6">
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
    </FormDialog>
  );
};
