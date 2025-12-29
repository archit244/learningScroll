import React, { useState, useEffect } from "react";
import { User, Settings, Flame, Star, Clock, Grid, Bookmark, LogOut } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("saved");
  const [savedLessons, setSavedLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setUser(user);
        // Fetch saved lessons (Mock logic - replace with real join query later)
        const { data } = await supabase.from("user_interactions").select("lesson_id").eq("user_id", user.id).eq("interaction_type", "save");
        if(data && data.length > 0) {
            const ids = data.map(i => i.lesson_id);
            const { data: lessons } = await supabase.from("lessons").select("*").in("id", ids);
            setSavedLessons(lessons || []);
        }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) return <div className="h-full flex items-center justify-center text-gray-500 bg-[#F0F2F5]">Loading...</div>;

  return (
    <div className="w-full h-full bg-[#F0F2F5] font-['Nunito'] text-gray-900 overflow-y-auto no-scrollbar">
      <div className="max-w-3xl mx-auto p-4 md:p-8 pb-24">
        
        {/* 1. HEADER PROFILE CARD */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
            {/* Settings Button */}
            <button onClick={handleLogout} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition" title="Logout">
                <LogOut size={20} />
            </button>

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${user.email}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-black text-gray-900 mb-1">{user.email.split('@')[0]}</h1>
                <p className="text-gray-500 font-medium text-sm mb-4">Student • Learning Physics & Code</p>
                
                {/* Stats Row */}
                <div className="flex justify-center md:justify-start gap-4">
                    <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2 font-bold text-sm">
                        <Flame size={16} fill="currentColor" /> 5 Day Streak
                    </div>
                    <div className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-xl border border-yellow-100 flex items-center gap-2 font-bold text-sm">
                        <Star size={16} fill="currentColor" /> 1,250 XP
                    </div>
                </div>
            </div>
        </div>

        {/* 2. TABS */}
        <div className="flex items-center gap-8 border-b border-gray-200 mb-6 px-4">
            {['saved', 'history'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 font-bold text-sm uppercase tracking-wider transition-all relative ${activeTab === tab ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
                >
                    <span className="flex items-center gap-2">
                        {tab === 'saved' ? <Bookmark size={18} /> : <Clock size={18} />} 
                        {tab}
                    </span>
                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full" />}
                </button>
            ))}
        </div>

        {/* 3. GRID CONTENT */}
        {activeTab === 'saved' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {savedLessons.length > 0 ? savedLessons.map((lesson) => (
                    <div key={lesson.id} className="aspect-[9/16] relative rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer shadow-sm hover:shadow-md transition">
                        <video src={lesson.video_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                             <h3 className="text-white font-bold text-xs line-clamp-2">{lesson.title}</h3>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-10 text-center text-gray-400 font-medium flex flex-col items-center gap-2">
                        <Bookmark size={40} className="opacity-20" />
                        No saved lessons yet.
                    </div>
                )}
            </div>
        ) : (
             <div className="py-20 text-center text-gray-400 font-medium">History feature coming soon.</div>
        )}

      </div>
    </div>
  );
}