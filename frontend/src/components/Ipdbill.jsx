import React from "react";
import { ToWords } from "to-words";

const Ipdbill = ({ bill, patient, onClose }) => {
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
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
          <h2 className="text-xl font-bold text-gray-800">IPD Bill View</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white w-full max-w-[800px] p-8 shadow-sm text-gray-800 relative h-fit print:w-full print:max-w-full print:shadow-none print:p-8 font-sans text-[12px] leading-tight">
            {/* Header */}
            <div className="flex flex-col items-center mb-6 font-sans">
              <h1 className="text-xl font-bold tracking-wide text-gray-900 uppercase">
                Medicare Hospital
              </h1>
              <p className="font-bold text-sm text-gray-700 mt-1 uppercase">
                Khawa Rani ji, Jamwa Ramgarh ,Jaipur 303109(Raj)
              </p>

              <p className="font-bold text-sm text-gray-800 mt-1 ">
                MOB. NO- 7023314141, 6350283164, 7340306199, 8058280829
              </p>

              <div className="flex flex-col items-center mt-3">
                <h2 className="font-bold underline decoration-gray-800 underline-offset-2 uppercase text-sm">
                  CASH RECEIPT
                </h2>
                <h3 className="font-bold underline decoration-gray-800 underline-offset-2 text-sm">
                  In Patient Dept.
                </h3>
              </div>
            </div>

            {/* Patient Details Grid */}
            <div className="w-full text-sm font-medium leading-snug mb-2">
              <div className="flex justify-between gap-x-4">
                {/* Left Column */}
                <div className="flex-1">
                  <div className="grid grid-cols-[85px_10px_1fr]">
                    <span>Reg. No</span> <span>:</span>{" "}
                    <span>{patient.patientId}</span>
                    <span>Receipt No</span> <span>:</span> <span>{bill.ipdNo}</span>
                    <span className="self-start">Name</span>{" "}
                    <span className="self-start">:</span>
                    <span className="uppercase">{patient.name}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="w-[45%]">
                  <div className="grid grid-cols-[75px_10px_1fr]">
                    <span>Date</span> <span>:</span>{" "}
                    <span>{formatDate(bill.billDate || bill.createdAt)}</span>
                    <span>Category</span> <span>:</span> <span>CASH</span>
                    <span>Mob No</span> <span>:</span>{" "}
                    <span>{patient.phoneNumber}</span>
                    {bill.consultantName && (
                      <>
                        <span className="self-start">Consultant</span>{" "}
                        <span className="self-start">:</span>{" "}
                        <span className="uppercase leading-tight">
                          {bill.consultantName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-b border-gray-400 py-1 mt-2">
              <div className="grid grid-cols-[1fr_4fr_1fr] text-sm font-bold">
                <div className="pl-1">Date</div>
                <div>Particulars</div>
                <div className="text-right pr-1">Amount</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="py-2 min-h-[100px]">
              {bill.particulars &&
                bill.particulars.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_4fr_1fr] text-sm font-medium text-gray-700 mb-1"
                  >
                    <div className="pl-1">{formatDate(item.date)}</div>
                    <div>{item.description}</div>
                    <div className="text-right pr-1">
                      {parseFloat(item.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
            </div>

            {/* Spacer for height simulation */}
            <div className="h-4"></div>

            {/* Totals Section */}
            <div className="flex flex-col items-end mt-2">
              <div className="w-full max-w-[200px] text-sm">
                {/* Dashed Separator */}
                <div className="border-t border-dashed border-gray-400 w-full mb-1"></div>

                {/* Total Amount */}
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span>Total Amount</span>
                  <span>{parseFloat(bill.totalAmount).toFixed(2)}</span>
                </div>

                {/* Dashed Separator */}
                <div className="border-b border-dashed border-gray-400 w-full pb-1"></div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="mt-6 text-sm font-medium text-gray-700">
              ({toWords.convert(parseFloat(bill.totalAmount || 0))})
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-end mt-12 print:mt-8 print:text-xs">
              <div>
                <p>Mode: {bill.paymentMode}</p>
                <p>User Name : SUPER</p>
              </div>
              <div className="text-right pr-8 print:pr-0">
                <p className="mb-4 print:mb-2">For.</p>
                <p className="font-bold text-gray-700 print:font-bold">
                  Cashier
                </p>
              </div>
            </div>

            {/* Bottom decorative fake tear marks or edge */}
            <div className="mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ipdbill;
