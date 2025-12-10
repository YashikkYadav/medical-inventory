import React from "react";

const HospitalBill = ({ bill }) => {
  // If no bill data, show loading state
  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4 font-sans text-gray-800">
        <div className="text-xl">Loading bill details...</div>
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Format datetime for admission/discharge
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB");
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate} ${formattedTime}`;
  };

  // Calculate totals
  const calculateTotals = () => {
    let total = 0;
    let discount = parseFloat(bill.discount) || 0;
    let tax = parseFloat(bill.tax) || 0;

    // Calculate service total
    if (bill.services && Array.isArray(bill.services)) {
      total = bill.services.reduce((sum, service) => {
        return sum + (parseFloat(service.amount) || 0);
      }, 0);
    }

    const grandTotal = total - discount + tax;
    return { total, discount, tax, grandTotal };
  };

  const { total, discount, tax, grandTotal } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8 font-sans text-gray-800 print:min-h-0 print:p-0 print:m-0">
      <div className="w-full max-w-[800px] bg-white p-8 shadow-lg text-[12px] leading-tight relative print:w-full print:max-w-none print:p-4 print:shadow-none print:bg-white">
        {/* --- HEADER --- */}
        <div className="text-center mb-6 print:mb-4">
          <h1 className="text-xl font-bold tracking-wide text-gray-900 print:text-lg uppercase">
            Medicare Hospital
          </h1>
          <p className="text-sm font-medium mt-1 print:text-xs uppercase">
            Khawa Rani ji, Jamwa Ramgarh ,Jaipur 303109(Raj)
          </p>

          <p className="text-sm font-bold mt-1 print:text-xs">
            MOB. NO- 7023314141, 6350283164, 7340306199, 8058280829
          </p>
          <p className="text-sm font-bold mt-1 print:text-xs">
            Email : medicarehospital14@gmail.com
          </p>
          <div className="mt-2 print:mt-1">
            <span className="font-bold underline text-sm border-b-2 border-black inline-block pb-[1px] print:text-xs print:border-b print:pb-0">
              FINAL BILL
            </span>
          </div>
        </div>

        {/* --- PATIENT INFO GRID --- */}
        <div className="flex justify-between mb-4 print:mb-2 print:text-xs">
          {/* Left Column */}
          <div className="w-[55%] space-y-1">
            <div className="flex">
              <span className="w-24">Bill No.</span>
              <span>: &nbsp; {bill._id?.substring(0, 8) || "N/A"}</span>
            </div>
            <div className="flex">
              <span className="w-24">Name</span>
              <span>: &nbsp; {bill.customerName || "N/A"}</span>
            </div>
            {bill.patientRegistration && (
              <div className="flex">
                <span className="w-24">Reg. No</span>
                <span>: &nbsp; {bill.patientRegistration}</span>
              </div>
            )}
            {bill.ipdNo && (
              <div className="flex">
                <span className="w-24">IPD No.</span>
                <span>: &nbsp; {bill.ipdNo}</span>
              </div>
            )}
            {bill.patientAddress && (
              <div className="flex mt-2 items-start">
                <span className="w-24 shrink-0">Address</span>
                <span className="leading-tight">
                  : &nbsp; {bill.patientAddress}
                </span>
              </div>
            )}
            <div className="flex mt-2">
              <span className="w-24">Ins. Company:</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[45%] space-y-1 pl-4">
            <div className="flex">
              <span className="w-20">Bill Date</span>
              <span>: &nbsp; {formatDate(bill.createdAt)}</span>
            </div>
            {bill.admitDate && (
              <div className="flex">
                <span className="w-20">Adm. Date</span>
                <span>: &nbsp; {formatDateTime(bill.admitDate)}</span>
              </div>
            )}
            {bill.dischargeDate && (
              <div className="flex">
                <span className="w-20">Dis. Date</span>
                <span>: &nbsp; {formatDateTime(bill.dischargeDate)}</span>
              </div>
            )}
            {bill.consultantName && (
              <div className="flex items-start">
                <span className="w-20 shrink-0">Consultant</span>
                <span className="uppercase">
                  : &nbsp; {bill.consultantName}
                </span>
              </div>
            )}
            {bill.customerContact && (
              <div className="flex mt-1">
                <span className="w-20">Mob No.</span>
                <span>: &nbsp; {bill.customerContact}</span>
              </div>
            )}
            <div className="flex mt-2">
              <span className="w-20">Ser.Tax No</span>
              <span>:</span>
            </div>
          </div>
        </div>

        {/* --- MAIN PARTICULARS TABLE --- */}
        <div className="mb-4 print:mb-2">
          <div className="border-t border-b border-gray-400 py-1 flex font-medium mb-1 print:border-t print:border-b print:py-0">
            <div className="w-[60%]">Particulars</div>
            <div className="w-[15%] text-right">Rate</div>
            <div className="w-[10%] text-right">Qty</div>
            <div className="w-[15%] text-right">Amount</div>
          </div>

          <div className="space-y-1 print:space-y-0">
            {bill.services && bill.services.length > 0 ? (
              bill.services.map((service, index) => (
                <div key={index} className="flex justify-between print:text-xs">
                  <span className="w-[60%] truncate">
                    {service.serviceName}
                  </span>
                  <span className="w-[15%] text-right">
                    {parseFloat(service.rate || 0).toFixed(2)}
                  </span>
                  <span className="w-[10%] text-right">
                    {service.quantity || 1}
                  </span>
                  <span className="w-[15%] text-right">
                    {parseFloat(service.amount || 0).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <span className="w-[60%]">No services found</span>
                <span className="w-[15%] text-right">0.00</span>
                <span className="w-[10%] text-right">0</span>
                <span className="w-[15%] text-right">0.00</span>
              </div>
            )}
          </div>
        </div>

        {/* --- TOTALS SECTION --- */}
        <div className="flex flex-col items-end mb-6 print:mb-4">
          <div className="w-[200px] border-t border-dashed border-gray-400 mt-2 mb-1 print:w-[150px] print:mt-1 print:mb-0"></div>

          <div className="w-[250px] flex justify-between print:w-[200px] print:text-xs">
            <span>Total</span>
            <span>{total.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="w-[250px] flex justify-between print:w-[200px] print:text-xs">
              <span>Less:-Discount</span>
              <span>{discount.toFixed(2)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="w-[250px] flex justify-between print:w-[200px] print:text-xs">
              <span>Add:-Tax</span>
              <span>{tax.toFixed(2)}</span>
            </div>
          )}

          <div className="w-[200px] border-t border-dashed border-gray-400 my-1 print:w-[150px] print:my-0"></div>

          <div className="w-[250px] flex justify-between print:w-[200px] print:text-xs">
            <span>Total Bill Amount</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>
          <div className="w-[250px] flex justify-between print:w-[200px] print:text-xs">
            <span>Less:-Advance Amount</span>
            <span>0.00</span>
          </div>

          <div className="w-[200px] border-t border-dashed border-gray-400 my-1 print:w-[150px] print:my-0"></div>

          <div className="w-[250px] flex justify-between font-bold text-[13px] print:w-[200px] print:text-xs print:font-bold">
            <span>Balance to be paid by Patient</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>
          <div className="w-[200px] border-t-2 border-dashed border-gray-400 mt-1 print:w-[150px] print:border-t-2 print:mt-0"></div>
        </div>

        {/* --- AMOUNT IN WORDS --- */}
        <div className="mb-4 print:mb-2 print:text-xs">
          {/* {console.log(bill)} */}
          <p>(Rs. {bill.amountInWords || "Zero only"})</p>
        </div>

        {/* --- ADVANCE DETAILS --- */}
        {/* <div className="mb-4 print:mb-2 print:text-xs">
          <p className="underline mb-1">Advance Details</p>
          <div className="border-t border-b border-gray-400 py-1 flex mb-1 print:border-t print:border-b print:py-0">
            <div className="w-[15%]">Recpt. No</div>
            <div className="w-[20%]">Date</div>
            <div className="w-[15%] text-right">Amount</div>
            <div className="w-[10%] text-center">Mode</div>
            <div className="w-[20%] pl-4">Cheque No.</div>
            <div className="w-[20%]">Bank Name</div>
          </div>
          <div className="flex print:text-xs">
            <div className="w-[15%]">0001172</div>
            <div className="w-[20%]">21/09/2023</div>
            <div className="w-[15%] text-right">5000.00</div>
            <div className="w-[10%] text-center">Cash</div>
            <div className="w-[20%] pl-4"></div>
            <div className="w-[20%]"></div>
          </div>
        </div> */}

        {/* --- DEPOSIT RECEIPT DETAILS --- */}
        {/* <div className="mb-8 print:mb-4 print:text-xs">
          <p className="mb-1">Deposit Receipt Details</p>
          <div className="flex font-medium mb-1 print:font-normal">
            <div className="w-[15%]">Recpt. No</div>
            <div className="w-[20%]">Date</div>
            <div className="w-[15%] text-right">Amount</div>
            <div className="w-[10%] text-center">Mode</div>
            <div className="w-[20%] pl-4">Cheque No.</div>
            <div className="w-[20%]">Bank Name</div>
          </div>
          <div className="flex print:text-xs">
            <div className="w-[15%]">0001209</div>
            <div className="w-[20%]">25/09/2023</div>
            <div className="w-[15%] text-right">20600.00</div>
            <div className="w-[10%] text-center">Cash</div>
            <div className="w-[20%] pl-4"></div>
            <div className="w-[20%]"></div>
          </div>
        </div> */}

        {/* --- FOOTER --- */}
        <div className="flex justify-between items-end mt-12 print:mt-8 print:text-xs">
          <div>
            <p>Remark : {bill.remarks}</p>
            <p>User Name : SUPER</p>
          </div>
          <div className="text-right pr-8 print:pr-0">
            <p className="mb-4 print:mb-2">For.</p>
            <p className="font-bold text-gray-700 print:font-bold">Cashier</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalBill;
