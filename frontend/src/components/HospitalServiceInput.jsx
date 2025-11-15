import React from 'react';

const HospitalServiceInput = ({ 
  charge, 
  index, 
  services,
  showDropdown,
  dropdownIndex,
  handleServiceSearch,
  handleServiceFocus,
  handleServiceBlur,
  handleServiceSelect,
  handleServiceChange
}) => {
  return (
    <td className="px-4 py-2">
      <input
        type="text"
        value={charge.name || ""}
        onChange={(e) => handleServiceSearch(index, e.target.value)}
        onFocus={() => handleServiceFocus(index)}
        onBlur={handleServiceBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Select or type service name"
      />
      {showDropdown && dropdownIndex === index && charge.filteredServices && charge.filteredServices.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-96 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Services</div>
          {charge.filteredServices.map((service) => (
            <div
              key={service._id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handleServiceSelect(index, service)}
            >
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-gray-500">Price: ₹{service.price}</div>
            </div>
          ))}
        </div>
      )}
    </td>
  );
};

export default HospitalServiceInput;