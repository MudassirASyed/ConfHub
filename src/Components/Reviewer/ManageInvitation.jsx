import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layouts/Layout';

const ManageInvitations = () => {
  const [activeInvitations, setActiveInvitations] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitationsData = async () => {
      try {
        const activeResponse = await axios.get('http://localhost:1337/api/invitations/active');
        setActiveInvitations(activeResponse.data);

        const pendingResponse = await axios.get('http://localhost:1337/api/invitations/pending');
        setPendingInvitations(pendingResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching invitations data:', error);
        setLoading(false);
      }
    };

    fetchInvitationsData();
  }, []);

  const handleApprove = async (invitationId) => {
    try {
      await axios.post(`http://localhost:1337/api/invitations/approve/${invitationId}`);
      const updatedPending = pendingInvitations.filter(invite => invite.id !== invitationId);
      setPendingInvitations(updatedPending);
      alert('Invitation approved successfully!');
    } catch (error) {
      console.error('Error approving invitation:', error);
    }
  };

  const renderActiveInvitations = () => {
    if (loading) return <p className="text-gray-500">Loading active invitations...</p>;
    if (activeInvitations.length === 0) return <p className="text-gray-500">No active invitations found.</p>;

    return activeInvitations.map((invite) => (
      <div
        key={invite.id}
        className="bg-white p-4 rounded-lg shadow mb-4"
      >
        <h3 className="text-xl font-semibold">{invite.name}</h3>
        <p><strong>Email:</strong> {invite.email}</p>
        <p><strong>Status:</strong> {invite.status}</p>
        <p><strong>Role:</strong> {invite.role}</p>
      </div>
    ));
  };

  const renderPendingInvitations = () => {
    if (loading) return <p className="text-gray-500">Loading invitations to approve...</p>;
    if (pendingInvitations.length === 0) return <p className="text-gray-500">No pending invitations to approve.</p>;

    return pendingInvitations.map((invite) => (
      <div
        key={invite.id}
        className="bg-white p-4 rounded-lg shadow mb-4"
      >
        <h3 className="text-xl font-semibold">{invite.name}</h3>
        <p><strong>Email:</strong> {invite.email}</p>
        <p><strong>Requested Role:</strong> {invite.role}</p>
        <button
          onClick={() => handleApprove(invite.id)}
          className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Approve
        </button>
      </div>
    ));
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Invitations</h1>

        <div className="flex space-x-4 mb-6 bg-gray-100 p-2 rounded-full">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeTab === 'active' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active Invitations
          </button>
          <button
            onClick={() => setActiveTab('approve')}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeTab === 'approve' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approve Invitations
          </button>
        </div>

        <div>
          {activeTab === 'active' && renderActiveInvitations()}
          {activeTab === 'approve' && renderPendingInvitations()}
        </div>
      </div>
    </Layout>
  );
};

export default ManageInvitations;
