import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { createHospitalBill, updateHospitalBill } from "../apis/hospitalBillApi";
import { getServices } from "../apis/serviceApi";

const FinalBillForm = ({ patient, onClose, onSuccess, isEdit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(-1);

  const [formData, setFormData] = useState({
    patient: patient?._id || "",
    customerName: patient?.name || "",
    customerContact: patient?.phoneNumber || "",
    patientAge: patient?.age ? patient.age.toString() : "",
    patientSex: patient?.sex || "",
    patientAddress: patient?.address || "",
    consultantName: "",
    admitDate: "",
    dischargeDate: "",
    ipdNo: "",
    patientRegistration: patient?.patientId || "",
    discount: 0,
    tax: 0,
    paymentMode: "Cash",
    remarks: "",
  });

  const [services, setServices] = useState([
    { serviceName: "", date: new Date().toISOString().split("T")[0], rate: 0, quantity: 1, amount: 0, filteredServices: [] }
  ]);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        patient: initialData.patient?._id || initialData.patient || patient?._id,
        customerName: initialData.customerName || "",
        customerContact: initialData.customerContact || "",
        patientAge: initialData.patientAge ? initialData.patientAge.toString() : "",
        patientSex: initialData.patientSex || "",
        patientAddress: initialData.patientAddress || "",
        consultantName: initialData.consultantName || "",
        admitDate: initialData.admitDate ? initialData.admitDate.split('T')[0] : "",
        dischargeDate: initialData.dischargeDate ? initialData.dischargeDate.split('T')[0] : "",
        ipdNo: initialData.ipdNo || "",
        patientRegistration: initialData.patientRegistration || "",
        discount: initialData.discount || 0,
        tax: initialData.tax || 0,
        paymentMode: initialData.paymentMode || "Cash",
        remarks: initialData.remarks || "",
      });
      if (initialData.services) {
          setServices(initialData.services.map(s => ({ 
              ...s, 
              date: s.date ? s.date.split('T')[0] : new Date().toISOString().split("T")[0],
              filteredServices: [] 
          })));
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
        toast.error("Failed to load services");
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
    
    // Auto calculate amount
    if (field === 'rate' || field === 'quantity') {
      const rate = parseFloat(updatedServices[index].rate) || 0;
      const quantity = parseFloat(updatedServices[index].quantity) || 0;
      updatedServices[index].amount = rate * quantity;
    }

    setServices(updatedServices);
  };

  const handleServiceSearch = (index, searchTerm) => {
    const updatedServices = [...services];
    updatedServices[index].serviceName = searchTerm;

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
    updatedServices[index].service = service._id;
    updatedServices[index].serviceName = service.name;
    updatedServices[index].rate = service.price;
    updatedServices[index].quantity = 1;
    updatedServices[index].amount = service.price; 
    updatedServices[index].filteredServices = [];

    setServices(updatedServices);
    setShowDropdown(false);
  };

  const handleServiceFocus = (index) => {
    const service = services[index];
    const searchTerm = service.serviceName || "";
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
    setServices([...services, { serviceName: "", date: new Date().toISOString().split("T")[0], rate: 0, quantity: 1, amount: 0, filteredServices: [] }]);
  };

  const removeService = (index) => {
    if (services.length > 1) {
      const updatedServices = services.filter((_, i) => i !== index);
      setServices(updatedServices);
    }
  };

  const calculateTotals = () => {
    const totalAmount = services.reduce((total, service) => total + (parseFloat(service.amount) || 0), 0);
    const discount = parseFloat(formData.discount) || 0;
    const tax = parseFloat(formData.tax) || 0;
    const grandTotal = totalAmount - discount + tax;
    return { totalAmount, grandTotal };
  };

  const { totalAmount, grandTotal } = calculateTotals();

  const numberToWords = (num) => {
      return `Rupees ${num.toFixed(2)} Only`; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName) {
      toast.error("Customer/Patient Name is required");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
          ...formData,
          services: services.map(({ filteredServices, ...rest }) => rest),
          totalAmount,
          grandTotal,
          amountInWords: numberToWords(grandTotal)
      };

      if (isEdit && initialData?._id) {
          await updateHospitalBill(initialData._id, payload);
          toast.success("Final Bill Updated Successfully");
      } else {
          await createHospitalBill(payload);
          toast.success("Final Bill Created Successfully");
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} Final bill`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-start justify-center p-4 pt-16 backdrop-blur-sm overflow-y-auto">
       <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all animate-fadeIn my-4">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
              <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit' : 'New'} Final Bill</h2>
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Patient Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Patient Name</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact</label>
                <input type="text" name="customerContact" value={formData.customerContact} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">IPD No</label>
                <input type="text" name="ipdNo" value={formData.ipdNo} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="IPD No" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Admit Date</label>
                <input type="date" name="admitDate" value={formData.admitDate} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discharge Date</label>
                <input type="date" name="dischargeDate" value={formData.dischargeDate} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Consultant Name</label>
                <input type="text" name="consultantName" value={formData.consultantName} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
             </div>
          </div>

          {/* Services Section */}
          <div className="border rounded-xl p-4 bg-gray-50">
             <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">Bill Items</h3>
             </div>
             
             <div className="space-y-3">
                  {services.map((service, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 md:gap-2 items-start md:items-end relative p-3 md:p-0 border md:border-0 rounded-lg bg-white md:bg-transparent shadow-sm md:shadow-none">
                          <div className="w-full md:flex-[3] relative">
                              <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Item Name</label>
                              <input 
                                type="text" 
                                value={service.serviceName} 
                                onChange={(e) => handleServiceSearch(index, e.target.value)}
                                onFocus={() => handleServiceFocus(index)}
                                onBlur={handleServiceBlur}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm" 
                                placeholder="Search Service..." 
                              />
                              {showDropdown && dropdownIndex === index && service.filteredServices && service.filteredServices.length > 0 && (
                                 <div className="absolute z-50 left-0 right-0 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-y-auto">
                                     {service.filteredServices.map((s) => (
                                         <div 
                                           key={s._id} 
                                           onMouseDown={() => handleServiceSelect(index, s)}
                                           className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-0"
                                         >
                                             <div className="font-medium text-gray-800">{s.name}</div>
                                             <div className="text-xs text-gray-500 font-bold">Price: ₹{s.price}</div>
                                         </div>
                                     ))}
                                 </div>
                              )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:contents gap-3 w-full">
                              <div className="w-full md:flex-1">
                                  <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Date</label>
                                  <input type="date" value={service.date} onChange={(e) => handleServiceChange(index, "date", e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm" />
                              </div>
                              <div className="w-full md:flex-1">
                                  <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Rate</label>
                                  <input type="number" value={service.rate} onChange={(e) => handleServiceChange(index, "rate", e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm" placeholder="0" />
                              </div>
                              <div className="w-full md:flex-[0.5]">
                                  <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Qty</label>
                                  <input type="number" value={service.quantity} onChange={(e) => handleServiceChange(index, "quantity", e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 outline-none text-sm" placeholder="1" />
                              </div>
                              <div className="w-full md:flex-1">
                                  <label className="block text-xs text-gray-500 mb-1 font-semibold md:font-normal">Amount</label>
                                  <input type="number" value={service.amount} readOnly className="w-full px-2 md:px-3 py-2 rounded-md border border-gray-300 bg-gray-100 outline-none text-sm font-medium" placeholder="0" />
                              </div>
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={() => removeService(index)} 
                            className="absolute md:static top-2 right-2 md:top-auto md:right-auto p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-100 md:border-0" 
                            disabled={services.length === 1}
                          >
                            ✕
                          </button>
                      </div>
                  ))}
                  <button type="button" onClick={addService} className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors font-medium mt-2">+ Add Item</button>
             </div>
          </div>
          
          {/* Totals Section */}
          <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="md:w-1/2">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                   <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" rows="3" placeholder="Notes..."></textarea>
                   
                   <div className="mt-4">
                       <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                       <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                       </select>
                   </div>
              </div>

              <div className="md:w-1/3 space-y-3 bg-gray-50 p-4 rounded-xl h-fit">
                   <div className="flex justify-between text-sm">
                       <span className="text-gray-600">Total Amount:</span>
                       <span className="font-medium">₹ {totalAmount.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm items-center">
                       <span className="text-gray-600">Discount:</span>
                       <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-20 px-2 py-1 rounded border border-gray-300 outline-none text-right font-medium" />
                   </div>
                   <div className="flex justify-between text-sm items-center">
                       <span className="text-gray-600">Tax:</span>
                       <input type="number" name="tax" value={formData.tax} onChange={handleChange} className="w-20 px-2 py-1 rounded border border-gray-300 outline-none text-right font-medium" />
                   </div>
                   <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                       <span className="text-gray-800">Grand Total:</span>
                       <span className="text-blue-600">₹ {grandTotal.toFixed(2)}</span>
                   </div>
              </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-lg shadow-blue-200">
              {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Final Bill" : "Create Final Bill")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinalBillForm;
