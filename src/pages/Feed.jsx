import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom"; 
import { AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Volume2, VolumeX, ChevronUp, ChevronDown, Music } from "lucide-react";
import { supabase } from "../supabaseClient";
import StoryCard from "../components/StoryCard"; 

const PAGE_SIZE = 5;

export default function Feed() {
  const { category } = useParams(); 
  
  const [lessons, setLessons] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true); 
  
  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Interaction
  const [likedIDs, setLikedIDs] = useState(new Set());
  const [savedIDs, setSavedIDs] = useState(new Set());
  
  const videoRefs = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    setLessons([]);
    setPage(0);
    setHasMore(true);
    setActiveIndex(0);
    setLoading(true); 
    loadLessons(0);
    fetchUserInteractions();
  }, [category]); 

  const loadLessons = async (pageIndex) => {
    let query = supabase
      .from("lessons")
      .select("*")
      .order("created_at", { ascending: false })
      .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

    if (category) {
      query = query.ilike('category', category); 
    }

    const { data } = await query;

    if (!data || data.length < PAGE_SIZE) setHasMore(false);

    setLessons((prev) => (pageIndex === 0 ? (data || []) : [...prev, ...(data || [])]));
    setLoading(false); 
  };

  const fetchUserInteractions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("user_interactions").select("lesson_id, interaction_type").eq("user_id", user.id);
    const likes = new Set();
    const saves = new Set();
    data?.forEach(item => {
      if (item.interaction_type === 'like') likes.add(item.lesson_id);
      if (item.interaction_type === 'save') saves.add(item.lesson_id);
    });
    setLikedIDs(likes);
    setSavedIDs(saves);
  };

  const scrollToVideo = (index) => {
    if (index < 0 || index >= lessons.length) return;
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: index * container.clientHeight, behavior: "smooth" });
    }
  };

  const handleScroll = (e) => {
    const index = Math.round(e.target.scrollTop / e.target.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
      videoRefs.current.forEach((v) => v && v.pause());
      if (videoRefs.current[index]) {
        videoRefs.current[index].currentTime = 0;
        videoRefs.current[index].play().catch(() => setIsMuted(true));
      }
      if (hasMore && index >= lessons.length - 2) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadLessons(nextPage);
      }
    }
  };

  const handleInteraction = async (lessonId, type) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in!");
    const isActive = type === 'like' ? likedIDs.has(lessonId) : savedIDs.has(lessonId);
    
    if (type === 'like') {
      setLikedIDs(prev => { const newSet = new Set(prev); isActive ? newSet.delete(lessonId) : newSet.add(lessonId); return newSet; });
    } else {
      setSavedIDs(prev => { const newSet = new Set(prev); isActive ? newSet.delete(lessonId) : newSet.add(lessonId); return newSet; });
    }

    if (isActive) {
      await supabase.from("user_interactions").delete().match({ user_id: user.id, lesson_id: lessonId, interaction_type: type });
    } else {
      await supabase.from("user_interactions").insert({ user_id: user.id, lesson_id: lessonId, interaction_type: type });
    }
  };

  return (
    // LIGHT MODE BACKGROUND
    <div className="w-full h-full flex justify-center items-center bg-[#F0F2F5] font-['Nunito']">
      
      <div 
        ref={containerRef}
        className="h-full w-full max-w-[400px] md:max-w-none md:w-auto overflow-y-scroll snap-y snap-mandatory no-scrollbar flex flex-col items-center"
        onScroll={handleScroll}
      >
        
        {/* --- LIGHT MODE SKELETONS --- */}
        {loading && lessons.length === 0 && (
           <div className="h-full w-full flex flex-col gap-4 items-center justify-center pt-10">
              {[1, 2].map((i) => (
                <div key={i} className="w-full md:w-[350px] h-[620px] bg-white rounded-2xl shadow-lg border border-gray-200 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gray-100 to-transparent skew-x-12 opacity-50 animate-pulse" />
                  <div className="absolute bottom-10 left-4 w-3/4 h-6 bg-gray-200 rounded" />
                  <div className="absolute bottom-20 left-4 w-1/4 h-4 bg-gray-200 rounded" />
                </div>
              ))}
           </div>
        )}

        {!loading && lessons.length === 0 && (
            <div className="h-screen flex flex-col items-center justify-center text-gray-500 gap-2">
                <span className="text-4xl">🤷‍♂️</span>
                <p>{category ? `No lessons found for ${category}` : "No videos yet."}</p>
            </div>
        )}

        {/* --- FEED --- */}
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="h-full w-full md:h-[90vh] md:w-[850px] snap-center snap-always flex items-center justify-center p-4 gap-6">
            
            {/* VIDEO CARD (Remains Dark inside, but container is clean) */}
            <div className="relative h-full w-full md:w-[350px] md:h-[620px] bg-black rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 group">
              
              {/* Audio */}
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition duration-300">
                <button onClick={() => setIsMuted(!isMuted)} className="bg-black/50 backdrop-blur p-2 rounded-full text-white hover:bg-black/70 active:scale-90 transition">
                   {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={lesson.video_url}
                className="h-full w-full object-cover"
                loop
                playsInline
                muted={isMuted}
                onClick={() => handleInteraction(lesson.id, 'like')} 
              />
              
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

              {/* Text Info */}
              <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                   <span className="font-bold text-sm hover:underline cursor-pointer text-white">LearningScroll</span>
                   {category && <span className="text-[10px] uppercase border border-white/30 px-2 py-0.5 rounded backdrop-blur-sm">{category}</span>}
                </div>
                <h2 className="text-sm font-normal mb-2 leading-snug text-white">{lesson.title}</h2>
                <div className="flex items-center gap-2 text-xs text-white/70">
                    <Music size={12} /> <span className="truncate">Original Audio • Explained by AI</span>
                </div>
              </div>
            </div>

            {/* SIDEBAR ACTIONS (LIGHT MODE COLORS) */}
            <div className="hidden md:flex flex-col gap-6 justify-end pb-8 h-[620px]">
              
              {/* Like */}
              <div className="flex flex-col items-center gap-1">
                <button 
                  onClick={() => handleInteraction(lesson.id, 'like')} 
                  className={`p-3.5 rounded-full shadow-lg border border-gray-100 transition active:scale-90 duration-200 
                  ${likedIDs.has(lesson.id) ? "bg-red-50 text-red-500 border-red-100" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  <Heart size={26} fill={likedIDs.has(lesson.id) ? "currentColor" : "none"} />
                </button>
                <span className="text-xs text-gray-500 font-bold">{likedIDs.has(lesson.id) ? "1.2k" : "1.1k"}</span>
              </div>

              {/* Comments */}
              <div className="flex flex-col items-center gap-1">
                <button className="p-3.5 rounded-full bg-white text-gray-700 shadow-lg border border-gray-100 hover:bg-gray-50 transition active:scale-90 duration-200">
                  <MessageCircle size={26} />
                </button>
                <span className="text-xs text-gray-500 font-bold">45</span>
              </div>

              {/* Save */}
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => handleInteraction(lesson.id, 'save')} className="p-3.5 rounded-full bg-white text-gray-700 shadow-lg border border-gray-100 hover:bg-gray-50 transition active:scale-90 duration-200">
                   <Bookmark size={26} className={savedIDs.has(lesson.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-700"} />
                </button>
                <span className="text-xs text-gray-500 font-bold">Save</span>
              </div>

              {/* NOTES BUTTON (The Star of Show) */}
              <div className="flex flex-col items-center gap-1 mt-4">
                <button 
                   onClick={() => setShowCard(true)} 
                   className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl overflow-hidden hover:scale-105 active:scale-90 transition duration-200"
                >
                  <img src={`https://ui-avatars.com/api/?name=${lesson.category || 'Notes'}&background=random&color=fff`} alt="Notes" />
                </button>
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Learn</span>
              </div>

            </div>

            {/* NAVIGATION ARROWS */}
            <div className="hidden xl:flex flex-col gap-4 ml-4">
               <button onClick={() => scrollToVideo(index - 1)} disabled={index === 0} className="p-3 bg-white text-gray-700 shadow-md rounded-full hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition"><ChevronUp size={20} /></button>
               <button onClick={() => scrollToVideo(index + 1)} disabled={index === lessons.length - 1} className="p-3 bg-white text-gray-700 shadow-md rounded-full hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition"><ChevronDown size={20} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showCard && (
          <StoryCard 
            data={lessons[activeIndex]} 
            onClose={() => setShowCard(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}