import React, { useEffect, useState } from 'react';
import { Upload, Plus, Trash2, FileText, Calendar, User, Mail, Building } from 'lucide-react';
import Layout from './Layouts/Layout';
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { submitPaper } from '../../Services/author.js';

const PaperSubmissionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [paperTitle, setPaperTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [recentConferences, setRecentConferences] = useState([]);
  
  const [authors, setAuthors] = useState([
    { name: '', email: '', affiliation: '' }
  ]);
  const [formData, setFormData] = useState({
    paperTitle: "",
    abstract: "",
    submittedBy: "",
    file: null,
    submittedTo: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    const selectedFile = files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFormData((prevData) => ({
        ...prevData,
        file: selectedFile,
      }));
      setFileName(selectedFile.name);
    } else {
      alert('Please select a PDF file only');
    }
  };

  const handleAuthorChange = (index, field, value) => {
    const updated = [...authors];
    updated[index][field] = value;
    setAuthors(updated);
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: '', email: '', affiliation: '' }]);
  };

  const removeAuthor = (index) => {
    const updated = [...authors];
    updated.splice(index, 1);
    setAuthors(updated);
  };

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const conferenceResponse = await axios.get(`http://localhost:1337/api/conferences?filters[id][$eq]=${id}`);
        setRecentConferences(conferenceResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching author data:', error);
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paperTitle || !formData.abstract || !formData.file) {
      alert("Please fill in all fields and upload a file.");
      return;
    }

    try {
      setLoading(true);

      const userDetails = localStorage.getItem("userDetails");
      if (!userDetails) {
        console.error('No user details found in localStorage');
        alert('You must be logged in to submit a paper.');
        return;
      }

      const parsedUserDetails = JSON.parse(userDetails);
      const authorId = parsedUserDetails?.authorId?.id;

      if (!authorId) {
        console.error('Author ID not found in userDetails');
        alert('Author ID is missing. Please log in again.');
        return;
      }

      const submissionData = new FormData();
      submissionData.append('paperTitle', formData.paperTitle);
      submissionData.append('abstract', formData.abstract);
      submissionData.append('file', formData.file);
      submissionData.append('submittedBy', authorId);
      submissionData.append('submittedTo', id);

      const filteredAuthors = authors.filter(
        (author) =>
          author.name.trim() !== '' ||
          author.email.trim() !== '' ||
          author.affiliation.trim() !== ''
      );

      submissionData.append('authors', JSON.stringify(filteredAuthors));
      console.log('papp', submissionData);

      await submitPaper(submissionData);
      alert("Paper submitted successfully!");
      navigate("/AuthorDashboard");
    } catch (err) {
      console.error("Error during paper submission:", err);
      alert("Failed to submit the paper. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading conference details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {recentConferences.map((conference) => (
        <div key={conference.id} className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
                <h1 className="text-3xl font-bold text-white mb-2">{conference.Conference_title}</h1>
                <div className="flex items-center text-blue-100">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="text-lg">Paper Submission Deadline: {conference.Submission_deadline}</span>
                </div>
              </div>
              <div className="px-8 py-6">
                <h2 className="text-2xl font-semibold text-gray-800 text-center">
                  Submit Your Paper Here
                </h2>
              </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                {/* Paper Title Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <label className="text-lg font-semibold text-gray-800">Paper Title</label>
                    <span className="text-red-500">*</span>
                  </div>
                  <input
                    type="text"
                    name="paperTitle"
                    value={formData.paperTitle}
                    onChange={handleInputChange}
                    placeholder="Enter your Paper Title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                    required
                  />
                </div>

                {/* Abstract Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <label className="text-lg font-semibold text-gray-800">Abstract</label>
                    <span className="text-red-500">*</span>
                  </div>
                  <textarea
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleInputChange}
                    placeholder="Enter your Paper Abstract"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 resize-vertical"
                    required
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <label className="text-lg font-semibold text-gray-800">Upload Paper (PDF only)</label>
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      name="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="fileUpload"
                      required
                    />
                    <label
                      htmlFor="fileUpload"
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-gray-600 font-medium">
                          {fileName ? fileName : 'Choose File'}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">PDF format required</p>
                      </div>
                    </label>
                  </div>
                  {fileName && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">File selected: {fileName}</span>
                    </div>
                  )}
                </div>

                {/* Authors Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Authors</h3>
                      <span className="text-sm text-gray-500">(Optional: Add multiple authors)</span>
                    </div>
                    <button
                      type="button"
                      onClick={addAuthor}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Add Author
                    </button>
                  </div>

                  <div className="space-y-4">
                    {authors.map((author, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-700">Author {index + 1}</h4>
                          {authors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAuthor(index)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <label className="text-sm font-medium text-gray-700">Author Name</label>
                            </div>
                            <input
                              type="text"
                              value={author.name}
                              onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                              placeholder="Enter author name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <label className="text-sm font-medium text-gray-700">Author Email</label>
                            </div>
                            <input
                              type="email"
                              value={author.email}
                              onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                              placeholder="Enter author email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <label className="text-sm font-medium text-gray-700">Affiliation</label>
                          </div>
                          <input
                            type="text"
                            value={author.affiliation}
                            onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                            placeholder="Enter affiliation/organization"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? "Submitting..." : "Submit Paper"}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Make sure all required fields are filled before submitting your paper.
              </p>
            </div>
          </div>
        </div>
      ))}
    </Layout>
  );
};

export default PaperSubmissionForm;