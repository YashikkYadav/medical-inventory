import React from "react";

const MedicalBill = ({
  medicalInfo,
  patientInfo,
  charges,
  summary,
  payment,
  billNo,
}) => {
  // Default values for safety
  const safeMedicalInfo = medicalInfo;

  const safePatientInfo = patientInfo;

  // Transform charges from invoice items format
  const transformedCharges = charges
    ? charges.map((item, index) => {
        // console.log("Processing item:", item);
        // Handle both medicine and service items
        const itemName =
          typeof item.name === "object" ? item.name.name : item.name;
        const medicine = item.medicine;

        return {
          sn: index + 1,
          name:
            itemName ||
            (medicine && typeof medicine === "object"
              ? medicine.name
              : "Unknown Item"),
          pack: medicine && typeof medicine === "object" ? medicine.pack : "",
          batch: item.batch || "N/A",
          expiry: item.expiry
            ? new Date(item.expiry).toLocaleDateString("en-GB", {
                year: "2-digit",
                month: "2-digit",
              })
            : "N/A",
          qty: item.qty || 1,
          mrp: item.mrp,
          amount: item.mrp * item.qty || item.amount,
        };
      })
    : [];

  const safeCharges = transformedCharges;

  // Calculate summary if not provided
  const calculatedSummary = summary || {
    total: safeCharges.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    ),
    discount: 0,
    balance: 0,
  };

  // If summary is provided, use it; otherwise calculate
  const safeSummary = summary
    ? summary
    : {
        total: calculatedSummary.total,
        discount: calculatedSummary.discount,
        balance: calculatedSummary.total - calculatedSummary.discount,
      };

  const safePayment = payment || {
    mode: "Cash",
    date: new Date().toLocaleDateString("en-GB"),
    amount: safeSummary.balance,
    amountInWords: "",
  };

  // Calculate values for display
  const subtotal = parseFloat(safeSummary.total) || 0;
  const discount = parseFloat(safeSummary.discount) || 0;
  const netAmount = parseFloat(safeSummary.balance) || subtotal - discount;
  const roundOff = Math.round((netAmount - (subtotal - discount)) * 100) / 100;

  return (
    <div className="w-full bg-white text-[11px] leading-tight relative ">
      <div className="w-full border-black border-2 p-4">
        {/* --- HEADER SECTION --- */}
        <div className="flex border-b border-gray-400">
          {/* Left Header */}
          <div className="w-[60%] p-3 pl-4">
            <h1 className="text-xl font-bold tracking-wide mb-1 uppercase">
              {safeMedicalInfo.name}
            </h1>
            <p className="uppercase text-xs mb-3">{safeMedicalInfo.address}</p>

            <div className="space-y-1">
              <p>
                D.L.No. &nbsp;&nbsp;&nbsp;&nbsp; : {safeMedicalInfo.dlNo || ""}
              </p>
              <div className="flex gap-2">
                <span>GSTIN</span>
                <span className="ml-5">: {safeMedicalInfo.gstin || ""}</span>
              </div>
              <div className="flex gap-2">
                <span>Phone</span>
                <span className="ml-5">: {safeMedicalInfo.phone || ""}</span>
              </div>
            </div>
          </div>

          {/* Right Header */}
          <div className="w-[40%] border-l border-gray-400">
            <div className="bg-gray-200 text-center py-1 font-bold border-b border-gray-400 text-lg tracking-widest">
              INVOICE
            </div>
            <div className="p-2 space-y-1">
              <div className="flex">
                <span className="w-20">Patient Name</span>
                <span className="uppercase">
                  : <b>{safePatientInfo.name}</b>
                </span>
              </div>
              <div className="flex">
                <span className="w-20 uppercase">Doctor Name</span>
                <span>: {safePatientInfo.doctorName || ""}</span>
              </div>
              <div className="flex">
                <span className="w-20">Phone</span>
                <span>: {safePatientInfo.phone || ""}</span>
              </div>
              <div className="text-center font-bold text-lg mt-3">
                {safePayment.mode}
              </div>
            </div>
            {/* Invoice Meta */}
            <div className="border-t border-gray-400 flex text-sm font-bold mt-2">
              <div className="w-1/2 p-2 border-r border-gray-400">
                Inv. No: &nbsp;&nbsp; {billNo || ""}
              </div>
              <div className="w-1/2 p-2 text-center">
                Date: &nbsp;&nbsp;&nbsp;{" "}
                {safePayment.date || new Date().toLocaleDateString("en-GB")}
              </div>
            </div>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="min-h-[500px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-50 text-left font-bold text-[10px]">
                <th className="p-1 border-r border-gray-400 w-[5%] text-center">
                  S.No.
                </th>
                <th className="p-1 border-r border-gray-400 w-[30%]">
                  PRODUCT NAME
                </th>
                <th className="p-1 border-r border-gray-400 w-[8%]">PACK</th>
                <th className="p-1 border-r border-gray-400 w-[12%]">BATCH</th>
                <th className="p-1 border-r border-gray-400 w-[8%]">EXPIRY</th>
                <th className="p-1 border-r border-gray-400 w-[5%] text-center">
                  QTY
                </th>
                <th className="p-1 border-r border-gray-400 w-[10%] text-right">
                  MRP
                </th>
                <th className="p-1 w-[12%] text-right pr-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {safeCharges.map((item, index) => (
                <tr key={index} className="text-[11px]">
                  <td className="p-1 border-r border-gray-400 text-center align-top">
                    {item.sn}
                  </td>
                  <td className="p-1 border-r border-gray-400 align-top font-medium uppercase">
                    {item.name}
                  </td>
                  <td className="p-1 border-r border-gray-400 align-top">
                    {item.pack || 1}
                  </td>
                  <td className="p-1 border-r border-gray-400 align-top">
                    {item.batch}
                  </td>
                  <td className="p-1 border-r border-gray-400 align-top">
                    {item.expiry}
                  </td>
                  <td className="p-1 border-r border-gray-400 text-center align-top">
                    {item.qty}
                  </td>
                  <td className="p-1 border-r border-gray-400 text-right align-top">
                    {item.mrp}
                  </td>
                  <td className="p-1 text-right align-top pr-2">
                    {item.amount}
                  </td>
                </tr>
              ))}
              {/* Empty rows filler to match height if needed */}
              {[...Array(Math.max(0, 15 - safeCharges.length))].map((_, i) => (
                <tr key={`empty-${i}`} className="h-6">
                  <td className="border-r border-gray-400"></td>
                  <td className="border-r border-gray-400"></td>
                  <td className="border-r border-gray-400"></td>
                  <td className="border-r border-gray-400"></td>
                  <td className="border-r border-gray-400"></td>
                  <td className="border-r border-gray-400"></td>
                  <td className="border-r border-gray-400"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER SECTION --- */}
        <div className="border-t border-gray-400 flex relative">
          {/* Left Footer: Terms */}
          <div className="w-[45%] p-2 pt-3 text-[10px] leading-relaxed">
            <p className="mb-2">GET WELL SOON **Duplicate Copy**</p>
            <p className="font-bold underline mb-1">Terms & Conditions</p>
            <ol className="list-decimal pl-4 space-y-0.5 text-gray-700">
              <li>Goods once sold will no be taken back</li>
              <li>Please consult Dr. before using the medicine.</li>
              <li>All disputes subject to Jaipur Jurisdiction Only</li>
            </ol>
          </div>

          {/* Center Stamp Area (Visual recreation) */}
          <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 text-center pointer-events-none opacity-80">
            <div className="flex flex-col items-center justify-end h-24"></div>
            <p className="text-[10px] font-bold mt-2 text-black">
              For {safeMedicalInfo.name}
            </p>
          </div>

          {/* Right Footer: Totals */}
          <div className="w-[55%] flex justify-end items-end p-2 pb-3">
            <div className="w-48 text-right text-xs space-y-1">
              <div className="flex justify-between font-bold text-gray-600">
                <span>Sub Total</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-600">
                <span>Discount</span>
                <span>{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-600">
                <span>Round Off</span>
                <span>{roundOff.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-black mt-1 border-t border-gray-300 pt-1">
                <span>NET AMT</span>
                <span>{netAmount.toFixed(2)}</span>
              </div>
              {safePayment.amountInWords && (
                <div className="flex justify-between text-xs italic mt-1">
                  <span>In Words:</span>
                  <span>{safePayment.amountInWords}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalBill;
