import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Layout from "./Layouts/Layout";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { updateSelectedConferences } from "../../Services/author.js";
const Tab = ({ active, onClick, children }) => (
  <button
    className={`py-2 px-4 rounded-full ${
      active ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
    } transition-colors`}
    onClick={onClick}
  >
    {children}
  </button>
);

const SearchBar = React.memo(({ searchTerm, setSearchTerm, placeholder }) => (
  <div className="relative mb-4 w-1/5">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
      autoComplete="off"
    />
  </div>
));

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const [recentConferences, setRecentConferences] = useState([]);
  const [submittedPapers, setSubmittedPapers] = useState([]);
  const [activeTab, setActiveTab] = useState("conferences");
  const [loading, setLoading] = useState(true);

  // Search states
  const [conferenceSearchTerm, setConferenceSearchTerm] = useState("");
  const [paperSearchTerm, setPaperSearchTerm] = useState("");
  const [debouncedConferenceSearch, setDebouncedConferenceSearch] =
    useState("");
  const [debouncedPaperSearch, setDebouncedPaperSearch] = useState("");

  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const authorname = userDetails?.username;

  // Debounce conference search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedConferenceSearch(conferenceSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [conferenceSearchTerm]);

  // Debounce paper search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPaperSearch(paperSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [paperSearchTerm]);

  // Filter conferences based on search
  const filteredConferences = useMemo(() => {
    if (!debouncedConferenceSearch) return recentConferences;

    return recentConferences.filter(
      (conference) =>
        conference.Conference_title?.toLowerCase().includes(
          debouncedConferenceSearch.toLowerCase()
        ) ||
        conference.Description?.toLowerCase().includes(
          debouncedConferenceSearch.toLowerCase()
        ) ||
        conference.Conference_location?.toLowerCase().includes(
          debouncedConferenceSearch.toLowerCase()
        )
    );
  }, [debouncedConferenceSearch, recentConferences]);

  // Filter papers based on search
  const filteredPapers = useMemo(() => {
    if (!debouncedPaperSearch) return submittedPapers;

    return submittedPapers.filter(
      (paper) =>
        paper.Paper_Title?.toLowerCase().includes(
          debouncedPaperSearch.toLowerCase()
        ) ||
        paper.conference?.Conference_title?.toLowerCase().includes(
          debouncedPaperSearch.toLowerCase()
        )
    );
  }, [debouncedPaperSearch, submittedPapers]);

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    const authorId = userDetails?.authorId?.id;
    let selectedConferences = [];
    const fetchAuthorData = async () => {
      try {
        try {
          const author = await axios.get(
            `https://confhub-production-0226.up.railway.app/api/authors?filters[id][$eq]=${authorId}&populate=*`
          );

          // Get the first author object (since filters can return multiple)
          const authorData = author.data.data[0];

          // Extract the array of selected conferences
          selectedConferences = authorData?.selected_conferences || [];
          const localConferenceId = localStorage.getItem(
            "selectedConferenceId"
          );
          if (localConferenceId) {
            const alreadyExists = selectedConferences.some(
              (conf) => conf.id === Number(localConferenceId)
            );
            if (!alreadyExists) {
                 try {
      // Prepare payload for update
      const payload = {
        authorId: authorId,
        conferenceId: Number(localConferenceId),
      };

      // Call your service to update selected conferences
      await updateSelectedConferences(payload);


    } catch (error) {
      console.error("Error adding conference to selected conferences:", error);
    }
              selectedConferences.push({ id: Number(localConferenceId) });
              console.log(
                "Added localStorage conference ID to selectedConferences:",
                localConferenceId
              );

            }
          }

          console.log("Selected Conferences Array:", selectedConferences);
        } catch (error) {
          console.error("Error fetching author data:", error);
        }
        if (!selectedConferences.length) {
          console.warn("No selected conferences found for this author");
        } else {
          const conferenceIds = selectedConferences.map((conf) => conf.id);
          let filters = conferenceIds
            .map((id, index) => `filters[id][$in][${index}]=${id}`)
            .join("&");
          const conferenceResponse = await axios.get(
            `https://confhub-production-0226.up.railway.app/api/conferences?filters[requestStatus][$eq]=approved&${filters}&populate[Papers][populate]=submitted_by`
          );
          console.log("recentt", conferenceResponse.data.data);

          const allConferences = conferenceResponse.data.data;

          const filteredConferences = allConferences.filter((conference) => {
            const papers = conference.Papers || [];

            // Check if any paper's submitted_by array includes authorId
            const hasSubmittedByCurrentAuthor = papers.some((paper) => {
              const submittedAuthors = Array.isArray(paper.submitted_by)
                ? paper.submitted_by
                : [];
              return submittedAuthors.some((author) => author?.id === authorId);
            });

            // Include conference ONLY if no papers are submitted by this author
            return !hasSubmittedByCurrentAuthor;
          });

          setRecentConferences(filteredConferences);
          console.log("Filtered Recent Conferences", filteredConferences);
          console.log(
            "Filtered Approved Conferences:",
            conferenceResponse.data.data
          );
        }
        const papersResponse = await axios.get(
          `https://confhub-production-0226.up.railway.app/api/papers?filters[submitted_by][id][$eq]=${authorId}&populate=*`
        );
        setSubmittedPapers(papersResponse.data?.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching author data:", error);
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, []);

  const handleSubmitPaper = (conferenceId) => {
    navigate(`/SubmitPaper/${conferenceId}`);
  };

  const handleShowReview = (paperId) => {
    navigate(`/paper-review/${paperId}`);
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Welcome <strong>{authorname}</strong> in Author Dashboard
        </h1>

        {/* Tab Buttons */}
        <div className="mb-6 flex gap-4">
          <Tab
            active={activeTab === "conferences"}
            onClick={() => setActiveTab("conferences")}
          >
            Selected Conferences
          </Tab>
          <Tab
            active={activeTab === "papers"}
            onClick={() => setActiveTab("papers")}
          >
            Submitted Papers
          </Tab>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === "conferences" && (
            <div>
              <SearchBar
                searchTerm={conferenceSearchTerm}
                setSearchTerm={setConferenceSearchTerm}
                placeholder="Search conferences by title, description, or location..."
              />

              {/* Results count for conferences */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredConferences.length} of{" "}
                  {recentConferences.length} conferences
                  {debouncedConferenceSearch && (
                    <span className="ml-2 text-blue-600">
                      for "{debouncedConferenceSearch}"
                    </span>
                  )}
                </p>
              </div>

              {loading ? (
                <p className="text-gray-600">Loading conferences...</p>
              ) : filteredConferences.length === 0 ? (
                <p className="text-gray-600">
                  {debouncedConferenceSearch
                    ? "No conferences found matching your search."
                    : "No conferences available. To submit paper in a conference you have to join conference from home page of bzchair and then login to you author account"}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Conference Title
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Description
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Start Date
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Submission Deadline
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConferences.map((conference) => (
                        <tr
                          key={conference.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {conference.Conference_title}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {conference.Description}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {conference.Start_date}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {conference.Submission_deadline}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <button
                              onClick={() => handleSubmitPaper(conference.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                            >
                              Submit Paper
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "papers" && (
            <div>
              <SearchBar
                searchTerm={paperSearchTerm}
                setSearchTerm={setPaperSearchTerm}
                placeholder="Search papers by title or conference..."
              />

              {/* Results count for papers */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredPapers.length} of {submittedPapers.length}{" "}
                  papers
                  {debouncedPaperSearch && (
                    <span className="ml-2 text-blue-600">
                      for "{debouncedPaperSearch}"
                    </span>
                  )}
                </p>
              </div>

              {loading ? (
                <p className="text-gray-600">Loading papers...</p>
              ) : filteredPapers.length === 0 ? (
                <p className="text-gray-600">
                  {debouncedPaperSearch
                    ? "No papers found matching your search."
                    : "No papers submitted yet."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                         <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Paper ID
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Paper Title
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Conference
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Review Deadline
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPapers.map((paper) => (
                        <tr
                          key={paper.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paper.id}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paper.Paper_Title}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paper.conference?.Conference_title || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paper.conference?.Review_deadline || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {paper.finalDecisionByOrganizer ? (
                              <button
                                onClick={() => handleShowReview(paper.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                              >
                                View Review
                              </button>
                            ) : (
                              <button
                                disabled
                                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                              >
                                Organizer Decision pending
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "decisions" && (
            <div>
              {loading ? (
                <p className="text-gray-600">Loading decisions...</p>
              ) : submittedPapers.length === 0 ? (
                <p className="text-gray-600">No decisions available yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Paper Title
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Conference
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Organizer Decision
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                          Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedPapers.map((paper) => (
                        <tr
                          key={paper.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paper.Paper_Title}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paper.conference?.Conference_title || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paper.organizerDecision || "Pending"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paper.organizerComment || "No comments"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AuthorDashboard;
