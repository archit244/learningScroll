import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import SimulatorWrapper from "./simulators/SimulatorWrapper";
import ThinkTimer from "./slides/ThinkTimer";
import { createPortal } from "react-dom";
import { Heart, MessageCircle, Bookmark, Volume2, VolumeX, ChevronUp, ChevronDown, Music, X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DialogueView from './slides/DialogueView';

const ReelCard = memo(({
    lesson,
    index,
    isActive,
    isMuted,
    setIsMuted,
    likedIDs,
    savedIDs,
    handleInteraction,
    onShowCard,
    onScrollTo,
    isFirst,
    isLast,
    shouldRender,
    registerVideo
}) => {
    const videoRef = useRef(null);

    // --- 1. Video Focus Mode & Lesson State ---
    const [isLessonActive, setIsLessonActive] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    // --- 2. Waterfall Sequence State ---
    const [visibleCount, setVisibleCount] = useState(0); // Changed from array to count for index-based rendering
    const timeoutsRef = useRef([]);

    // Logic Update: Normalized Data Handling
    const slides = useMemo(() => {
        if (!lesson?.lesson_data) return lesson?.slides || [];
        if (Array.isArray(lesson.lesson_data)) return lesson.lesson_data;
        if (lesson.lesson_data.slides && Array.isArray(lesson.lesson_data.slides)) return lesson.lesson_data.slides;
        return [];
    }, [lesson]);

    const currentSlide = slides[currentSlideIndex];
    const contentElements = useMemo(() => currentSlide?.content_elements || [], [currentSlide]);

    // Playback & Audio Authority
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isActive) return;

        if (isLessonActive) {
            video.pause();
            return;
        }

        video.src = lesson.video_url;
        video.muted = isMuted;
        video.volume = 1.0;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log("Autoplay blocked:", err);
            });
        }
    }, [isActive, isMuted, lesson.video_url, isLessonActive]);

    // Hard Reset
    useEffect(() => {
        const video = videoRef.current;
        if (!isActive && video) {
            video.pause();
            video.muted = true;
            video.src = "";
            video.load();
            setIsLessonActive(false);
            setVisibleCount(0);
        }
    }, [isActive]);

    // --- 3. The Waterfall Sequence Logic ---
    useEffect(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        setVisibleCount(0); // Reset on slide change

        if (!isLessonActive || !currentSlide) return;

        let accumulatedDelay = 0;

        contentElements.forEach((text, i) => {
            const wordCount = text.split(' ').length;
            const readTime = (wordCount / 225) * 60000;
            const delay = i === 0 ? 0 : accumulatedDelay;

            const timeoutId = setTimeout(() => {
                setVisibleCount(prev => prev + 1);
            }, delay);

            timeoutsRef.current.push(timeoutId);
            accumulatedDelay += readTime + 800;
        });

        return () => {
            timeoutsRef.current.forEach(clearTimeout);
        };
    }, [currentSlideIndex, isLessonActive, contentElements, currentSlide]);


    // --- 4. The Skip/Next Functionality ---
    const handleNext = (e) => {
        e?.stopPropagation();

        if (visibleCount < contentElements.length) {
            timeoutsRef.current.forEach(clearTimeout);
            setVisibleCount(contentElements.length); // Reveal All
        } else {
            if (currentSlideIndex < slides.length - 1) {
                setVisibleCount(0);
                setCurrentSlideIndex(prev => prev + 1);
            } else {
                setIsLessonActive(false);
                setCurrentSlideIndex(0);
                setVisibleCount(0);
            }
        }
    };

    const toggleLessonMode = (e) => {
        e.stopPropagation();
        setIsLessonActive(true);
        setCurrentSlideIndex(0);
        setVisibleCount(0);
    };


    if (!lesson) return null;

    if (!shouldRender) {
        return (
            <div className="h-[95vh] w-full md:w-[850px] snap-center snap-always flex items-center justify-center my-10 p-4 gap-6 scroll-snap-align-center">
                <div className="w-full md:w-[350px] h-[700px] bg-black/5 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="h-[95vh] w-full md:w-[850px] snap-center snap-always flex items-center justify-center my-10 p-4 gap-6 scroll-snap-align-center"
            style={{ transform: "translate3d(0,0,0)", scrollSnapStop: "always !important" }}
        >

            {/* VIDEO CARD */}
            <div className="relative h-full w-full md:w-[350px] md:h-[700px] bg-black rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 group">

                {!isLessonActive && (
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition duration-300">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="bg-black/50 backdrop-blur p-2 rounded-full text-white hover:bg-black/70 active:scale-90 transition"
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>
                )}

                <video
                    ref={videoRef}
                    src={lesson?.video_url}
                    className={`h-full w-full object-cover transition-all duration-500 ${isLessonActive ? 'blur-sm brightness-50 scale-105' : ''}`}
                    loop
                    playsInline
                    muted={!isActive || isMuted}
                    key={lesson.id}
                    onClick={() => handleInteraction(lesson?.id, 'like')}
                />

                {/* --- CONTENT OVERLAY (Portal for True Full Screen) --- */}
                {isLessonActive && createPortal(
                    <div
                        className="fixed inset-0 z-[99999] w-screen h-screen bg-white flex flex-col overflow-hidden"
                        style={{ margin: 0, padding: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col w-full h-full relative"
                        >

                            {/* HEADER: Close + Progress */}
                            <div className="w-full max-w-2xl mx-auto pt-6 px-5 flex items-center gap-4 z-[100000] shrink-0">
                                <button
                                    onClick={() => setIsLessonActive(false)}
                                    className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex-1 flex gap-1 h-1">
                                    {slides.map((_, idx) => (
                                        <div key={idx} className="h-full bg-gray-100 rounded-full flex-1 overflow-hidden">
                                            <div
                                                className={`h-full bg-black transition-all duration-300 ${idx <= currentSlideIndex ? 'w-full' : 'w-0'}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. MAIN CONTENT (Total Content Positioning - 100vh Fit) */}
                            <div className="flex-grow w-full h-full overflow-hidden" onClick={handleNext}>
                                {/* Flex center container, no scroll */}
                                <div className="w-full h-full flex flex-col items-center justify-center p-8 pt-8 pb-32">
                                    <div className="w-full max-w-2xl mx-auto max-h-full flex flex-col justify-center">

                                        {/* Map CONTENT elements (All of them) to reserve space */}
                                        {currentSlide?.type === 'delayed_question' ? (
                                            <ThinkTimer
                                                question={contentElements[0]}
                                                duration={5}
                                            />
                                        ) : (currentSlide?.type === 'conversation' || currentSlide?.type === 'dialogue' || (contentElements.length > 0 && typeof contentElements[0] === 'string' && (contentElements[0].includes('MIA') || contentElements[0].includes('LEO')))) ? (
                                            <DialogueView dialogues={contentElements} />
                                        ) : (
                                            <div className="flex flex-col gap-4">
                                                {contentElements.map((text, i) => {
                                                    const isVisible = i < visibleCount;
                                                    return (
                                                        <div
                                                            key={`${currentSlideIndex}-${i}`}
                                                            className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-4 blur-sm'}`}
                                                        >
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    // Adjusted fonts to fit 100vh better (Scaled down)
                                                                    h1: ({ node, ...props }) => <h1 className="text-5xl font-black text-black mb-8 block tracking-tighter" {...props} />,
                                                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-extrabold text-gray-800 mt-6 mb-4 block" {...props} />,
                                                                    p: ({ node, ...props }) => <p className="text-base md:text-lg text-gray-800 font-medium leading-relaxed mb-3" {...props} />,
                                                                    li: ({ node, ...props }) => (
                                                                        <li className="flex gap-3 items-start mb-2">
                                                                            <div className="mt-2 w-1.5 h-1.5 bg-black rounded-full shrink-0" />
                                                                            <span className="text-base md:text-lg text-gray-800 font-medium leading-relaxed">{props.children}</span>
                                                                        </li>
                                                                    ),
                                                                    ul: ({ node, ...props }) => <ul className="mb-4 pl-1" {...props} />,
                                                                    strong: ({ node, ...props }) => <span className="font-black text-black tracking-wide uppercase text-xs mr-2" {...props} />,
                                                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-black pl-4 py-1 my-4 italic text-lg text-gray-700 font-serif" {...props} />
                                                                }}
                                                            >
                                                                {text}
                                                            </ReactMarkdown>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>

                            {/* 4. BLACK ACTION BAR (Fixed Bottom) */}
                            <div className="absolute bottom-10 left-0 right-0 z-[100000] flex justify-center pointer-events-none px-6">
                                <button
                                    onClick={handleNext}
                                    className="pointer-events-auto w-full max-w-md bg-black text-white py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    {visibleCount < contentElements.length ? "Reveal All" : (currentSlideIndex < slides.length - 1 ? "Next Slide" : "Complete Lesson")}
                                    <ArrowRight size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                        </motion.div>
                    </div>,
                    document.body
                )}

                {/* Gradient Overlay (Only visible when lesson NOT active) */}
                {!isLessonActive && (
                    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                )}

                {/* Text Info (Hidden during lesson) */}
                {!isLessonActive && (
                    <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                            <span className="font-bold text-sm hover:underline cursor-pointer text-white">LearningScroll</span>
                        </div>
                        <h2 className="text-sm font-normal mb-2 leading-snug text-white">{lesson?.title}</h2>
                        <div className="flex items-center gap-2 text-xs text-white/70">
                            <Music size={12} /> <span className="truncate">Original Audio • Explained by AI</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="hidden md:flex flex-col gap-6 justify-end pb-8 h-[620px]">
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => handleInteraction(lesson?.id, 'like')}
                        className={`p-3.5 rounded-full shadow-lg border border-gray-100 transition active:scale-90 duration-200 
            ${likedIDs?.has(lesson.id) ? "bg-red-50 text-red-500 border-red-100" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                    >
                        <Heart size={26} fill={likedIDs?.has(lesson?.id) ? "currentColor" : "none"} />
                    </button>
                    <span className="text-xs text-gray-500 font-bold">{likedIDs?.has(lesson?.id) ? "1.2k" : "1.1k"}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="p-3.5 rounded-full bg-white text-gray-700 shadow-lg border border-gray-100 hover:bg-gray-50 transition active:scale-90 duration-200">
                        <MessageCircle size={26} />
                    </button>
                    <span className="text-xs text-gray-500 font-bold">45</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button onClick={() => handleInteraction(lesson?.id, 'save')} className="p-3.5 rounded-full bg-white text-gray-700 shadow-lg border border-gray-100 hover:bg-gray-50 transition active:scale-90 duration-200">
                        <Bookmark size={26} className={savedIDs?.has(lesson?.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-700"} />
                    </button>
                    <span className="text-xs text-gray-500 font-bold">Save</span>
                </div>

                <div className="flex flex-col items-center gap-1 mt-4">
                    <button
                        onClick={toggleLessonMode}
                        className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl overflow-hidden hover:scale-105 active:scale-90 transition duration-200"
                    >
                        <img src={`https://ui-avatars.com/api/?name=${lesson?.category || 'Notes'}&background=random&color=fff`} alt="Notes" />
                    </button>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Learn</span>
                </div>
            </div>

            <div className="hidden xl:flex flex-col gap-4 ml-4">
                <button onClick={() => onScrollTo(index - 1)} disabled={isFirst} className="p-3 bg-white text-gray-700 shadow-md rounded-full hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition"><ChevronUp size={20} /></button>
                <button onClick={() => onScrollTo(index + 1)} disabled={isLast} className="p-3 bg-white text-gray-700 shadow-md rounded-full hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition"><ChevronDown size={20} /></button>
            </div>

        </div>
    );
}, (prev, next) => {
    return (
        prev.lesson.id === next.lesson.id &&
        prev.isActive === next.isActive &&
        prev.isMuted === next.isMuted
    );
});

export default ReelCard;
