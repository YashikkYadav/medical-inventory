import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import MedicalBillForm from "../components/MedicalBillForm";
import HospitalBillForm from "../components/HospitalBillForm";
import { getMedicalBills } from "../apis/medicalBillApi";
import { getInvoices } from "../apis/invoiceApi";
import { getHospitalBills } from "../apis/hospitalBillApi"; // Added hospital bill API

const Billing = () => {
  const [currentBill, setCurrentBill] = useState(null);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [activeTab, setActiveTab] = useState("medical"); // medical or hospital
  const [medicalBills, setMedicalBills] = useState([]);
  const [hospitalBills, setHospitalBills] = useState([]); // Will now use hospital bills
  const [loading, setLoading] = useState(false);

  const hospitalInfo = {
    name: "Medicare Hospital",
    address: "Khawa Rani ji, Jamwa Ramgarh,Jaipur 303109(Raj)",
    phone: "7023314141, 6350283164, 7340306199, 8058280829",
    email: "medicarehospital14@gmail.com",
  };

  // Fetch bills when component mounts or tab changes
  useEffect(() => {
    console.log("run");
    fetchBills();
  }, [activeTab]);

  const fetchBills = async () => {
    setLoading(true);

    try {
      if (activeTab === "medical") {
        // Always fetch fresh data for now (we can enable caching later)
        console.log("Fetching fresh medical bills data");
        const response = await getMedicalBills();
        console.log("Medical bills raw response:", response);

        // Handle different response formats
        let bills = [];
        if (Array.isArray(response)) {
          bills = response;
        } else if (response && Array.isArray(response.data)) {
          bills = response.data;
        } else if (response && typeof response === "object") {
          bills = [response];
        }

        console.log("Processed medical bills:", bills);

        // Store in localStorage
        localStorage.setItem("medicalBills", JSON.stringify(bills));
        localStorage.setItem(
          "medicalBills_timestamp",
          new Date().getTime().toString()
        );

        setMedicalBills(bills);
      } else {
        // Fetch hospital bills
        console.log("Fetching fresh hospital bills data");
        const response = await getHospitalBills(); // Using hospital bill API
        console.log("Hospital bills raw response:", response);

        // Handle different response formats
        let bills = [];
        if (Array.isArray(response)) {
          bills = response;
        } else if (response && Array.isArray(response.data)) {
          bills = response.data;
        } else if (response && typeof response === "object") {
          bills = [response];
        }

        console.log("Processed hospital bills:", bills);

        // Store in localStorage
        localStorage.setItem("hospitalBills", JSON.stringify(bills));
        localStorage.setItem(
          "hospitalBills_timestamp",
          new Date().getTime().toString()
        );

        setHospitalBills(bills);
      }
    } catch (error) {
      toast.error(`Failed to load ${activeTab} bills`);
      console.error(`Error fetching ${activeTab} bills:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalBillCreated = (billData) => {
    // Add the new bill to the list
    setMedicalBills((prev) => [billData, ...prev]);

    // Update localStorage
    localStorage.setItem(
      "medicalBills",
      JSON.stringify([billData, ...medicalBills])
    );

    // Hide form
    setShowMedicalForm(false);

    // Show success message
    toast.success("Medical bill created successfully!");
  };

  // Updated handler for hospital bill creation
  const handleHospitalBillCreated = (billData) => {
    // Add the new bill to the list
    setHospitalBills((prev) => [billData, ...prev]);

    // Update localStorage
    localStorage.setItem(
      "hospitalBills",
      JSON.stringify([billData, ...hospitalBills])
    );

    // Hide form
    setShowHospitalForm(false);

    // Show success message
    toast.success("Hospital bill created successfully!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const handleViewBill = (billId, billType) => {
    // Navigate to the appropriate view bill page
    if (billType === "hospital") {
      window.open(`/view-hospital-bill/${billId}`, "_blank");
    } else {
      window.open(`/view-medical-bill/${billId}`, "_blank");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {!showMedicalForm && !showHospitalForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowHospitalForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Create Bill for Hospital
              </button>
              <button
                onClick={() => setShowMedicalForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Create Bill for Medical
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("medical")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "medical"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Medical Bills
              </button>
              <button
                onClick={() => setActiveTab("hospital")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "hospital"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Hospital Bills
              </button>
            </nav>
          </div>

          {/* Bills Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {activeTab === "medical" ? "Medical Bills" : "Hospital Bills"}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                List of all {activeTab === "medical" ? "medical" : "hospital"}{" "}
                bills
              </p>
            </div>
            <div className="border-t border-gray-200">
              {loading ? (
                <div className="px-4 py-5 sm:px-6 text-center">
                  <p>Loading bills...</p>
                </div>
              ) : activeTab === "medical" ? (
                medicalBills.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Bill No
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Customer
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Items
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Total
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Payment Mode
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {medicalBills.map((bill) => (
                          <tr key={bill._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {bill._id.substring(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(bill.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.items.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(bill.grandTotal)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.paymentMode || "Cash"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() =>
                                  handleViewBill(bill._id, "medical")
                                }
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                View /Print
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-4 py-5 sm:px-6 text-center">
                    <p>No medical bills found</p>
                  </div>
                )
              ) : hospitalBills.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Bill No
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Patient
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Services
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                        {/* <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th> */}
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {hospitalBills.map((bill) => (
                        <tr key={bill._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bill._id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bill.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(bill.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(bill.services || []).length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(bill.grandTotal)}
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                bill.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : bill.paymentStatus === "partial"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {bill.paymentStatus || "pending"}
                            </span>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() =>
                                handleViewBill(bill._id, "hospital")
                              }
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View/Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-5 sm:px-6 text-center">
                  <p>No hospital bills found</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : showMedicalForm ? (
        <MedicalBillForm
          onClose={() => setShowMedicalForm(false)}
          onBillCreated={handleMedicalBillCreated}
        />
      ) : (
        <HospitalBillForm
          onClose={() => setShowHospitalForm(false)}
          onBillCreated={handleHospitalBillCreated}
        />
      )}
    </div>
  );
};

export default Billing;
