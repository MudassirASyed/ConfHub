    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
import {  assignSubOrganizerRole } from '../Services/api.js';
    const AssignSubOrganizer = ({ conferenceId, onClose }) => {
        const [authors, setAuthors] = useState([]);
        const [reviewers, setReviewers] = useState([]);
        const [selectedAuthors, setSelectedAuthors] = useState([]);
        const [selectedReviewers, setSelectedReviewers] = useState([]);
        const [error, setError] = useState('');
        const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

        useEffect(() => {
            const fetchUsers = async () => {
                try {
                const [authorsResponse, reviewersResponse] = await Promise.all([
    axios.get(`http://localhost:1337/api/authors?populate=UserID.SubOrganizerRole`),
    axios.get(`http://localhost:1337/api/reviewers?populate=UserID.SubOrganizerRole`)
    ]);

    console.log('res',authorsResponse.data.data);

        const fetchedAuthors = authorsResponse.data.data
    .filter(item => item.UserID) // ⬅️ Only include those with UserID
    .map(item => {
        const roles = item.UserID?.SubOrganizerRole || [];

        const isAssigned = roles.some(role => role.id === conferenceId);

        return {
            id: item.id,
            name: `${item.firstName} ${item.lastName}`,
            isAssigned
        };
    });

const fetchedReviewers = reviewersResponse.data.data
    .filter(item => item.UserID) // ⬅️ Same filter here
    .map(item => {
        const roles = item.UserID?.SubOrganizerRole || [];

        const isAssigned = roles.some(role => role.id === conferenceId);

        return {
            id: item.id,
            name: `${item.firstName} ${item.lastName}`,
            isAssigned
        };
    });


    console.log('fetched',fetchedAuthors);

                    setAuthors(fetchedAuthors);
                    setReviewers(fetchedReviewers);
                } catch (err) {
                    console.error('Error fetching users:', err);
                }
            };

            fetchUsers();
        }, []);

        // 🔍 Move filtering logic HERE
        const filteredAuthors = authors.filter(a =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const filteredReviewers = reviewers.filter(r =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const handleAuthorSelection = (authorId) => {
            setSelectedAuthors(prev =>
                prev.includes(authorId)
                    ? prev.filter(id => id !== authorId)
                    : [...prev, authorId]
            );
        };

        const handleReviewerSelection = (reviewerId) => {
            setSelectedReviewers(prev =>
                prev.includes(reviewerId)
                    ? prev.filter(id => id !== reviewerId)
                    : [...prev, reviewerId]
            );
        };

        const handleAssign = async () => {
        if (selectedAuthors.length === 0 && selectedReviewers.length === 0) {
            setError('Please select at least one author or reviewer to assign');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const payload = {
                conferenceId,
                selectedAuthors,
                selectedReviewers
            };

            await assignSubOrganizerRole(payload);
            setSuccessMessage("Sub-Organizers Assigned Successfully!");
            setTimeout(() => {
            setSuccessMessage(""); 
            onClose(); // Close modal after showing snackbar
        }, 3000);  // Auto close after 3 sec
        } catch (error) {
            console.error(error);
            setError('Something went wrong while assigning sub-organizers');
        } finally {
            setIsLoading(false);
        }
    };


        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                        Assign Sub-Organizers
                    </h2>

                    {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

                    {/* 🔍 Search Bar */}
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border px-3 py-2 rounded-md mb-4 focus:ring focus:ring-blue-300"
                    />

                    {/* Scrollable List */}
                    <div className="overflow-y-auto max-h-[60vh] pr-2">
                        <section className="mb-4">
    <h4 className="font-semibold text-gray-700 mb-2">Already Assigned</h4>
    {(authors.filter(u => u.isAssigned).length === 0 &&
        reviewers.filter(u => u.isAssigned).length === 0) && (
        <p className="text-sm text-gray-400">No sub-organizers assigned yet.</p>
    )}

    {authors.filter(u => u.isAssigned).map(u => (
        <p key={`a-${u.id}`} className="text-sm text-green-600">
        {u.name} (Author)
        </p>
    ))}

    {reviewers.filter(u => u.isAssigned).map(u => (
        <p key={`r-${u.id}`} className="text-sm text-green-600">
        {u.name} (Reviewer)
        </p>
    ))}
    </section>

                        <section className="mb-5 border-b pb-3">
                            <h4 className="font-semibold text-gray-700 mb-2">Authors</h4>
                            {filteredAuthors.length > 0 ? (
                                filteredAuthors.map(author => (
                                <label 
        key={author.id} 
        className="flex items-center gap-3 mb-2 opacity-90"
    >
        <input
            type="checkbox"
            disabled={author.isAssigned}
            checked={selectedAuthors.includes(author.id)}
            onChange={() => handleAuthorSelection(author.id)}
            className="h-5 w-5 text-blue-500"
        />
        <span>{author.name}</span>

        {author.isAssigned && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                Assigned
            </span>
        )}
    </label>

                                ))
                            ) : (
                                <p className="text-sm text-gray-400">No authors found</p>
                            )}
                        </section>

                        <section>
                            <h4 className="font-semibold text-gray-700 mb-2">Reviewers</h4>
                            {filteredReviewers.length > 0 ? (
                                filteredReviewers.map(reviewer => (
                                    <label key={reviewer.id} className="flex items-center gap-3 mb-2">
                                        <input
                                            type="checkbox"
                                            disabled={reviewer.isAssigned}
                                            checked={selectedReviewers.includes(reviewer.id)}
                                            onChange={() => handleReviewerSelection(reviewer.id)}
                                            className="h-5 w-5 text-blue-500"
                                        />
                                        <span>{reviewer.name}</span>
                                         {reviewer.isAssigned && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                Assigned
            </span>
        )}
                                    </label>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400">No reviewers found</p>
                            )}
                        </section>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={onClose}
                            className="bg-gray-400 text-white py-2 px-6 rounded-md hover:bg-gray-500">
                            Cancel
                        </button>
                    <button
        onClick={handleAssign}
        disabled={isLoading}
        className={`${
            isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
        } text-white py-2 px-6 rounded-md transition flex items-center gap-2`}
    >
        {isLoading && (
            <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/>
                <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8"
                    strokeWidth="4"
                />
            </svg>
        )}
        {isLoading ? "Assigning..." : "Assign Sub-Organizers"}
    </button>

                    </div>
                </div>
                {/* ✅ Success Snackbar */}
    {successMessage && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg animate-fade-in">
            {successMessage}
        </div>
    )}

            </div>
        );
    };

    export default AssignSubOrganizer;
