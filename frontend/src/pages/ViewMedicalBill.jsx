import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MedicalBill from "../components/MedicalBill";
import { getMedicalBill } from "../apis/medicalBillApi";
import "../styles/print.css";

const ViewMedicalBill = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const billRef = useRef();

  React.useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const response = await getMedicalBill(billId);
        setBill(response);
      } catch (err) {
        setError("Failed to load bill details");
        console.error("Error fetching bill:", err);
      } finally {
        setLoading(false);
      }
    };

    if (billId) {
      fetchBill();
    }
  }, [billId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading bill details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Bill not found</div>
      </div>
    );
  }

  // Transform bill data for MedicalBill component
  const medicalInfo = {
    name: "Shree Medical And General Store",
    address: "Khawa Rani ji, Jamwa Ramgarh,Jaipur 303109(Raj)",
    phone: "7023314141, 6350283164, 7340306199, 8058280829",
    dlNo: bill.dlNo || "DRUG/2025-26/13632-136324",
    gstin: bill.gstin || "",
  };

  const patientInfo = {
    name: bill.customerName,
    phone: bill.customerContact,
    age: bill.patientAge || "",
    sex: bill.patientSex || "",
  };

  // Transform charges to match the expected format
  const charges = (bill.items || []).map((item, index) => {
    const medicine = item.medicine || {};
    return {
      sn: index + 1,
      name: medicine.name || "Unknown Item",
      pack: "", // Pack information not available in current data structure
      batch: medicine.batchNumber || "N/A",
      expiry: medicine.expiryDate
        ? new Date(medicine.expiryDate).toLocaleDateString("en-GB", {
            year: "2-digit",
            month: "2-digit",
          })
        : "N/A",
      qty: item.quantity || 1,
      mrp: medicine.price ? parseFloat(medicine.price).toFixed(2) : "0.00",
      amount:
        medicine.price && item.quantity
          ? (medicine.price * item.quantity).toFixed(2)
          : "0.00",
    };
  });

  const summary = {
    total: bill.totalAmount,
    discount: bill.discount,
    balance: bill.grandTotal,
  };

  const payment = {
    mode: bill.paymentMode || "Cash",
    date: bill.paymentDate
      ? new Date(bill.paymentDate).toLocaleDateString("en-GB")
      : new Date().toLocaleDateString("en-GB"),
    amount: bill.grandTotal,
  };

  return (
    <div className="">
      <div className="max-w-6xl mx-auto ">
        <div className="mb-4 flex justify-between items-center print:hidden">
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Print Bill
            </button>
          </div>
        </div>

        <div ref={billRef} className="print:w-full print:max-w-none">
          <MedicalBill
            medicalInfo={medicalInfo}
            patientInfo={patientInfo}
            charges={charges}
            summary={summary}
            payment={payment}
            billNo={bill._id?.substring(0, 8) || "N/A"}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewMedicalBill;
