import React, { useState, useEffect } from "react";
import Layout from "./Layouts/Layout";
import axios from "axios";
import { reviewRequest } from "../../Services/reviewerService";
import { 
  FiDownload, 
  FiEdit3, 
  FiFileText, 
  FiCalendar, 
  FiUser, 
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw
} from "react-icons/fi";
import { 
  MdAssignment, 
  MdDone, 
  MdSend 
} from "react-icons/md";

const ReviewerDashboard = () => {
  const [ongoingPapers, setOngoingPapers] = useState([]);
  const [assignedPapers, setAssignedPapers] = useState([]);
  const [completedReviews, setCompletedReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("papers");
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("userDetails"));
  const userId = storedUser?.id;
  const reviewerId = storedUser?.reviewerId?.id;
const username=storedUser.username
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !reviewerId) return;

      try {
        const userResponse = await axios.get(
          `http://localhost:1337/api/users/${userId}?populate=reviewerId`
        );

        const domain = userResponse.data?.reviewerId?.domain;

        const [ongoingRes, completedRes, assignedRes] = await Promise.all([
          axios.get("http://localhost:1337/api/papers?populate=*"),
          axios.get(
            "http://localhost:1337/api/papers?populate[review][populate]=reviewer&populate=conference"
          ),
          axios.get(
            `http://localhost:1337/api/papers?filters[reviewRequestsConfirmed][id][$eq]=${reviewerId}&populate=*`
          ),
        ]);

        const allPapers = ongoingRes.data?.data || [];
        const completedData = completedRes.data?.data || [];
        const assignedData = assignedRes.data?.data || [];

        const completed = completedData.filter((paper) =>
          paper.review?.some((r) => r.reviewer?.id === reviewerId)
        );

        const ongoing = allPapers.filter((paper) => {
          const domainMatch = paper.Domain === domain;
          const alreadyReviewed = completed.some((p) => p.id === paper.id);
          const alreadyRequested =
            paper.reviewRequests?.some((r) => r.id === reviewerId) ||
            paper.reviewRequestsConfirmed?.some((r) => r.id === reviewerId) ||
            paper.reviewRequestsRejected?.some((r) => r.id === reviewerId);

          return domainMatch && !alreadyReviewed && !alreadyRequested;
        });

        setCompletedReviews(completed);
        setAssignedPapers(assignedData);
        setOngoingPapers(ongoing);
      } catch (err) {
        console.error("Error fetching reviewer data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, reviewerId]);

  const handleReviewRequest = async (paper) => {
    alert("Request received! Your review request has been submitted.");
    try {
      const response = await reviewRequest({
        paperId: paper.id,
        reviewerId,
        status: "pending",
      });
      console.log("Review request sent:", response);
    } catch (error) {
      console.error("Review request failed:", error);
    }
  };

  const renderAssigned = () =>
    assignedPapers.length ? (
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-left">
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-blue-600" />
                  Paper ID
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <MdAssignment className="text-blue-600" />
                  Title
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiUser className="text-blue-600" />
                  Author
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-blue-600" />
                  Conference
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="text-blue-600" />
                  Deadline
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedPapers.map((paper, index) => (
              <tr 
                key={paper.id} 
                className={`border-b hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                }`}
              >
                <td className="p-4 border-r font-medium text-blue-600">
                  #{paper.id}
                </td>
                <td className="p-4 border-r">
                  <div className="font-medium text-gray-900 line-clamp-2">
                    {paper.Paper_Title}
                  </div>
                </td>
                <td className="p-4 border-r text-gray-700">
                  {paper.Author}
                </td>
                <td className="p-4 border-r">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {paper.SubmittedTo?.Conference_title}
                  </span>
                </td>
                <td className="p-4 border-r">
                  <div className="flex items-center gap-2 text-orange-600">
                    <FiClock size={16} />
                    <span className="text-sm font-medium">
                      {paper.conference?.Review_deadline}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2">
                    {paper.file?.url && (
                      <a
                        href={paper.file.url}
                        download={paper.file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        <FiDownload size={16} />
                        Download
                      </a>
                    )}
                    <button
                      onClick={() =>
                        (window.location.href = `/SubmitReview/${paper.id}`)
                      }
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <FiEdit3 size={16} />
                      Submit Review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <MdAssignment className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 text-lg">No assigned papers found.</p>
        <p className="text-gray-500 text-sm mt-2">New assignments will appear here when available.</p>
      </div>
    );

  const renderCompleted = () =>
    completedReviews.length ? (
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-green-50 to-emerald-50 text-left">
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-green-600" />
                  Title
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiUser className="text-green-600" />
                  Author
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-green-600" />
                  Conference
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="text-green-600" />
                  Deadline
                </div>
              </th>
              <th className="p-4 border-b font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" />
                  Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {completedReviews.map((paper, index) => (
              <tr 
                key={paper.id} 
                className={`border-b hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                }`}
              >
                <td className="p-4 border-r">
                  <div className="font-medium text-gray-900 line-clamp-2">
                    {paper.Paper_Title}
                  </div>
                </td>
                <td className="p-4 border-r text-gray-700">
                  {paper.Author}
                </td>
                <td className="p-4 border-r">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {paper.conference?.Conference_title}
                  </span>
                </td>
                <td className="p-4 border-r text-gray-600 text-sm">
                  {paper.conference?.Review_deadline}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" size={18} />
                    <span className="text-green-700 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full">
                      Review Submitted
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <MdDone className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 text-lg">No completed reviews yet.</p>
        <p className="text-gray-500 text-sm mt-2">Completed reviews will appear here once submitted.</p>
      </div>
    );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Reviewer Dashboard
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
  <FiUser className="text-blue-600" />
  Welcome back! <span className="text-blue-600 font-bold text-lg">{username}</span> Manage your review assignments and track your progress.
</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Assigned Papers</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {assignedPapers.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MdAssignment className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed Reviews</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {completedReviews.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Review Rate</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {assignedPapers.length + completedReviews.length > 0 
                    ? Math.round((completedReviews.length / (assignedPapers.length + completedReviews.length)) * 100)
                    : 0}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiRefreshCw className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-fit">
          {[
            { key: "papers", label: "Assigned Papers", icon: MdAssignment },
            { key: "completed", label: "Completed Reviews", icon: MdDone }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <FiRefreshCw className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
              <p className="text-gray-600 text-lg">Loading your dashboard...</p>
            </div>
          ) : activeTab === "papers" ? (
            renderAssigned()
          ) : (
            renderCompleted()
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReviewerDashboard;