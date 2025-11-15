import React from 'react';

const MedicalMedicineInput = ({ 
  charge, 
  index, 
  medicines,
  showDropdown,
  dropdownIndex,
  handleMedicineSearch,
  handleMedicineFocus,
  handleMedicineBlur,
  handleMedicineSelect,
  handleMedicineChange
}) => {
  return (
    <td className="px-4 py-2">
      <input
        type="text"
        value={charge.name || ""}
        onChange={(e) => handleMedicineSearch(index, e.target.value)}
        onFocus={() => handleMedicineFocus(index)}
        onBlur={handleMedicineBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Select or type medicine name"
      />
      {showDropdown && dropdownIndex === index && charge.filteredMedicines && charge.filteredMedicines.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-96 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Medicines</div>
          {charge.filteredMedicines.map((medicine) => (
            <div
              key={medicine._id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handleMedicineSelect(index, medicine)}
            >
              <div className="font-medium">{medicine.name}</div>
              <div className="text-sm text-gray-500">{medicine.composition} - Price: ₹{medicine.price}</div>
            </div>
          ))}
        </div>
      )}
    </td>
  );
};

export default MedicalMedicineInput;