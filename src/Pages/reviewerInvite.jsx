import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // or useSearchParams in Next.js

export default function ReviewerInvitePage() {
  const [message, setMessage] = useState("Processing invitation...");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  useEffect(() => {
    if (!token || !action) {
      setMessage("Invalid invitation link.");
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/api/reviewer-invitation/respond?token=${token}&action=${action}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setMessage("Invitation link invalid or expired.");
        else setMessage(data.message);
      })
      .catch(() => setMessage("Error connecting to server."));
  }, [token, action]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 bg-white rounded-lg shadow text-center max-w-sm">
        <h1 className="text-xl font-semibold mb-4">Reviewer Invitation</h1>
        <p>{message}</p>
        <a href="/login" className="text-blue-600 mt-4 inline-block">
          Go to Login
        </a>
        <p>or if not already registered as reviewer then.<a><a href="/register" className="text-blue-600 mt-4 inline-block">
          Go to SignUp
        </a></a></p>
      </div>
    </div>
  );
}