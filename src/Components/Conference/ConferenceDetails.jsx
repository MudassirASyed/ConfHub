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
const [showRegistrationModal, setShowRegistrationModal] = useState(false);
const [registerAs, setRegisterAs] = useState("participant");
const [isSubmitting, setIsSubmitting] = useState(false);

const [formData, setFormData] = useState({
  name: "",
  contact: "",
  email: "",
  paperId: "",
  paperTitle:'',
  amount: "",
  bankDetails: "",
  receipt: null,
});

  useEffect(() => {
    const fetchConferenceDetails = async () => {
      try {
        const response = await axios.get(

          `https://bzchair-backend.up.railway.app/api/conferences?filters[id][$eq]=${id}&populate=*`

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
const handleParticipantRegistration = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);   // START loader

  try {
    const confId = id;

    const formPayload = new FormData();
    formPayload.append("conferenceId", confId);
    formPayload.append("registerAs", registerAs);
    formPayload.append("name", formData.name);
    formPayload.append("contact", formData.contact);
    formPayload.append("email", formData.email);
    formPayload.append("paperId", formData.paperId || "");
    formPayload.append("paperTitle", formData.paperTitle || "");
    formPayload.append("amount", formData.amount);
    formPayload.append("bankDetails", formData.bankDetails);

    if (formData.receipt) {
      formPayload.append("receipt", formData.receipt);
    }

    const res = await axios.post(
      "https://bzchair-backend.up.railway.app/api/organizers/participant-registration",
      formPayload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    alert("Registration submitted successfully!");
    setShowRegistrationModal(false);

    setFormData({
      name: "",
      contact: "",
      email: "",
      paperId: "",
      paperTitle:'',
      amount: "",
      bankDetails: "",
      receipt: null,
    });

  } catch (error) {
    console.error("Registration error:", error.response?.data || error);
    alert("Failed to submit registration");
  } finally {
    setIsSubmitting(false);   // STOP loader
  }
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

                  <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-blue-900">
                      Conference Participation details
                    </h3>
<p className="text-blue-800 mb-4">
  To participate in this conference, attendees must complete the official
  registration process. Registration is mandatory for both general participants
  and paper presenters. Your registration will be considered valid only after
  successful payment verification and administrative clearance. Please ensure
  that all submitted details are accurate to avoid delays in approval.
</p>
                  <button
  onClick={() => setShowRegistrationModal(true)}
  className="mt-4 bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition"
>
  Conference Registration
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
      {showRegistrationModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative">
      
      <h2 className="text-2xl font-bold mb-6 text-blue-700">
        Participant Registration Form
      </h2>

    <form className="space-y-4" onSubmit={handleParticipantRegistration}>


        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Contact Number"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <select
          className="w-full border rounded-lg px-4 py-2"
          value={registerAs}
          onChange={(e) => setRegisterAs(e.target.value)}
        >
          <option value="participant">Participant</option>
          <option value="presenter">Presenter (Author)</option>
        </select>

        {registerAs === "presenter" && (
          <input
            type="text"
            placeholder="Paper ID"
            className="w-full border rounded-lg px-4 py-2"
            value={formData.paperId}
            onChange={(e) => setFormData({ ...formData, paperId: e.target.value })}
          />
          
        )}
         {registerAs === "presenter" && (
          <input
            type="text"
            placeholder="Paper Title"
            className="w-full border rounded-lg px-4 py-2"
            value={formData.paperTitle}
            onChange={(e) => setFormData({ ...formData, paperTitle: e.target.value })}
          />
          
        )}

        <input
          type="number"
          placeholder="Amount Paid"
          className="w-full border rounded-lg px-4 py-2"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />

       <div className="flex flex-col gap-2">
  <label className="text-sm font-semibold text-gray-700">
    Payment Receipt
  </label>

  <input
    type="file"
    accept="image/*"
    className="w-full border rounded-lg px-3 py-2 bg-white"
    onChange={(e) =>
      setFormData({ ...formData, receipt: e.target.files[0] })
    }
  />

  <span className="text-xs text-gray-500">
    Upload payment receipt (PNG, JPG only)
  </span>
</div>


        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowRegistrationModal(false)}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

        <button
  type="submit"
  disabled={isSubmitting}
  className={`px-6 py-2 rounded-lg text-white flex items-center justify-center gap-2
    ${isSubmitting 
      ? "bg-blue-400 cursor-not-allowed" 
      : "bg-blue-600 hover:bg-blue-700"}`}
>
  {isSubmitting ? (
    <>
      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
      Submitting...
    </>
  ) : (
    "Submit"
  )}
</button>

        </div>
      </form>
    </div>
  </div>
)}

      <Footer />
    </>
  );
  
};

export default ConferenceDetails;