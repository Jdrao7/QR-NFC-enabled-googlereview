import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import QRCode from 'qrcode';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Business Profile State
  const [businessProfile, setBusinessProfile] = useState({
    name: '',
    logo: '',
    category: '',
    reviewLink: '',
    description: ''
  });

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [stats, setStats] = useState({
    totalReviews: 0,
    qrScans: 0,
    reviewsThisMonth: 0
  });

  // ✅ Fetch business profile from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "businessProfiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusinessProfile(data);
          if (data.logo) setLogoPreview(data.logo);
        } else {
          console.log("No profile found, using defaults");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  // ✅ Generate QR Code based on UID
  useEffect(() => {
    if (!user?.uid) return;
    const reviewPageUrl = `${window.location.origin}/review/${user.uid}`;
    QRCode.toDataURL(reviewPageUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" }
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [user?.uid]);

  // ✅ Save profile to Firestore
  const handleSaveProfile = async () => {
    try {
      if (!user?.uid) return alert("User not logged in!");

      const updatedProfile = {
        ...businessProfile,
        logo: logoPreview,
        name: businessProfile.name || user.displayName || "My Business",
      };

      await setDoc(doc(db, "businessProfiles", user.uid), updatedProfile, { merge: true });
      setBusinessProfile(updatedProfile);
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    }
  };

  // ✅ Handle Logo Upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // ✅ Download QR
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `${user?.uid}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  // ✅ Copy review link
  const copyReviewLink = () => {
    const reviewPageUrl = `${window.location.origin}/review/${user?.uid}`;
    navigator.clipboard.writeText(reviewPageUrl);
    alert('Review page link copied to clipboard!');
  };

  const businessRoute = user?.uid || "business";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {logoPreview ? (
                <img src={logoPreview} alt="Business Logo" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {businessProfile.name ? businessProfile.name.charAt(0).toUpperCase() : 'B'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {businessProfile.name || 'My Business'}
                </h1>
                <p className="text-sm text-gray-500">/{businessRoute}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                    <div className="flex items-center space-x-4">
                      {logoPreview && <img src={logoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />}
                      <input type="file" accept="image/*" onChange={handleLogoChange} />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={businessProfile.name}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Business Name"
                  />

                  <select
                    value={businessProfile.category}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select category</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="retail">Retail</option>
                    <option value="salon">Salon & Spa</option>
                    <option value="automotive">Automotive</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="technology">Technology</option>
                    <option value="other">Other</option>
                  </select>

                  <textarea
                    value={businessProfile.description}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Brief description..."
                  />

                  <input
                    type="url"
                    value={businessProfile.reviewLink}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, reviewLink: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://g.page/r/..."
                  />

                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p><strong>Name:</strong> {businessProfile.name || 'Not set'}</p>
                  <p><strong>Category:</strong> {businessProfile.category || 'Not set'}</p>
                  <p><strong>Description:</strong> {businessProfile.description || 'No description'}</p>
                  <p><strong>Review Link:</strong>{' '}
                    {businessProfile.reviewLink ? (
                      <a href={businessProfile.reviewLink} target="_blank" rel="noreferrer" className="text-blue-600">
                        {businessProfile.reviewLink}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* QR Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Your QR Code</h3>
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-full mb-4" />}
            <button onClick={handleDownloadQR} className="w-full mb-2 bg-blue-600 text-white py-2 rounded-lg">Download QR</button>
            <button onClick={copyReviewLink} className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg">Copy Review Link</button>
          </div>
        </div>
      </main>
    </div>
  );
}
