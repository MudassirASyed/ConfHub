import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiHome, 
  FiInfo, 
  FiSettings, 
  FiMail, 
  FiSearch, 
  FiCalendar, 
  FiClock, 
  FiDownload,
  FiArrowRight,
  FiUsers,
  FiBookOpen,
  FiAward,
  FiSend
} from "react-icons/fi";
import { FaEye } from 'react-icons/fa';

import { 
  HiSparkles, 
  HiLocationMarker 
} from "react-icons/hi";
import { 
  BsGlobe, 
  BsPeople, 
  BsFileEarmarkText 
} from "react-icons/bs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  {/* Add these state variables at the top of your component */}
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);




  // Fetch conferences in progress and approved by admin
  useEffect(() => {
    const fetchConferences = async () => {
      try {


        const response = await axios.get('https://bzchair-backend.up.railway.app/api/conferences', {


          params: {
            filters: {
              requestStatus: {
                $eq: 'approved',
              },
              Status: {
        $ne: 'completed', // ✅ not equal filter
      },
            },
            populate: '*',  // This will populate all related fields
          },
        });
        const allConferences = response.data.data
        console.log('conf',response);
        console.log('aprconf',allConferences);
        setConferences(allConferences);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conferences:", error);
        setLoading(false);
      }
    };

    fetchConferences();
  }, []);

  const handleConferenceClick = (conferenceId) => {
    navigate(`/conference/${conferenceId}`);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const filteredConferences = conferences.filter(conference =>
    conference.Conference_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

{/* Calculate pagination values */}
const totalItems = filteredConferences.length;
const totalPages = Math.ceil(totalItems / pageSize);
const startIndex = (currentPage - 1) * pageSize;
const endIndex = startIndex + pageSize;
const currentPageData = filteredConferences.slice(startIndex, endIndex);
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-purple-50">

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-pink-400 rounded-lg flex items-center justify-center">
                <HiSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">
                bzchair
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="flex items-center space-x-2 text-sky-600 hover:text-pink-600 transition-colors duration-300">
                <FiHome className="w-4 h-4" />
                <span className="font-medium">Home</span>
              </a>
              <a href="#about" className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors duration-300">
                <FiInfo className="w-4 h-4" />
                <span className="font-medium">About</span>
              </a>
              <a href="#services" className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors duration-300">
                <FiSettings className="w-4 h-4" />
                <span className="font-medium">Services</span>
              </a>
              <a href="#contact" className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors duration-300">
                <FiMail className="w-4 h-4" />
                <span className="font-medium">Contact</span>
              </a>
            </div>

            {/* Login Button */}
            <button 
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Login
            </button>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-sky-100 py-4">
              <div className="flex flex-col space-y-4 px-4">
                <a href="#home" className="flex items-center space-x-2 text-sky-600 hover:text-pink-600 transition-colors duration-300">
                  <FiHome className="w-4 h-4" />
                  <span>Home</span>
                </a>
                <a href="#about" className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors duration-300">
                  <FiInfo className="w-4 h-4" />
                  <span>About</span>
                </a>
                <a href="#services" className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors duration-300">
                  <FiSettings className="w-4 h-4" />
                  <span>Services</span>
                </a>
                <a href="#contact" className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors duration-300">
                  <FiMail className="w-4 h-4" />
                  <span>Contact</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20  to-purple-400/20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium text-sky-600 border border-sky-200">
                <HiSparkles className="w-4 h-4" />
                <span>Conference Management System</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-sky-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Streamline Your
                </span>
                <br />
                <span className="text-gray-800">Academic Events</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                From managing program committees to publishing proceedings, our bzchair system provides a professional solution for organizing successful conferences from start to finish.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                  <span className="flex items-center space-x-2">
                    <span>Get Started</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
                <button className="bg-white/80 backdrop-blur-md hover:bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-sky-200 hover:border-pink-300">
                  Learn More
                </button>
              </div>

              {/* Stats */}

              {/* <div className="flex items-center space-x-8 pt-8">

                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-600">500+</div>
                  <div className="text-sm text-gray-600">Conferences</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">10K+</div>
                  <div className="text-sm text-gray-600">Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-gray-600">Universities</div>
                </div>

              </div> */}

            </div>

            {/* Hero Image */}
    <div className="relative hidden md:flex items-center justify-center min-h-[300px]">
  {/* background gradient shadow */}
  <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-pink-400 rounded-3xl transform rotate-6 opacity-20"></div>

  {/* content card */}
  <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-sky-100 max-w-xl text-center flex flex-col items-center justify-center">
    <div className="space-y-5">
      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
        Our platform streamlines the management of university-level conferences, providing comprehensive tools for organizers to efficiently manage tracks, sessions, and submissions. We focus on collaboration, simplicity, and success in academic events.
      </p>

      <div className="space-y-3 w-full">
        {[{
          num: 1,
          title: "Conference Management",
          desc: "Organize tracks, sessions & submissions",
        },
        {
          num: 2,
          title: "Seamless Collaboration",
          desc: "Connect organizers, reviewers & authors",
        },
        {
          num: 3,
          title: "Academic Excellence",
          desc: "Simplify success for university events",
        }].map((item) => (
          <div
            key={item.num}
            className="flex flex-col items-center p-3 bg-gradient-to-r from-sky-50 to-pink-50 rounded-lg hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 bg-gradient-to-r from-sky-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-semibold mb-1 text-sm">
              {item.num}
            </div>
            <div className="font-medium text-gray-800 text-sm">{item.title}</div>
            <div className="text-xs text-gray-600">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>


          </div>
        </div>
      </section>


      {/* Conferences Section */}
      <section className="py-20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0 w-300">
            <div className="relative w-full sm:w-96">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conferences by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
              />
            </div> 
            {/* <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
                {filteredConferences.length}
              </span>
              <span>of {conferences.length} conferences</span>
            </div> */}
          </div>


    {/* Conferences Table */}

{loading ? (
  <div className="flex justify-center items-center py-20">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-sky-200 rounded-full animate-spin"></div>
      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
    </div>
  </div>
) : (

  <>
    {/* Page Size Selector */}
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Show:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <span className="text-sm text-gray-600">entries</span>
      </div>
      
      {/* Results Info */}
      <div className="text-md text-gray-1000 ">
        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
      </div>
    </div>

  {/* TABLE — visible on sm and larger */}
<div className="relative hidden sm:block">
  {/* Scroll hint gradient */}
  <div className="pointer-events-none absolute right-0 top-0 h-full w-7 bg-gradient-to-l from-white to-transparent z-10"></div>

  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
      <thead className="bg-gray-100 sticky top-0 z-20">
        <tr>
          <th className="py-3 px-4 text-left">Conference Title</th>
          <th className="py-3 px-4 text-left">Conference Date</th>
          <th className="py-3 px-4 text-left">Paper Submission Deadline</th>
          <th className="py-3 px-4 text-left">Acceptance Notification</th>
          <th className="py-3 px-4 text-left">Status</th>
          <th className="py-3 px-4 text-left">Conference Topics</th>
          <th className="py-3 px-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {currentPageData.length > 0 ? (
          currentPageData.map((conference) => (
            <tr
              key={conference.id}
              className="border-b cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-200"
              onClick={() => handleConferenceClick(conference.id)}
            >
             <td className="py-3 px-4">
                  {conference.Conference_title}              
              </td>
              <td className="py-3 px-4">
                <div className="line-clamp-2">{conference.Start_date}</div>
              </td>
              <td className="py-3 px-4">
                <div className="line-clamp-2">{conference.Submission_deadline}</div>
              </td>
              <td className="py-3 px-4">
                <div className="line-clamp-2">
                  {conference.Review_deadline && conference.Review_deadline.trim() !== ""
                    ? conference.Review_deadline
                    : "Not announced yet"}
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    conference.Status === "inProgress"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-blue-600"
                  }`}
                >
                  {conference.Status}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="line-clamp-2" title={conference.Conference_Topics}>
                  {conference.Conference_Topics}
                </div>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConferenceClick(conference.id);
                  }}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaEye /> View details
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="py-4 text-center text-gray-600">
              No conferences found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

{/* MOBILE CARDS — visible only on small screens */}
<div className="grid gap-4 sm:hidden mt-4">
  {currentPageData.length > 0 ? (
    currentPageData.map((conference) => (
      <div
        key={conference.id}
        className="border rounded-xl p-4 shadow-sm bg-white transition-all hover:shadow-md"
        onClick={() => handleConferenceClick(conference.id)}
      >
        <h3 className="font-bold text-lg mb-2 text-center">{conference.Conference_title}</h3>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Date:</strong> {conference.Start_date}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Submission Deadline:</strong> {conference.Submission_deadline}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Acceptance Notification:</strong>{" "}
          {conference.Review_deadline && conference.Review_deadline.trim() !== ""
            ? conference.Review_deadline
            : "Not announced yet"}
        </p>
        <p className="text-sm mb-2">
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              conference.Status === "inProgress"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-blue-600"
            }`}
          >
            {conference.Status}
          </span>
        </p>
        <p className="text-sm text-gray-700 mb-3">
          <strong>Conference Topics:</strong> {conference.Conference_Topics}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleConferenceClick(conference.id);
          }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors w-full justify-center"
        >
          <FaEye /> View details
        </button>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-600">No conferences found</p>
  )}
</div>

 <div className="text-center mb-16 mt-30">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-100 to-pink-100 rounded-full px-4 py-2 text-sm font-medium text-sky-600 mb-4 mt-20">
              <FiCalendar className="w-4 h-4" />
              <span>Active Conferences</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Discover <span className="bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">Upcoming Events</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join leading conferences and contribute to the academic community with cutting-edge research and innovations.
            </p>
          </div>
    {/* Pagination Controls */}
    {totalPages > 1 && (
      <div className="flex justify-center items-center mt-6 space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first page, last page, current page, and pages around current
          const showPage = page === 1 || 
                          page === totalPages || 
                          Math.abs(page - currentPage) <= 1;
          
          if (!showPage && page !== 2 && page !== totalPages - 1) {
            // Show ellipsis for gaps
            if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2 py-2 text-gray-400">...</span>;
            }
            return null;
          }

          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
    )}
  </>

)}
 <div className="text-center mb-16 mt-30">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-100 to-pink-100 rounded-full px-4 py-2 text-sm font-medium text-sky-600 mb-4 mt-20">
              <FiCalendar className="w-4 h-4" />
              <span>Active Conferences</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Discover <span className="bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">Upcoming Events</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join leading conferences and contribute to the academic community with cutting-edge research and innovations.
            </p>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-sky-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium text-sky-600 border border-sky-200">
                <FiInfo className="w-4 h-4" />
                <span>About bzchair</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                Empowering <span className="bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">Academic Excellence</span>
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform streamlines the management of university-level conferences, providing comprehensive tools for organizers to efficiently manage tracks, sessions, and submissions. We focus on collaboration, simplicity, and success in academic events.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BsGlobe className="w-5 h-5 text-sky-500" />
                    <span className="font-semibold text-gray-800">Global Reach</span>
                  </div>
                  <p className="text-sm text-gray-600">Connecting researchers worldwide</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BsPeople className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold text-gray-800">Community Driven</span>
                  </div>
                  <p className="text-sm text-gray-600">Built for academic communities</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-pink-400 rounded-3xl transform -rotate-6 opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-sky-100">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: FiUsers, label: "Collaboration", color: "text-sky-500" },
                    { icon: FiBookOpen, label: "Knowledge", color: "text-pink-500" },
                    { icon: FiAward, label: "Excellence", color: "text-purple-500" },
                    { icon: BsFileEarmarkText, label: "Publishing", color: "text-green-500" }
                  ].map((item, index) => (
                    <div key={index} className="text-center p-4 bg-gradient-to-br from-sky-50 to-pink-50 rounded-xl">
                      <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
                      <div className="text-sm font-medium text-gray-800">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-100 to-pink-100 rounded-full px-4 py-2 text-sm font-medium text-sky-600 mb-4">
              <FiSettings className="w-4 h-4" />
              <span>Our Services</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Comprehensive <span className="bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">Conference Solutions</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to organize successful academic conferences from start to finish.
            </p>
          </div>

          <div className="space-y-16">
            {[
              {
                title: "Conference Management",
                description: "Comprehensive tools for submission, review workflows, and real-time dashboards that keep conferences well-organized and efficient.",
                icon: FiSettings,
                gradient: "from-sky-500 to-blue-500"
              },
              {
                title: "Review Management",
                description: "Manage review teams and peer-review processes with automated notifications and built-in collaboration tools.",
                icon: FiUsers,
                gradient: "from-pink-500 to-rose-500"
              },
              {
                title: "Publishing & Proceedings",
                description: "Create detailed conference proceedings or publish to indexing databases, ensuring visibility for your academic contributions.",
                icon: BsFileEarmarkText,
                gradient: "from-purple-500 to-indigo-500"
              }
            ].map((service, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-800">{service.title}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>
                  <button className={`inline-flex items-center space-x-2 bg-gradient-to-r ${service.gradient} hover:scale-105 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl`}>
                    <span>Learn More</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} rounded-3xl transform ${index % 2 === 0 ? 'rotate-6' : '-rotate-6'} opacity-20`}></div>
                  <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-sky-100 h-64 flex items-center justify-center">
                    <service.icon className={`w-24 h-24 bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-sky-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium text-sky-600 border border-sky-200 mb-4">
              <FiMail className="w-4 h-4" />
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Ready to <span className="bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">Get Started?</span>
            </h2>
            <p className="text-lg text-gray-600">
              Have questions or ready to organize your next conference? We'd love to hear from you.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-sky-100">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-md border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Your Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-md border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Your Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us about your conference needs..."
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-md border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 resize-none"
                ></textarea>
              </div>
              <div className="text-center">
                <button 
                  type="submit"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <FiSend className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <HiSparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-pink-400 bg-clip-text text-transparent">
                  bzchair
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering academic excellence through seamless conference management solutions.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: BsGlobe, href: "#" },
                  { icon: FiMail, href: "#" },
                  { icon: HiLocationMarker, href: "#" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-sky-500 hover:to-pink-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <div className="space-y-2">
                {['Home', 'About Us', 'Services', 'Contact'].map((link, index) => (
                  <a 
                    key={index}
                    href={`#${link.toLowerCase().replace(' ', '')}`}
                    className="block text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Services</h4>
              <div className="space-y-2">
                {['Conference Management', 'Review Process', 'Publishing', 'Analytics'].map((service, index) => (
                  <a 
                    key={index}
                    href="#"
                    className="block text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300"
                  >
                    {service}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Get in Touch</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <FiMail className="w-5 h-5 text-sky-400" />
                  <span>info@bzchair.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <HiLocationMarker className="w-5 h-5 text-pink-400" />
                  <span>Capital University of Science and technology</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <BsGlobe className="w-5 h-5 text-purple-400" />
                  <span>www.bzchair.org</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                &copy; 2025 bzchair. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;