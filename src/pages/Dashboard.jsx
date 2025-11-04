import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import QRCode from 'qrcode';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { 
  LogOut, 
  Edit3, 
  Save, 
  X, 
  Download, 
  Copy, 
  Check, 
  Upload,
  TrendingUp,
  Eye,
  Star,
  Grid,
  Moon,
  Sun
} from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    qrScans: 0,
    reviewsThisMonth: 0
  });

  // Fetch business profile from Firestore
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
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  // Generate QR Code based on UID
  useEffect(() => {
    if (!user?.uid) return;
    const reviewPageUrl = `${window.location.origin}/review/${user.uid}`;
    QRCode.toDataURL(reviewPageUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#1e293b", light: "#FFFFFF" }
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [user?.uid]);

  // Save profile to Firestore
  const handleSaveProfile = async () => {
    try {
      if (!user?.uid) return alert("User not logged in!");
      setSaving(true);

      const updatedProfile = {
        ...businessProfile,
        logo: logoPreview,
        name: businessProfile.name || user.displayName || "My Business",
      };

      await setDoc(doc(db, "businessProfiles", user.uid), updatedProfile, { merge: true });
      setBusinessProfile(updatedProfile);
      setIsEditingProfile(false);
      
      // Success feedback
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
      setSaving(false);
    }
  };

  // Handle Logo Upload
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

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Download QR
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `${businessProfile.name || 'business'}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  // Copy review link
  const copyReviewLink = () => {
    const reviewPageUrl = `${window.location.origin}/review/${user?.uid}`;
    navigator.clipboard.writeText(reviewPageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const businessRoute = user?.uid || "business";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Header with glassmorphism */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-900/80 border-slate-700/60' 
          : 'bg-white/80 border-slate-200/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo with gradient fallback */}
              {logoPreview ? (
                <div className="relative group">
                  <img 
                    src={logoPreview} 
                    alt="Business Logo" 
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300" 
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                  {businessProfile.name ? businessProfile.name.charAt(0).toUpperCase() : 'B'}
                </div>
              )}
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-300 ${
                  darkMode 
                    ? 'from-slate-100 to-slate-300' 
                    : 'from-slate-900 to-slate-700'
                }`}>
                  {businessProfile.name || 'My Business'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 transition-transform hover:rotate-45 duration-300" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform hover:-rotate-12 duration-300" />
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  darkMode 
                    ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<Star className="w-6 h-6" />}
            title="Total Reviews"
            value={stats.totalReviews}
            trend="+12%"
            color="from-amber-500 to-orange-500"
            darkMode={darkMode}
          />
          <StatCard 
            icon={<Eye className="w-6 h-6" />}
            title="QR Scans"
            value={stats.qrScans}
            trend="+8%"
            color="from-blue-500 to-indigo-500"
            darkMode={darkMode}
          />
          <StatCard 
            icon={<TrendingUp className="w-6 h-6" />}
            title="This Month"
            value={stats.reviewsThisMonth}
            trend="+24%"
            color="from-emerald-500 to-teal-500"
            darkMode={darkMode}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden transition-colors duration-300 ${
              darkMode 
                ? 'bg-slate-800/80 shadow-slate-900/50 border-slate-700/60' 
                : 'bg-white/80 shadow-slate-200/50 border-slate-200/60'
            }`}>
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Business Profile</h2>
                    <p className="text-blue-100 text-sm">Manage your business information</p>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30"
                  >
                    {isEditingProfile ? (
                      <>
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">Cancel</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm font-medium">Edit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-8">
                {isEditingProfile ? (
                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Business Logo</label>
                      <div className="flex items-center space-x-6">
                        {logoPreview && (
                          <img 
                            src={logoPreview} 
                            alt="Preview" 
                            className="w-24 h-24 rounded-xl object-cover ring-2 ring-slate-200 shadow-lg" 
                          />
                        )}
                        <label className="flex-1 cursor-pointer">
                          <div className={`flex items-center justify-center px-6 py-4 border-2 border-dashed rounded-xl transition-all duration-200 group ${
                            darkMode 
                              ? 'border-slate-600 hover:border-blue-400 hover:bg-slate-700/50' 
                              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}>
                            <div className="text-center">
                              <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                                darkMode 
                                  ? 'text-slate-500 group-hover:text-blue-400' 
                                  : 'text-slate-400 group-hover:text-blue-500'
                              }`} />
                              <p className={`text-sm font-medium transition-colors ${
                                darkMode ? 'text-slate-300' : 'text-slate-600'
                              }`}>Click to upload logo</p>
                              <p className={`text-xs mt-1 transition-colors ${
                                darkMode ? 'text-slate-500' : 'text-slate-400'
                              }`}>PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Business Name */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Business Name</label>
                      <input
                        type="text"
                        value={businessProfile.name}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          darkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-100' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="Enter your business name"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Category</label>
                      <select
                        value={businessProfile.category}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, category: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          darkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-100' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="">Select category</option>
                        <option value="restaurant">🍽️ Restaurant</option>
                        <option value="retail">🛍️ Retail</option>
                        <option value="salon">💇 Salon & Spa</option>
                        <option value="automotive">🚗 Automotive</option>
                        <option value="healthcare">🏥 Healthcare</option>
                        <option value="education">📚 Education</option>
                        <option value="technology">💻 Technology</option>
                        <option value="other">✨ Other</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Description</label>
                      <textarea
                        value={businessProfile.description}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                          darkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-100' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        rows={4}
                        placeholder="Tell customers about your business..."
                      />
                    </div>

                    {/* Review Link */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Google Review Link</label>
                      <input
                        type="url"
                        value={businessProfile.reviewLink}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, reviewLink: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          darkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-100' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="https://g.page/r/..."
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>Save Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <ProfileField label="Business Name" value={businessProfile.name || 'Not set'} darkMode={darkMode} />
                    <ProfileField 
                      label="Category" 
                      value={businessProfile.category ? businessProfile.category.charAt(0).toUpperCase() + businessProfile.category.slice(1) : 'Not set'} 
                      darkMode={darkMode}
                    />
                    <ProfileField 
                      label="Description" 
                      value={businessProfile.description || 'No description provided'} 
                      darkMode={darkMode}
                    />
                    <div>
                      <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Google Review Link</p>
                      {businessProfile.reviewLink ? (
                        <a 
                          href={businessProfile.reviewLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group"
                        >
                          <span className="group-hover:underline">{businessProfile.reviewLink}</span>
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <p className={`italic transition-colors duration-300 ${
                          darkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>Not set</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-6">
            <div className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden transition-colors duration-300 ${
              darkMode 
                ? 'bg-slate-800/80 shadow-slate-900/50 border-slate-700/60' 
                : 'bg-white/80 shadow-slate-200/50 border-slate-200/60'
            }`}>
              {/* QR Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Grid className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Your QR Code</h3>
                    <p className="text-indigo-100 text-xs">Scan to leave a review</p>
                  </div>
                </div>
              </div>

              {/* QR Content */}
              <div className="p-6">
                {qrCodeUrl && (
                  <div className={`mb-6 p-6 rounded-xl transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-slate-700 to-slate-800' 
                      : 'bg-gradient-to-br from-slate-50 to-slate-100'
                  }`}>
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <button 
                    onClick={handleDownloadQR} 
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/30 group"
                  >
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    <span>Download QR Code</span>
                  </button>
                  
                  <button 
                    onClick={copyReviewLink} 
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-all duration-200 group ${
                      darkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Copy Review Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Stats */}
                <div className={`mt-6 pt-6 border-t transition-colors duration-300 ${
                  darkMode ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 transition-colors duration-300 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>Quick Stats</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`transition-colors duration-300 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>QR Scans</span>
                      <span className={`font-semibold transition-colors duration-300 ${
                        darkMode ? 'text-slate-200' : 'text-slate-900'
                      }`}>{stats.qrScans}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`transition-colors duration-300 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>Total Reviews</span>
                      <span className={`font-semibold transition-colors duration-300 ${
                        darkMode ? 'text-slate-200' : 'text-slate-900'
                      }`}>{stats.totalReviews}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, trend, color, darkMode }) {
  return (
    <div className={`backdrop-blur-sm rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 group ${
      darkMode 
        ? 'bg-slate-800/80 shadow-slate-900/50 border-slate-700/60 hover:shadow-slate-900/70' 
        : 'bg-white/80 shadow-slate-200/50 border-slate-200/60 hover:shadow-slate-300/50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <h3 className={`text-sm font-medium mb-1 transition-colors duration-300 ${
        darkMode ? 'text-slate-400' : 'text-slate-600'
      }`}>{title}</h3>
      <p className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-300 ${
        darkMode 
          ? 'from-slate-100 to-slate-300' 
          : 'from-slate-900 to-slate-700'
      }`}>
        {value}
      </p>
    </div>
  );
}

// Profile Field Component
function ProfileField({ label, value, darkMode }) {
  return (
    <div>
      <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
        darkMode ? 'text-slate-300' : 'text-slate-700'
      }`}>{label}</p>
      <p className={`px-4 py-3 rounded-lg border transition-colors duration-300 ${
        darkMode 
          ? 'text-slate-300 bg-slate-700/50 border-slate-600' 
          : 'text-slate-600 bg-slate-50 border-slate-200'
      }`}>
        {value}
      </p>
    </div>
  );
}