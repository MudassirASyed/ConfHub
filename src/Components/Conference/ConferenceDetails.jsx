import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import { dashboard_bg } from "../../assets/Images";
import { ArrowLeft } from "lucide-react";
const ConferenceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConferenceDetails = async () => {
      try {
        const response = await axios.get(

          `http://localhost:1337/api/conferences?filters[id][$eq]=${id}&populate=*`
        );
        setConference(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conference details:", error);
        setLoading(false);
      }
    };

    fetchConferenceDetails();
  }, [id]);

 const handleJoinConference = (confId) => {
  localStorage.setItem("selectedConferenceId", confId);
  navigate("/login");
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      
      <div className="bg-inherit py-10 min-h-screen">
        <div className="max-w-5xl mx-auto px-4">
          {conference && conference.length > 0 ? (
            conference.map((conf) => (
              <div
                key={conf.id}
                className="bg-white bg-opacity-90 rounded-lg shadow-2xl shadow-black/40 drop-shadow-2xl overflow-hidden"
              >
                <div className="relative flex items-center justify-center mb-6 p-10">
  <button
      onClick={() => navigate("/")}
    className="absolute left-4 top-10 rounded-full p-2 bg-blue-500 hover:bg-blue-700 text-white transition"
  >
    <ArrowLeft className="h-7 w-7" />
  </button>

  <h2 className="text-3xl font-bold text-blue-700 text-center">
    Submit Your Paper
  </h2>
</div>

                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                    {conf.Conference_title}
                  </h1>
  
                  <div className="overflow-x-auto mb-8">
                    <table className="min-w-full text-sm text-left text-gray-800">
                      <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
                        <tr>
                          <th className="px-6 py-3 rounded-tl-lg">Field</th>
                          <th className="px-6 py-3 rounded-tr-lg">Details</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 font-semibold">Organizer</td>
                          <td className="px-6 py-4">
                            {conf.Organizer?.Organizer_FirstName}{" "}
                            {conf.Organizer?.Organizer_LastName}
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold">Description</td>
                          <td className="px-6 py-4">{conf.Description}</td>
                        </tr>
                         <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold">Conference Topics</td>
                          <td className="px-6 py-4">{conf.Conference_Topics}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold">Status</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                conf.Status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {conf.Status}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold">Conference Date</td>
                          <td className="px-6 py-4">{conf.Start_date}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-semibold">Paper Submission Deadline</td>
                          <td className="px-6 py-4">{conf.Submission_deadline}</td>
                        </tr>
                        {/* <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold">Location</td>
                          <td className="px-6 py-4">{conf.Conference_location}</td>
                        </tr> */}
                      </tbody>
                    </table>
                  </div>
  
                  <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-blue-900">
                      Submission Instructions
                    </h3>
                    <p className="text-blue-800 mb-4">
                      To submit your paper to this conference, please register as an Author or
                      login to your existing Author account.
                    </p>
                    <button
                      onClick={() => handleJoinConference(conf.id)}
                      className="bg-gradient-to-r from-blue-600 to-pink-500 text-white font-medium py-2 px-6 rounded-lg hover:from-blue-700 hover:to-pink-600 transition-all"
                    >
                      Join Conference
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white bg-opacity-80 rounded-lg shadow-sm">
              <p className="text-xl text-gray-700">No conference details found.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
  
};

export default ConferenceDetails;