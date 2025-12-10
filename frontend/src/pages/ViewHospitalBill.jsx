import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHospitalBill } from "../apis/hospitalBillApi";
import { toast, Toaster } from "react-hot-toast";
import HospitalBill from "../components/HospitalBill";
import DetailedHospitalBill from "../components/DetailedHospitalBill";
import "../styles/print.css";

const ViewHospitalBill = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [viewMode, setViewMode] = React.useState("regular");

  React.useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const response = await getHospitalBill(billId);
        setBill(response.data || response);
        console.log(response.data || response);
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

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate("/dashboard/billing")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                setViewMode(viewMode === "regular" ? "detailed" : "regular")
              }
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              {viewMode === "regular"
                ? "Show Detailed View"
                : "Show Regular View"}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Print Bill
            </button>
          </div>
        </div>

        {/* Render the appropriate bill component based on viewMode */}
        <div className="print:w-full print:max-w-none">
          {viewMode === "regular" ? (
            <HospitalBill bill={bill} />
          ) : (
            <DetailedHospitalBill bill={bill} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewHospitalBill;
