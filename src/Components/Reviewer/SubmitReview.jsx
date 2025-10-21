import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layouts/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { submitReview } from "../../Services/reviewerService";
import { Edit3, Send, Loader2 } from 'lucide-react';
import { ArrowLeft } from "lucide-react";
// Rating options
const ratingOptions = [
  { label: "Strongly Disagree", value: 0 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 5 },
  { label: "Agree", value: 7 },
  { label: "Strongly Agree", value: 10 },
];

const SubmitReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reviewerId, setReviewerId] = useState(null);
  const [paperDetails, setPaperDetails] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewComments, setReviewComments] = useState("");
  const [recommendation, setRecommendation] = useState("Accept");

  const [dynamicScores, setDynamicScores] = useState({});
  const [reviewFields, setReviewFields] = useState([
    // fallback static fields (optional)
    { id: "originality", label: "Originality", enabled: true },
    { id: "significance", label: "Significance", enabled: true },
    { id: "presentation", label: "Presentation", enabled: true },
    { id: "overall", label: "Overall Recommendation", enabled: true }
  ]);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load reviewerId
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userDetails"));
    if (storedUser?.reviewerId?.id) {
      setReviewerId(storedUser.reviewerId.id);
    } else {
      setErrorMessage("Reviewer not found. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, []);

  // Fetch paper and conference details
  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        const res = await axios.get(

          `http://localhost:1337/api/papers?filters[id][$eq]=${id}&populate=conference`

        );
        const paper = res.data.data[0];
        setPaperDetails(paper);

        const conf = paper.conference;
        const fields = conf?.reviewFormFields;

        if (fields && Array.isArray(fields) && fields.length > 0) {
          setReviewFields(fields.filter(f => f.enabled));
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to load paper details.");
      }
    };
    fetchPaperDetails();
  }, [id]);

  // Fetch existing review
  // useEffect(() => {
  //   const fetchExistingReview = async () => {
  //     if (!reviewerId || !id) return;
  //     try {
  //       const res = await axios.get(

  //         `http://localhost:1337/api/reviews?filters[paperId][$eq]=${id}&filters[reviewerId][$eq]=${reviewerId}&populate=*`

  //       );
  //       if (res.data.data.length > 0) {
  //         setExistingReview(res.data.data[0].attributes);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching existing review:", err);
  //     }
  //   };
  //   fetchExistingReview();
  // }, [reviewerId, id]);

  // Handle dynamic score change
  const handleScoreChange = (fieldId, value) => {
    setDynamicScores((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    for (const field of reviewFields) {
      if (!dynamicScores[field.id]) {
        setErrorMessage(`Please rate ${field.label}.`);
        return;
      }
    }
    if (!reviewComments) {
      setErrorMessage("Please add review comments.");
      return;
    }

    const reviewData = {
      paperId: id,
      reviewerId,
      comments: reviewComments,
      recommendation,
      ...Object.fromEntries(
        Object.entries(dynamicScores).map(([key, val]) => [key, parseInt(val)])
      ),
    };

    setLoading(true);
    try {
      await submitReview(reviewData);
      setSuccessMessage("Review submitted successfully.");
       setTimeout(() => {
    navigate("/ReviewerDashboard");
  }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred while submitting the review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen px-4 py-10">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl shadow-2xl shadow-black/40 drop-shadow-2xl">
<div className="relative flex items-center justify-center mb-50">
  <button
    onClick={() => window.history.back()}
    className="absolute left-0 rounded-full p-2 bg-blue-500 hover:bg-blue-700 text-white transition"
  >
    <ArrowLeft className="h-7 w-7" />
  </button>

  <h2 className="text-3xl font-bold text-blue-700 text-center">
    Submit Your Review
  </h2>
</div>


          {paperDetails ? (
  <div className="mb-7 mt-20 text-2xl  text-left w-full">
    <p className="text-left text-lg mb-2"><strong>Paper Id:</strong> {paperDetails.id}</p>
    <p className="text-left text-lg mb-2"><strong>Title:</strong> {paperDetails.Paper_Title}</p>
    <p className="text-left text-lg mb-2"><strong>Author:</strong> {paperDetails.Author}</p>
    <p className="text-left text-lg mb-2"><strong>Conference:</strong> {paperDetails.conference?.Conference_title}</p>
    <p className="text-left text-lg mb-2"><strong>Deadline:</strong> {paperDetails.conference?.Review_deadline}</p>
  </div>
) : (
  <p className="text-gray-500 text-left">Loading paper details...</p>
)}


          
          <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-xl">
  <h3 className="text-xl font-bold text-gray-800 mb-2">
    Rate the Following (Based on Agreement)
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {reviewFields.map((field) => (
      <ScoreSelect
        key={field.id}
        label={field.label}
        value={dynamicScores[field.id] || ""}
        onChange={(value) => handleScoreChange(field.id, value)}
      />
    ))}
  </div>

  <SelectField
    label="Recommendation"
    value={recommendation}
    onChange={setRecommendation}
    options={["Accept", "Minor Revision", "Major Revision", "Reject"]}
  />

<div>
  <label htmlFor="reviewComments" className="block text-sm font-medium text-gray-700 mb-1">
    Review Comments
  </label>
  <div className="relative">
    <textarea
      id="reviewComments"
      className="w-full min-h-[120px] max-h-[300px] border border-gray-300 rounded-md p-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-y"
      value={reviewComments}
      onChange={(e) => setReviewComments(e.target.value)}
      placeholder="Write your detailed comments..."
      rows={5}
    />
    <span className="absolute top-3 right-3 text-gray-400">
      <Edit3 className="w-5 h-5" />
    </span>
  </div>
</div>

  {errorMessage && <p className="text-red-500 text-sm mt-4">{errorMessage}</p>}
  {successMessage && <p className="text-green-600 text-sm mt-4">{successMessage}</p>}

  <button
    type="submit"
    disabled={loading || successMessage}
    className={`w-full flex items-center justify-center gap-2 mt-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-md shadow-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {loading ? (
      <>
        <Loader2 className="animate-spin h-5 w-5" />
        Submitting...
      </>
    ) : (
      <>
        <Send className="h-5 w-5" />
        Submit Review
      </>
    )}
  </button>
</form>
        </div>
      </div>
    </Layout>
  );
};

// Reusable Components
const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ScoreSelect = ({ label, value, onChange }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">Select rating</option>
      {ratingOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label} ({opt.value})
        </option>
      ))}
    </select>
  </div>
);

export default SubmitReview;
