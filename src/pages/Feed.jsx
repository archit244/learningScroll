import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Volume2, VolumeX, ChevronUp, ChevronDown, Music } from "lucide-react";
import { supabase } from "../supabaseClient";
import StoryCard from "../components/StoryCard";
import ReelCard from "../components/ReelCard";
import ErrorBoundary from "../components/ErrorBoundary";

const BATCH_SIZE = 3; // Instagram-style: Load 3 reels at a time
const MEMORY_THRESHOLD = 2; // Keep current +/- 2 in memory

export default function Feed() {
  const { category } = useParams();

  const [allLessons, setAllLessons] = useState([]); // All loaded lessons
  const [displayedLessons, setDisplayedLessons] = useState([]); // Currently displayed lessons
  const [activeId, setActiveId] = useState(null); // Single-ID Authority
  const [showCard, setShowCard] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Pagination
  const [hasMore, setHasMore] = useState(true);

  // Interaction
  const [likedIDs, setLikedIDs] = useState(new Set());
  const [savedIDs, setSavedIDs] = useState(new Set());

  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const sentinelObserverRef = useRef(null);
  const isFetching = useRef(false); // Atomic lock for fetching
  const lastTriggeredCountRef = useRef(0); // Track when we last triggered
  const displayedLessonsRef = useRef([]); // Always current value
  const triggeredIndicesRef = useRef(new Set()); // Track triggered indices to prevent loops

  // Reset scroll to top on route change (Snap-to-New)
  // const offsetRef = useRef(0); // Removed for Length-Based Truth

  // Reset scroll and cursor on route change
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
    // offsetRef.current = 0; // Removed
  }, [category]);

  useEffect(() => {
    setAllLessons([]);
    setDisplayedLessons([]);
    setHasMore(true);
    setActiveId(null);
    setLoading(true);
    // offsetRef.current = 0; // Removed
    isFetching.current = false;
    lastTriggeredCountRef.current = 0; // Reset trigger tracking
    triggeredIndicesRef.current.clear(); // Clear triggered indices
    loadLessons(true);
    fetchUserInteractions();
  }, [category]);

  // Keep ref in sync with state
  useEffect(() => {
    displayedLessonsRef.current = displayedLessons;
  }, [displayedLessons]);


  /* --- TIKTOK-STYLE INFINITE SCROLL ENGINE --- */
  const loadLessons = useCallback(async (isInitial = false) => {
    if (isFetching.current) {
      console.log("⏸️ Already fetching, skipping...");
      return;
    }
    isFetching.current = true;

    try {
      // Get the last DISPLAYED lesson's ID using REF (not state)
      const currentDisplayed = displayedLessonsRef.current;
      const lastId = currentDisplayed.length > 0 ? currentDisplayed[currentDisplayed.length - 1].id : null;
      console.log(`🔄 Fetching batch (Last ID: ${lastId || 'initial'}, Displayed: ${currentDisplayed.length})...`);

      // Cursor-based pagination: Use last ID instead of range
      let query = supabase
        .from("lessons")
        .select("*")
        .order("id", { ascending: false }) // LIFO: Newest First
        .limit(BATCH_SIZE);

      // If not initial, fetch items with ID less than the last one we have
      if (!isInitial && lastId) {
        query = query.lt('id', lastId);
      }

      if (category) query = query.ilike('category', category);

      const { data, error } = await query;
      if (error) throw error;

      console.log(`✅ Fetched ${data?.length || 0} items`, data?.map(d => d.id));

      if (data && data.length > 0) {
        setAllLessons(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const newItems = data.filter(item => !existingIds.has(item.id));
          const unique = isInitial ? newItems : [...prev, ...newItems];
          // LIFO: Keep descending order (newest first)
          unique.sort((a, b) => b.id - a.id);
          return unique;
        });

        // CRITICAL FIX: Update displayedLessons for BOTH initial and subsequent loads
        if (isInitial) {
          setDisplayedLessons(data.slice(0, BATCH_SIZE));
        } else {
          // Add new items to displayed list
          setDisplayedLessons(prev => [...prev, ...data]);
        }
      }

      if (!data || data.length < BATCH_SIZE) {
        setHasMore(false);
      }

    } catch (err) {
      console.error("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, [category]); // ONLY category as dependency, NOT displayedLessons

  const loadNextBatch = useCallback(() => {
    if (isFetching.current || !hasMore) return;

    console.log("📦 loadNextBatch called");
    // Simply fetch the next batch from database
    setLoadingMore(true);
    loadLessons(false);
  }, [hasMore, loadLessons]);


  /* --- STANDARD OBSERVER (Strict Authority) --- */
  useEffect(() => {
    // 1. Disconnect Old
    if (observerRef.current) observerRef.current.disconnect();

    const options = {
      root: containerRef.current,
      threshold: 0.5, // Standard: 50% visible means "Active"
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = Number(entry.target.dataset.id);
          const index = Number(entry.target.dataset.index);

          if (id) {
            setActiveId(id);

            // LOGIC FIX: Trigger at 2nd reel of ANY batch
            // BATCH_SIZE = 3. Trigger at index 1, 4, 7, etc.
            // Formula: index % BATCH_SIZE === (BATCH_SIZE - 2)
            // (1 % 3 === 1) -> True
            // (4 % 3 === 1) -> True
            const isTriggerPoint = index % BATCH_SIZE === (BATCH_SIZE - 2);

            // Only trigger if:
            // 1. It is a trigger point index
            // 2. We haven't triggered this index before (deduplication)
            // 3. Not currently fetching
            // 4. Has more data
            if (isTriggerPoint && !triggeredIndicesRef.current.has(index)) {
              if (!isFetching.current && hasMore) {
                console.log(`🚀 Triggering next batch from Reel ${index + 1} (Index ${index})`);
                triggeredIndicesRef.current.add(index); // Mark triggered immediately
                loadNextBatch();
              }
            }
          }
        }
      });
    }, options);

    // 2. Observe New Elements
    const cards = document.querySelectorAll('.reel-card-container');
    cards.forEach(card => observerRef.current.observe(card));

    return () => observerRef.current?.disconnect();
  }, [displayedLessons.length, loadNextBatch, hasMore]); // Only re-run when length changes


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
    if (index < 0 || index >= displayedLessons.length) return;
    if (containerRef.current) containerRef.current.scrollTo({ top: index * containerRef.current.clientHeight, behavior: "smooth" });
  };

  // Removed Sentinel Observer completely
  // Sentinel was causing race conditions. Replaced by Active-Index Trigger above.


  // Simplified Windowing: Keep current +/- 2
  const isWithinWindow = (index) => {
    const activeIndex = displayedLessons.findIndex(l => l.id === activeId);
    if (activeIndex === -1) return index < 3;
    return Math.abs(index - activeIndex) <= MEMORY_THRESHOLD;
  };

  const handleInteraction = async (lessonId, type) => {
    // ... (Implementation unchanged via prop pass)
    // I'll assume handleInteraction is safe to omit from this massive replace block if I'm not changing it, 
    // BUT replace_file_content needs strict context. I should probably include it or ensure alignment.
    // Wait, replacementContent replaces the range. 
    // I will include handleInteraction to be safe or cut before it.
    // The instruction block targets EndLine: 343 which essentially covers the whole logic area.
    // I will implement handleInteraction here to verify it exists in the replacement.

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in!");
    const isActive = type === 'like' ? likedIDs.has(lessonId) : savedIDs.has(lessonId);
    const setFn = type === 'like' ? setLikedIDs : setSavedIDs;

    setFn(prev => { const newSet = new Set(prev); isActive ? newSet.delete(lessonId) : newSet.add(lessonId); return newSet; });

    if (isActive) await supabase.from("user_interactions").delete().match({ user_id: user.id, lesson_id: lessonId, interaction_type: type });
    else await supabase.from("user_interactions").insert({ user_id: user.id, lesson_id: lessonId, interaction_type: type });
  };

  if (!displayedLessons) return null;

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex justify-center items-center bg-[#F0F2F5] font-['Nunito']">

        <div
          ref={containerRef}
          className="h-full w-full max-w-[400px] md:max-w-none md:w-auto overflow-y-scroll snap-y snap-mandatory no-scrollbar flex flex-col items-center pt-[40px] pb-[40px]"
          style={{ scrollSnapStop: 'always' }}
        >

          {loading && displayedLessons.length === 0 && (
            <div className="h-[95vh] w-full md:w-[850px] snap-center snap-always flex items-center justify-center my-10 p-4 gap-6 scroll-snap-align-center">
              {[1, 2].map((i) => (
                <div key={i} className="w-full md:w-[350px] h-[700px] bg-white rounded-2xl shadow-lg border border-gray-200 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gray-100 to-transparent skew-x-12 opacity-50 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {!loading && displayedLessons.length === 0 && (
            <div className="h-screen flex flex-col items-center justify-center text-gray-500 gap-2">
              <span className="text-4xl">🤷‍♂️</span>
              <p>{category ? `No lessons found for ${category}` : "No videos yet."}</p>
            </div>
          )}

          {displayedLessons.map((lesson, index) => {
            if (!lesson) return null;
            const inWindow = isWithinWindow(index);

            return (
              <div
                key={lesson?.id || `lesson-${index}`}
                className="reel-card-container"
                data-index={index}
                data-id={lesson?.id}
                style={{ transform: "translateZ(0)", willChange: "transform", scrollSnapStop: "always" }}
              >
                <ReelCard
                  lesson={lesson}
                  index={index}
                  isActive={lesson?.id === activeId}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                  likedIDs={likedIDs}
                  savedIDs={savedIDs}
                  handleInteraction={handleInteraction}
                  onShowCard={() => setShowCard(true)}
                  onScrollTo={scrollToVideo}
                  isFirst={index === 0}
                  isLast={index === displayedLessons.length - 1}
                  shouldRender={inWindow}
                />
              </div>
            );
          })}

          {loadingMore && (
            <div className="h-[95vh] w-full md:w-[850px] snap-center snap-always flex items-center justify-center my-10 p-4 gap-6">
              <div className="w-full md:w-[350px] h-[700px] bg-black rounded-3xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <p className="text-white/60 text-sm">Loading...</p>
                </div>
              </div>
            </div>
          )}
        </div>


        <AnimatePresence>
          {showCard && activeId && (
            <StoryCard
              data={displayedLessons.find(l => l.id === activeId)}
              onClose={() => setShowCard(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}