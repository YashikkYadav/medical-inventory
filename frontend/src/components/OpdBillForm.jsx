import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { createOpdBill, updateOpdBill } from "../apis/opdBillApi";
import { getServices } from "../apis/serviceApi";

const OpdBillForm = ({ patient, onClose, onSuccess, isEdit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: patient?._id || "",
    billNo: "",
    caseType: "New Case",
    billDate: new Date().toISOString().split("T")[0],
    consultantName: "",
    paymentMode: "Cash",
    remarks: "",
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(-1);

  const [services, setServices] = useState([
    { name: "CONSULTATION CHARGES-OPD", amount: 100, date: new Date().toISOString().split('T')[0], filteredServices: [] }
  ]);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        patientId: initialData.patient?._id || initialData.patient || patient?._id,
        billNo: initialData.billNo || "",
        caseType: initialData.caseType || "New Case",
        billDate: initialData.billDate ? initialData.billDate.split("T")[0] : new Date().toISOString().split("T")[0],
        consultantName: initialData.consultantName || "",
        paymentMode: initialData.paymentMode || "Cash",
        remarks: initialData.remarks || "",
      });
      if (initialData.services) {
          setServices(initialData.services.map(s => ({ ...s, filteredServices: [] })));
      }
    }
  }, [isEdit, initialData, patient]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        setAvailableServices(response.data || response);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  const handleServiceSearch = (index, searchTerm) => {
    const updatedServices = [...services];
    updatedServices[index].name = searchTerm;

    const filtered = availableServices.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    updatedServices[index].filteredServices = searchTerm ? filtered : availableServices;
    setServices(updatedServices);
    setShowDropdown(true);
    setDropdownIndex(index);
  };

  const handleServiceSelect = (index, service) => {
    const updatedServices = [...services];
    updatedServices[index].name = service.name;
    updatedServices[index].amount = service.price;
    updatedServices[index].filteredServices = [];

    setServices(updatedServices);
    setShowDropdown(false);
  };

  const handleServiceFocus = (index) => {
    const service = services[index];
    const searchTerm = service.name || "";
    const filtered = availableServices.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const updatedServices = [...services];
    updatedServices[index].filteredServices = searchTerm ? filtered : availableServices;
    setServices(updatedServices);
    setShowDropdown(true);
    setDropdownIndex(index);
  };

  const handleServiceBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const addService = () => {
    setServices([...services, { name: "", amount: 0, date: new Date().toISOString().split('T')[0], filteredServices: [] }]);
  };

  const removeService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
  };

  const calculateTotal = () => {
    return services.reduce((total, service) => total + (parseFloat(service.amount) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consultantName) {
      toast.error("Consultant Name is required");
      return;
    }

    try {
      setLoading(true);
      const totalAmount = calculateTotal();
      
      const payload = {
          ...formData,
          services: services.map(({ filteredServices, ...rest }) => rest), // Remove filteredServices temp field
          totalAmount
      };

      if (isEdit && initialData?._id) {
          await updateOpdBill(initialData._id, payload);
          toast.success("OPD Bill Updated Successfully");
      } else {
          await createOpdBill(payload);
          toast.success("OPD Bill Created Successfully");
      }
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} OPD bill`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-start justify-center p-4 pt-16 backdrop-blur-sm overflow-y-auto index-1">
       <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all animate-fadeIn my-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
              <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit' : 'New'} OPD Bill</h2>
              <p className="text-sm text-gray-500 mt-1">Patient: <span className="font-semibold text-gray-700">{patient?.name}</span> ({patient?.patientId})</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:font-extrabold hover:scale-110 transition-all bg-red-500  text-white rounded-full px-3 py-1 shadow-sm hover:shadow-md"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consultant Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="consultantName"
                value={formData.consultantName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Dr. Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
              <select
                name="caseType"
                value={formData.caseType}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="New Case">New Case</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bill Date</label>
              <input
                type="date"
                name="billDate"
                value={formData.billDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receipt No. (Optional)</label>
              <input
                type="text"
                name="billNo"
                value={formData.billNo}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          {/* Services Section */}
          <div className="border rounded-xl p-4 bg-gray-50">
             <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">Services / Particulars</h3>
             </div>
             
             <div className="space-y-3">
                  {services.map((service, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-end relative p-3 md:p-0 border md:border-0 rounded-lg bg-white md:bg-transparent">
                          <div className="flex-1 relative">
                              <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Service Name</label>
                              <input
                                 type="text"
                                 value={service.name}
                                 onChange={(e) => handleServiceSearch(index, e.target.value)}
                                 onFocus={() => handleServiceFocus(index)}
                                 onBlur={handleServiceBlur}
                                 className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                 placeholder="Service Name"
                              />
                              {showDropdown && dropdownIndex === index && service.filteredServices && service.filteredServices.length > 0 && (
                                <div className="absolute z-[110] left-0 right-0 mt-1 bg-white shadow-xl rounded-md border border-gray-200 max-h-48 overflow-y-auto">
                                    {service.filteredServices.map((s) => (
                                        <div 
                                          key={s._id} 
                                          onMouseDown={() => handleServiceSelect(index, s)}
                                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                                        >
                                            <div className="font-medium text-gray-800">{s.name}</div>
                                            <div className="text-xs text-gray-500 font-bold">₹ {s.price}</div>
                                        </div>
                                    ))}
                                </div>
                              )}
                          </div>
                          <div className="flex flex-row gap-3 items-end">
                              <div className="flex-1 md:w-32">
                                  <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Date</label>
                                  <input
                                     type="date"
                                     value={service.date ? service.date.split('T')[0] : ''}
                                     onChange={(e) => handleServiceChange(index, "date", e.target.value)}
                                     className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm font-medium"
                                  />
                              </div>
                              <div className="flex-1 md:w-32">
                                  <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Amount (₹)</label>
                                  <input
                                     type="number"
                                     value={service.amount}
                                     onChange={(e) => handleServiceChange(index, "amount", e.target.value)}
                                     className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm font-medium"
                                     placeholder="0.00"
                                  />
                              </div>
                              <button 
                                type="button"
                                onClick={() => removeService(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-100 md:border-0"
                                disabled={services.length === 1}
                              >
                                 ✕
                              </button>
                          </div>
                      </div>
                  ))}
                  <button 
                   type="button" 
                   onClick={addService}
                   className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors font-medium mt-2"
                 >
                   + Add Item
                 </button>
             </div>
             
             <div className="mt-4 flex justify-end items-center gap-4 pt-4 border-t border-gray-200">
                  <span className="font-bold text-gray-700">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">₹ {calculateTotal().toFixed(2)}</span>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              rows="2"
              placeholder="Any additional notes..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-200"
            >
              {loading ? (isEdit ? "Updating..." : "Generating...") : (isEdit ? "Update OPD Bill" : "Generate OPD Bill")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpdBillForm;
