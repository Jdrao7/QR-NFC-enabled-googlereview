import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export function ReviewPage() {
  const { businessRoute } = useParams(); // UID
  const navigate = useNavigate();

  const [businessData, setBusinessData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  // 50 Predefined review options
  const mockReviews = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    text: [
      "Amazing experience! The staff was super friendly and professional.",
      "Highly recommended! Great service and a wonderful atmosphere.",
      "Loved it! Fast, efficient, and very courteous team.",
      "Best experience ever! I’ll definitely come again.",
      "Outstanding service and attention to detail.",
      "Affordable, clean, and well-organized — great job!",
      "Superb quality and excellent behavior of the staff.",
      "One of the best businesses in town. Keep it up!",
      "Really impressed by the quick response and service quality.",
      "Everything was perfect — from start to finish!",
    ][i % 10],
  }));

  const pickRandomReviews = () => {
    const shuffled = [...mockReviews].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Load business data
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const businessRef = doc(db, "businessProfiles", businessRoute);
        const docSnap = await getDoc(businessRef);

        if (docSnap.exists()) {
          setBusinessData({ ...docSnap.data(), uid: businessRoute });
          await incrementScanCount(businessRoute);
        } else {
          setBusinessData(null);
        }
      } catch (error) {
        console.error("Error loading business:", error);
        setBusinessData(null);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, [businessRoute]);

  // Increment scan count
  const incrementScanCount = async (uid) => {
    try {
      const statsRef = doc(db, "stats", uid);
      const docSnap = await getDoc(statsRef);
      if (docSnap.exists()) {
        await updateDoc(statsRef, { qrScans: increment(1) });
      } else {
        await setDoc(statsRef, {
          totalReviews: 0,
          qrScans: 1,
          reviewsThisMonth: 0,
        });
      }
    } catch (error) {
      console.error("Error updating scan count:", error);
    }
  };

  // Handle clicking "Leave a Review"
  const handleLeaveReview = () => {
    if (!businessData?.reviewLink) {
      alert("Review link not set up yet. Please contact the business owner.");
      return;
    }
    setReviews(pickRandomReviews());
    setShowReviewModal(true);
  };

  // Handle selecting one of the prebuilt reviews
  const handleSelectReview = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 3000);
      setShowReviewModal(false);
      setTimeout(() => {
        window.open(businessData.reviewLink, "_blank");
      }, 800);
    } catch (err) {
      console.error("Clipboard error:", err);
      window.open(businessData.reviewLink, "_blank");
    }
  };

  // UI Loading
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!businessData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn’t find this business. Please check the link.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center space-x-4">
          {businessData.logo ? (
            <img
              src={businessData.logo}
              alt={businessData.name}
              className="w-16 h-16 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
              {businessData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{businessData.name}</h1>
            {businessData.category && (
              <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                {businessData.category}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold mb-3">Share Your Experience!</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Pick a ready-made review, paste it, and support this business instantly!
          </p>

          <button
            onClick={handleLeaveReview}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition transform hover:scale-105 shadow-lg text-lg"
          >
            Leave a Review
          </button>
        </div>
      </main>

      {/* Modal for Review Selection */}
      {showReviewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 text-left">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Choose a Review</h3>

            <div className="space-y-3">
              {reviews.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectReview(r.text)}
                  className="w-full text-left px-4 py-3 border rounded-lg hover:bg-blue-50 transition"
                >
                  {r.text}
                </button>
              ))}
            </div>

            <button
              onClick={() => setReviews(pickRandomReviews())}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Show More Options
            </button>

            <button
              onClick={() => setShowReviewModal(false)}
              className="mt-4 block w-full text-center text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showCopyMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          ✓ Review copied! Redirecting...
        </div>
      )}
    </div>
  );
}
