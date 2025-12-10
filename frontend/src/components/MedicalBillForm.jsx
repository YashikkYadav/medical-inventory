import React, { useState, useEffect } from "react";
import { ToWords } from "to-words";
import { toast } from "react-hot-toast";
import { getMedicines } from "../apis/medicineApi";
import { createMedicalBill } from "../apis/medicalBillApi";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});

const MedicalBillForm = ({ onClose, onBillCreated }) => {
  const medialInfo = {
    name: "Shree Medical And General Store",
    address: "Khawa Rani ji, Jamwa Ramgarh,Jaipur 303109(Raj)",
    phone: "7023314141, 6350283164, 7340306199, 8058280829",
    dlNo: "DRUG/2025-26/13632-136324",
  };

  // Form state for medical bill
  const [medicalBillForm, setMedicalBillForm] = useState({
    customerName: "",
    customerContact: "",
    patientAge: "",
    patientSex: "",
    patientAddress: "",
    dlNo: medialInfo.dlNo,
    gstin: "",
    items: [{ medicine: "", quantity: 1 }],
    discount: 0,
    paymentMode: "Cash",
    paymentDate: "",
  });

  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [searchTerms, setSearchTerms] = useState({}); // Track search terms for each item
  const [filteredMedicines, setFilteredMedicines] = useState({}); // Track filtered medicines for each item
  const [showDropdown, setShowDropdown] = useState({}); // Track dropdown visibility for each item
  // Fetch medicines when component mounts
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Initialize search terms when medicines or items change
  useEffect(() => {
    const initialSearchTerms = {};
    const initialFilteredMedicines = {};
    const initialShowDropdown = {};

    medicalBillForm.items.forEach((item, index) => {
      if (item.medicine) {
        // Find the medicine name for the selected medicine ID
        const medicine = medicines.find((m) => m._id === item.medicine);
        if (medicine) {
          initialSearchTerms[index] = medicine.name;
        }
      }
      initialFilteredMedicines[index] = [];
      initialShowDropdown[index] = false;
    });

    setSearchTerms(initialSearchTerms);
    setFilteredMedicines(initialFilteredMedicines);
    setShowDropdown(initialShowDropdown);
  }, [medicines, medicalBillForm.items]);
  const fetchMedicines = async () => {
    try {
      setLoadingMedicines(true);

      // Check if medicines are already in localStorage
      const cachedMedicines = localStorage.getItem("medicines");
      const cacheTimestamp = localStorage.getItem("medicines_timestamp");

      // Use cached data if it exists and is less than 5 minutes old
      if (cachedMedicines && cacheTimestamp) {
        const now = new Date().getTime();
        const cacheTime = parseInt(cacheTimestamp);

        if (now - cacheTime < 5 * 60 * 1000) {
          // 5 minutes
          setMedicines(JSON.parse(cachedMedicines));
          setLoadingMedicines(false);
          return;
        }
      }

      // Fetch fresh data from API
      const response = await getMedicines();
      const medicinesData = response.data || response || []; // Handle different response formats

      // Ensure medicinesData is an array
      const medicinesArray = Array.isArray(medicinesData) ? medicinesData : [];

      // Store in localStorage
      localStorage.setItem("medicines", JSON.stringify(medicinesArray));
      localStorage.setItem(
        "medicines_timestamp",
        new Date().getTime().toString()
      );

      setMedicines(medicinesArray);
    } catch (error) {
      toast.error("Failed to load medicines");
      console.error("Error fetching medicines:", error);

      // Fallback to cached data if available
      const cachedMedicines = localStorage.getItem("medicines");
      if (cachedMedicines) {
        setMedicines(JSON.parse(cachedMedicines));
      }
    } finally {
      setLoadingMedicines(false);
    }
  };

  const handleMedicalFormChange = (e) => {
    const { name, value } = e.target;
    setMedicalBillForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...medicalBillForm.items];
    updatedItems[index][field] = value;
    setMedicalBillForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Handle medicine search input change
  const handleMedicineSearchChange = (index, searchTerm) => {
    // Update search term for this item
    setSearchTerms((prev) => ({
      ...prev,
      [index]: searchTerm,
    }));

    // Filter medicines based on search term
    if (searchTerm.trim() === "") {
      setFilteredMedicines((prev) => ({
        ...prev,
        [index]: [],
      }));
      setShowDropdown((prev) => ({
        ...prev,
        [index]: false,
      }));
    } else {
      const filtered = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredMedicines((prev) => ({
        ...prev,
        [index]: filtered,
      }));

      setShowDropdown((prev) => ({
        ...prev,
        [index]: true,
      }));
    }
  };

  // Handle medicine selection from dropdown
  const handleMedicineSelect = (index, medicine) => {
    // Update the item with the selected medicine ID
    handleItemChange(index, "medicine", medicine._id);

    // Update search term to show the medicine name
    setSearchTerms((prev) => ({
      ...prev,
      [index]: medicine.name,
    }));

    // Hide dropdown
    setShowDropdown((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  // Handle focus on medicine input
  const handleMedicineFocus = (index) => {
    const searchTerm = searchTerms[index] || "";
    if (searchTerm.trim() !== "") {
      setShowDropdown((prev) => ({
        ...prev,
        [index]: true,
      }));
    }
  };

  // Handle blur (losing focus) on medicine input
  const handleMedicineBlur = (index) => {
    // Delay hiding dropdown to allow clicking on items
    setTimeout(() => {
      setShowDropdown((prev) => ({
        ...prev,
        [index]: false,
      }));
    }, 200);
  };
  const addItem = () => {
    setMedicalBillForm((prev) => ({
      ...prev,
      items: [...prev.items, { medicine: "", quantity: 1 }],
    }));
  };

  const removeItem = (index) => {
    if (medicalBillForm.items.length <= 1) return;
    const updatedItems = [...medicalBillForm.items];
    updatedItems.splice(index, 1);
    setMedicalBillForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const calculateTotals = () => {
    let totalAmount = 0;

    medicalBillForm.items.forEach((item) => {
      const medicine = medicines.find((m) => m._id === item.medicine);
      if (medicine) {
        totalAmount += medicine.price * item.quantity;
      }
    });

    const discount = parseFloat(medicalBillForm.discount) || 0;
    const grandTotal = totalAmount - discount;

    return { totalAmount, discount, grandTotal };
  };

  const handleCreateMedicalBill = async (e) => {
    e.preventDefault();

    // Validate form
    if (!medicalBillForm.customerName || !medicalBillForm.customerContact) {
      toast.error("Customer name and contact are required");
      return;
    }

    if (
      medicalBillForm.items.some((item) => !item.medicine || item.quantity <= 0)
    ) {
      toast.error(
        "All items must have a medicine selected and quantity greater than 0"
      );
      return;
    }

    try {
      const { totalAmount, discount, grandTotal } = calculateTotals();

      // Convert amount to words
      const amountInWords = toWords.convert(grandTotal);

      // Prepare data for submission (including payment fields)
      const medicalBillData = {
        customerName: medicalBillForm.customerName,
        customerContact: medicalBillForm.customerContact,
        patientAge: medicalBillForm.patientAge,
        patientSex: medicalBillForm.patientSex,
        patientAddress: medicalBillForm.patientAddress,
        dlNo: medicalBillForm.dlNo,
        gstin: medicalBillForm.gstin,
        items: medicalBillForm.items,
        totalAmount,
        discount,
        tax: 0, // Not used in current form
        grandTotal,
        amountInWords,
        paymentMode: medicalBillForm.paymentMode,
        paymentDate:
          medicalBillForm.paymentDate || new Date().toISOString().split("T")[0],
      };

      const response = await createMedicalBill(medicalBillData);

      toast.success("Medical bill created successfully!");

      // Notify parent component
      if (onBillCreated) {
        onBillCreated(response);
      }
    } catch (error) {
      toast.error(error);
      console.error("Error creating medical bill:", error);
    }
  };

  const { totalAmount, discount, grandTotal } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Medical Bill</h1>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg"
        >
          Back to Billing
        </button>
      </div>

      <form
        onSubmit={handleCreateMedicalBill}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={medicalBillForm.customerName}
              onChange={handleMedicalFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Contact *
            </label>
            <input
              type="text"
              name="customerContact"
              value={medicalBillForm.customerContact}
              onChange={handleMedicalFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Age
            </label>
            <input
              type="text"
              name="patientAge"
              value={medicalBillForm.patientAge}
              onChange={handleMedicalFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Sex
            </label>
            <select
              name="patientSex"
              value={medicalBillForm.patientSex}
              onChange={handleMedicalFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Address
            </label>
            <textarea
              name="patientAddress"
              value={medicalBillForm.patientAddress}
              onChange={handleMedicalFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Medicine Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Add Item
            </button>
          </div>

          {loadingMedicines ? (
            <p>Loading medicines...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (₹)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicalBillForm.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <input
                          type="text"
                          value={searchTerms[index] || ""}
                          onChange={(e) =>
                            handleMedicineSearchChange(index, e.target.value)
                          }
                          onFocus={() => handleMedicineFocus(index)}
                          onBlur={() => handleMedicineBlur(index)}
                          placeholder="Search medicine..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {showDropdown[index] &&
                          filteredMedicines[index] &&
                          filteredMedicines[index].length > 0 && (
                            <div className="relative z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {filteredMedicines[index].map((medicine) => (
                                <div
                                  key={medicine._id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={() =>
                                    handleMedicineSelect(index, medicine)
                                  }
                                >
                                  {medicine.name}
                                </div>
                              ))}
                            </div>
                          )}
                        {/* Hidden input to store the selected medicine ID */}
                        <input
                          type="hidden"
                          value={item.medicine}
                          onChange={() => {}}
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.medicine
                          ? (() => {
                              const medicine = medicines.find(
                                (m) => m._id === item.medicine
                              );
                              return medicine
                                ? medicine.price.toFixed(2)
                                : "0.00";
                            })()
                          : "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.medicine
                          ? (() => {
                              const medicine = medicines.find(
                                (m) => m._id === item.medicine
                              );
                              return medicine
                                ? (medicine.price * item.quantity).toFixed(2)
                                : "0.00";
                            })()
                          : "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {medicalBillForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <input
                type="number"
                name="discount"
                value={medicalBillForm.discount}
                onChange={handleMedicalFormChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                value={medicalBillForm.paymentMode || "Cash"}
                onChange={handleMedicalFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                name="paymentDate"
                value={medicalBillForm.paymentDate || ""}
                onChange={handleMedicalFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600">
                In Words: {toWords.convert(grandTotal)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create Medical Bill
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalBillForm;
