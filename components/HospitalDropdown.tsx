interface HospitalDropdownProps {
  hospitals: any[]
  onSelect: (hospital: any) => void
}

export default function HospitalDropdown({ hospitals, onSelect }: HospitalDropdownProps) {
  return (
    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
      {hospitals.map((hospital) => (
        <div key={hospital.id} className="p-2 hover:bg-gray-700 cursor-pointer" onClick={() => onSelect(hospital)}>
          <h3 className="font-semibold">{hospital.name}</h3>
          <p className="text-sm text-gray-400">Specialties: {hospital.specialties.join(", ")}</p>
          <p className="text-sm text-gray-400">Wait Time: {hospital.averageWaitTime} mins</p>
        </div>
      ))}
    </div>
  )
}
