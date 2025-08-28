import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layouts/Layout';
import styled from 'styled-components';

const AdminDashboard = () => {
  const [organizers, setOrganizers] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
const [loadingStates, setLoadingStates] = useState({});

const setButtonLoading = (index, action, isLoading) => {
  setLoadingStates(prev => ({
    ...prev,
    [`${index}-${action}`]: isLoading
  }));
};
  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/organizers');
        const allRequests = response.data.data;

        const pending = allRequests.filter(req => req.reqStatus === 'pending');
        const completed = allRequests.filter(
          req => req.reqStatus === 'approved' || req.reqStatus === 'rejected'
        );

        setOrganizers(pending);
        setCompletedRequests(completed);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  const updateRequestStatus = async (id, status) => {
    try {
      const response = await axios.put('http://localhost:1337/api/organizers/update-status', {
        id,
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating status to '${status}':`, error.response || error.message);
      throw error;
    }
  };

  const handleApprove = async (index) => {
  const organizer = organizers[index];
  setButtonLoading(index, 'approve', true);
  try {
    await updateRequestStatus(organizer.id, 'approved');
    const updatedOrganizers = [...organizers];
    updatedOrganizers.splice(index, 1);
    setOrganizers(updatedOrganizers);
    setCompletedRequests([...completedRequests, { ...organizer, reqStatus: 'approved' }]);
  } catch (error) {
    console.error('Error approving request:', error);
  } finally {
    setButtonLoading(index, 'approve', false);
  }
};

const handleReject = async (index) => {
  const organizer = organizers[index];
  setButtonLoading(index, 'reject', true);
  try {
    await updateRequestStatus(organizer.id, 'rejected');
    const updatedOrganizers = [...organizers];
    updatedOrganizers.splice(index, 1);
    setOrganizers(updatedOrganizers);
    setCompletedRequests([...completedRequests, { ...organizer, reqStatus: 'rejected' }]);
  } catch (error) {
    console.error('Error rejecting request:', error);
  } finally {
    setButtonLoading(index, 'reject', false);
  }
};
  const renderRequests = () => {
    const requestsToRender = activeTab === 'pending' ? organizers : completedRequests;

    if (loading) {
      return <p className="text-gray-600">Loading requests...</p>;
    }

    if (requestsToRender.length === 0) {
      return (
        <p className="text-gray-600">
          No {activeTab === 'pending' ? 'pending' : 'completed'} requests.
        </p>
      );
    }

    return (
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Affiliation</th>
              <th className="px-6 py-3 text-left">Department</th>
              {activeTab === "completed" && (
                <th className="px-6 py-3 text-left">Status</th>
              )}
              {activeTab === "pending" && (
                <th className="px-6 py-3 text-left">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {requestsToRender.map((organizer, index) => (
              <tr key={organizer.id} className="border-b">
                <td className="px-6 py-4">
                  {organizer.Organizer_FirstName} {organizer.Organizer_LastName}
                </td>
                <td className="px-6 py-4">{organizer.Organizer_Email}</td>
                <td className="px-6 py-4">{organizer.Affiliation}</td>
                <td className="px-6 py-4">{organizer.Department}</td>
                {activeTab === "completed" && (
                  <td className="px-6 py-4 capitalize">
                    {organizer.reqStatus}
                  </td>
                )}
                {activeTab === "pending" && (
                  <td className="px-6 py-4 space-x-2">
                    <button
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleApprove(index)}
                      disabled={
                        loadingStates[`${index}-approve`] ||
                        loadingStates[`${index}-reject`]
                      }
                    >
                      {loadingStates[`${index}-approve`]
                        ? "Approving..."
                        : "Approve"}
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleReject(index)}
                      disabled={
                        loadingStates[`${index}-approve`] ||
                        loadingStates[`${index}-reject`]
                      }
                    >
                      {loadingStates[`${index}-reject`]
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-sky-600 text-center">Welcome to Admin Dashboard</h1>
<h1 className="text-2xl font-bold mb-6 text-gray-800">Approve or Reject Organizer Account Request</h1>

        <div className="mb-4 flex gap-4">
          <Tab
            active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests
          </Tab>
          <Tab
            active={activeTab === 'completed'}
            onClick={() => setActiveTab('completed')}
          >
            Completed Requests
          </Tab>
        </div>

        {renderRequests()}
      </div>
    </Layout>
  );
};

export default AdminDashboard;

// Styled Components for Tabs
const Tab = styled.button`
  padding: 8px 16px;
  border: none;
  font-weight: 500;
  background-color: ${(props) => (props.active ? '#3b82f6' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : '#374151')};
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.active ? '#2563eb' : '#e5e7eb')};
  }
`;
