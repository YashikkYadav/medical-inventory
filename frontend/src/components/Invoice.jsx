import React from "react";

const Invoice = ({ hospitalInfo, patientInfo, charges, summary, payment, billNo, billType }) => {
  // Defensive programming to prevent errors
  const safeHospitalInfo = hospitalInfo || {
    name: 'Hospital',
    address: '',
    phone: '',
    email: ''
  };
  
  const safePatientInfo = patientInfo || {
    name: 'Patient',
    age: '',
    sex: '',
    address: '',
    phone: '',
    admitDate: '',
    dischargeDate: ''
  };
  
  const safeCharges = charges || [];
  const safeSummary = summary || {
    total: 0,
    advance: 0,
    discount: 0,
    balance: 0
  };
  const safePayment = payment || {
    mode: 'Cash',
    date: '',
    amount: 0,
    amountInWords: ''
  };
  
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg border p-6 text-sm">
      {/* Header */}
      <div className="text-center border-b pb-2 mb-4">
        <h1 className="text-xl font-bold uppercase">{safeHospitalInfo.name}</h1>
        <p>{safeHospitalInfo.address}</p>
        <p>
          Mob: {safeHospitalInfo.phone} 
        </p>
      { safeHospitalInfo?.email&& <p>
          email: {safeHospitalInfo.email}
        </p>}
        
        
        <h2 className="text-lg font-semibold mt-2 underline">Final Bill</h2>
        
        
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          {billNo && (
          <p className="text-sm mt-1">
            <strong>Bill No:</strong> {billNo}
          </p>
        )}
          <p>
            <strong>Patient Name:</strong> {safePatientInfo.name}
          </p>
          {billType !== 'medical' && ( 
            <p>
                <strong>Reg No:</strong> {safePatientInfo.patientRegistration}
              </p>
          )}
          <p>
            <strong>Age/Sex:</strong> {safePatientInfo.age} / {safePatientInfo.sex}
          </p>
          <p>
            <strong>Address:</strong> {safePatientInfo.address}
          </p>
          <p>
            <strong>Phone:</strong> {safePatientInfo.phone}
          </p>
          {billType === 'medical' && (
          <p className="mt-1">
            <strong>D.L. No.:</strong> DRUG/2025-26/13632-136324
          </p>
        )}
        </div>
        <div>
          {billType !== 'medical' && (
            <>
              
              <p>
                <strong>Consultant Name:</strong> {safePatientInfo.consultantName}
              </p>
              <p>
                <strong>Admit Date:</strong> {safePatientInfo.admitDate}
              </p>
              <p>
                <strong>Discharge Date:</strong> {safePatientInfo.dischargeDate}
              </p>
              <p>
                <strong>IPD No:</strong> {safePatientInfo.ipdNo}
              </p>
              
            </>
          )}
        </div>
      </div>

      {/* Charges Table */}
      <table className="w-full border text-center text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">S.No</th>
            <th className="border px-2 py-1">Particulars</th>
            <th className="border px-2 py-1">Qty</th>
            <th className="border px-2 py-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {safeCharges.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{index + 1}</td>
              <td className="border px-2 py-1 text-left">
                {item.name ? (typeof item.name === 'object' ? item.name.name : item.name) : 'Service/Charge'}
              </td>
              <td className="border px-2 py-1">{item.qty || 0}</td>
              <td className="border px-2 py-1 text-right">{item.amount || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="mt-3 text-right">
        <p>
          <strong>Total Bill Amount:</strong> ₹{safeSummary.total || 0}
        </p>
        <p>
          <strong>Less - Advance:</strong> ₹{safeSummary.advance || 0}
        </p>
        <p>
          <strong>Less - Discount:</strong> ₹{safeSummary.discount || 0}
        </p>
        <p className="font-bold text-base border-t mt-1 pt-1">
          Balance to be Paid: ₹{safeSummary.balance || 0}
        </p>
      </div>

      {/* Payment Details */}
      <div className="mt-4 border-t pt-2 text-sm">
        <p>
          <strong>Payment Mode:</strong> {safePayment.mode || 'Cash'}
        </p>
        <p>
          <strong>Amount Paid:</strong> ₹{safePayment.amount || 0}
        </p>
        <p>
          <strong>Date:</strong> {safePayment.date || ''}
        </p>
        <p className="italic mt-2">
          (Rupees {safePayment.amountInWords || ''} Only)
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 text-right">
        <p>
          <strong>For {safeHospitalInfo.name}</strong>
        </p>
        <p className="mt-6">Authorized Signature</p>
      </div>
    </div>
  );
};

export default Invoice;
