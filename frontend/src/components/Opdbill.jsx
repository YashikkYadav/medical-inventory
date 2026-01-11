import React from "react";
import { Toaster } from "react-hot-toast";
import { ToWords } from 'to-words';

const Opdbill = ({ bill, patient, onClose }) => {
  const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: 'Rupee',
        plural: 'Rupees',
        symbol: '₹',
        fractionalUnit: {
          name: 'Paisa',
          plural: 'Paise',
          symbol: '',
        },
      },
    },
  });

  if (!bill || !patient) return null;

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString("en-GB");
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto print:p-0">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 flex flex-col h-[90vh] print:h-auto print:shadow-none print:w-full print:max-w-full print:my-0">
        {/* Toolbar */}
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h2 className="text-xl font-bold text-gray-800">OPD Bill View</h2>
           <div className="space-x-4">
              <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Print</button>
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Close</button>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
            <div className="bg-white w-full max-w-[800px] p-8 shadow-sm text-gray-800 relative h-fit print:w-full print:max-w-full print:shadow-none print:p-8 font-sans text-[12px] leading-tight">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                <h1 className="text-xl font-bold tracking-wide text-gray-900">
                    MEDISCOPE GENERAL HOSPITAL
                </h1>
                <p className="font-bold text-sm text-gray-700 mt-1">
                    Near Honda Showroom , Nayla Road
                </p>
                <p className="font-bold text-sm text-gray-700">
                    Kanota,Jaipur- 303012
                </p>
                <p className="font-bold text-sm text-gray-800 mt-1">
                    MOB. NO- 8233606885
                </p>

                <div className="flex flex-col items-center mt-3">
                    <h2 className="font-bold underline decoration-gray-800 underline-offset-2 uppercase text-sm">
                    CASH RECEIPT
                    </h2>
                    <h3 className="font-bold underline decoration-gray-800 underline-offset-2 text-sm">
                    Out Patient Dept.
                    </h3>
                </div>
                </div>

                {/* Patient Details Grid */}
                <div className="w-full text-xs font-semibold leading-relaxed mb-4">
                <div className="grid grid-cols-12 gap-x-4">
                    {/* Left Column */}
                    <div className="col-span-7">
                    <div className="grid grid-cols-[80px_10px_1fr]">
                        <span>ReceiptNo.</span> <span>:</span> <span>{bill.billNo || bill._id?.substring(0, 8)}</span>
                        <span>Reg. No</span> <span>:</span> <span>{patient.patientId}</span>
                        <span className="self-start">Name</span>{" "}
                        <span className="self-start">:</span>
                        <span className="uppercase">
                        {patient.name} {patient.fatherName ? `S/O ${patient.fatherName}` : ''}
                        </span>
                        <span>Age</span> <span>:</span> <span>{patient.age ? `${patient.age} Years` : 'N/A'}</span>
                        <span>Consultant</span> <span>:</span>{" "}
                        <span className="uppercase">{bill.consultantName}</span>
                        <span className="self-start">Address</span>{" "}
                        <span className="self-start">:</span>
                        <span className="uppercase">
                        {patient.address}
                        </span>
                    </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-5">
                    <div className="grid grid-cols-[70px_10px_1fr]">
                        <span>Date</span> <span>:</span> <span>{formatDate(bill.createdAt)}</span>
                        <span>Category</span> <span>:</span> <span>{bill.caseType || "Opd"}</span>
                        <span>&nbsp;</span>
                        <span></span>
                        <span></span> {/* Spacer to align Sex */}
                        <span>Sex</span> <span>:</span> <span>{patient.sex}</span>
                        <span>Ref. By</span> <span>:</span> <span></span>
                        <span>Mob. No</span> <span>:</span> <span>{patient.phoneNumber}</span>
                    </div>
                    </div>
                </div>
                </div>

                {/* Table Header */}
                <div className="border-t border-b border-gray-400 py-1 mt-2">
                <div className="grid grid-cols-[1fr_3fr_2fr_1fr] text-xs font-bold">
                    <div className="pl-1">Date</div>
                    <div>Particular</div>
                    <div>Perform By</div>
                    <div className="text-right pr-1">Amount</div>
                </div>
                </div>

                {/* Table Body */}
                <div className="py-2 min-h-[60px]">
                {bill.services && bill.services.map((service, index) => (
                    <div key={index} className="grid grid-cols-[1fr_3fr_2fr_1fr] text-xs font-medium text-gray-700 mb-1">
                        <div className="pl-1">{formatDate(service.date)}</div>
                        <div className="uppercase">{service.name}</div>
                        <div>({bill.consultantName})</div>
                        <div className="text-right pr-1">{parseFloat(service.amount).toFixed(2)}</div>
                    </div>
                ))}
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mt-4">
                <div className="w-48 text-xs">
                    {/* Net Amount */}
                    <div className="flex justify-between items-center mb-1 font-medium border-t border-dashed border-gray-400 pt-1">
                    <span>Net Amount</span>
                    <span>{parseFloat(bill.totalAmount).toFixed(2)}</span>
                    </div>

                    {/* Total Amount */}
                    <div className="flex justify-between items-center mb-1 font-medium">
                    <span>Total Amount</span>
                    <span>{parseFloat(bill.totalAmount).toFixed(2)}</span>
                    </div>

                    {/* Paid Amount */}
                    <div className="flex justify-between items-center font-medium border-b border-dashed border-gray-400 pb-1">
                    <span>Paid Amount</span>
                    <span>{parseFloat(bill.totalAmount).toFixed(2)}</span>
                    </div>
                </div>
                </div>

                {/* Amount in Words (Placeholder function needed or simplified) */}
                <div className="mt-2 text-xs font-medium text-gray-600 italic">
                {/* Simplified logic since we don't have the numberToWords function imported here, or we can copy it */}
                 ({toWords.convert(parseFloat(bill.totalAmount || 0))})  
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-end mt-12 print:mt-8 print:text-xs">
                  <div>
                    <p>Mode: By {bill.paymentMode}</p>
                    <p>Remark : {bill.remarks}</p>
                    <p className="mt-1">User Name : SUPER</p>
                  </div>
                  <div className="text-right pr-8 print:pr-0">
                    <p className="mb-4 print:mb-2">For.</p>
                    <p className="font-bold text-gray-700 print:font-bold">Cashier</p>
                  </div>
                </div>

                {/* Bottom decorative line (resembling print tear-off or edge) */}
                <div className="mt-12"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Opdbill;
