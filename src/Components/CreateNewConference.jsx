 import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Layout from './Layouts/Layout';
import { createConference } from '../Services/conference-service';
import { ArrowLeft } from "lucide-react";
const CreateConference = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    conferenceTitle: '',
    conferenceDescription: '',
    conferenceTopics:'',
    startDate: '',
    conferenceTime: '',
    conferenceLocation: '',
    trackTitle: '',
    trackDescription: '',
    sessionTitle: '',
    speakerNames: '',
    submissionDeadline: '',
    reviewDeadline: '',
    organizerId: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    if (userDetails && userDetails.organizerId && userDetails.organizerId.id) {
      setFormData((prev) => ({
        ...prev,
        organizerId: userDetails.organizerId.id,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };
// compute tomorrow's date in yyyy-mm-dd for the input min attribute
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const minDateForInputs = tomorrow.toISOString().split('T')[0]; // e.g. "2025-08-07"

const validateForm = () => {
  const newErrors = {};

  // Required fields
  if (!formData.conferenceTitle || !formData.conferenceTitle.trim()) {
    newErrors.conferenceTitle = 'Conference title is required';
  }
  if (!formData.startDate) {
    newErrors.startDate = 'Conference date is required';
  }
  if (!formData.submissionDeadline) {
    newErrors.submissionDeadline = 'Submission deadline is required';
  }

  // Only run date validations if both provided (or individually as needed)
  // Normalize dates to date-only (midnight) to avoid time-of-day timezone issues
  const toDateOnly = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // date-only today

  if (formData.startDate) {
    const conferenceDate = toDateOnly(formData.startDate);

    // Conference cannot be today or in the past
    if (conferenceDate.getTime() <= today.getTime()) {
      newErrors.startDate = 'Conference date must be after today';
    }
  }

  if (formData.submissionDeadline) {
    const submissionDate = toDateOnly(formData.submissionDeadline);

    // Submission must be after today
    if (submissionDate.getTime() <= today.getTime()) {
      newErrors.submissionDeadline = 'Submission deadline must be after today';
    }

    // If conference date is present, submission must be strictly before conference
    if (formData.startDate) {
      const conferenceDate = toDateOnly(formData.startDate);
      if (submissionDate.getTime() >= conferenceDate.getTime()) {
        newErrors.submissionDeadline = 'Submission deadline must be before the conference date';
      }
    }
  }

  setErrors(newErrors);
  // Return boolean: valid if no errors
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);
  
  const formattedFormData = {
    ...formData,
    conferenceTime: formData.conferenceTime ? `${formData.conferenceTime}:00.000` : "",
  };

  // Add this debug log
  console.log("Submitting conference data:", formattedFormData);

  try {
    const response = await createConference(formattedFormData);
    setCurrentStep(3);
    setTimeout(() => {
      navigate("/OrganizerDashboard");
    }, 2000);
  } catch (err) {
    console.error("Error during conference creation:", err);
    // Add more detailed error handling
    if (err.response) {
      console.error("Server response:", err.response.data);
      setErrors({ 
        submit: err.response.data.message || "Failed to create conference. Please check your data and try again."
      });
    } else {
      setErrors({ submit: "Failed to create conference. Please try again." });
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info before proceeding
      const basicErrors = {};
      if (!formData.conferenceTitle.trim()) {
        basicErrors.conferenceTitle = 'Conference title is required';
      }
       if (!formData.conferenceDescription || formData.conferenceDescription.trim() === '') {
    basicErrors.conferenceDescription = 'Conference description is required';
  }

  // Validate Conference Topics
  if (!formData.conferenceTopics || formData.conferenceTopics.trim() === '') {
    basicErrors.conferenceTopics = 'Conference topics are required';
  }
      if (!formData.startDate) {
        basicErrors.startDate = 'Conference date is required';
      }
      
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (currentStep === 3) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Conference Created!</h2>
            <p className="text-gray-600 mb-4">Your conference has been submitted for admin approval.</p>
            <div className="animate-pulse text-blue-600">Redirecting to dashboard...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
         <div className="text-center mb-8">
  <div className="flex items-center justify-center gap-3 mb-2">
    <button
      onClick={() => window.history.back()}
      className="rounded-full p-2 bg-blue-500 hover:bg-blue-700 text-white transition mr-10"
    >
      <ArrowLeft className="h-7 w-7" />
    </button>
    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ">
      Create New Conference
    </h1>
  </div>
  <p className="text-gray-600 text-lg">
    Set up your academic conference in just a few steps
  </p>
</div>


          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 transition-all duration-300 ${
                currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Basic Information</h2>
                    <p className="text-gray-600">Tell us about your conference</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="conferenceTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Conference Title *
                      </label>
                      <input
                        type="text"
                        id="conferenceTitle"
                        placeholder="Enter your conference title"
                        value={formData.conferenceTitle}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.conferenceTitle ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.conferenceTitle && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.conferenceTitle}
                        </p>
                      )}
                    </div>
  
<div>
  <label htmlFor="conferenceDescription" className="block text-sm font-medium text-gray-700 mb-2">
    Conference Description *
  </label>
  <textarea
    id="conferenceDescription"
    rows="4"
    placeholder="Describe your conference, its themes, and objectives"
    value={formData.conferenceDescription}
    onChange={handleChange}
    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[100px] ${
      errors.conferenceDescription ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
    }`}
  />
  {errors.conferenceDescription && (
    <p className="mt-2 text-sm text-red-600 flex items-center">
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {errors.conferenceDescription}
    </p>
  )}
</div>

<div>
  <label htmlFor="conferenceTopics" className="block text-sm font-medium text-gray-700 mb-2">
    Conference Topics *
  </label>
  <textarea
    id="conferenceTopics"
    rows="3"
    placeholder="Enter topics separated by commas or new lines&#10;e.g., Machine Learning, Data Science, AI Ethics"
    value={formData.conferenceTopics}
    onChange={handleChange}
    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[80px] ${
      errors.conferenceTopics ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
    }`}
  />
  {errors.conferenceTopics && (
    <p className="mt-2 text-sm text-red-600 flex items-center">
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {errors.conferenceTopics}
    </p>
  )}
  <p className="mt-2 text-sm text-gray-500">
    List main topics for paper submissions. This helps authors identify relevant conferences.
  </p>
</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Conference Date *
                        </label>
                        <input
                          type="date"
                          id="startDate"
                            min={minDateForInputs}
                          value={formData.startDate}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        />
                        {errors.startDate && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.startDate}
                          </p>
                        )}
                      </div>

                      {/* <div>
                        <label htmlFor="conferenceTime" className="block text-sm font-medium text-gray-700 mb-2">
                          Conference Time
                        </label>
                        <input
                          type="time"
                          id="conferenceTime"
                          value={formData.conferenceTime}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div> */}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Next Step
                      <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Deadlines & Submit */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Deadlines & Finalize</h2>
                    <p className="text-gray-600">Set important dates for your conference</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Important Deadlines
                    </h3>
                    
                    <div>
                      <label htmlFor="submissionDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                        Paper Submission Deadline *
                      </label>
                      <input
                        type="date"
                        id="submissionDeadline"
                        value={formData.submissionDeadline}
                        onChange={handleChange}
                          min={minDateForInputs}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.submissionDeadline ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.submissionDeadline && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.submissionDeadline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Conference Summary */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Conference Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium text-gray-900">{formData.conferenceTitle || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">{formData.startDate || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submission Deadline:</span>
                        <span className="font-medium text-gray-900">{formData.submissionDeadline || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.submit}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                      Previous
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Conference
                          <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </Layout>
  );
};

export default CreateConference;