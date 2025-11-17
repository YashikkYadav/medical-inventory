import React, { useState, useEffect, useRef } from 'react';
import Invoice from '../components/Invoice';
import { ToWords } from 'to-words';
import { getMedicines } from '../apis/medicineApi';
import { getServices } from '../apis/serviceApi';  // Add this import
import { createInvoice, getInvoices } from '../apis/invoiceApi';
import HospitalServiceInput from '../components/HospitalServiceInput';
import MedicalMedicineInput from '../components/MedicalMedicineInput';
import { toast, Toaster } from 'react-hot-toast'; // Add toast import

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
  const [services, setServices] = useState([]);  // Add this line
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
    
    const fetchServices = async () => {  // Add this function
      // Try to get services from sessionStorage first
      const sessionServices = sessionStorage.getItem('services');
      if (sessionServices) {
        try {
          const parsedServices = JSON.parse(sessionServices);
          setServices(parsedServices);
          return;
        } catch (sessionError) {
          console.error('Error parsing services from sessionStorage:', sessionError);
        }
      }
      
      // Fallback to API if sessionStorage is empty
      try {
        const servicesData = await getServices();
        setServices(servicesData);
        // Update sessionStorage
        sessionStorage.setItem('services', JSON.stringify(servicesData));
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
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
          billType: invoice.billType || 'medical', // Use the billType from invoice data
          hospitalInfo: {
            name: invoice.billType === 'medical' ? medialInfo.name : hospitalInfo.name,
            address: invoice.billType === 'medical' ? medialInfo.address : hospitalInfo.address,
            phone: invoice.billType === 'medical' ? medialInfo.phone : hospitalInfo.phone,
            email: invoice.billType === 'medical' ? "" : hospitalInfo.email,
            regNo: invoice.billType === 'medical' ? "8BZJPS2130M1ZDm" : "8BZJPS2130M1ZDh"
          },
          patientInfo: {
            name: invoice.customerName || 'Unknown Patient',
            age: invoice.patientAge || '', // Add age field
            sex: invoice.patientSex || '', // Add sex field
            address: invoice.patientAddress || '', // Add address field
            phone: invoice.customerContact || '',
            consultantName: invoice.consultantName || '',
            admitDate: invoice.admitDate || new Date(invoice.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            dischargeDate: invoice.dischargeDate || new Date(invoice.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            ipdNo: invoice.ipdNo || '',
            patientRegistration: invoice.patientRegistration || '', // Add patient registration field
          },
          charges: invoice.items.map((item, index) => ({
            id: index + 1,
            name: item.name || item.medicineName || (item.medicine && typeof item.medicine === 'object' ? item.medicine.name : item.medicine) || 'Service/Charge',
            qty: item.quantity || 0,
            amount: item.price || 0
          })),
          payment: {
            mode: 'Cash',
            date: new Date(invoice.createdAt).toLocaleDateString('en-GB'),
            amount: invoice.items.reduce((total, item) => total + (item.quantity * item.price), 0),
            amountInWords: invoice.amountInWords || toWords.convert(invoice.items.reduce((total, item) => total + (item.quantity * item.price), 0)) || ''
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
        sessionStorage.setItem('invoices', JSON.stringify(transformedBills));
        console.log('Loaded bills from API:', transformedBills);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setBills([]);
      }
    };
    
    fetchMedicines();
    fetchServices();  // Add this line
    fetchBills();
    
    // Remove the duplicate fetchInvoices function as we're already fetching invoices in fetchBills
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
      consultantName: "",
      admitDate: "",
      dischargeDate: "",
      ipdNo: "",
      patientRegistration: "", // Add patient registration field
      date: new Date().toISOString().split('T')[0],
    },
    charges: [
      {
        id: 1,
        name: "",
        description: "",
        qty: 1,
        amount: 0,
        filteredMedicines: [],  // Keep this for medical bills
        filteredServices: [],   // Add this for hospital bills
        showDropdown: false,    // Add this for dropdown control
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

  // New function to handle custom charges for hospital bills
  const handleCustomChargeChange = (index, field, value) => {
    const updatedCharges = [...formData.charges];
    updatedCharges[index] = {
      ...updatedCharges[index],
      [field]: value
    };
    
    // If this is a hospital bill and they're entering a custom charge name,
    // we don't need to link it to a medicine
    if (formData.billType === 'hospital') {
      updatedCharges[index].medicineId = null;
    }
    
    setFormData({
      ...formData,
      charges: updatedCharges
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
        : medicines,
      filteredServices: value.length > 0  // Add this for services
        ? services.filter(service =>
            service.name && service.name.toLowerCase().includes(value.toLowerCase())
          )
        : services
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
      filteredMedicines: medicines,
      filteredServices: services  // Add this for services
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

  // Hospital-specific functions
  const handleServiceSearch = (index, value) => {
    const newCharges = [...formData.charges];
    newCharges[index] = { 
      ...newCharges[index], 
      name: value,
      filteredServices: value.length > 0 
        ? services.filter(service =>
            service.name && service.name.toLowerCase().includes(value.toLowerCase())
          )
        : services
    };
    
    setFormData({
      ...formData,
      charges: newCharges
    });
  };

  const handleServiceFocus = (index) => {
    // Show dropdown with all services
    const newCharges = [...formData.charges];
    newCharges[index] = { 
      ...newCharges[index], 
      filteredServices: services
    };
    
    setFormData({
      ...formData,
      charges: newCharges
    });
    
    setShowDropdown(true);
    setDropdownIndex(index);
  };

  const handleServiceBlur = () => {
    // Delay closing dropdown to allow click on items
    setTimeout(() => {
      setShowDropdown(false);
      setDropdownIndex(null);
    }, 200);
  };

  const handleServiceSelect = (index, service) => {
    const updatedCharges = [...formData.charges];
    updatedCharges[index].name = service.name;
    updatedCharges[index].amount = parseFloat(service.price) || 0;
    updatedCharges[index].medicineId = null; // No medicine ID for services
    setFormData({
      ...formData,
      charges: updatedCharges
    });
    
    // Close dropdown
    setShowDropdown(false);
    setDropdownIndex(null);
    
    // Add a new blank item when selecting a service
    addChargeRow();
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
          filteredServices: [],  // Add this line
          showDropdown: false,   // Add this line
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
    const total = formData.charges.reduce((sum, charge) => sum + ((charge.qty || 0) * (charge.amount || 0)), 0);
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
        patientAge: formData.patientInfo.age, // Add patient age
        patientSex: formData.patientInfo.sex, // Add patient sex
        patientAddress: formData.patientInfo.address, // Add patient address
        consultantName: formData.patientInfo.consultantName,
        admitDate: formData.patientInfo.admitDate,
        dischargeDate: formData.patientInfo.dischargeDate,
        ipdNo: formData.patientInfo.ipdNo,
        patientRegistration: formData.patientInfo.patientRegistration, // Add patient registration field
        billType: formData.billType || 'medical', // Add billType to differentiate hospital and medical bills
        items: formData.charges.map(charge => ({
          medicine: charge.medicineId, // This can be null for hospital bills
          quantity: parseInt(charge.qty) || 0,
          price: parseFloat(charge.amount) || 0,
          name: charge.name || '' // Include the service name for hospital bills
        })).filter(item => item.quantity > 0), // Only include items with quantity > 0
        discount: parseFloat(formData.discount) || 0,
        tax: 0, // You might want to add tax field to the form
        amountInWords: formData.payment.amountInWords || '' // Add amountInWords to the invoice data
      };
      
      // Create invoice via API
      const createdInvoice = await createInvoice(invoiceData);
      
      // Transform the created invoice to bill format
      const newBill = {
        id: createdInvoice._id || Date.now(),
        billNo: `INV-${Date.now()}`,
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
          consultantName: formData.patientInfo.consultantName || '',
          admitDate: formData.patientInfo.admitDate || '',
          dischargeDate: formData.patientInfo.dischargeDate || '',
          ipdNo: formData.patientInfo.ipdNo || '',
          patientRegistration: formData.patientInfo.patientRegistration || '', // Add patient registration field
        },
        charges: createdInvoice.items ? createdInvoice.items.map((item, index) => ({
          id: index + 1,
          name: item.name || item.medicineName || (item.medicine && typeof item.medicine === 'object' ? item.medicine.name : item.medicine) || 'Service/Charge',
          qty: item.quantity || 0,
          amount: item.price || 0
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
      sessionStorage.setItem('invoices', JSON.stringify(updatedBills));
      
      setCurrentBill(newBill);
      setShowForm(false);
      
      // Show success toast
      toast.success(`${formData.billType === 'hospital' ? 'Hospital' : 'Medical'} bill created successfully!`);
      
      // Refresh medicines from API to reflect updated quantities (only if we have medicine items)
      const hasMedicineItems = formData.charges.some(charge => charge.medicineId);
      if (hasMedicineItems) {
        const refreshedMedicines = await getMedicines();
        setMedicines(refreshedMedicines);
        sessionStorage.setItem('medicines', JSON.stringify(refreshedMedicines));
      }
      
      // Reset form data to initial state
      setFormData({
        hospitalInfo: formData.billType === 'medical' ? {
          name: medialInfo.name,
          address: medialInfo.address,
          phone: medialInfo.phone,
          email: "",
        } : hospitalInfo,
        patientInfo: {
          name: "",
          age: "",
          sex: "",
          address: "",
          phone: "",
          consultantName: "",
          admitDate: "",
          dischargeDate: "",
          ipdNo: "",
          patientRegistration: "", // Add patient registration field
          date: new Date().toISOString().split('T')[0],
        },
        charges: [
          {
            id: 1,
            name: "",
            description: "",
            qty: 1,
            amount: 0,
            filteredMedicines: [],
            filteredServices: [],
            showDropdown: false,
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
        billType: formData.billType || 'hospital',
      });
      
      console.log('Invoice created successfully:', createdInvoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create bill: ' + error.message);
    }
  };

  const handlePrint = () => {
    // If we're printing from the currentBill view, use the ref
    if (currentBill && invoiceRef && invoiceRef.current) {
      const printContent = invoiceRef.current;
      
      // Simple approach: just print the current window
      window.print();
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
        hospitalInfo: {
            name: hospitalInfo.name,
            address: hospitalInfo.address,
            phone: hospitalInfo.phone,
            email: hospitalInfo.email,
            regNo: hospitalInfo.regNo
        },
      patientInfo: {
        name: "",
        age: "",
        sex: "",
        address: "",
        phone: "",
        consultantName: "",
        admitDate: "",
        dischargeDate: "",
        ipdNo: "",
        patientRegistration: "", // Add patient registration field
        date: new Date().toISOString().split('T')[0],
      },
      charges: [
        {
          id: 1,
          name: "",
          description: "",
          qty: 1,
          amount: 0,
          filteredMedicines: [],
          filteredServices: [],
          showDropdown: false,
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
      },
      patientInfo: {
        name: "",
        age: "",
        sex: "",
        address: "",
        phone: "",
        consultantName: "",
        admitDate: "",
        dischargeDate: "",
        ipdNo: "",
        patientRegistration: "", // Add patient registration field
        date: new Date().toISOString().split('T')[0],
      },
      charges: [
        {
          id: 1,
          name: "",
          description: "",
          qty: 1,
          amount: 0,
          filteredMedicines: [],
          filteredServices: [],
          showDropdown: false,
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
        patientRegistration: '', // Add patient registration field
      };
    }
    
    if (!bill.charges) {
      bill.charges = [];
    } else {
      // Ensure each charge has proper properties
      bill.charges = bill.charges.map(charge => ({
        ...charge,
        name: charge.name ? (typeof charge.name === 'object' ? charge.name.name : charge.name) : 'Service/Charge',
        qty: charge.qty || 0,
        amount: charge.amount || 0
      }));
    }
    
    if (!bill.payment) {
      bill.payment = {
        mode: 'Cash',
        date: '',
        amount: bill.summary ? bill.summary.total : 0,
        amountInWords: bill.summary ? (toWords.convert(parseFloat(bill.summary.total) || 0) || '') : ''
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

  // Function to render medicine input for medical bills
  const renderMedicineInput = (charge, index) => (
    <td className="px-4 py-2 ">
      <input
        type="text"
        value={charge.name || ""}
        onChange={(e) => handleSearchChange(index, e.target.value)}
        onFocus={() => handleFocus(index)}
        onBlur={handleBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Select or type service/medicine name"
      />
      {showDropdown && dropdownIndex === index && (
        (charge.filteredMedicines && charge.filteredMedicines.length > 0) || 
        (charge.filteredServices && charge.filteredServices.length > 0)
      ) && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-96 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {/* Show medicines for medical bills */}
          {formData.billType === 'medical' && charge.filteredMedicines && charge.filteredMedicines.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Medicines</div>
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
            </>
          )}
          
          {/* Show services for hospital bills */}
          {formData.billType === 'hospital' && charge.filteredServices && charge.filteredServices.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Services</div>
              {charge.filteredServices.map((service) => (
                <div
                  key={service._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => handleServiceSelect(index, service)}
                >
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-500">Price: ₹{service.price}</div>
                </div>
              ))}
            </>
          )}
          
          {/* Show medicines for hospital bills as well */}
          {formData.billType === 'hospital' && charge.filteredMedicines && charge.filteredMedicines.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-t mt-2">Medicines</div>
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
            </>
          )}
        </div>
      )}
    </td>
  );

  return (
    <div className="p-6">
      <Toaster position="top-right" /> {/* Add Toaster component for toast notifications */}
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
                {formData.billType === 'hospital' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultant Name</label>
                      <input
                        type="text"
                        value={formData.patientInfo.consultantName || ""}
                        onChange={(e) => handleInputChange(e, 'patientInfo', 'consultantName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admit Date</label>
                      <input
                        type="date"
                        value={formData.patientInfo.admitDate || ""}
                        onChange={(e) => handleInputChange(e, 'patientInfo', 'admitDate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date</label>
                      <input
                        type="date"
                        value={formData.patientInfo.dischargeDate || ""}
                        onChange={(e) => handleInputChange(e, 'patientInfo', 'dischargeDate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IPD No</label>
                      <input
                        type="text"
                        value={formData.patientInfo.ipdNo || ""}
                        onChange={(e) => handleInputChange(e, 'patientInfo', 'ipdNo')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reg No</label>
                      <input
                        type="text"
                        value={formData.patientInfo.patientRegistration || ""}
                        onChange={(e) => handleInputChange(e, 'patientInfo', 'patientRegistration')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {formData.billType === 'hospital' ? 'Service' : 'Medicine'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.charges.map((charge, index) => (
                      <tr key={charge.id}>
                        {formData.billType === 'hospital' ? (
                          <HospitalServiceInput
                            charge={charge}
                            index={index}
                            services={services}
                            showDropdown={showDropdown}
                            dropdownIndex={dropdownIndex}
                            handleServiceSearch={handleServiceSearch}
                            handleServiceFocus={handleServiceFocus}
                            handleServiceBlur={handleServiceBlur}
                            handleServiceSelect={handleServiceSelect}
                            handleServiceChange={handleChargeChange}
                          />
                        ) : (
                          <MedicalMedicineInput
                            charge={charge}
                            index={index}
                            medicines={medicines}
                            showDropdown={showDropdown}
                            dropdownIndex={dropdownIndex}
                            handleMedicineSearch={handleSearchChange}
                            handleMedicineFocus={handleFocus}
                            handleMedicineBlur={handleBlur}
                            handleMedicineSelect={handleMedicineSelect}
                            handleMedicineChange={handleChargeChange}
                          />
                        )}
                        
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
                          ₹{parseFloat((charge.qty || 0) * (charge.amount || 0)).toFixed(2)}
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
              onClick={() => window.open(`/bill/${currentBill.id || currentBill.billNo}`, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View/print
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
                          onClick={() => window.open(`/bill/${bill.id || bill.billNo}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View/print
                        </button>
                        {/* <button
                          onClick={() => {window.open(`/bill/${bill.id || bill.billNo}`, '_blank')  }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Print
                        </button> */}
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