import React from 'react';

const DepositReceipt = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
      {/* Paper Container */}
      <div className="bg-white w-full max-w-[800px] p-8 shadow-lg text-zinc-800 relative min-h-[550px]">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="font-serif text-2xl font-bold tracking-wide text-zinc-800 uppercase">
            Mediscope General Hospital
          </h1>
          <p className="font-bold text-sm text-zinc-700 mt-1">
            Near Honda Showroom , Nayla Road
          </p>
          <p className="font-bold text-sm text-zinc-700">
            Kanota,Jaipur- 303012
          </p>
          <p className="font-bold text-sm text-zinc-800 mt-1">
            MOB. NO- 8233606885
          </p>
          
          <div className="mt-2">
            <h2 className="font-bold underline decoration-zinc-800 underline-offset-2 uppercase text-sm">
              DEPOSIT RECEIPT
            </h2>
          </div>
        </div>

        {/* Patient Details Grid */}
        <div className="w-full text-sm font-medium leading-relaxed mb-4 relative">
          {/* Date is positioned absolutely to match the visual layout on the right */}
          <div className="absolute right-0 top-6 text-sm">
             <span className="mr-2">Date :</span>
             <span>25/09/2023</span>
          </div>

          <div className="grid grid-cols-[90px_10px_1fr] w-3/4">
            <span>Receipt No.</span> <span>:</span> <span>0001209</span>
            
            <span>Category</span> <span>:</span> <span>CASH</span>
            
            <span>Reg. No</span> <span>:</span> <span>00641</span>
            
            <span className="self-start">Name</span> <span className="self-start">:</span> 
            <span className="uppercase">Mr ROSHAN LAL SHARMA</span>
          </div>
        </div>

        {/* Table Header */}
        {/* The image shows a single line above Particulars and one below it */}
        <div className="border-t border-b border-zinc-400 py-1 mt-2">
          <div className="flex justify-between text-sm font-bold">
            <div>Particulars</div>
            <div className="text-right">Amount</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="py-2">
          <div className="flex justify-between text-sm font-medium text-zinc-700">
            <div>Deposit Amount Final Bill No. 000551</div>
            <div className="text-right">20600.00</div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-8"></div>

        {/* Net Total Section */}
        <div className="flex justify-between items-end mt-2 text-sm">
          <div className="font-medium text-zinc-700">
            Net Total
          </div>
          
          <div className="w-32 flex flex-col items-end">
             {/* Dashed line top */}
             <div className="border-t border-dashed border-zinc-400 w-full mb-1"></div>
             
             <div className="font-medium text-zinc-800">20600.00</div>
             
             {/* Dashed line bottom */}
             <div className="border-b border-dashed border-zinc-400 w-full mt-1"></div>
          </div>
        </div>

        {/* Footer Details */}
        <div className="mt-8 text-sm font-medium text-zinc-700 space-y-1">
          <div>(Rs. Twenty Thousand Six Hundred Only)</div>
          
          <div className="grid grid-cols-[90px_1fr] mt-2">
             <span>Mode</span> 
             <span>: Cash</span>
          </div>
          
          <div className="grid grid-cols-[90px_1fr]">
             <span>Remarks</span> 
             <span>: .</span>
          </div>

          <div className="grid grid-cols-[90px_1fr] uppercase">
             <span>User Name</span> 
             <span>: SUPER</span>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 flex justify-end relative">
            <div className="flex flex-col items-end w-64 mr-8">
                <span className="font-medium text-sm mr-20 mb-12">For</span>
                
                {/* Stamp and Signature Container */}
                <div className="relative flex flex-col items-center">
                    <span className="font-medium text-sm z-10 relative mt-2">Cashier.</span>
                </div>
            </div>
        </div>
        
    
      </div>
    </div>
  );
};

export default DepositReceipt;