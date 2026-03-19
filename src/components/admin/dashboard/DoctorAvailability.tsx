interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  avatar?: string;
  department?: string;
  nextAvailable?: string;
}

interface Props {
  doctors?: Doctor[];
}

const defaultDoctors: Doctor[] = [
  { id: "1", name: "Dr. Sarah Johnson", specialty: "Cardiologist", available: true, department: "Cardiology", nextAvailable: "2:00 PM" },
  { id: "2", name: "Dr. Michael Chen", specialty: "Neurologist", available: false, department: "Neurology", nextAvailable: "4:30 PM" },
  { id: "3", name: "Dr. Emily Williams", specialty: "Pediatrician", available: true, department: "Pediatrics", nextAvailable: "Now" },
  { id: "4", name: "Dr. James Anderson", specialty: "Orthopedic", available: true, department: "Orthopedics", nextAvailable: "3:15 PM" },
  { id: "5", name: "Dr. Lisa Martinez", specialty: "Dermatologist", available: false, department: "Dermatology", nextAvailable: "5:00 PM" },
  { id: "6", name: "Dr. Robert Taylor", specialty: "General Surgeon", available: true, department: "Surgery", nextAvailable: "1:30 PM" },
  { id: "7", name: "Dr. Jennifer Davis", specialty: "Psychiatrist", available: false, department: "Psychiatry", nextAvailable: "6:00 PM" },
  { id: "8", name: "Dr. David Wilson", specialty: "Radiologist", available: true, department: "Radiology", nextAvailable: "2:45 PM" },
  { id: "9", name: "Dr. Maria Garcia", specialty: "Oncologist", available: true, department: "Oncology", nextAvailable: "3:30 PM" },
  { id: "10", name: "Dr. John Brown", specialty: "Endocrinologist", available: false, department: "Endocrinology", nextAvailable: "Tomorrow" },
];

export default function DoctorAvailability({ doctors = defaultDoctors }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Doctor Availability
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Available</span>
          <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
          <span>Busy</span>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
        <div className="space-y-3">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  doc.available ? "bg-gradient-to-br from-green-400 to-green-600" : "bg-gradient-to-br from-red-400 to-red-600"
                }`}>
                  {doc.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{doc.specialty}</p>
                    {doc.department && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-xs text-gray-400">{doc.department}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    doc.available
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    doc.available ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  {doc.available ? "Available" : "Busy"}
                </span>
                {doc.nextAvailable && (
                  <p className="text-xs text-gray-400 mt-1">
                    {doc.available ? "Next: " : "Available: "}{doc.nextAvailable}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}