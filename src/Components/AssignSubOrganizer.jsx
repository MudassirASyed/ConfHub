import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {  assignSubOrganizerRole } from '../Services/api.js';
const AssignSubOrganizer = ({ conferenceId, onClose }) => {
    const [authors, setAuthors] = useState([]);
    const [reviewers, setReviewers] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [selectedReviewers, setSelectedReviewers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const [authorsResponse, reviewersResponse] = await Promise.all([
                    axios.get('http://localhost:1337/api/authors'),
                    axios.get('http://localhost:1337/api/reviewers')
                ]);

                const fetchedAuthors = authorsResponse.data.data.map(item => ({
                    id: item.id,
                    name:item.firstName+   item.lastName
                }));
                const fetchedReviewers = reviewersResponse.data.data.map(item => ({
                    id: item.id,
                    name:item.firstName+item.lastName
                    
                }));
               console.log('autther',authorsResponse,reviewersResponse);
               
                setAuthors(fetchedAuthors);
                setReviewers(fetchedReviewers);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

  
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

        const payload = {
            conferenceId: conferenceId,
            selectedAuthors: selectedAuthors,
            selectedReviewers: selectedReviewers
        };
        try {
            const response = await assignSubOrganizerRole(payload);
            console.log('Assignment successful:', response);
            onClose(); // Close modal on success
        } catch (error) {
            console.error('Error assigning sub-organizers:', error);
            setError('Something went wrong while assigning sub-organizers');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Assign Sub-Organizers</h2>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                <h3 className="text-lg font-semibold text-gray-700 mb-3">Select Users</h3>

                {/* Authors List */}
                <div className="mb-6 border-b pb-4">
                    <h4 className="font-medium text-gray-600 mb-2">Authors</h4>
                    <div>
                        {authors.map((author) => (
                            <div key={author.id} className="flex items-center mb-3">
                                <input
                                    type="checkbox"
                                    value={author.id}
                                    onChange={() => handleAuthorSelection(author.id)}
                                    checked={selectedAuthors.includes(author.id)}
                                    className="form-checkbox h-5 w-5 text-blue-500 border-gray-300 rounded mr-3"
                                />
                                <label className="text-gray-800">{author.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviewers List */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-600 mb-2">Reviewers</h4>
                    <div>
                        {reviewers.map((reviewer) => (
                            <div key={reviewer.id} className="flex items-center mb-3">
                                <input
                                    type="checkbox"
                                    value={reviewer.id}
                                    onChange={() => handleReviewerSelection(reviewer.id)}
                                    checked={selectedReviewers.includes(reviewer.id)}
                                    className="form-checkbox h-5 w-5 text-blue-500 border-gray-300 rounded mr-3"
                                />
                                <label className="text-gray-800">{reviewer.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-400 text-white py-2 px-6 rounded-md hover:bg-gray-500 transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        Assign Sub-Organizers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignSubOrganizer;
