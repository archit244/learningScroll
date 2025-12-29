import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Play, Atom, Hourglass, Code, Dna, Rocket, Calculator } from "lucide-react"; 
import { supabase } from "../supabaseClient";

export default function Library() {
  const [lessons, setLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Categories with Light Mode Colors
  const categories = [
    { name: "Physics", icon: Atom, color: "text-cyan-600 bg-cyan-50", border: "border-cyan-100" },
    { name: "History", icon: Hourglass, color: "text-amber-600 bg-amber-50", border: "border-amber-100" },
    { name: "Coding", icon: Code, color: "text-green-600 bg-green-50", border: "border-green-100" },
    { name: "Biology", icon: Dna, color: "text-pink-600 bg-pink-50", border: "border-pink-100" },
    { name: "Space", icon: Rocket, color: "text-purple-600 bg-purple-50", border: "border-purple-100" },
    { name: "Math", icon: Calculator, color: "text-blue-600 bg-blue-50", border: "border-blue-100" }
  ];

  useEffect(() => {
    supabase.from("lessons").select("*").then(({ data }) => {
      setLessons(data || []);
      setLoading(false);
    });
  }, []);

  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lesson.category && lesson.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full h-full bg-[#F0F2F5] font-['Nunito'] text-gray-900 overflow-y-auto no-scrollbar pb-20">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* 1. SEARCH BAR */}
        <div className="sticky top-0 bg-[#F0F2F5]/95 backdrop-blur z-10 py-4 mb-4">
          <div className="relative max-w-md mx-auto md:max-w-none md:mx-0">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm transition"
            />
          </div>
        </div>

        {/* 2. CATEGORIES (Hidden when searching) */}
        {!searchQuery && (
          <div className="mb-10">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Browse by Topic</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link 
                  to={`/feed/${cat.name}`} 
                  key={cat.name}
                  className={`aspect-square rounded-2xl bg-white border ${cat.border} flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer shadow-sm`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3 transition ${cat.color} group-hover:scale-110`}>
                    <cat.icon size={28} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-gray-700 text-sm uppercase tracking-wider">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 3. RECENT LESSONS */}
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : "Recent Lessons"}
        </h2>

        {loading ? (
          <div className="text-gray-400 text-center mt-10 font-bold">Loading library...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="aspect-[9/16] relative rounded-2xl overflow-hidden bg-white shadow-md group cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <video src={lesson.video_url} className="w-full h-full object-cover" muted />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] text-yellow-400 font-black uppercase tracking-wider mb-1 px-2 py-0.5 bg-black/50 rounded-md w-fit backdrop-blur-sm">
                    {lesson.category || "General"}
                  </span>
                  <h3 className="text-sm text-white font-bold leading-tight line-clamp-2">{lesson.title}</h3>
                </div>

                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/20 backdrop-blur-[2px]">
                  <div className="bg-white p-3 rounded-full text-black shadow-lg transform scale-90 group-hover:scale-100 transition">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredLessons.length === 0 && !loading && (
          <div className="text-center text-gray-400 font-bold mt-10">No lessons found.</div>
        )}
      </div>
    </div>
  );
}