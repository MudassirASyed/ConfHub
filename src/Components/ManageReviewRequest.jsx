import React, { useState, useEffect } from "react";
import Layout from "./Layouts/Layout";
import { confirmReviewRequest, rejectReviewRequest } from "../Services/api.js";

const ManageReviewerRequests = () => {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("");

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/papers?populate=*");
        const data = await response.json();
        const filtered = data.data.filter(
          (paper) => paper.reviewRequests && paper.reviewRequests.length > 0
        );
        setPapers(filtered);
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // Filter papers based on search term and domain
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.Paper_Title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         paper.Author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain ? paper.Domain === filterDomain : true;
    return matchesSearch && matchesDomain;
  });

  const uniqueDomains = [...new Set(papers.map(paper => paper.Domain))];

  const handlePaperClick = (paper) => setSelectedPaper(paper);
  const handleBack = () => setSelectedPaper(null);

  const handleApproveRequest = async (reviewerId) => {
    if (!window.confirm("Are you sure you want to approve this reviewer?")) return;
    
    const payload = {
      paperId: selectedPaper.id,
      reviewerId,
    };

    try {
      const response = await confirmReviewRequest(payload);
      if (response.message === "paper assignment successful") {
        alert("Reviewer approved successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error approving reviewer:", error);
      alert("Failed to approve reviewer. Please try again.");
    }
  };

  const handleDisapproveRequest = async (reviewerId) => {
    if (!window.confirm("Are you sure you want to reject this reviewer?")) return;

    const payload = {
      paperId: selectedPaper.id,
      reviewerId,
    };

    try {
      const response = await rejectReviewRequest(payload);
      if (response.message === "paper assignment successful") {
        alert("Reviewer rejected successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error rejecting reviewer:", error);
      alert("Failed to reject reviewer. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#6D24C5] to-[#9F13AB] bg-clip-text text-transparent">
          Manage Reviewer Requests
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : !selectedPaper ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#6D24C5] to-[#9F13AB] bg-clip-text text-transparent">
                Papers with Reviewer Requests
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 w-full max-w-3xl mx-auto">
                {/* Search Input with Icon */}
                <div className="relative flex-grow">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search papers..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="w-full sm:w-48">
                  <select
                    value={filterDomain}
                    onChange={(e) => setFilterDomain(e.target.value)}
                    className="w-full mt-2 h-11 py-2.5 px-4 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                  >
                    <option value="">All Domains</option>
                    {uniqueDomains.map((domain, index) => (
                      <option key={index} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
            
            {filteredPapers.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No papers found</h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm || filterDomain ? "Try adjusting your search or filter" : "No papers currently have reviewer requests"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Paper Title</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Author</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Conference</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Domain</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Review Deadline</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Requests</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPapers.map((paper) => (
                      <tr 
                        key={paper.id} 
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 font-medium">{paper.Paper_Title}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{paper.Author}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{paper.SubmittedTo?.Conference_title || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {paper.Domain}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {paper.conference?.Review_deadline ? (
                            new Date(paper.conference.Review_deadline).toLocaleDateString()
                          ) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {paper.reviewRequests.length} request{paper.reviewRequests.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <button
                            onClick={() => handlePaperClick(paper)}
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#6D24C5] to-[#9F13AB] bg-clip-text text-transparent">
                  Reviewer Requests for: {selectedPaper.Paper_Title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Domain: <span className="font-medium">{selectedPaper.Domain}</span> | 
                  Author: <span className="font-medium">{selectedPaper.Author}</span> | 
                  Conference: <span className="font-medium">{selectedPaper.SubmittedTo?.Conference_title || 'N/A'}</span>
                </p>
              </div>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Papers
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Paper Details</h3>
                <p className="text-gray-700 text-sm">
                  <strong>Abstract:</strong> {selectedPaper.Abstract || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Review Timeline</h3>
                <div className="flex justify-between text-sm text-gray-700">
                  <div>
                    <p className="font-medium">Submission Date:</p>
                    <p>{new Date(selectedPaper.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Review Deadline:</p>
                    <p>{selectedPaper.conference?.Review_deadline ? 
                      new Date(selectedPaper.conference.Review_deadline).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Assigned Reviewers</h3>
                {selectedPaper.reviewers?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPaper.reviewers.map((rev, i) => (
                          <tr key={i} className="border-b border-gray-200">
                            <td className="py-3 px-4 text-sm text-gray-700">{rev.firstName} {rev.lastName}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{rev.email}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          No reviewers have been assigned to this paper yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Reviewer Requests ({selectedPaper.reviewRequests?.length || 0})</h3>
                {selectedPaper.reviewRequests?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Reviewer</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Affiliation</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Expertise</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPaper.reviewRequests.map((req, i) => (
                          <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">
                              <div className="font-medium">{req.firstName} {req.lastName}</div>
                              <div className="text-gray-500 text-xs">{req.email}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{req.affiliation || 'Not specified'}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {req.expertise?.join(', ') || 'Not specified'}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveRequest(req.id)}
                                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDisapproveRequest(req.id)}
                                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          No pending reviewer requests for this paper.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageReviewerRequests;