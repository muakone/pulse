"use client"

interface HospitalDropdownProps {
  hospitals: any[]
  onSelect: (hospital: any) => void
}

export default function HospitalDropdown({ hospitals, onSelect }: HospitalDropdownProps) {
  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
      {hospitals.map((hospital) => (
        <div key={hospital.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => onSelect(hospital)}>
          <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
          <p className="text-sm text-gray-600">Specialties: {hospital.specialties.join(", ")}</p>
          <p className="text-sm text-gray-600">Wait Time: {hospital.averageWaitTime} mins</p>
        </div>
      ))}
    </div>
  )
}
