import React, { useEffect, useState } from 'react';
import Layout from './Layouts/Layout';
import { useNavigate } from "react-router-dom";
import AssignSubOrganizer from './AssignSubOrganizer';
import axios from 'axios';
import { FaClipboardList, FaCheckCircle, FaUserPlus, FaEye, FaSearch } from 'react-icons/fa';
import { MdPendingActions, MdDoneAll, MdAssignment } from 'react-icons/md';
import { ChevronLeft, ChevronRight, Filter, ChevronDown } from 'lucide-react';

const Tab = ({ active, onClick, icon: Icon, children }) => (
    <button
        className={`flex items-center gap-2 py-2 px-4 rounded-full transition-all duration-200 ${
            active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={onClick}
    >
        {Icon && <Icon size={18} />}
        {children}
    </button>
);

const OrganizerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inProgress');
    const [conferences, setConferences] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedConferenceId, setSelectedConferenceId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [loading, setLoading] = useState(false);

    const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    const organizerName = userDetails.username;

    useEffect(() => {
        const fetchConferences = async () => {
            try {
                setLoading(true);
                const userDetails = JSON.parse(localStorage.getItem("userDetails"));
                const organizerId = userDetails?.organizerId?.id;
                const subOrganizerRoles = userDetails?.SubOrganizerRole || [];
                const userId = userDetails?.id;

                if (subOrganizerRoles.length > 0) {
                    const response = await axios.get(`https://confhub-production-0226.up.railway.app/api/conferences?filters[requestStatus][$eq]=approved&filters[AssignedSubOrganizer][id][$eq]=${userId}&populate=*`);
                    setConferences(response.data.data);
                    setLoading(false);
                    return;
                }

                if (!organizerId) {
                    console.error('Organizer ID not found in local storage');
                    setLoading(false);
                    return;
                }


                // Fetch conferences where requestStatus is approved and they are for the current organizer
                const response = await axios.get(`https://confhub-production-0226.up.railway.app/api/conferences?filters[requestStatus][$eq]=approved&filters[Organizer][$eq]=${organizerId}&populate=*`);

                setConferences(response.data.data);
                
            } catch (error) {
                console.error('Error fetching conferences:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConferences();
    }, []);

    const filteredConferences = conferences
        .filter(conference => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const conferenceTitle = conference.Conference_title || '';
            const conferenceDescription = conference.Description || '';
            const conferenceStatus = conference.Status || '';

            const matchesSearch = 
                conferenceTitle.toLowerCase().includes(lowerCaseSearchTerm) ||
                conferenceDescription.toLowerCase().includes(lowerCaseSearchTerm) ||
                conferenceStatus.toLowerCase().includes(lowerCaseSearchTerm);

            if (!matchesSearch) {
                return false;
            }

            // Corrected logic to handle the "assignSubOrganizer" tab
            if (activeTab === 'inProgress' || activeTab === 'assignSubOrganizer') {
                return conferenceStatus === 'inProgress';
            } else if (activeTab === 'completed') {
                return conferenceStatus === 'completed';
            }
            return false;
        });

    const handleCardClick = (conferenceId) => {
        navigate(`/orgConferenceDetails/${conferenceId}`);
    };

    const handleAssignSubOrganizer = (conferenceId) => {
        setSelectedConferenceId(conferenceId);
        setShowAssignModal(true);
    };
    
    // Pagination logic
    const totalPages = Math.ceil(filteredConferences.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedConferences = filteredConferences.slice(startIndex, startIndex + pageSize);

    // Reset to first page when changing tab or search term
    useEffect(() => {

        setCurrentPage(1);
    }, [activeTab, searchTerm, pageSize]);


        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await axios.get('https://confhub-production-0226.up.railway.app/api/paper-reviews');
                setPaperReviews(response.data || []);
            } catch (error) {
                console.error('Error fetching paper reviews:', error);
            } finally {
                setLoading(false);
            }
        };
    
        if (activeTab === 'reviews') {
            fetchReviews();
        }
   
    return (
        <Layout>
            <h4 className="text-3xl font-semibold text-blue-700 text-center my-6 font-sans">
                Welcome <strong>{organizerName}</strong> to your dashboard
            </h4>
            <div className="p-6">
                <div className="mb-6 flex gap-3 flex-wrap">
                    <Tab active={activeTab === 'inProgress'} onClick={() => setActiveTab('inProgress')} icon={MdPendingActions}>
                        In Progress
                    </Tab>
                    <Tab active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} icon={MdDoneAll}>
                        Completed
                    </Tab>
                    <Tab active={activeTab === 'assignSubOrganizer'} onClick={() => setActiveTab('assignSubOrganizer')} icon={FaUserPlus}>
                        Assign TPC Chair
                    </Tab>
                </div>

                {/* Search and Pagination Controls */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1 w-full md:max-w-xs">
                            <FaSearch className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conferences..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        {/* Page Size Control */}
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                            <span className="text-sm font-medium text-gray-600">Show</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
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

                {/* Loading State */}
                {loading && (
                    <div className="text-center text-gray-500 py-10">
                        <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4">Loading conferences...</p>
                    </div>
                )}

                {!loading && activeTab === 'assignSubOrganizer' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                            <FaUserPlus /> Assign TPC Chair
                        </h2>
                        {paginatedConferences.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-gray-700">Conference Title</th>
                                            <th className="py-3 px-4 text-left text-gray-700">Description</th>
                                            <th className="py-3 px-4 text-left text-gray-700">Status</th>
                                            <th className="py-3 px-4 text-left text-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedConferences.map((conference, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">{conference.Conference_title}</td>
                                                <td className="py-3 px-4">{conference.Description}</td>
                                                <td className="py-3 px-4">{conference.Status}</td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleAssignSubOrganizer(conference.id)}
                                                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        <MdAssignment size={18} /> Assign
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600">No in-progress conferences found for assigning sub-organizers.</p>
                        )}
                    </div>
                )}
                
                {!loading && activeTab !== 'assignSubOrganizer' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                            <FaClipboardList /> Conference Details
                        </h2>
                        <div className="overflow-x-auto mt-4">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-gray-700">Title</th>
                                        <th className="py-3 px-4 text-left text-gray-700">Description</th>
                                        <th className="py-3 px-4 text-left text-gray-700">Submission Deadline</th>
                                        <th className="py-3 px-4 text-left text-gray-700">Review Deadline</th>
                                        <th className="py-3 px-4 text-left text-gray-700">Status</th>
                                        <th className="py-3 px-4 text-left text-gray-700">Start Date</th>
                                        <th className="py-3 px-4 text-left text-gray-700">Location</th>
                                        <th className="py-3 px-4 text-left text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedConferences.length > 0 ? (
                                        paginatedConferences.map((conference, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">{conference.Conference_title}</td>
                                                <td className="py-3 px-4">{conference.Description}</td>
                                                <td className="py-3 px-4">{conference.Submission_deadline}</td>
                                                <td className="py-3 px-4">{conference.Review_deadline}</td>
                                                <td className="py-3 px-4">{conference.Status}</td>
                                                <td className="py-3 px-4">{conference.Start_date}</td>
                                                <td className="py-3 px-4">{conference.Conference_location}</td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleCardClick(conference.id)}
                                                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="py-4 text-center text-gray-600">
                                                No conferences found for this tab.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && filteredConferences.length > pageSize && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 mt-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredConferences.length)} of {filteredConferences.length} conferences
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                                            (page >= currentPage - 1 && page <= currentPage + 1);
                                        
                                        if (!shouldShow) {
                                            if (page === currentPage - 2 || page === currentPage + 2) {
                                                return <span key={page} className="px-2 py-1 text-gray-400">...</span>;
                                            }
                                            return null;
                                        }
                                        
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                                    isCurrentPage
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showAssignModal && selectedConferenceId && (
                    <AssignSubOrganizer
                        conferenceId={selectedConferenceId}
                        onClose={() => setShowAssignModal(false)}
                    />
                )}
            </div>
        </Layout>
    );
};

export default OrganizerDashboard;
