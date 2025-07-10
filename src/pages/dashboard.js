import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '../context/AppContext';
import { Check, X, Edit, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import EditListingModal from '../components/EditListingModal';
import { openDb } from '../lib/database';
export default function Dashboard({ initialListings, totalPages, currentPage }) {
  const [listings, setListings] = useState(initialListings);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { state, dispatch, showNotification } = useApp();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!state.user) {
      dispatch({ type: 'SET_USER', payload: { username: 'admin' } });
    }
  }, [state.user, dispatch, router]);

  const handleStatusChange = async (listingId, newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedListing = await response.json();
        setListings(listings.map(listing =>
          listing.id === listingId ? updatedListing : listing
        ));
        showNotification(`Listing ${newStatus} successfully!`);
      } else {
        showNotification('Failed to update listing status', 'error');
      }
    } catch (error) {
      showNotification('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing) => {
    setSelectedListing(listing);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedListing) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/listings/${updatedListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedListing),
      });

      if (response.ok) {
        const savedListing = await response.json();
        setListings(listings.map(listing =>
          listing.id === updatedListing.id ? savedListing : listing
        ));
        showNotification('Listing updated successfully!');
        setIsEditModalOpen(false);
      } else {
        showNotification('Failed to update listing', 'error');
      }
    } catch (error) {
      showNotification('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    router.push(`/dashboard?page=${page}&status=${statusFilter}`);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    router.push(`/dashboard?page=1&status=${status}`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return `px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`;
  };

  if (!state.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Car Rental Listings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and review all car rental listings submitted by users.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {listing.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.brand} {listing.model} ({listing.year})
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${listing.price_per_day}/day
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {listing.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(listing.status)}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {listing.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(listing.id, 'approved')}
                                disabled={loading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Approve"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(listing.id, 'rejected')}
                                disabled={loading}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Reject"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(listing)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === i + 1
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditListingModal
        listing={selectedListing}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

export async function getServerSideProps(context) {

  const { query } = context;
  const page = parseInt(query.page) || 1;
  const status = query.status || 'all';
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const db = await openDb();
    
    let whereClause = '';
    let params = [];
    
    if (status !== 'all') {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }
    
    const [listings, countResult] = await Promise.all([
      db.all(`
        SELECT * FROM listings 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]),
      db.get(`SELECT COUNT(*) as count FROM listings ${whereClause}`, params)
    ]);

    const totalPages = Math.ceil(countResult.count / limit);

    return {
      props: {
        initialListings: listings,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      props: {
        initialListings: [],
        totalPages: 1,
        currentPage: 1,
      },
    };
  }
}
