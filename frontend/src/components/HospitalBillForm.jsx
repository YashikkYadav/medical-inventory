import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createHospitalBill } from "../apis/hospitalBillApi";
import { getServices } from "../apis/serviceApi";

const HospitalBillForm = ({ onClose, onBillCreated }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(-1);

  const [formData, setFormData] = useState({
    customerName: "",
    customerContact: "",
    patientAge: "",
    patientSex: "",
    patientAddress: "",
    consultantName: "",
    admitDate: "",
    dischargeDate: "",
    billDate: new Date().toISOString().split("T")[0],
    ipdNo: "",
    patientRegistration: "",
    receiptNo: "",
    discount: 0,
    tax: 0,
    amountInWords: "",
    paymentMode: "Cash",
    remarks: "",
  });

  const [charges, setCharges] = useState([
    {
      service: null,
      serviceName: "",
      date: new Date().toISOString().split("T")[0],
      quantity: 1,
      rate: 0,
      amount: 0,
      filteredServices: [],
    },
  ]);

  // Function to convert number to words in Indian numbering system
  const numberToWords = (num) => {
    if (num === 0) return "Zero";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertHundreds = (n) => {
      let str = "";
      if (n > 99) {
        str += ones[Math.floor(n / 100)] + " Hundred";
        n %= 100;
        if (n > 0) str += " ";
      }
      if (n > 19) {
        str += tens[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) str += " " + ones[n];
      } else if (n > 0) {
        str += ones[n];
      }
      return str;
    };

    if (num >= 10000000) {
      return "Amount too large";
    }

    let result = "";
    if (num >= 100000) {
      // lakhs
      result += convertHundreds(Math.floor(num / 100000)) + " Lakh";
      num %= 100000;
      if (num > 0) result += " ";
    }
    if (num >= 1000) {
      // thousands
      result += convertHundreds(Math.floor(num / 1000)) + " Thousand";
      num %= 1000;
      if (num > 0) result += " ";
    }
    if (num > 0) {
      result += convertHundreds(num);
    }

    return result;
  };

  // Effect to update amount in words when grand total changes
  useEffect(() => {
    const grandTotal = calculateGrandTotal();
    const rupees = Math.floor(grandTotal);
    const paise = Math.round((grandTotal - rupees) * 100);

    let amountInWords = numberToWords(rupees) + " Rupees";
    if (paise > 0) {
      amountInWords += " and " + numberToWords(paise) + " Paise";
    }
    amountInWords += " Only";

    setFormData((prev) => ({
      ...prev,
      amountInWords,
    }));
  }, [charges, formData.discount, formData.tax]);

  // Load services for autocomplete
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        setServices(response.data || response);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services");
      }
    };

    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChargeChange = (index, field, value) => {
    const updatedCharges = [...charges];
    updatedCharges[index][field] = value;

    // If changing quantity or rate, recalculate amount
    if (field === "quantity" || field === "rate") {
      const rate =
        field === "rate"
          ? parseFloat(value) || 0
          : parseFloat(updatedCharges[index].rate) || 0;
      const quantity =
        field === "quantity"
          ? parseInt(value) || 1
          : parseInt(updatedCharges[index].quantity) || 1;
      updatedCharges[index].amount = (rate * quantity).toFixed(2);
    }

    setCharges(updatedCharges);
  };

  const handleServiceSearch = (index, searchTerm) => {
    const updatedCharges = [...charges];
    updatedCharges[index].serviceName = searchTerm;

    if (searchTerm.length > 1) {
      const filtered = services.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      updatedCharges[index].filteredServices = filtered;
      setCharges(updatedCharges);
      setShowDropdown(true);
      setDropdownIndex(index);
    } else {
      updatedCharges[index].filteredServices = [];
      setCharges(updatedCharges);
      setShowDropdown(false);
    }
  };

  const handleServiceSelect = (index, service) => {
    const updatedCharges = [...charges];
    updatedCharges[index].service = service._id;
    updatedCharges[index].serviceName = service.name;
    updatedCharges[index].rate = service.price;
    updatedCharges[index].amount = (
      service.price * updatedCharges[index].quantity
    ).toFixed(2);
    updatedCharges[index].filteredServices = [];

    setCharges(updatedCharges);
    setShowDropdown(false);
  };

  const addChargeRow = () => {
    setCharges([
      ...charges,
      {
        service: null,
        serviceName: "",
        date: new Date().toISOString().split("T")[0],
        quantity: 1,
        rate: 0,
        amount: 0,
        filteredServices: [],
      },
    ]);
  };

  const removeChargeRow = (index) => {
    if (charges.length > 1) {
      const updatedCharges = charges.filter((_, i) => i !== index);
      setCharges(updatedCharges);
    }
  };

  const calculateTotal = () => {
    return charges.reduce((total, charge) => {
      return total + parseFloat(charge.amount || 0);
    }, 0);
  };

  const calculateGrandTotal = () => {
    const total = calculateTotal();
    return (
      total - parseFloat(formData.discount || 0) + parseFloat(formData.tax || 0)
    );
  };

  const handleServiceFocus = (index) => {
    const charge = charges[index];
    if (charge.serviceName && charge.serviceName.length > 1) {
      const filtered = services.filter((service) =>
        service.name.toLowerCase().includes(charge.serviceName.toLowerCase())
      );
      const updatedCharges = [...charges];
      updatedCharges[index].filteredServices = filtered;
      setCharges(updatedCharges);
      setShowDropdown(true);
      setDropdownIndex(index);
    }
  };

  const handleServiceBlur = () => {
    // Delay hiding dropdown to allow for clicks on items
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customerName) {
      toast.error("Customer name is required");
      return;
    }

    // Validate charges
    for (let i = 0; i < charges.length; i++) {
      const charge = charges[i];
      if (!charge.serviceName) {
        toast.error(`Service name is required for row ${i + 1}`);
        return;
      }
      if (!charge.rate || parseFloat(charge.rate) <= 0) {
        toast.error(`Valid rate is required for row ${i + 1}`);
        return;
      }
      if (!charge.amount || parseFloat(charge.amount) <= 0) {
        toast.error(`Valid amount is required for row ${i + 1}`);
        return;
      }
    }

    try {
      // Prepare services for submission
      const servicesData = charges.map((charge) => ({
        service: charge.service,
        serviceName: charge.serviceName,
        date: charge.date,
        quantity: parseInt(charge.quantity),
        rate: parseFloat(charge.rate),
        amount: parseFloat(charge.amount),
      }));

      // Prepare data for API
      const billData = {
        ...formData,
        services: servicesData,
        totalAmount: calculateTotal(),
        grandTotal: calculateGrandTotal(),
      };

      const response = await createHospitalBill(billData);
      toast.success("Hospital bill created successfully!");

      // Notify parent component
      if (onBillCreated) {
        onBillCreated(response.data || response);
      }

      // Close form
      onClose();
    } catch (error) {
      console.error("Error creating hospital bill:", error);
      toast.error(
        "Failed to create hospital bill: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const totalAmount = calculateTotal();
  const grandTotal = calculateGrandTotal();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hospital Bill</h1>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg"
        >
          Back to Billing
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Patient Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="customerContact"
              value={formData.customerContact}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="patientAge"
              value={formData.patientAge}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter age"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex
            </label>
            <select
              name="patientSex"
              value={formData.patientSex}
              onChange={handleInputChange}
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
              Address
            </label>
            <textarea
              name="patientAddress"
              value={formData.patientAddress}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient address"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultant Name
            </label>
            <input
              type="text"
              name="consultantName"
              value={formData.consultantName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter consultant name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IPD No.
            </label>
            <input
              type="text"
              name="ipdNo"
              value={formData.ipdNo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter IPD number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admit Date
            </label>
            <input
              type="date"
              name="admitDate"
              value={formData.admitDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discharge Date
            </label>
            <input
              type="date"
              name="dischargeDate"
              value={formData.dischargeDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill Date *
            </label>
            <input
              type="date"
              name="billDate"
              value={formData.billDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration No.
            </label>
            <input
              type="text"
              name="patientRegistration"
              value={formData.patientRegistration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter registration number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt No.
            </label>
            <input
              type="text"
              name="receiptNo"
              value={formData.receiptNo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter receipt number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Mode
            </label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any additional remarks"
              rows="3"
            />
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Services</h3>
            <button
              type="button"
              onClick={addChargeRow}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add Service
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 ">
                {charges.map((charge, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 relative ">
                      <input
                        type="text"
                        value={charge.serviceName}
                        onChange={(e) =>
                          handleServiceSearch(index, e.target.value)
                        }
                        onFocus={() => handleServiceFocus(index)}
                        onBlur={handleServiceBlur}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Select or type service"
                      />
                      {showDropdown &&
                        dropdownIndex === index &&
                        charge.filteredServices &&
                        charge.filteredServices.length > 0 && (
                          <div className="relative z-50 mt-2 w-full bg-white shadow-lg rounded-md max-h-60 ">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                              Services
                            </div>
                            {charge.filteredServices.map((service) => (
                              <div
                                key={service._id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onMouseDown={() =>
                                  handleServiceSelect(index, service)
                                }
                              >
                                <div className="font-medium">
                                  {service.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Price: ₹{service.price}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        value={charge.date}
                        onChange={(e) =>
                          handleChargeChange(index, "date", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={charge.quantity}
                        onChange={(e) =>
                          handleChargeChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={charge.rate}
                        onChange={(e) =>
                          handleChargeChange(
                            index,
                            "rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={charge.amount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeChargeRow(index)}
                        disabled={charges.length <= 1}
                        className={`${
                          charges.length <= 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:text-red-900"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount in Words
            </label>
            <input
              type="text"
              name="amountInWords"
              value={formData.amountInWords}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount in words"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Hospital Bill
          </button>
        </div>
      </form>
    </div>
  );
};

export default HospitalBillForm;
