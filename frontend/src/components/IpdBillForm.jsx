import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { createIpdBill, updateIpdBill } from "../apis/ipdBillApi";
import { getServices } from "../apis/serviceApi";

const IpdBillForm = ({ patient, onClose, onSuccess, isEdit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: patient?._id || "",
    ipdNo: "",
    consultantName: "",
    paymentMode: "Cash",
    remarks: "",
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(-1);

  const [particulars, setParticulars] = useState([
    { description: "Advance Amount Towards Patient Admission", amount: 5000, date: new Date().toISOString().split('T')[0], filteredServices: [] }
  ]);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        patientId: initialData.patient?._id || initialData.patient || patient?._id,
        ipdNo: initialData.ipdNo || "",
        consultantName: initialData.consultantName || "",
        paymentMode: initialData.paymentMode || "Cash",
        remarks: initialData.remarks || "",
      });
      if (initialData.particulars) {
          setParticulars(initialData.particulars.map(p => ({ ...p, filteredServices: [] })));
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

  const handleParticularChange = (index, field, value) => {
    const updatedParticulars = [...particulars];
    updatedParticulars[index][field] = value;
    setParticulars(updatedParticulars);
  };

  const handleParticularSearch = (index, searchTerm) => {
    const updatedParticulars = [...particulars];
    updatedParticulars[index].description = searchTerm;

    const filtered = availableServices.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    updatedParticulars[index].filteredServices = searchTerm ? filtered : availableServices;
    setParticulars(updatedParticulars);
    setShowDropdown(true);
    setDropdownIndex(index);
  };

  const handleParticularSelect = (index, service) => {
    const updatedParticulars = [...particulars];
    updatedParticulars[index].description = service.name;
    updatedParticulars[index].amount = service.price;
    updatedParticulars[index].filteredServices = [];

    setParticulars(updatedParticulars);
    setShowDropdown(false);
  };

  const handleParticularFocus = (index) => {
    const particular = particulars[index];
    const searchTerm = particular.description || "";
    const filtered = availableServices.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const updatedParticulars = [...particulars];
    updatedParticulars[index].filteredServices = searchTerm ? filtered : availableServices;
    setParticulars(updatedParticulars);
    setShowDropdown(true);
    setDropdownIndex(index);
  };

  const handleParticularBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const addParticular = () => {
    setParticulars([...particulars, { description: "", amount: 0, date: new Date().toISOString().split('T')[0], filteredServices: [] }]);
  };

  const removeParticular = (index) => {
    const updatedParticulars = particulars.filter((_, i) => i !== index);
    setParticulars(updatedParticulars);
  };

  const calculateTotal = () => {
    return particulars.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ipdNo) {
      toast.error("IPD Number is required");
      return;
    }
    if (!formData.consultantName) {
      toast.error("Consultant Name is required");
      return;
    }

    try {
      setLoading(true);
      const totalAmount = calculateTotal();
      
      const payload = {
          ...formData,
          particulars: particulars.map(({ filteredServices, ...rest }) => rest),
          totalAmount
      };

      if (isEdit && initialData?._id) {
          await updateIpdBill(initialData._id, payload);
          toast.success("IPD Bill Updated Successfully");
      } else {
          await createIpdBill(payload);
          toast.success("IPD Bill Created Successfully");
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} IPD bill`);
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
              <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit' : 'New'} IPD Bill</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">IPD Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="ipdNo"
                value={formData.ipdNo}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter IPD No"
                required
              />
            </div>

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

          {/* Particulars Section */}
          <div className="border rounded-xl p-4 bg-gray-50">
             <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">Particulars</h3>
             </div>
             
             <div className="space-y-3">
                  {particulars.map((item, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-end relative p-3 md:p-0 border md:border-0 rounded-lg bg-white md:bg-transparent">
                          <div className="flex-1 relative">
                              <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Description</label>
                               <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleParticularSearch(index, e.target.value)}
                                  onFocus={() => handleParticularFocus(index)}
                                  onBlur={handleParticularBlur}
                                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                  placeholder="Description"
                              />
                              {showDropdown && dropdownIndex === index && item.filteredServices && item.filteredServices.length > 0 && (
                                <div className="absolute z-[110] left-0 right-0 mt-1 bg-white shadow-xl rounded-md border border-gray-200 max-h-48 overflow-y-auto">
                                    {item.filteredServices.map((s) => (
                                        <div 
                                          key={s._id} 
                                          onMouseDown={() => handleParticularSelect(index, s)}
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
                                     value={item.date ? item.date.split('T')[0] : ''}
                                     onChange={(e) => handleParticularChange(index, "date", e.target.value)}
                                     className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm font-medium"
                                  />
                              </div>
                              <div className="flex-1 md:w-32">
                                  <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Amount (₹)</label>
                                  <input
                                     type="number"
                                     value={item.amount}
                                     onChange={(e) => handleParticularChange(index, "amount", e.target.value)}
                                     className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm font-medium"
                                     placeholder="0.00"
                                  />
                              </div>
                              <button 
                                type="button"
                                onClick={() => removeParticular(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-100 md:border-0"
                                disabled={particulars.length === 1}
                              >
                                 ✕
                              </button>
                          </div>
                      </div>
                  ))}
                  <button 
                   type="button" 
                   onClick={addParticular}
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
              {loading ? (isEdit ? "Updating..." : "Generating...") : (isEdit ? "Update IPD Bill" : "Generate IPD Bill")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IpdBillForm;
