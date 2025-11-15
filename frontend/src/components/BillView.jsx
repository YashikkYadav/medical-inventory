import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Invoice from './Invoice';

const BillView = () => {
  const { billId } = useParams();
  const [bill, setBill] = React.useState(null);

  useEffect(() => {
    // Load bill data from sessionStorage
    const bills = JSON.parse(sessionStorage.getItem('invoices') || '[]');
    const foundBill = bills.find(b => b.id === billId || b.billNo === billId);
    
    if (foundBill) {
      setBill(foundBill);
    } else {
      // If not found in sessionStorage, you might want to fetch from API
      console.error('Bill not found');
    }
  }, [billId]);

  // useEffect(() => {
  //   // Auto-print when component mounts and bill is loaded
  //   if (bill) {
  //     const printTimer = setTimeout(() => {
  //       window.print();
  //     }, 500);

  //     return () => clearTimeout(printTimer);
  //   }
  // }, [bill]);

  if (!bill) {
    return <div className="p-6 text-center">Loading bill...</div>;
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <Invoice
          hospitalInfo={bill.hospitalInfo}
          patientInfo={bill.patientInfo}
          charges={bill.charges}
          summary={bill.summary}
          payment={bill.payment}
          billNo={bill.billNo}
          billType={bill.billType}
        />
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Print Bill
          </button>
          <button
            onClick={() => window.close()}
            className="ml-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillView;