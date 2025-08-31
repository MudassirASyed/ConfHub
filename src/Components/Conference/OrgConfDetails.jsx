import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "./ConferenceDetails.css";
import Header from "../Layouts/Header";
import Footer from "./Footer";
import axios from "axios";
import { Download } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { dashboard_bg } from "../../assets/Images";
import { 
  X, 
  Eye, 
  UserPlus, 
  Calendar, 
  Settings, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Users, 
  MessageCircle, 
  ChevronDown, 
  Star, 
  Award,
  Clock,
  Edit3,
  Save,
  Plus,
  Trash2,
  Filter,
  Search,
  AlertCircle,
  CheckCheck,
  UserCheck,
  Mail,
  Calendar as CalendarIcon,
  FileCheck,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import { 
  FiDownload } from "react-icons/fi";

const OrgConfDetails = () => {
    const STRAPI_BASE_URL = "http://localhost:1337"
  const [state, setState] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [submittedPapers, setSubmittedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDeadline, setReviewDeadline] = useState(false);

  // New states for review form fields
  const [showReviewFormModal, setShowReviewFormModal] = useState(false);
  const [reviewFormFields, setReviewFormFields] = useState([]);
  const [newCustomField, setNewCustomField] = useState("");
   const [acceptedPapersCount, setAcceptedPapersCount] = useState(0);


  const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [activeTab, setActiveTab] = useState('remaining');


  // Default review criteria options
  const defaultReviewCriteria = [
    { id: "significance", label: "Significance", enabled: true, icon: Target },
    { id: "originality", label: "Originality", enabled: true, icon: Zap },
    { id: "presentation", label: "Presentation Quality", enabled: true, icon: FileText },
    { id: "technical_quality", label: "Technical Quality", enabled: false, icon: Settings },
    { id: "clarity", label: "Clarity", enabled: false, icon: Eye },
    { id: "novelty", label: "Novelty", enabled: false, icon: Star },
    { id: "reproducibility", label: "Reproducibility", enabled: false, icon: CheckCheck },
    { id: "related_work", label: "Related Work Coverage", enabled: false, icon: FileCheck },
    {
      id: "experimental_validation",
      label: "Experimental Validation",
      enabled: false,
      icon: BarChart3
    },
    { id: "writing_quality", label: "Writing Quality", enabled: false, icon: Edit3 },
  ];
  const [newReviewerInput, setNewReviewerInput] = useState("");
  const [newReviewerEmails, setNewReviewerEmails] = useState([]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignPaper, setAssignPaper] = useState(null);
  const [sortOption, setSortOption] = useState("reviews");
  const [selectedExistingReviewer, setSelectedExistingReviewer] = useState("");
  const [newReviewerEmail, setNewReviewerEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [existingReviewers, setExistingReviewers] = useState([
    // Replace with dynamic data if needed
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ]);
  const [selectedExistingReviewers, setSelectedExistingReviewers] = useState(
    []
  );const [statusDropdowns, setStatusDropdowns] = useState({});

  const [reviewers, setReviewers] = useState([]);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const response = await axios.get(`http://localhost:1337/api/reviewers`);
        const reviewerData = response.data.data.map((r) => ({
          id: r.id,
          name: r.firstName + r.lastName,
          email: r.email,
        }));
        setReviewers(reviewerData);
      } catch (error) {
        console.error("Error fetching reviewers:", error);
      }
    };

    fetchReviewers();
  }, []);
  // Extract IDs of already assigned reviewers

  const reviewerOptions = reviewers.map((reviewer) => ({
    value: reviewer.id,
    label: `${reviewer.name} (${reviewer.email})`,
  }));
  const assignedReviewerIds =
    assignPaper?.reviewRequestsConfirmed?.map((r) => r.id) || [];

  // Filter out already assigned reviewers from options
  const filteredReviewerOptions = reviewerOptions.filter(
    (option) => !assignedReviewerIds.includes(option.value)
  );
  const handleReviewerChange = (selectedOptions) => {
    setSelectedExistingReviewers(selectedOptions || []);
  };
  let confData;
  useEffect(() => {
    const fetchConferenceDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:1337/api/conferences?filters[id][$eq]=${id}&populate[Papers][populate][file][populate]=*
&populate[Papers][populate][review][populate]=reviewer
&populate[Organizer][populate]=*`
        );
        confData = response.data.data;
        setConference(confData);
        setLoading(false);
        console.log("ddd", confData);

        if (confData.length > 0) {
          const papers = confData[0].Papers || []; // No `.data` here
          setSubmittedPapers(papers);
console.log('paa',papers);
const acceptedPapers = papers.filter(paper => paper.finalDecisionByOrganizer === 'Accept');
setAcceptedPapersCount(acceptedPapers.length);
console.log(`Number of accepted papers: ${acceptedPapersCount}`); 

          // Initialize review form fields from conference data or use defaults
          const existingFields = [
            ...(confData[0].reviewFormFields || []),
            ...defaultReviewCriteria,
          ];

          setReviewFormFields(existingFields);
        }
      } catch (error) {
        console.error("Error fetching conference details:", error);
        setLoading(false);
      }
    };

    fetchConferenceDetails();
  }, [id]);

  const handleShowReviews = (paperId) => {
    const paper = submittedPapers.find((p) => p.id === paperId);
    console.log("rr", paper.review);

    if (paper) {
      setSelectedReviews(paper.review); // Set the reviews for the selected paper
      setIsModalOpen(true); // Open the modal
      setSelectedPaper(paper);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false); // Hide the modal
    setSelectedReviews(null);
    setSelectedPaper(null);
  };

  const handleJoinConference = () => {
    navigate("/register");
  };

  const handleDecision = async (decision) => {
    try {
      const payload = {
        paperId: selectedPaper.id,
        decision,
      };
      console.log("payy", payload);

      const response = await axios.post(
        "http://localhost:1337/api/organizers/final-decision",
        payload
      );

      if (response.status === 200) {
        console.log("Decision sent successfully:", response.data);
        window.location.reload();
        handleCloseModal(); // Close the modal after submitting the decision
      } else {
        console.error("Failed to send decision:", response.data);
      }
    } catch (error) {
      console.error("Error sending decision:", error);
    }
  };

  const handleReviewDeadlineSubmit = async () => {
    if (!reviewDeadline) {
      alert("Review deadline is required");
      return;
    }

    const reviewDate = reviewDeadline;
    const submissionDate = conference[0].Submission_deadline;
    const startDate = conference[0].Start_date;
    console.log("datee", submissionDate, "--", reviewDate, "--", startDate);

    if (reviewDate <= submissionDate) {
      alert("Review deadline must be after the submission deadline");
      return;
    }

    if (reviewDate >= startDate) {
      alert("Review deadline must be before the conference start date");
      return;
    }
    const payload = {
      id: conference[0].id,
      Review_deadline: reviewDeadline,
    };

    try {
      const response = await axios.post(
        "http://localhost:1337/api/conferences/updateReviewDeadline",
        payload
      );

      if (response.status === 200) {
        const updatedConference = [...conference];
        updatedConference[0].Review_deadline = reviewDeadline;
        setConference(updatedConference);
        setShowReviewModal(false);
      }
    } catch (error) {
      console.error("Error updating review deadline:", error);
    }
  };

  const updateConferenceStatus = async () => {
    setIsUpdating(true);

    const payload = {
      id: conference[0].id,
      status: "completed",
    };

    try {
      const response = await axios.post(
        "http://localhost:1337/api/conferences/updateConferenceStatus",
        payload
      );

      if (response.status === 200) {
        navigate("/OrganizerDashboard");
      }
    } catch (error) {
      console.error("Error updating conference status:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  // New functions for review form fields management
  const handleReviewFormFieldToggle = (id) => {
    const updatedFields = reviewFormFields.map((field) =>
      field.id === id ? { ...field, enabled: !field.enabled } : field
    );
    setReviewFormFields(updatedFields);
  };

  const handleAddCustomField = () => {
    if (newCustomField.trim()) {
      const customFieldId = `custom_${Date.now()}`;
      const newField = {
        id: customFieldId,
        label: newCustomField.trim(),
        enabled: true,
        isCustom: true,
        icon: Plus
      };
      setReviewFormFields((prev) => [...prev, newField]);
      setNewCustomField("");
    }
  };

  const handleRemoveCustomField = (fieldId) => {
    setReviewFormFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  const handleSaveReviewFormFields = async () => {
    try {
      const checkedFields = reviewFormFields.filter((field) => field.enabled); // use 'enabled'

      const payload = {
        id: conference[0].id,
        reviewFormFields: checkedFields,
      };

      // Replace with your actual API endpoint
      const response = await axios.post(
        "http://localhost:1337/api/organizers/updateReviewFormFields",
        payload
      );

      if (response.status === 200) {
        const updatedConference = [...conference];
        updatedConference[0].reviewFormFields = reviewFormFields;
        setConference(updatedConference);
        setShowReviewFormModal(false);
      }
    } catch (error) {
      console.error("Error updating review form fields:", error);
    }
  };

  const openEditModal = () => {
    setNewDeadline(conference[0]?.Submission_deadline || "");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleAssignReviewers = (paperId) => {
    const paper = submittedPapers.find((p) => p.id === paperId);
    if (paper) {
      setAssignPaper(paper);
      setIsAssignModalOpen(true); // Open the new modal
    }
  };
  const handleConfirmAssign = () => {
    const selectedReviewerIds = selectedExistingReviewers.map((r) => r.value);

    if (selectedReviewerIds.length === 0 && newReviewerEmails.length === 0) {
      alert("Please select at least one reviewer or enter at least one email.");
      return;
    }

    const payload = {
      paperId: assignPaper.id,
      reviewers: selectedReviewerIds,
      newReviewerEmails: newReviewerEmails,
    };

    console.log("Payload to send:", payload);

    axios
      .post("http://localhost:1337/api/organizers/assign-reviewers", payload)
      .then((res) => {
        console.log("Reviewers assigned successfully", res.data);
        setSelectedExistingReviewers([]);
        setNewReviewerEmails([]);
        setNewReviewerInput("");
        setAssignPaper(null);
        setIsAssignModalOpen(false);
      })
      .catch((err) => {
        console.error("Error assigning reviewers:", err);
      });
  };

  const getSortedPapers = () => {
    return [...submittedPapers].sort((a, b) => {
      if (sortOption === "reviews") {
        return b.review.length - a.review.length;
      } else {
        return new Date(a.submissionDate) - new Date(b.submissionDate);
      }
    });
  };
  // compute tomorrow's date in yyyy-mm-dd for the input min attribute
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateForInputs = tomorrow.toISOString().split("T")[0]; // e.g. "2025-08-07"

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="text-gray-600 font-medium">Loading conference details...</p>
      </div>
    </div>
  );
const handleDownload = async (fileUrl, fileName) => {
  try {
    const response = await fetch(`${STRAPI_BASE_URL}${fileUrl}`, {
      method: "GET",
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName); // force download
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed:", error);
  }
};
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 shadow-2xl shadow-black/40 drop-shadow-2xl">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : conference.length > 0 ? (
            <>
              {/* Conference Info */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                <div className="p-8">
                  {conference.map((conf) => (
                    <div key={conf.id} className="space-y-8">
                      <div className="flex justify-between items-start">
                        <button
    onClick={() => window.history.back()}
    className="rounded-full p-2 bg-blue-500 hover:bg-blue-700 text-white transition"
  >
    <ArrowLeft className="h-7 w-7" />
  </button>
                        <div className="flex-1">
                          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
                            {conf.Conference_title}
                          </h1>
                          <p className="mt-2 text-lg text-gray-600 leading-relaxed">
                            {conf.Description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            <Activity className="w-4 h-4 mr-2" />
                            {conf.Status}
                          </span>
                        </div>
                     {conf.Status !== "completed" && new Date(conf.Start_date) < new Date() && (
  <button
    onClick={updateConferenceStatus}
    disabled={isUpdating}
    className={`inline-flex items-center px-4 py-2 ${
      isUpdating ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
    } text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200`}
  >
    <CheckCircle className="w-4 h-4 mr-2" />
    {isUpdating ? "Updating…" : "Mark as Completed"}
  </button>
)}




                      </div>

                      {/* Organizer and Date Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Organizer
                            </h3>
                            <p className="text-lg font-semibold text-gray-900">
                              {conf.Organizer?.Organizer_FirstName}{" "}
                              {conf.Organizer?.Organizer_LastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Start Date
                            </h3>
                            <p className="text-lg font-semibold text-gray-900">
                              {conf.Start_date}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Deadlines Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                  Paper Submission Deadline
                                </h3>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                  {conf.Submission_deadline}
                                </p>
                              </div>
                            </div>
                             {conf.Status !== "completed" && (
                            <button
                              onClick={openEditModal}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 hover:text-orange-800 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg transition-all duration-200"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                             )}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                          {conf.Review_deadline ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                                  <FileCheck className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Review Deadline
                                  </h3>
                                  <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {conf.Review_deadline}
                                  </p>
                                </div>
                              </div>
                               {conf.Status !== "completed" && (
                              <button
                                onClick={() => setShowReviewModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-all duration-200"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit
                              </button>
                               )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                                  <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    Review Deadline
                                  </h3>
                                  <p className="text-sm text-gray-400 mt-1">Not set</p>
                                </div>
                              </div>
                               {conf.Status !== "completed" && (
                              <button
                                onClick={() => setShowReviewModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                              >
                                <Plus className="w-4 h-4" />
                                Add Review Deadline
                              </button>
                               )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Form Configuration */}
                       {conf.Status !== "completed" && (
                      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                              <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                Review Form Configuration
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Customize the review criteria for submitted papers
                              </p>
                              <div className="mt-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                                  <Target className="w-3 h-3 mr-1" />
                                  {
                                    reviewFormFields.filter((f) => f.enabled)
                                      .length
                                  }{" "}
                                  criteria enabled
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowReviewFormModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                          >
                            <Settings className="w-4 h-4" />
                            Configure Review Form
                          </button>
                        </div>
                      </div>
                       )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submitted Papers Section */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
  {/* Header, Tabs, and Controls */}
  <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
  
      <div className="flex justify-between items-center bg-white shadow-lg rounded-xl p-6 md:p-8 mb-10">
        {/* Submitted Papers - Left Corner */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {submittedPapers.length} Papers Submitted
          </h3>
        </div>

        {/* Accepted Papers - Right Corner */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {acceptedPapersCount} Papers accepted
          </h3>
        </div>
      </div>
    

    {/* Tabs */}
    {/* Tabs */}
<div className="flex space-x-2 bg-gray-100 p-1 rounded-xl mb-4">
  <button
    onClick={() => {
      setActiveTab('remaining');
      setCurrentPage(1);
    }}
    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-xl transition-all duration-200 ${
      activeTab === 'remaining'
        ? 'bg-white text-blue-700 shadow-lg'
        : 'text-gray-600 bg-gray-300 hover:bg-gray-400 hover:text-gray-900'
    }`}
  >
    <Clock className="w-5 h-5" />
    Decision Remaining ({submittedPapers.filter(p => !p.finalDecisionByOrganizer || p.finalDecisionByOrganizer.trim() === '').length})
  </button>
  <button
    onClick={() => {
      setActiveTab('submitted');
      setCurrentPage(1);
    }}
    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-xl transition-all duration-200 ${
      activeTab === 'submitted'
        ? 'bg-white text-green-700 shadow-lg'
        : 'text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-gray-900'
    }`}
  >
    <Award className="w-5 h-5" />
    Decision Submitted ({submittedPapers.filter(p => p.finalDecisionByOrganizer && p.finalDecisionByOrganizer.trim() !== '').length})
  </button>
</div>

    {/* Search and Controls */}
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title, author, or ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Sort and Page Size Controls */}
      <div className="flex items-center gap-4">
        {/* Sort Control */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Sort by</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none bg-transparent border-none text-sm font-medium text-gray-800 focus:outline-none cursor-pointer pr-6"
            >
              <option value="reviews">Most Reviews</option>
              <option value="submission">Submission Date</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Page Size Control */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="appearance-none bg-transparent border-none text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div className="p-6">
    {(() => {
      // Filtering and pagination logic, which you already have.
      const filteredPapers = submittedPapers.filter(paper => {
        const matchesSearch = 
          paper.Paper_Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.Author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          paper.id?.toString().includes(searchTerm);

        const hasDecision = paper.finalDecisionByOrganizer && paper.finalDecisionByOrganizer.trim() !== '';
        
        if (activeTab === 'remaining') {
          return matchesSearch && !hasDecision;
        } else {
          return matchesSearch && hasDecision;
        }
      }).sort((a, b) => {
        if (sortOption === "reviews") {
          return b.review.length - a.review.length;
        } else {
          return new Date(a.submissionDate) - new Date(b.submissionDate);
        }
      });
      
      const totalPages = Math.ceil(filteredPapers.length / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedPapers = filteredPapers.slice(startIndex, startIndex + pageSize);

      return filteredPapers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 shadow-2xl shadow-black/40 drop-shadow-2xl">
            {paginatedPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1"
              >
                {/* Title and ID Section */}
                <div className="text-center mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {paper.Paper_Title}
                    </h4>
                  </div>
                <div className="flex items-center justify-center gap-3 mt-2">
  <p className="text-lg text-black-500 font-medium pt-5">
    Paper ID: #{paper.id || "N/A"}
  </p>

                     {paper.file?.url && (
  <button
    onClick={() => handleDownload(paper.file.url, paper.file.name)}
    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors shadow-sm"
  >
    <FiDownload size={16} />
    Download
  </button>
)}

</div>
                  {paper.finalDecisionByOrganizer && (
  <h4
    className={`text-xl font-bold ${
      paper.finalDecisionByOrganizer === "Accept"
        ? "text-green-600"
        : paper.finalDecisionByOrganizer === "Reject"
        ? "text-red-600"
        : "text-gray-900"
    }`}
  >
    {paper.finalDecisionByOrganizer}ed
  </h4>
)}

                </div>

                {/* Status Badges */}
                <div className="flex justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">
                      {paper.reviewRequestsConfirmed?.length || 0} Assigned
                      reviewers
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">
                      {paper.review?.length || 0} Reviews submitted
                    </span>
                  </div>
                </div>

                {/* Author and Submission Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <strong>Author:</strong> {paper.Author || "N/A"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <strong>Submitted:</strong>{" "}
                    {new Date(paper.submissionDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Abstract */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Abstract:
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {paper.Abstract}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
               <div className="flex flex-wrap justify-center gap-3">
  {/* Assign Reviewer Button */}
  <button
    onClick={() => handleAssignReviewers(paper.id)}
    disabled={!!paper.finalDecisionByOrganizer} // disable if decision exists
    className={`inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg transition-all duration-200 ${
      paper.finalDecisionByOrganizer
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
    }`}
  >
    <UserPlus className="w-4 h-4" />
    Assign Reviewer
  </button>

  {/* View Reviews Button */}
  <button
    onClick={() => handleShowReviews(paper.id)}
    disabled={!!paper.finalDecisionByOrganizer || !paper.review || paper.review.length === 0}
    className={`inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg transition-all duration-200 ${
      paper.finalDecisionByOrganizer
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : !paper.review || paper.review.length === 0
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transform hover:scale-105"
    }`}
  >
    <Eye className="w-4 h-4" />
    View Reviews
  </button>
</div>

              </div>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + pageSize, filteredPapers.length)} of{" "}
                  {filteredPapers.length} papers
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, idx) => {
                      const page = idx + 1;
                      const isCurrentPage = page === currentPage;
                      const shouldShow =
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1;

                      if (!shouldShow) {
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="px-2 py-1 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            isCurrentPage
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:bg-white hover:text-gray-900"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No papers submitted
          </h3>
          <p className="text-gray-500">
            Papers submitted to this conference will appear here.
          </p>
        </div>
      );
    })()}
  </div>
</div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No conference found
              </h3>
              <p className="text-gray-500">
                There are no conferences available at the moment.
              </p>
            </div> 
          )}
        </section>

        {/* Enhanced Review Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
              {/* Enhanced Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 justify-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text center justify-center">Paper Reviews</h2>
                      <p className="text-indigo-100 mt-1 text-xl justify-center">
                        Review details for: {selectedPaper?.Paper_Title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-250px)]">
                {selectedReviews && selectedReviews.length > 0 ? (
                  <div className="space-y-8">
                    {selectedReviews.map((reviews, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            Review {index + 1} 
                            ({reviews.reviewer.firstName} {reviews.reviewer.lastName})
                          </h3>
                        </div>

                        {/* Enhanced Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          {conference[0].reviewFormFields &&
                          conference[0].reviewFormFields.length > 0 ? (
                            conference[0].reviewFormFields.map(
                              (field, fieldIndex) => {
                                const colors = [
                                  { bg: "from-blue-500 to-blue-600", text: "text-blue-600", dot: "bg-blue-500" },
                                  { bg: "from-green-500 to-green-600", text: "text-green-600", dot: "bg-green-500" },
                                  { bg: "from-orange-500 to-orange-600", text: "text-orange-600", dot: "bg-orange-500" },
                                  { bg: "from-purple-500 to-purple-600", text: "text-purple-600", dot: "bg-purple-500" },
                                  { bg: "from-red-500 to-red-600", text: "text-red-600", dot: "bg-red-500" },
                                  { bg: "from-teal-500 to-teal-600", text: "text-teal-600", dot: "bg-teal-500" },
                                ];
                                const color = colors[fieldIndex % colors.length];
                                const IconComponent = field.icon || Target;
                                
                                return (
                                  <div
                                    key={field.id}
                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className={`w-8 h-8 bg-gradient-to-r ${color.bg} rounded-lg flex items-center justify-center`}>
                                        <IconComponent className="w-4 h-4 text-white" />
                                      </div>
                                      <span className="font-semibold text-gray-700 text-sm">
                                        {field.label}
                                      </span>
                                    </div>
                                    <div className={`text-2xl font-bold ${color.text}`}>
                                      {reviews[field.id] || "N/A"}
                                      {field.id !== "Recommendations" && (
                                        <span className="text-sm text-gray-500 ml-1">
                                          /10
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )
                          ) : (
                            <>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Target className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-gray-700">
                                    Significance
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                  {reviews.significance || "N/A"}
                                  <span className="text-sm text-gray-500 ml-1">
                                    /10
                                  </span>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-gray-700">
                                    Originality
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  {reviews.originality || "N/A"}
                                  <span className="text-sm text-gray-500 ml-1">
                                    /10
                                  </span>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-gray-700">
                                    Presentation
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                  {reviews.presentation || "N/A"}
                                  <span className="text-sm text-gray-500 ml-1">
                                    /10
                                  </span>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Award className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-gray-700">
                                    Recommendation
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-purple-600">
                                  {reviews.Recommendations || "N/A"}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Enhanced Comments Section */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-gray-600" />
                            Reviewer Comments
                          </h4>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                            <p className="text-gray-700 leading-relaxed">
                              {reviews.Comments || "No comments available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      No reviews available for this paper.
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Decision Buttons Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-t border-gray-200">
                <div className="flex justify-center space-x-4">
                  <button
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
                    onClick={() => handleDecision("Accept")}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept Paper
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
                    onClick={() => handleDecision("Reject")}
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Paper
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Edit submission Deadline Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        Edit Submission Deadline
                      </h3>
                      <p className="text-blue-100 text-sm mt-1">
                        Update the paper submission deadline
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeEditModal}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4" />
                    New Submission Deadline
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    min={minDateForInputs}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!newDeadline) {
                        alert("Submission deadline is required");
                        return;
                      }

                      const submissionDate = new Date(newDeadline);
                      const reviewDate = new Date(
                        conference[0].Review_deadline
                      );
                      const startDate = new Date(conference[0].Start_date);

                      if (submissionDate >= reviewDate) {
                        alert(
                          "Submission deadline must be before review deadline"
                        );
                        return;
                      }

                      if (submissionDate >= startDate) {
                        alert("Submission deadline must be before start date");
                        return;
                      }
                      try {
                        const payload = {
                          id: conference[0].id,
                          Submission_deadline: newDeadline,
                        };
                        const response = await axios.post(
                          "http://localhost:1337/api/conferences/updateSubmissiondate",
                          payload
                        );

                        if (response.status === 200) {
                          const updatedConference = [...conference];
                          updatedConference[0].Submission_deadline =
                            newDeadline;
                          setConference(updatedConference);
                          closeEditModal();
                        }
                      } catch (error) {
                        console.error(
                          "Error updating submission deadline:",
                          error.response?.data || error.message
                        );
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={closeEditModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Review Deadline Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Set Review Deadline</h3>
                      <p className="text-purple-100 text-sm mt-1">
                        Configure the deadline for paper reviews
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4" />
                    Review Deadline Date
                  </label>
                  <input
                    type="date"
                    value={reviewDeadline}
                    min={minDateForInputs}
                    onChange={(e) => setReviewDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReviewDeadlineSubmit}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Deadline
                  </button>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Review Form Fields Modal */}
        {showReviewFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-2xl font-bold">
                        Configure Review Form
                      </h2>
                      <p className="text-blue-100 mt-1">
                        Customize the criteria reviewers will use to evaluate
                        papers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewFormModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Standard Criteria Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Standard Review Criteria
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviewFormFields
                      .filter((field) => !field.isCustom)
                      .map((field) => {
                        const IconComponent = field.icon || Target;
                        return (
                          <label
                            key={field.id}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                          >
                            <input
                              type="checkbox"
                              checked={field.enabled}
                              onChange={() =>
                                handleReviewFormFieldToggle(field.id)
                              }
                              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-700 font-medium">
                              {field.label}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-800 text-lg">
                      Configuration Summary
                    </h4>
                  </div>
                  <p className="text-blue-700">
                    <span className="font-semibold text-xl">
                      {reviewFormFields.filter((f) => f.enabled).length}
                    </span>{" "}
                    criteria will be included in the review form. Reviewers will
                    evaluate papers based on these selected criteria.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => setShowReviewFormModal(false)}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveReviewFormFields}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Assign Reviewer Modal */}
        {isAssignModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-200">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex-shrink-0 rounded-3xl">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-1">
                Assign Reviewer
              </h2>
              <p className="text-indigo-100 text-sm leading-relaxed break-words overflow-wrap-anywhere">
                {assignPaper?.Paper_Title}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAssignModalOpen(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Paper Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <strong>Paper ID:</strong> #{assignPaper?.id}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <strong>Author:</strong> {assignPaper?.Author}
              </div>
            </div>
          </div>

          {/* Already Assigned Reviewers */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <UserCheck className="w-4 h-4" />
              Already Assigned Reviewers
            </label>
            {assignPaper?.reviewRequestsConfirmed?.length > 0 ? (
              <div className="space-y-2">
                {assignPaper.reviewRequestsConfirmed.map((rev, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {rev.firstName} {rev.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{rev.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 italic">
                  No reviewers assigned yet.
                </p>
              </div>
            )}
          </div>

          {/* Select Existing Reviewers */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Users className="w-4 h-4" />
              Select Existing Reviewers
            </label>
            <Select
              isMulti
              options={filteredReviewerOptions}
              value={selectedExistingReviewers}
              onChange={handleReviewerChange}
              className="text-sm"
              classNamePrefix="react-select"
              placeholder="Choose reviewers from database..."
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '12px',
                  borderColor: '#e5e7eb',
                  padding: '4px',
                }),
              }}
            />
          </div>

          {/* Add New Reviewer */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Mail className="w-4 h-4" />
              Add New Reviewer (Email)
            </label>
            <input
              type="email"
              value={newReviewerInput}
              onChange={(e) => setNewReviewerInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  (e.key === "Enter" || e.key === ",") &&
                  newReviewerInput.trim()
                ) {
                  e.preventDefault();
                  setNewReviewerEmails((prev) => [
                    ...prev,
                    newReviewerInput.trim(),
                  ]);
                  setNewReviewerInput("");
                }
              }}
              placeholder="Type email and press Enter or comma"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-2">
              Press Enter or comma after each email to add it
            </p>
          </div>

          {/* New Reviewer Email Tags */}
          {newReviewerEmails.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                New Reviewers to Add:
              </label>
              <div className="flex flex-wrap gap-2">
                {newReviewerEmails.map((email, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-2 rounded-lg border border-green-200 text-sm font-medium"
                  >
                    <Mail className="w-3 h-3" />
                    {email}
                    <button
                      type="button"
                      onClick={() =>
                        setNewReviewerEmails((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-3">
          <button
            onClick={() => setIsAssignModalOpen(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleConfirmAssign}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
      <Footer />
    </>
  );
};

export default OrgConfDetails;