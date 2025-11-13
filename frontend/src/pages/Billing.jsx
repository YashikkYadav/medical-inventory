import React, { useState, useEffect, useRef } from 'react';
import Invoice from '../components/Invoice';
import { ToWords } from 'to-words';
import { getMedicines } from '../apis/medicineApi';
import { createInvoice, getInvoices } from '../apis/invoiceApi';

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  }
});

const Billing = () => {
  const [showForm, setShowForm] = useState(false);
  const [bills, setBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const invoiceRef = useRef(null); // Add ref for invoice printing
  const [activeTab, setActiveTab] = useState('all'); // Add this state for tab navigation

  // Load medicines and bills from API/sessionStorage
  useEffect(() => {
    const fetchMedicines = async () => {
      // Try to get medicines from sessionStorage first
      const sessionMedicines = sessionStorage.getItem('medicines');
      if (sessionMedicines) {
        try {
          const parsedMedicines = JSON.parse(sessionMedicines);
          setMedicines(parsedMedicines);
          return;
        } catch (sessionError) {
          console.error('Error parsing medicines from sessionStorage:', sessionError);
        }
      }
      
      // Fallback to API if sessionStorage is empty
      try {
        const medicinesData = await getMedicines();
        setMedicines(medicinesData);
        // Update sessionStorage
        sessionStorage.setItem('medicines', JSON.stringify(medicinesData));
      } catch (error) {
        console.error('Error fetching medicines:', error);
        // Fallback to localStorage if API fails
        const savedMedicines = localStorage.getItem('medicines');
        if (savedMedicines) {
          try {
            const parsedMedicines = JSON.parse(savedMedicines);
            setMedicines(parsedMedicines);
          } catch (localStorageError) {
            console.error('Error parsing medicines from localStorage:', localStorageError);
            setMedicines([]);
          }
        }
      }
    };
    
    const fetchBills = async () => {
      // Try to get bills from sessionStorage first
      const sessionBills = sessionStorage.getItem('bills');
      if (sessionBills) {
        try {
          const parsedBills = JSON.parse(sessionBills);
          console.log('Loaded bills from sessionStorage:', parsedBills);
          setBills(parsedBills);
          return;
        } catch (sessionError) {
          console.error('Error parsing bills from sessionStorage:', sessionError);
        }
      }
      
      // Fallback to API if sessionStorage is empty
      try {
        const billsData = await getInvoices();
        // Transform invoice data to bill format
        const transformedBills = billsData.map(invoice => ({
          id: invoice._id,
          billNo: `INV-${invoice._id.substr(-6)}`,
          billType: 'hospital', // Default to hospital
          hospitalInfo: {
            name: "Medicare Hospital",
            address: "Khawa Rani ji, Jamwa Ramgarh,Jaipur 303109(Raj)",
            phone: "7023314141, 6350283164, 7340306199, 8058280829",
            email: "medicarehospital14@gmail.com",
          },
          patientInfo: {
            name: invoice.customerName || 'Unknown Patient',
            age: '',
            sex: '',
            address: '',
            phone: invoice.customerContact || '',
            admitDate: new Date(invoice.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            dischargeDate: new Date(invoice.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
          },
          charges: invoice.items.map((item, index) => ({
            id: index + 1,
            name: item.medicineName || item.medicine || 'Unknown Medicine',
            qty: item.quantity,
            amount: item.price
          })),
          payment: {
            mode: 'Cash',
            date: new Date(invoice.createdAt).toLocaleDateString('en-GB'),
            amount: invoice.items.reduce((total, item) => total + (item.quantity * item.price), 0),
            amountInWords: ''
          },
          summary: {
            total: invoice.items.reduce((total, item) => total + (item.quantity * item.price), 0),
            discount: invoice.discount || 0,
            advance: 0,
            balance: invoice.items.reduce((total, item) => total + (item.quantity * item.price), 0) - (invoice.discount || 0)
          }
        }));
        
        setBills(transformedBills);
        // Update sessionStorage
        sessionStorage.setItem('bills', JSON.stringify(transformedBills));
        console.log('Loaded bills from API:', transformedBills);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setBills([]);
      }
    };
    
    fetchMedicines();
    fetchBills();
    
    // Load invoices from API
    const fetchInvoices = async () => {
      try {
        // Try to get invoices from sessionStorage first
        const sessionInvoices = sessionStorage.getItem('invoices');
        if (sessionInvoices) {
          try {
            const parsedInvoices = JSON.parse(sessionInvoices);
            // You might want to do something with these invoices
            console.log('Loaded invoices from sessionStorage:', parsedInvoices);
            return;
          } catch (sessionError) {
            console.error('Error parsing invoices from sessionStorage:', sessionError);
          }
        }
        
        // Fallback to API if sessionStorage is empty
        const invoicesData = await getInvoices();
        // Update sessionStorage
        sessionStorage.setItem('invoices', JSON.stringify(invoicesData));
        console.log('Loaded invoices from API:', invoicesData);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };
    
    fetchInvoices();
  }, []);

  const medialInfo = {
      name: "Shree Medical And General Store",
      address: "Khawa Rani ji, Jamwa Ramgarh,Jaipur 303109(Raj)",
      phone: "7023314141, 6350283164, 7340306199, 8058280829",
    }
  const hospitalInfo = {
      name: "Medicare Hospital",
      address: "Khawa Rani ji, Jamwa Ramgarh,Jaipur 303109(Raj)",
      phone: "7023314141, 6350283164, 7340306199, 8058280829",
      email: "medicarehospital14@gmail.com",
    }
  const [formData, setFormData] = useState({
    hospitalInfo: hospitalInfo,
    patientInfo: {
      name: "",
      age: "",
      sex: "",
      address: "",
      phone: "",
      admitDate: "",
      dischargeDate: "",
      date: new Date().toISOString().split('T')[0],
    },
    charges: [
      {
        id: 1,
        name: "",
        description: "",
        qty: 1,
        amount: 0,
        medicineId: null,
      }
    ],
    payment: {
      mode: "Cash",
      date: new Date().toLocaleDateString('en-GB'),
      amountInWords: "",
    },
    discount: 0,
    advance: 0,
    total: 0,
    billType: 'hospital',
  });

  const handleInputChange = (e, section, field) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  const handleChargeChange = (index, field, value) => {
    setFormData({
      ...formData,
      charges: formData.charges.map((charge, i) => 
        i === index ? { ...charge, [field]: value } : charge
      )
    });
  };

  const handleMedicineSelect = (index, medicine) => {
    const updatedCharges = [...formData.charges];
    updatedCharges[index].name = medicine.name;
    updatedCharges[index].amount = parseFloat(medicine.price) || 0;
    updatedCharges[index].medicineId = medicine._id; // Store medicine ID
    setFormData({
      ...formData,
      charges: updatedCharges
    });
    
    // Close dropdown
    setShowDropdown(false);
    setDropdownIndex(null);
    
    // Add a new blank item when selecting a medicine
    addChargeRow();
  };

  const handleSearchChange = (index, value) => {
    const newCharges = [...formData.charges];
    newCharges[index] = { 
      ...newCharges[index], 
      name: value,
      filteredMedicines: value.length > 0 
        ? medicines.filter(medicine =>
            medicine.name && medicine.name.toLowerCase().includes(value.toLowerCase()) ||
            medicine.composition && medicine.composition.toLowerCase().includes(value.toLowerCase())
          )
        : medicines
    };
    
    setFormData({
      ...formData,
      charges: newCharges
    });
  };

  const handleFocus = (index) => {
    // Show dropdown with all medicines
    const newCharges = [...formData.charges];
    newCharges[index] = { 
      ...newCharges[index], 
      filteredMedicines: medicines
    };
    
    setFormData({
      ...formData,
      charges: newCharges
    });
    
    setShowDropdown(true);
    setDropdownIndex(index);
  };

  const handleBlur = () => {
    // Delay closing dropdown to allow click on items
    setTimeout(() => {
      setShowDropdown(false);
      setDropdownIndex(null);
    }, 200);
  };

  const addChargeRow = () => {
    setFormData({
      ...formData,
      charges: [
        ...formData.charges,
        { 
          id: Date.now(), 
          name: "", 
          description: "",
          qty: 1, 
          amount: 0,
          filteredMedicines: [],
          medicineId: null
        }
      ]
    });
  };

  const removeChargeRow = (index) => {
    if (formData.charges.length > 1) {
      setFormData({
        ...formData,
        charges: formData.charges.filter((_, i) => i !== index)
      });
    }
  };

  const calculateSummary = () => {
    const total = formData.charges.reduce((sum, charge) => sum + (charge.qty * charge.amount), 0);
    const discount = parseFloat(formData.discount) || 0;
    const advance = parseFloat(formData.advance) || 0;
    const balance = total - discount - advance;
    
    return {
      total: total,
      discount: discount,
      advance: advance,
      balance: balance
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare invoice data for API
      const invoiceData = {
        customerName: formData.patientInfo.name,
        customerContact: formData.patientInfo.phone,
        items: formData.charges.map(charge => ({
          medicine: charge.medicineId, // We'll need to store medicine IDs in the charges
          quantity: parseInt(charge.qty) || 0,
          price: parseFloat(charge.amount) || 0
        })).filter(item => item.medicine), // Filter out items without medicine
        discount: parseFloat(formData.discount) || 0,
        tax: 0 // You might want to add tax field to the form
      };
      
      // Create invoice via API
      const createdInvoice = await createInvoice(invoiceData);
      
      // Transform the created invoice to bill format
      const newBill = {
        id: createdInvoice._id || Date.now(),
        billNo: createdInvoice._id ? `INV-${createdInvoice._id.substr(-6)}` : `BILL-${Date.now()}`,
        billType: formData.billType || 'hospital',
        hospitalInfo: formData.hospitalInfo || {
          name: "Medicare Hospital",
          address: "Khawa Rani ji, Jamwa Ramgarh,Jaipur 303109(Raj)",
          phone: "7023314141, 6350283164, 7340306199, 8058280829",
          email: "medicarehospital14@gmail.com",
        },
        patientInfo: {
          name: createdInvoice.customerName || formData.patientInfo.name || 'Unknown Patient',
          age: formData.patientInfo.age || '',
          sex: formData.patientInfo.sex || '',
          address: formData.patientInfo.address || '',
          phone: createdInvoice.customerContact || formData.patientInfo.phone || '',
          admitDate: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          dischargeDate: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
        },
        charges: createdInvoice.items ? createdInvoice.items.map((item, index) => ({
          id: index + 1,
          name: item.medicineName || 'Unknown Medicine',
          qty: item.quantity,
          amount: item.price
        })) : formData.charges,
        payment: {
          mode: formData.payment.mode || 'Cash',
          date: createdInvoice.createdAt ? new Date(createdInvoice.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
          amount: createdInvoice.items ? createdInvoice.items.reduce((total, item) => total + (item.quantity * item.price), 0) : 0,
          amountInWords: formData.payment.amountInWords || ''
        },
        summary: {
          total: createdInvoice.items ? createdInvoice.items.reduce((total, item) => total + (item.quantity * item.price), 0) : 0,
          discount: createdInvoice.discount || 0,
          advance: 0,
          balance: createdInvoice.items ? createdInvoice.items.reduce((total, item) => total + (item.quantity * item.price), 0) - (createdInvoice.discount || 0) : 0
        }
      };
      
      // Update bills state
      const updatedBills = [...bills, newBill];
      setBills(updatedBills);
      
      // Save to sessionStorage
      sessionStorage.setItem('bills', JSON.stringify(updatedBills));
      
      setCurrentBill(newBill);
      setShowForm(false);
      
      // Refresh medicines from API to reflect updated quantities
      const refreshedMedicines = await getMedicines();
      setMedicines(refreshedMedicines);
      sessionStorage.setItem('medicines', JSON.stringify(refreshedMedicines));
      
      // Reset form data to initial state
      setFormData({
        hospitalInfo: formData.billType === 'medical' ? {
          name: medialInfo.name,
          address: medialInfo.address,
          phone: medialInfo.phone,
          email: "",
          regNo: "GSTIN: 08BZJPS2130M1ZD"
        } : hospitalInfo,
        patientInfo: {
          name: "",
          age: "",
          sex: "",
          address: "",
          phone: "",
          admitDate: "",
          dischargeDate: "",
          date: new Date().toISOString().split('T')[0],
        },
        charges: [
          {
            id: 1,
            name: "",
            description: "",
            qty: 1,
            amount: 0,
          }
        ],
        payment: {
          mode: "Cash",
          date: new Date().toLocaleDateString('en-GB'),
          amountInWords: "",
        },
        discount: 0,
        advance: 0,
        total: 0,
        billType: formData.billType || 'hospital',
      });
      
      console.log('Invoice created successfully:', createdInvoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice: ' + error.message);
    }
  };

  const handlePrint = () => {
    // If we're printing from the currentBill view, use the ref
    if (currentBill && invoiceRef && invoiceRef.current) {
      const printContent = invoiceRef.current;
      
      // Create a new window for printing with exact styling
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Bill</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
              }
              body {
                margin: 0;
                padding: 20px;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                font-size: 0.875rem;
                line-height: 1.25rem;
                color: rgba(0, 0, 0, 1);
              }
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 1.5rem;
               
              }
              .max-w-3xl {
                max-width: 48rem;
              }
              .mx-auto {
                margin-left: auto;
                margin-right: auto;
              }
              .bg-white {
                background-color: rgba(255, 255, 255, 1);
              }
              .shadow-lg {
              
              }
              .border {
                border: 1px solid rgba(0, 0, 0, 0.1);
              }
              .p-6 {
                padding: 1.5rem;
              }
              .text-sm {
                font-size: 0.875rem;
                line-height: 1.25rem;
              }
              .text-center {
                text-align: center;
              }
              .border-b {
                border-bottom: 1px solid rgba(0, 0, 0, 1);
              }
              .pb-2 {
                padding-bottom: 0.5rem;
              }
              .mb-4 {
                margin-bottom: 1rem;
              }
              .text-xl {
                font-size: 1.25rem;
                line-height: 1.75rem;
              }
              .font-bold {
                font-weight: 700;
              }
              .uppercase {
                text-transform: uppercase;
              }
              .text-lg {
                font-size: 1.125rem;
                line-height: 1.75rem;
              }
              .font-semibold {
                font-weight: 600;
              }
              .mt-2 {
                margin-top: 0.5rem;
              }
              .underline {
                text-decoration: underline;
              }
              .text-sm {
                font-size: 0.875rem;
                line-height: 1.25rem;
              }
              .mt-1 {
                margin-top: 0.25rem;
              }
              .grid {
                display: grid;
              }
              .grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
              .gap-2 {
                gap: 0.5rem;
              }
              .mb-3 {
                margin-bottom: 0.75rem;
              }
              .w-full {
                width: 100%;
              }
              .text-center {
                text-align: center;
              }
              .text-xs {
                font-size: 0.75rem;
                line-height: 1rem;
              }
              .bg-gray-100 {
                background-color: rgba(247, 250, 252, 1);
              }
              .mt-3 {
                margin-top: 0.75rem;
              }
              .text-right {
                text-align: right;
              }
              .text-base {
                font-size: 1rem;
                line-height: 1.5rem;
              }
              .border-t {
                border-top: 1px solid rgba(0, 0, 0, 1);
              }
              .pt-1 {
                padding-top: 0.25rem;
              }
              .mt-4 {
                margin-top: 1rem;
              }
              .pt-2 {
                padding-top: 0.5rem;
              }
              .italic {
                font-style: italic;
              }
              .mt-6 {
                margin-top: 1.5rem;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid rgba(0, 0, 0, 0.1);
                padding: 0.5rem;
                text-align: left;
              }
              th {
                background-color: rgba(247, 250, 252, 1);
                font-weight: 700;
              }
              .px-2 {
                padding-left: 0.5rem;
                padding-right: 0.5rem;
              }
              .py-1 {
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
              }
              .text-left {
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      // If we don't have a currentBill or ref, show an error
      alert('No bill selected for printing');
    }
  };

  const summary = calculateSummary();
  
  // Update amount in words when balance changes
  useEffect(() => {
    const amountInWords = toWords.convert(parseFloat(summary.balance) || 0);
    setFormData(prevFormData => ({
      ...prevFormData,
      payment: {
        ...prevFormData.payment,
        amountInWords: amountInWords
      }
    }));
  }, [summary.balance]);

  // Function to handle hospital bill creation
  const handleCreateHospitalBill = () => {
    setFormData({
      hospitalInfo: hospitalInfo,
      patientInfo: {
        name: "",
        age: "",
        sex: "",
        address: "",
        phone: "",
        admitDate: "",
        dischargeDate: "",
        date: new Date().toISOString().split('T')[0],
      },
      charges: [
        {
          id: 1,
          name: "",
          description: "",
          qty: 1,
          amount: 0,
        }
      ],
      payment: {
        mode: "Cash",
        date: new Date().toLocaleDateString('en-GB'),
        amountInWords: "",
      },
      discount: 0,
      advance: 0,
      total: 0,
      billType: 'hospital',
    });
    setShowForm(true);
  };

  // Function to handle medical bill creation
  const handleCreateMedicalBill = () => {
    setFormData({
      hospitalInfo: {
        name: medialInfo.name,
        address: medialInfo.address,
        phone: medialInfo.phone,
        email: "",
        regNo: "GSTIN: 08BZJPS2130M1ZD"
      },
      patientInfo: {
        name: "",
        age: "",
        sex: "",
        address: "",
        phone: "",
        admitDate: "",
        dischargeDate: "",
        date: new Date().toISOString().split('T')[0],
      },
      charges: [
        {
          id: 1,
          name: "",
          description: "",
          qty: 1,
          amount: 0,
        }
      ],
      payment: {
        mode: "Cash",
        date: new Date().toLocaleDateString('en-GB'),
        amountInWords: "",
      },
      discount: 0,
      advance: 0,
      total: 0,
      billType: 'medical',
    });
    setShowForm(true);
  };

  // Filter bills based on the active tab
  const filteredBills = bills.filter(bill => {
    // Always show all bills if there's an issue with the bill structure
    if (!bill) return false;
    
    // Ensure bill has all required properties
    if (!bill.hospitalInfo) {
      bill.hospitalInfo = {
        name: "Medicare Hospital",
        address: "Khawa Rani ji, Jamwa Ramgarh,Jaipur 303109(Raj)",
        phone: "7023314141, 6350283164, 7340306199, 8058280829",
        email: "medicarehospital14@gmail.com",
      };
    }
    
    if (!bill.patientInfo) {
      bill.patientInfo = {
        name: 'Unknown Patient',
        age: '',
        sex: '',
        address: '',
        phone: '',
        admitDate: '',
        dischargeDate: '',
      };
    }
    
    if (!bill.charges) {
      bill.charges = [];
    }
    
    if (!bill.payment) {
      bill.payment = {
        mode: 'Cash',
        date: '',
        amount: 0,
        amountInWords: ''
      };
    }
    
    if (!bill.summary) {
      bill.summary = {
        total: 0,
        discount: 0,
        advance: 0,
        balance: 0
      };
    }
    
    // If no activeTab is set or it's 'all', show all bills
    if (!activeTab || activeTab === 'all') return true;
    
    // If bill doesn't have a billType, show it by default
    if (!bill.billType) return true;
    
    // Filter based on billType
    if (activeTab === 'hospital') return bill.billType === 'hospital';
    if (activeTab === 'medical') return bill.billType === 'medical';
    
    // Default to showing the bill
    return true;
  });
  
  // Add event listener for print requests
  useEffect(() => {
    const handlePrintEvent = () => {
      // Wait for the component to render, then trigger print
      setTimeout(handlePrint, 100);
    };
    
    window.addEventListener('printBill', handlePrintEvent);
    
    return () => {
      window.removeEventListener('printBill', handlePrintEvent);
    };
  }, [currentBill]);
  
  // Auto-print when currentBill is set and print is requested
  useEffect(() => {
    const handleAutoPrint = () => {
      if (window.printRequested) {
        window.printRequested = false;
        setTimeout(handlePrint, 100);
      }
    };
    
    // Set up a MutationObserver to detect when the invoice component is rendered
    const observer = new MutationObserver(handleAutoPrint);
    
    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [currentBill]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleCreateHospitalBill}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Bill for Hospital
          </button>
          <button
            onClick={handleCreateMedicalBill}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Bill for Medical
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 relative">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Create New Bill for {formData.billType === 'medical' ? 'Medical' : 'Hospital'}
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Patient Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={formData.patientInfo.name || ""}
                    onChange={(e) => handleInputChange(e, 'patientInfo', 'name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.patientInfo.age || ""}
                    onChange={(e) => handleInputChange(e, 'patientInfo', 'age')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                  <select
                    value={formData.patientInfo.sex || ""}
                    onChange={(e) => handleInputChange(e, 'patientInfo', 'sex')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Can't Say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.patientInfo.address || ""}
                    onChange={(e) => handleInputChange(e, 'patientInfo', 'address')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.patientInfo.phone || ""}
                    onChange={(e) => handleInputChange(e, 'patientInfo', 'phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              
              </div>
            </div>

            {/* Charges */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-700">Charges</h3>
                <button
                  type="button"
                  onClick={addChargeRow}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full  divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.charges.map((charge, index) => (
                      <tr key={charge.id}>
                        <td className="px-4 py-2 ">
                          <input
                            type="text"
                            value={charge.name || ""}
                            onChange={(e) => handleSearchChange(index, e.target.value)}
                            onFocus={() => handleFocus(index)}
                            onBlur={handleBlur}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Select or type medicine name"
                          />
                          {showDropdown && dropdownIndex === index && charge.filteredMedicines && charge.filteredMedicines.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-96 overflow-y-auto overflow-x-hidden scrollbar-hide">
                              {charge.filteredMedicines.map((medicine) => (
                                <div
                                  key={medicine._id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={() => handleMedicineSelect(index, medicine)}
                                >
                                  <div className="font-medium">{medicine.name}</div>
                                  <div className="text-sm text-gray-500">{medicine.composition} - Price: ₹{medicine.price}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={charge.qty || ""}
                            onChange={(e) => handleChargeChange(index, 'qty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={charge.amount || ""}
                            onChange={(e) => handleChargeChange(index, 'amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          ₹{parseFloat(charge.qty * charge.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeChargeRow(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={formData.charges.length <= 1}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.payment.mode || "Cash"}
                    onChange={(e) => handleInputChange(e, 'payment', 'mode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="text"
                    value={formData.payment.date || ""}
                    onChange={(e) => handleInputChange(e, 'payment', 'date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount in Words</label>
                  <input
                    type="text"
                    value={formData.payment.amountInWords || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Amount in words will be auto-generated"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-gray-600">Total:</span>
                    <span className="font-medium">₹{parseFloat(summary.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-gray-600">Advance:</span>
                    <span className="font-medium">₹<input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={formData.advance || 0}
                      onChange={(e) => setFormData({...formData, advance: parseFloat(e.target.value) || 0})}
                      className="w-24 px-1 py-0 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    /></span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-gray-600">Discount:</span>
                    <span className="font-medium">₹<input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={formData.discount || 0}
                      onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                      className="w-24 px-1 py-0 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    /></span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                    <span className="font-bold text-gray-800">Balance:</span>
                    <span className="font-bold text-gray-800">₹{parseFloat(summary.balance).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Bill
              </button>
            </div>
          </form>
        </div>
      )}

      {currentBill && (
        <div className="mb-6">
          <div className="flex justify-end space-x-3 mb-4">
            <button
              onClick={() => setCurrentBill(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print Bill
            </button>
          </div>
          <div ref={invoiceRef}>
            <Invoice
              hospitalInfo={currentBill.hospitalInfo}
              patientInfo={currentBill.patientInfo}
              charges={currentBill.charges}
              summary={currentBill.summary}
              payment={currentBill.payment}
              billNo={currentBill.billNo}
              billType={currentBill.billType}
            />
          </div>
        </div>
      )}

      {/* Display Bills */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('all')}
          >
            All Bills
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'hospital' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('hospital')}
          >
            Hospital Bills
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'medical' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('medical')}
          >
            Medical Bills
          </button>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {activeTab === 'all' && 'Recent Bills'}
          {activeTab === 'hospital' && 'Hospital Bills'}
          {activeTab === 'medical' && 'Medical Bills'}
        </h2>
        
        {bills && bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  bill ? (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.patientInfo ? bill.patientInfo.name : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.billNo || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.payment ? bill.payment.date : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{bill.summary ? parseFloat(bill.summary.total).toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setCurrentBill(bill);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            window.printRequested = true;
                            setCurrentBill(bill);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ) : null
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No bills found. Create a new bill to get started.</p>
        )}
      </div>
    </div>
  );
};

export default Billing;