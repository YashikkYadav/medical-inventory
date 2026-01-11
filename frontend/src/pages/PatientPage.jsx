import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getPatients, deletePatient } from "../apis/patientApi";
import {
  FaUserPlus,
  FaSearch,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import PatientRegistrationForm from "../components/PatientRegistrationForm";
import OpdBillForm from "../components/OpdBillForm";
import IpdBillForm from "../components/IpdBillForm";
import FinalBillForm from "../components/FinalBillForm";
import { useNavigate } from "react-router-dom";
import Opdbill from "../components/Opdbill";
import Ipdbill from "../components/Ipdbill";
import HospitalBill from "../components/HospitalBill";
import DetailedHospitalBill from "../components/DetailedHospitalBill";
import { getOpdBillById } from "../apis/opdBillApi";
import { getIpdBillById } from "../apis/ipdBillApi";
import { getHospitalBill } from "../apis/hospitalBillApi";

export const PatientPage = () => {
  const [showModal, setShowModal] = useState(false); // Registration modal
  const [showOpdModal, setShowOpdModal] = useState(false); // OPD modal
  const [showIpdModal, setShowIpdModal] = useState(false); // IPD modal
  const [showFinalModal, setShowFinalModal] = useState(false); // Final modal

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewingBillType, setViewingBillType] = useState(null);
  const [viewingBillData, setViewingBillData] = useState(null);
  const [showDetailedBill, setShowDetailedBill] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBillData, setEditingBillData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchPatients();
  }, [debouncedSearchTerm, page]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients(debouncedSearchTerm, page);
      setPatients(data.patients || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      toast.error(error.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowModal(false);
    fetchPatients();
  };

  const handleBillSuccess = () => {
    setShowOpdModal(false);
    setShowIpdModal(false);
    setShowFinalModal(false);
    setIsEditMode(false);
    setEditingBillData(null);
    fetchPatients();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openOpdForm = (patient) => {
    setSelectedPatient(patient);
    setIsEditMode(false);
    setEditingBillData(null);
    setShowOpdModal(true);
  };

  const openIpdForm = (patient) => {
    setSelectedPatient(patient);
    setIsEditMode(false);
    setEditingBillData(null);
    setShowIpdModal(true);
  };

  const openFinalForm = (patient) => {
    setSelectedPatient(patient);
    setIsEditMode(false);
    setEditingBillData(null);
    setShowFinalModal(true);
  };

  const handleEditBill = async (type, patient) => {
    setSelectedPatient(patient);

    try {
      let billData = null;
      if (type === "OPD" && patient.opdBills?.length > 0) {
        const latestBillId =
          patient.opdBills[patient.opdBills.length - 1]._id ||
          patient.opdBills[patient.opdBills.length - 1];
        const response = await getOpdBillById(latestBillId);
        billData = response.data || response;
        setEditingBillData(billData);
        setIsEditMode(true);
        setShowOpdModal(true);
      } else if (type === "IPD" && patient.ipdBills?.length > 0) {
        const latestBillId =
          patient.ipdBills[patient.ipdBills.length - 1]._id ||
          patient.ipdBills[patient.ipdBills.length - 1];
        const response = await getIpdBillById(latestBillId);
        billData = response.data || response;
        setEditingBillData(billData);
        setIsEditMode(true);
        setShowIpdModal(true);
      } else if (type === "FINAL" && patient.hospitalBills?.length > 0) {
        const latestBillId =
          patient.hospitalBills[patient.hospitalBills.length - 1]._id ||
          patient.hospitalBills[patient.hospitalBills.length - 1];
        const response = await getHospitalBill(latestBillId);
        billData = response.data || response;
        setEditingBillData(billData);
        setIsEditMode(true);
        setShowFinalModal(true);
      }
    } catch (error) {
      toast.error("Failed to fetch bill for editing");
    }
  };

  const handleDeletePatient = async (patient) => {
    if (
      window.confirm(
        `Are you sure you want to delete patient "${patient.name}"? This will also delete ALL their bills. This action cannot be undone.`
      )
    ) {
      try {
        await toast.promise(deletePatient(patient._id), {
          loading: "Deleting patient...",
          success: "Patient and related bills deleted successfully",
          error: (err) => err.message || "Failed to delete patient",
        });
        fetchPatients();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const hasOpdBill = (patient) => {
    return patient.opdBills && patient.opdBills.length > 0;
  };

  const hasIpdBill = (patient) => {
    return patient.ipdBills && patient.ipdBills.length > 0;
  };

  const handleViewBill = async (type, patient) => {
    setSelectedPatient(patient);

    const fetchBillPromise = (async () => {
      let billData = null;
      if (type === "OPD" && patient.opdBills && patient.opdBills.length > 0) {
        const latestBillId =
          patient.opdBills[patient.opdBills.length - 1]._id ||
          patient.opdBills[patient.opdBills.length - 1];
        const response = await getOpdBillById(latestBillId);
        billData = response.data || response;
        setViewingBillType("OPD");
      } else if (
        type === "IPD" &&
        patient.ipdBills &&
        patient.ipdBills.length > 0
      ) {
        const latestBillId =
          patient.ipdBills[patient.ipdBills.length - 1]._id ||
          patient.ipdBills[patient.ipdBills.length - 1];
        const response = await getIpdBillById(latestBillId);
        billData = response.data || response;
        setViewingBillType("IPD");
      } else if (
        type === "FINAL" &&
        patient.hospitalBills &&
        patient.hospitalBills.length > 0
      ) {
        const latestBillId =
          patient.hospitalBills[patient.hospitalBills.length - 1]._id ||
          patient.hospitalBills[patient.hospitalBills.length - 1];
        const response = await getHospitalBill(latestBillId);
        billData = response.data || response;
        setViewingBillType("FINAL");
      }

      if (!billData) {
        throw new Error("Could not fetch bill details");
      }
      return billData;
    })();

    try {
      const billData = await toast.promise(fetchBillPromise, {
        loading: `Fetching ${type} bill...`,
        success: `${type} Bill loaded successfully`,
        error: (err) => err.message || `Failed to load ${type} bill`,
      });
      setViewingBillData(billData);
    } catch (error) {
      console.error("Error viewing bill:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Hospital Bills{" "}
            </h1>
            <p className="text-gray-500 mt-1">
              Register and manage patient records
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all transform hover:scale-105"
          >
            <FaUserPlus size={20} />
            <span className="font-semibold">Register New Patient</span>
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Mobile No</th>
                  <th className="px-6 py-4">Age</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {patients.length > 0 ? (
                  patients.map((patient) => {
                    const hasOpd = hasOpdBill(patient);
                    const hasIpd = hasIpdBill(patient);
                    const hasFinal =
                      patient.hospitalBills && patient.hospitalBills.length > 0;

                    return (
                      <tr
                        key={patient._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {patient.name}
                          <div className="text-xs text-gray-400 font-normal mt-0.5">
                            {patient.patientId}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {patient.phoneNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {patient.age ? `${patient.age} Yrs` : "N/A"}
                        </td>
                        <td
                          className="px-6 py-4 truncate max-w-[200px]"
                          title={patient.address}
                        >
                          {patient.address || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {/* OPD Button */}
                            {hasOpd ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleViewBill("OPD", patient)}
                                  className="px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200"
                                >
                                  View OPD
                                </button>
                                <button
                                  onClick={() => handleEditBill("OPD", patient)}
                                  className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                                  title="Edit OPD Bill"
                                >
                                  <FaEdit size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => openOpdForm(patient)}
                                className="px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
                              >
                                Create OPD
                              </button>
                            )}

                            {/* IPD Button */}
                            {hasIpd ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleViewBill("IPD", patient)}
                                  className="px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
                                >
                                  View IPD
                                </button>
                                <button
                                  onClick={() => handleEditBill("IPD", patient)}
                                  className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 border border-blue-200"
                                  title="Edit IPD Bill"
                                >
                                  <FaEdit size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => openIpdForm(patient)}
                                className="px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                              >
                                Create IPD
                              </button>
                            )}

                            {/* Final Bill Button */}
                            {hasFinal ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    handleViewBill("FINAL", patient)
                                  }
                                  className="px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200"
                                >
                                  View Final
                                </button>
                                <button
                                  onClick={() =>
                                    handleEditBill("FINAL", patient)
                                  }
                                  className="p-1.5 rounded-md text-purple-600 hover:bg-purple-50 border border-purple-200"
                                  title="Edit Final Bill"
                                >
                                  <FaEdit size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => openFinalForm(patient)}
                                className="px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
                              >
                                Create Final
                              </button>
                            )}

                            {/* Delete Patient Button */}
                            <button
                              onClick={() => handleDeletePatient(patient)}
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 border border-red-200 ml-1"
                              title="Delete Patient"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      {loading ? (
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading patients...</span>
                        </div>
                      ) : (
                        <>
                          <FaUser
                            size={32}
                            className="mx-auto mb-3 opacity-20"
                          />
                          <p>No patients found</p>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {patients.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing page{" "}
                <span className="font-semibold text-gray-900">{page}</span> of{" "}
                <span className="font-semibold text-gray-900">
                  {totalPages}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <PatientRegistrationForm
          onClose={() => setShowModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {showOpdModal && selectedPatient && (
        <OpdBillForm
          patient={selectedPatient}
          isEdit={isEditMode}
          initialData={editingBillData}
          onClose={() => {
            setShowOpdModal(false);
            setIsEditMode(false);
            setEditingBillData(null);
          }}
          onSuccess={handleBillSuccess}
        />
      )}

      {showIpdModal && selectedPatient && (
        <IpdBillForm
          patient={selectedPatient}
          isEdit={isEditMode}
          initialData={editingBillData}
          onClose={() => {
            setShowIpdModal(false);
            setIsEditMode(false);
            setEditingBillData(null);
          }}
          onSuccess={handleBillSuccess}
        />
      )}

      {showFinalModal && selectedPatient && (
        <FinalBillForm
          patient={selectedPatient}
          isEdit={isEditMode}
          initialData={editingBillData}
          onClose={() => {
            setShowFinalModal(false);
            setIsEditMode(false);
            setEditingBillData(null);
          }}
          onSuccess={handleBillSuccess}
        />
      )}

      {/* View Bill Modals */}
      {viewingBillType === "OPD" && viewingBillData && (
        <Opdbill
          bill={viewingBillData}
          patient={selectedPatient}
          onClose={() => {
            setViewingBillType(null);
            setViewingBillData(null);
          }}
        />
      )}

      {viewingBillType === "IPD" && viewingBillData && (
        <Ipdbill
          bill={viewingBillData}
          patient={selectedPatient}
          onClose={() => {
            setViewingBillType(null);
            setViewingBillData(null);
          }}
        />
      )}

      {viewingBillType === "FINAL" && viewingBillData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto print:p-0">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-8 flex flex-col h-[90vh] print:h-auto print:shadow-none print:w-full print:max-w-full print:my-0">
            <div className="flex justify-between items-center p-4 border-b print:hidden">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Final Bill View
                </h2>
                <button
                  onClick={() => setShowDetailedBill(!showDetailedBill)}
                  className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-200 transition-colors"
                >
                  {showDetailedBill
                    ? "Show Summary Bill"
                    : "Show Detailed Custom Bill"}
                </button>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Print (Browser)
                </button>
                <button
                  onClick={() => {
                    setViewingBillType(null);
                    setViewingBillData(null);
                    setShowDetailedBill(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 print:bg-white print:overflow-visible">
              {showDetailedBill ? (
                <DetailedHospitalBill
                  bill={viewingBillData}
                  advanceDetails={selectedPatient?.ipdBills || []}
                />
              ) : (
                <HospitalBill
                  bill={viewingBillData}
                  advanceDetails={selectedPatient?.ipdBills || []}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
