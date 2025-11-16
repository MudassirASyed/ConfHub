import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPageImage } from '../assets/Images';
import { registerOrganizer } from '../Services/api.js';
import { registerAuthor } from '../Services/author.js';
import { registerReviewer } from '../Services/reviewerService.js';

const RegisterOrganizer = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("author");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    alternativeContact: "",
    password: "",
    confirmPassword: "",
    country: "",
    biography: "",
    researchInterests: "",
    affiliation: "",
    department: "",
    fullName: "",
    phoneNumber: "",
    orcidId: "",
    positionTitle: "",
    domain: "",
    subDomain: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

  // Trim the value
  const trimmedValue = value.trimStart(); // don't trim end so user can type naturally

  // Check if value is all spaces
  if (value.length > 0 && value.trim() === "") {
    setError(`${name} cannot contain only spaces.`);
  } else {
    setError("");
  }

  setFormData((prevData) => ({
    ...prevData,
    [name]: trimmedValue,
  }));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      const cleanedData = {};
  

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError("Please enter a valid email address.");
    return;
  }

  

  // Password should not contain only spaces
  // if (formData.password.trim() === "") {
  //   setError("Password cannot contains spaces.");
  //   return;
  // }

  // Password confirmation
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }
if (formData.password.includes(" ")) {
  setError("Password cannot contain spaces.");
  return;
}

  // All validations passed
  setError("");
  setFormData(cleanedData);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    setError(null);
      const selectedConferenceId = localStorage.getItem("selectedConferenceId");
    try {
      const response =
        userType === "author"
          ? await registerAuthor({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              alternativeContact: formData.alternativeContact,
              country: formData.country,
              biography: formData.biography,
              researchInterests: formData.researchInterests,
              password: formData.password,
              ...(selectedConferenceId && { selectedConferenceId: Number(selectedConferenceId) }),
            })
          : userType === "organizer"
          ? await registerOrganizer({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              alternativeContact: formData.alternativeContact,
              affiliation: formData.affiliation,
              department: formData.department,
              password: formData.password,
            })
          : await registerReviewer({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              alternativeContact: formData.alternativeContact,
              domain: formData.domain,
              subDomain: formData.subDomain,
              password: formData.password,
            });
      console.log(`${userType} registration successful`, response);
      navigate("/login");
    } catch (err) {
      console.error(`Error during ${userType} registration:`, err);
      setError(err.response?.data?.error.message);
      alert("registration failed: " + (err.response?.data?.error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-2">
      <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-xl rounded-2xl overflow-hidden border border-gray-200 bg-white">
        {/* Left Side - Image & Highlights */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-r from-sky-400  to-purple-400 p-6 w-1/2 relative">
          <img
            src={LoginPageImage}
            alt="Register"
            className="w-48 h-48 md:w-60 md:h-60 object-contain rounded-2xl shadow-lg mb-4 border-4 border-white"
          />
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 drop-shadow-lg">bzchair</h3>
          <p className="text-white/90 mb-4 text-center text-xs md:text-sm">Join bzchair and streamline your research journey!</p>
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
              <span className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-blue-500 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              <span className="text-white text-xs">Multi-Role: Admin, Organizer, Reviewer, Author</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
              <span className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-green-500 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span className="text-white text-xs">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
              <span className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-purple-500 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span className="text-white text-xs">Fast & Efficient</span>
            </div>
          </div>
        </div>
        {/* Right Side - Registration Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-xs sm:max-w-sm">
            <div className="mb-4 sm:mb-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Sign up in bzchair</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Create your account</p>
            </div>
            <div className="flex mb-3 sm:mb-4 gap-2">
              <button onClick={() => navigate("/login")}
                className="flex-1 py-2 text-xs font-semibold rounded bg-gradient-to-r from-sky-400  to-purple-400 text-white shadow hover:from-blue-600 hover:to-purple-700 transition">
                Login
              </button>
              <button className="flex-1 py-2 text-xs font-semibold rounded bg-gradient-to-r from-sky-400  to-purple-400 text-white shadow">
                Register
              </button>
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Register as:</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 text-sm">
                <option value="author">Author</option>
                <option value="organizer">Organizer</option>
                <option value="reviewer">Reviewer</option>
              </select>
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-1">{userType.charAt(0).toUpperCase() + userType.slice(1)} Registration</h2>
            <p className="text-xs text-gray-500 mb-3 sm:mb-4">
              {userType === "author"
                ? "Welcome to Author’s registration form, submit your paper here."
                : userType === "organizer"
                ? "Welcome to Organizer’s registration form, submit the form and wait for the admin’s approval."
                : "Welcome to Reviewer’s registration form, evaluate submitted papers and contribute to the review process."}
            </p>
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange}
                  className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input type="text" placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange}
                  className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange}
                  className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input type="text" placeholder="Alternative Contact" name="alternativeContact" value={formData.alternativeContact} onChange={handleInputChange}
                  className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {userType === "organizer" && (
                <div className="flex gap-2">
                  <input type="text" placeholder="Affiliation" name="affiliation" value={formData.affiliation} onChange={handleInputChange}
                    className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <input type="text" placeholder="Department" name="department" value={formData.department} onChange={handleInputChange}
                    className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}
              {userType === 'reviewer' && (
                <div className="flex gap-2">
                  <select name="domain" value={formData.domain} onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Select Domain</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Internet of Things">Internet of Things</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="Human-Computer Interaction">Human-Computer Interaction</option>
                    <option value="Natural Language Processing">Natural Language Processing</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Big Data">Big Data</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Edge Computing">Edge Computing</option>
                    <option value="Quantum Computing">Quantum Computing</option>
                  </select>
                </div>
              )}
              {userType === "author" && (
                <>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Country" name="country" value={formData.country} onChange={handleInputChange}
                      className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <input type="text" placeholder="Biography" name="biography" value={formData.biography} onChange={handleInputChange}
                      className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div className="flex gap-2">
                    <select name="researchInterests" value={formData.researchInterests} onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">Select Research Interest</option>
                      <option value="AI">Artificial Intelligence</option>
                      <option value="ML">Machine Learning</option>
                      <option value="DataScience">Data Science</option>
                      <option value="Other">Other</option>
                    </select>
                    {formData.researchInterests === "Other" && (
                      <input type="text" placeholder="Specify Research Interest" name="customResearchInterest" onChange={handleInputChange}
                        className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    )}
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <input type="password" placeholder="Password" name="password" value={formData.password} onChange={handleInputChange}
                  className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input type="password" placeholder="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
                  className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded shadow hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span className="text-white">Registering...</span> : <span className="text-white">Register</span>}
              </button>
            </form>
            <div className="mt-3 sm:mt-4 text-center">
              <span className="text-xs text-gray-500">Already have an account? </span>
              <button
                onClick={() => navigate("/login")}
                className="text-white bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 rounded text-xs font-semibold ml-1 shadow hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200"
              >
                Login here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterOrganizer;