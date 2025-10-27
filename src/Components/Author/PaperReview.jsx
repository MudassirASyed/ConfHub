import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layouts/Layout';
import axios from "axios";
import { ArrowLeft } from "lucide-react";
const PaperReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReview = async () => {
      try {
        console.log('paper id',id);
        
          const response = await axios.get(

  `https://bzchair-backend.up.railway.app/api/papers?filters[id][$eq]=${id}&populate=review&populate=SubmittedTo`

); 
        const data = response.data;
        setReviewData(data.data);
       // console.log('dd',data.data);
        
      } catch (error) {
        console.error('Error fetching review:', error);
        setReviewData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);
  const calculateOverallScore = (scores) => {
    if (!scores) return 'N/A';
  
    const values = Object.values(scores).filter(val => typeof val === 'number');
    if (values.length === 0) return 'N/A';
  
    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(1);
  };
  

  // const calculateOverallScore = (scores) => {
  //   const total = scores.originality + scores.presentation + scores.significance;
  //   return total / 3;  // Example calculation for average score
  // };

  // Return loading state while waiting for data
  if (!reviewData) {
    return <div>Loading...</div>;
  }
  if (loading) {
    return (
      <Layout>
        <div className="p-6">Loading review...</div>
      </Layout>
    );
  }

  if (!reviewData) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-red-600 font-semibold">No review found for this paper.</p>
          <button
            className="mt-4 bg-gray-700 text-white px-4 py-2 rounded"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-2xl shadow-black/40 drop-shadow-2xl">
      <button
      onClick={() => window.history.back()}
      className="rounded-full p-2 bg-blue-500 hover:bg-blue-700 text-white transition mr-10"
    >
      <ArrowLeft className="h-7 w-7" />
    </button>
      <h2 className="text-2xl text-bold  mb-6 text-center">Paper Title: {reviewData[0]?.Paper_Title}</h2>
  
      <div className="space-y-6">
        <h3 className="text-xl mb-6 text-center">Conference: {reviewData[0]?.SubmittedTo?.Conference_title}</h3>
       <h2 className="text-3xl  text-blue-500 font-bold mb-6 text-center">Final Decision By Organizer: {reviewData[0]?.finalDecisionByOrganizer || 'N/A'}</h2>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <p><span className="font-semibold">Conference:</span> {reviewData[0]?.SubmittedTo?.Conference_title}</p>
          <p><span className="font-semibold">Final Decision By Organizer: </span> {reviewData[0]?.finalDecisionByOrganizer || 'N/A'}</p>
        </div> */}
  
        {/* Loop through each review */}      
        {reviewData[0]?.review.map((reviews, index) => (
  <div
    key={index}
    className={`mt-10 p-6 bg-white rounded-lg shadow-2xl shadow-black/40 drop-shadow-2xl m-10 ${index !== 0 ? 'border-t-2 border-gray-500' : ''}`}
  >
    <h3 className="text-lg font-semibold mb-4">Review {index + 1}</h3>

    {/* First Row: Significance, Originality, Presentation, and Recommendation */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {reviewData[0]?.SubmittedTo?.reviewFormFields?.length > 0 ? (
    reviewData[0].SubmittedTo.reviewFormFields.map((field, index) => {
      const colorMap = ['blue', 'green', 'orange', 'purple', 'red', 'teal'];
      const color = colorMap[index % colorMap.length];
      return (
        <div key={field.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 bg-${color}-500 rounded-full`}></div>
            <span className="font-semibold text-gray-700">{field.label}</span>
          </div>
          <div className={`text-2xl font-bold text-${color}-600`}>
            {reviews[field.id] || 'N/A'}
            {field.id.toLowerCase() !== 'recommendations' && (
              <span className="text-sm text-gray-500">/10</span>
            )}
          </div>
        </div>
      );
    })
  ) : (
    <>
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="font-semibold text-gray-700">Significance</span>
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {reviews.significance || 'N/A'}
          <span className="text-sm text-gray-500">/10</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-semibold text-gray-700">Originality</span>
        </div>
        <div className="text-2xl font-bold text-green-600">
          {reviews.originality || 'N/A'}
          <span className="text-sm text-gray-500">/10</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="font-semibold text-gray-700">Presentation</span>
        </div>
        <div className="text-2xl font-bold text-orange-600">
          {reviews.presentation || 'N/A'}
          <span className="text-sm text-gray-500">/10</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="font-semibold text-gray-700">Recommendation</span>
        </div>
        <div className="text-lg font-bold text-purple-600">
          {reviews.Recommendations || 'N/A'}
        </div>
      </div>
    </>
  )}
</div>

    {/* Second Row: Overall Score */}
    <div className="mt-6">
      {/* <p className="text-blue-600 font-bold">
        Overall Score: {reviews.overall || 'N/A'}/10
      </p> */}
    </div>

    {/* Third Row: Reviewer Comments */}
    <div className="mt-6">
      <p className="font-semibold mb-2">Reviewer Comments:</p>
      <p className="bg-gray-100 p-6 rounded-lg">
        {reviews.Comments || 'No comments available'}
      </p>
    </div>
  </div>
))}

  
        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            onClick={() => navigate(-1)}
          >
            Back to Submitted Papers
          </button>
        </div>
      </div>
    </div>
  </Layout>
  
  

  );
};

export default PaperReviewPage;