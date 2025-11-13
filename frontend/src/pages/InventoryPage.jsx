import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../apis/medicineApi';

const InventoryPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    composition: '',
    manufacturer: '',
    schedule: '',
    batchNumber: '',
    expiryDate: '',
    purchasePrice: '',
    mrp: '',
    stockQuantity: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false); // New state to control form visibility
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMedicineId, setDeleteMedicineId] = useState(null);

  // Load medicines from sessionStorage on component mount
  useEffect(() => {
    const savedMedicines = sessionStorage.getItem('medicines');
    if (savedMedicines) {
      try {
        const parsedMedicines = JSON.parse(savedMedicines);
        setMedicines(parsedMedicines);
      } catch (error) {
        console.error('Error parsing medicines from sessionStorage:', error);
        fetchMedicines();
      }
    } else {
      fetchMedicines();
    }
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await getMedicines();
      setMedicines(data);
      // Update sessionStorage
      sessionStorage.setItem('medicines', JSON.stringify(data));
    } catch (error) {
      toast.error('Failed to fetch medicines: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.batchNumber || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      if (editingId) {
        // Update existing medicine
        const updatedMedicine = await updateMedicine(editingId, {
          name: formData.name,
          description: formData.composition,
          manufacturer: formData.manufacturer,
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate,
          price: parseFloat(formData.mrp) || 0,
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          quantity: parseInt(formData.stockQuantity) || 0,
          schedule: formData.schedule
        });
        
        // Refresh the medicine list from the API to ensure consistency
        const refreshedMedicines = await getMedicines();
        setMedicines(refreshedMedicines);
        // Update sessionStorage
        sessionStorage.setItem('medicines', JSON.stringify(refreshedMedicines));
        toast.success('Medicine updated successfully!');
      } else {
        // Add new medicine
        const newMedicine = await createMedicine({
          name: formData.name,
          description: formData.composition,
          manufacturer: formData.manufacturer,
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate,
          price: parseFloat(formData.mrp) || 0,
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          quantity: parseInt(formData.stockQuantity) || 0,
          schedule: formData.schedule
        });
        
        // Refresh the medicine list from the API to ensure consistency
        const refreshedMedicines = await getMedicines();
        setMedicines(refreshedMedicines);
        // Update sessionStorage
        sessionStorage.setItem('medicines', JSON.stringify(refreshedMedicines));
        toast.success('Medicine added successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        composition: '',
        manufacturer: '',
        schedule: '',
        batchNumber: '',
        expiryDate: '',
        purchasePrice: '',
        mrp: '',
        stockQuantity: ''
      });
      setEditingId(null);
      setShowForm(false); // Hide form after submission
    } catch (error) {
      toast.error('Operation failed: ' + error.message);
    }
  };

  const handleEdit = (medicine) => {
    setFormData({
      name: medicine.name,
      composition: medicine.description,
      manufacturer: medicine.manufacturer,
      schedule: medicine.schedule || '',
      batchNumber: medicine.batchNumber,
      expiryDate: medicine.expiryDate.split('T')[0], // Format date for input
      purchasePrice: medicine.purchasePrice || 0,
      mrp: medicine.price || 0,
      stockQuantity: medicine.quantity || 0
    });
    setEditingId(medicine._id);
    setShowForm(true); // Show form when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    // Show confirmation dialog
    setDeleteMedicineId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMedicine(deleteMedicineId);
      // Refresh the medicine list from the API to ensure consistency
      const refreshedMedicines = await getMedicines();
      setMedicines(refreshedMedicines);
      // Update sessionStorage
      sessionStorage.setItem('medicines', JSON.stringify(refreshedMedicines));
      toast.success('Medicine deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete medicine: ' + error.message);
    } finally {
      setShowDeleteConfirm(false);
      setDeleteMedicineId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteMedicineId(null);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      composition: '',
      manufacturer: '',
      schedule: '',
      batchNumber: '',
      expiryDate: '',
      purchasePrice: '',
      mrp: '',
      stockQuantity: ''
    });
    setEditingId(null);
    setShowForm(false); // Hide form on cancel
  };

  const openForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      name: '',
      composition: '',
      manufacturer: '',
      schedule: '',
      batchNumber: '',
      expiryDate: '',
      purchasePrice: '',
      mrp: '',
      stockQuantity: ''
    });
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this medicine? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage your medicine inventory and billing</p>
        </div>

        {/* Add Medicine Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={openForm}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add New Medicine
            </button>
          </div>
        )}

        {/* Medicine Form - Only shown when showForm is true */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editingId ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter medicine name"
                  required
                />
              </div>
              
              {/* Composition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Composition
                </label>
                <input
                  type="text"
                  name="composition"
                  value={formData.composition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter composition"
                />
              </div>
              
              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter manufacturer"
                />
              </div>
              
              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule
                </label>
                <select
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Schedule</option>
                  <option value="H">H</option>
                  <option value="H1">H1</option>
                  <option value="X">X</option>
                  <option value="Y">Y</option>
                  <option value="Z">Z</option>
                </select>
              </div>
              
              {/* Batch Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter batch number"
                  required
                />
              </div>
              
              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter purchase price"
                  min="0"
                  step="0.01"
                />
              </div>
              
              {/* MRP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRP
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter MRP"
                  min="0"
                  step="0.01"
                />
              </div>
              
              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter stock quantity"
                  min="0"
                />
              </div>
              
              {/* Form Actions */}
              <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaSave className="mr-2" />
                  {editingId ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Search and Medicine List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Medicine Inventory</h2>
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Medicine Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No medicines found
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <tr key={medicine._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">{medicine.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medicine.batchNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medicine.manufacturer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {medicine.schedule || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medicine.quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(medicine.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(medicine._id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;