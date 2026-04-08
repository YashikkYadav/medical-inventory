import React from "react";
import { ToWords } from 'to-words';

const DetailedHospitalBill = ({ bill, advanceDetails = [] }) => {
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

  // Helper component for a single row to ensure perfect alignment
  const BillRow = ({ date, desc, rate, qty, amount }) => (
    <div className="flex w-full mb-1 print:mb-0 print:text-[10px]">
      <div className="w-[15%] text-left">{date}</div>
      <div className="w-[45%] text-left uppercase">{desc}</div>
      <div className="w-[15%] text-right">{rate}</div>
      <div className="w-[10%] text-center flex justify-center gap-4">
        <span>*</span>
        <span>{qty}</span>
      </div>
      <div className="w-[15%] text-right">{amount}</div>
    </div>
  );

  // Helper for section totals
  const SectionTotal = ({ total }) => (
    <div className="mt-1 print:mt-0">
      <div className="border-t border-dashed border-gray-400 w-full mb-1 print:mb-0 print:border-t"></div>
      <div className="flex justify-between print:text-[10px]">
        <span className="font-bold">Total</span>
        <span className="font-bold">{total}</span>
      </div>
      <div className="border-b border-dashed border-gray-400 w-full mt-1 mb-4 print:mt-0 print:mb-2 print:border-b"></div>
    </div>
  );

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return "0.00";
    return parseFloat(amount).toFixed(2);
  };

  // Group services by date for detailed view
  const groupServicesByDate = (services) => {
    if (!services || !Array.isArray(services)) return {};

    const grouped = {};
    services.forEach((service) => {
      const date = service.date ? formatDate(service.date) : "N/A";
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(service);
    });
    return grouped;
  };

  // If no bill data, show loading state
  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
        <div className="text-xl">Loading bill details...</div>
      </div>
    );
  }

  const groupedServices = groupServicesByDate(bill.services);

  // Calculate totals
  const totalServiceAmount =
    bill.services?.reduce(
      (total, service) => total + (parseFloat(service.amount) || 0),
      0
    ) || 0;
  const discountAmount = parseFloat(bill.discount) || 0;
  
  // Calculate advance from prop OR bill
  const calculatedAdvance = advanceDetails.reduce((sum, adv) => sum + (parseFloat(adv.totalAmount) || parseFloat(adv.amount) || 0), 0);
  const advanceAmount = calculatedAdvance > 0 ? calculatedAdvance : (parseFloat(bill.advanceAmount) || 0);
  
  const balanceAmount = totalServiceAmount - discountAmount - advanceAmount + (parseFloat(bill.tax)||0); 
  const isNegativeBalance = balanceAmount < 0;
  const absBalance = Math.abs(balanceAmount);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4 font-mono text-[11px] text-gray-700 leading-none tracking-tight print:min-h-0 print:p-0 print:m-0">
      <div className="w-full max-w-[850px] bg-white p-8 shadow-xl relative print:w-full print:max-w-none print:p-4 print:shadow-none">
        {/* --- HEADER --- */}
        <div className="flex flex-col items-center mb-6 text-center print:mb-4">
          <h1 className="text-sm font-bold uppercase tracking-wider text-gray-600 print:text-[10px]">
             Medicare Hospital
          </h1>
          <p className="uppercase mt-1 print:text-[9px]">
            Khawa Rani ji, Jamwa Ramgarh ,Jaipur 303109(Raj)
          </p>

          <p className="uppercase print:text-[9px]">
            MOB. NO- 7023314141, 6350283164, 7340306199, 8058280829
          </p>
          <p className="uppercase print:text-[9px]">
            Email : medicarehospital14@gmail.com
          </p>
          <div className="mt-2 flex flex-col items-center print:mt-1">
            <span className="uppercase font-bold tracking-widest print:text-[10px]">
              FINAL BILL
            </span>
            <span className="w-24 border-b border-dashed border-gray-400 h-1 print:w-16 print:border-b"></span>
          </div>
        </div>

        {/* --- BILL INFO --- */}
        <div className="mb-2 uppercase text-gray-500 print:mb-1 print:text-[9px]">
          BILL NO:{bill._id?.substring(0, 8) || "N/A"}
          {bill.receiptNo && (
            <span className="ml-4">RECEIPT NO:{bill.receiptNo}</span>
          )}
        </div>

        {/* --- PATIENT DETAILS --- */}
        <div className="flex justify-between items-start uppercase mb-3 print:mb-2 print:text-[9px]">
          <div className="space-y-1 w-1/2">
            <div className="flex">
              <span className="w-28">NAME</span>
              <span>:{bill.customerName || "N/A"}</span>
            </div>
            {bill.patientRegistration && (
              <div className="flex">
                <span className="w-28">REG. NO</span>
                <span>:{bill.patientRegistration}</span>
              </div>
            )}
            {bill.ipdNo && (
              <div className="flex">
                <span className="w-28">IPD NO</span>
                <span>:{bill.ipdNo}</span>
              </div>
            )}
            <div className="flex">
              <span className="w-28">CATEGORY</span>
              <span>:{bill.paymentMode || "CASH"}</span>
            </div>
          </div>
          <div className="space-y-1 w-1/2 text-right flex flex-col items-end">
            {bill.admitDate && (
              <div className="flex">
                <span className="mr-2">ADM. DATE:</span>
                <span>{formatDate(bill.admitDate)}</span>
              </div>
            )}
            {bill.dischargeDate && (
              <div className="flex">
                <span className="mr-2">DIS. DATE:</span>
                <span>{formatDate(bill.dischargeDate)}</span>
              </div>
            )}
            <div className="flex">
              <span className="mr-2">PRINT DATE:</span>
              <span>{formatDate(new Date())}</span>
            </div>
          </div>
        </div>

        {/* --- TABLE HEADER --- */}
        <div className="border-t border-b border-dashed border-gray-400 py-2 mb-4 print:py-1 print:mb-2">
          <div className="flex uppercase font-bold text-gray-500 print:text-[10px]">
            <div className="w-[15%]">PARTICULARS</div>{" "}
            {/* Note: "PARTICULARS" spans visibly, but date is column 1 */}
            <div className="w-[45%]"></div>
            <div className="w-[15%] text-right">RATE</div>
            <div className="w-[10%] text-center">QTY/DAYS</div>
            <div className="w-[15%] text-right">AMOUNT</div>
          </div>
        </div>

        {/* --- SERVICES GROUPED BY DATE --- */}
        {Object.entries(groupedServices).map(([date, services], index) => (
          <div className="mb-2 print:mb-1" key={index}>
            <div className="uppercase font-bold mb-1 print:mb-0 print:text-[10px]">
              SERVICES FOR {date}
            </div>
            <div className="border-b border-dashed border-gray-400 mb-2 print:mb-1"></div>

            {services.map((service, serviceIndex) => (
              <BillRow
                key={serviceIndex}
                date={date}
                desc={service.serviceName}
                rate={parseFloat(service.rate || 0).toFixed(2)}
                qty={service.quantity || 1}
                amount={parseFloat(service.amount || 0).toFixed(2)}
              />
            ))}

            {/* Calculate total for this date group */}
            <SectionTotal
              total={services
                .reduce(
                  (total, service) => total + parseFloat(service.amount || 0),
                  0
                )
                .toFixed(2)}
            />
          </div>
        ))}

        {/* --- TOTALS AND BALANCE INFORMATION --- */}
        <div className="mt-4 print:mt-2 text-xs print:text-[10px] break-inside-avoid">
          {/* Totals Block - Right Aligned */}
          <div className="flex flex-col items-end w-full">
            <div className="w-full max-w-[300px]">
              {/* Total */}
              <div className="flex justify-between mb-1">
                <span className="">Total</span>
                <span className="">{formatCurrency(totalServiceAmount)}</span>
              </div>

              {/* Discount */}
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Less:-Discount</span>
                <span className="">{formatCurrency(discountAmount)}</span>
              </div>

              {/* Advance */}
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Less:-Advance Amount</span>
                <span className="">{formatCurrency(advanceAmount)}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-400 my-1"></div>

              {/* Balance */}
              <div className="flex justify-between font-bold text-sm print:text-xs">
                <span>{isNegativeBalance ? "Balance to be paid TO Patient" : "Balance to be paid by Patient"}</span>
                <span>{formatCurrency(absBalance)}</span>
              </div>

              {/* Divider */}
              <div className="border-b border-dashed border-gray-400 my-1"></div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mt-4 mb-4 print:mt-2 print:mb-2">
            <p className="uppercase">
              : ({toWords.convert(absBalance)})
            </p>
            <div className="border-b border-dashed border-gray-400 w-full mt-1"></div>
          </div>

          {/* Advance Details Table */}
          {(advanceDetails.length > 0 || (bill.advanceDetails && bill.advanceDetails.length > 0)) && (
            <div className="mb-8 print:mb-6">
              <h3 className="font-bold mb-1 text-gray-600">Advance Details</h3>
              <div className="w-full">
                <div className="flex uppercase text-gray-500 mb-1 font-semibold">
                  <div className="w-[15%]">Recpt. No</div>
                  <div className="w-[15%]">Date</div>
                  <div className="w-[15%] text-right pr-4">Amount</div>
                  <div className="w-[10%]">Mode</div>
                  <div className="w-[20%]">Cheque No.</div>
                  <div className="w-[25%]">Bank Name</div>
                </div>
                {(advanceDetails.length > 0 ? advanceDetails : bill.advanceDetails).map((adv, idx) => (
                  <div key={idx} className="flex text-gray-700">
                    <div className="w-[15%]">{adv.billNo || adv._id?.substring(0,8)}</div>
                    <div className="w-[15%]">{formatDate(adv.createdAt || adv.date)}</div>
                    <div className="w-[15%] text-right pr-4">
                      {formatCurrency(adv.totalAmount || adv.amount)}
                    </div>
                    <div className="w-[10%]">{adv.paymentMode || adv.mode}</div>
                    <div className="w-[20%]">{adv.chequeNo || "-"}</div>
                    <div className="w-[25%]">{adv.bankName || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Footer Signatures & Info */}
          <div className="mt-8 flex flex-col relative print:mt-4">
            <div className="flex justify-between items-end mb-8">
              <div className="text-center">
                <p className="mb-8">E. & O. E.</p>
              </div>
              <div className="text-right">
                <p className="mb-8 mr-8">For .</p>
              </div>
            </div>

            <div className="text-left mt-4 text-[10px] print:text-[9px] uppercase text-gray-500">
              <p>ALL SUBJECT TO JAIPUR JURISDICTION ONLY</p>
              <p>User Name : {bill.userName || "ADMIN"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedHospitalBill;
