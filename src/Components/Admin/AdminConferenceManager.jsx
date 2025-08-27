import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layouts/Layout';

const AdminConferenceManager = () => {
  const [conferences, setConferences] = useState([]);
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
    const fetchRequests = async () => {
      try {
        const response = await axios.get('https://confhub-production-0226.up.railway.app/api/conferences?populate=*');
        const allRequests = response.data.data;

        // Separate pending and completed requests
        const pending = allRequests.filter(req => req.requestStatus === 'pending');
        const completed = allRequests.filter(req => req.requestStatus === 'approved' || req.requestStatus === 'rejected');

        setConferences(pending);
        setCompletedRequests(completed);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const updateRequestStatus = async (id, status) => {
    try {
      const response = await axios.put('https://confhub-production-0226.up.railway.app/api/conference/update-status', {
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
  const conference = conferences[index];
  setButtonLoading(index, 'approve', true);
  try {
    await updateRequestStatus(conference.id, 'approved');
    const updatedConferences = [...conferences];
    updatedConferences.splice(index, 1);
    setConferences(updatedConferences);
  } catch (error) {
    console.error('Error approving request:', error);
  } finally {
    setButtonLoading(index, 'approve', false);
  }
};

const handleReject = async (index) => {
  const conference = conferences[index];
  setButtonLoading(index, 'reject', true);
  try {
    await updateRequestStatus(conference.id, 'rejected');
    const updatedConferences = [...conferences];
    updatedConferences.splice(index, 1);
    setConferences(updatedConferences);
  } catch (error) {
    console.error('Error rejecting request:', error);
  } finally {
    setButtonLoading(index, 'reject', false);
  }
};
  const renderRequests = () => {
    const requestsToRender = activeTab === 'pending' ? conferences : completedRequests;

    if (loading) {
      return <p>Loading requests...</p>;
    }

    if (requestsToRender.length === 0) {
      return <p>No {activeTab === 'pending' ? 'pending' : 'completed'} requests.</p>;
    }

    return (
      <div className="overflow-x-auto mt-8">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left border-b">#</th>
              <th className="px-4 py-2 text-left border-b">Conference Title</th>
              <th className="px-4 py-2 text-left border-b">Organizer Name</th>
              <th className="px-4 py-2 text-left border-b">Date</th>
              <th className="px-4 py-2 text-left border-b">Time</th>
              <th className="px-4 py-2 text-left border-b">
                Submission Deadline
              </th>
              <th className="px-4 py-2 text-left border-b">Review Deadline</th>
              <th className="px-4 py-2 text-left border-b">Status</th>
              {activeTab === "pending" && (
                <th className="px-4 py-2 text-left border-b">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {requestsToRender.map((conference, index) => (
              <tr key={conference.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{conference.Conference_title}</td>
                <td className="px-4 py-2">
                  {conference.Organizer?.Organizer_FirstName}{" "}
                  {conference.Organizer?.Organizer_LastName}
                </td>
                <td className="px-4 py-2">{conference.Start_date}</td>
                <td className="px-4 py-2">{conference.Conference_time}</td>
                <td className="px-4 py-2">{conference.Submission_deadline}</td>
                <td className="px-4 py-2">{conference.Review_deadline}</td>
                <td className="px-4 py-2">{conference.requestStatus}</td>
                {activeTab === "pending" && (
                  <td className="px-4 py-2">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="main-content px-8 py-6">
        <h1 className="text-3xl font-bold mb-6">Approve and Reject Conference Request</h1>

        <div className="flex space-x-4 mb-6">
          <button
            className={`px-6 py-2 rounded-full ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests
          </button>
          <button
            className={`px-6 py-2 rounded-full ${activeTab === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Requests
          </button>
        </div>

        {renderRequests()}
      </div>
    </Layout>
  );
};

export default AdminConferenceManager;
