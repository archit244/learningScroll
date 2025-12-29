import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Check, ArrowRight, AlertCircle, BookOpen, Layers } from "lucide-react";

export default function StoryCard({ data, onClose }) {
  const [slideIndex, setSlideIndex] = useState(0);
  
  // Quiz State
  const [selectedOption, setSelectedOption] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | correct | wrong
  
  // 1. DATA PREP
  const rawData = data.lesson_data || data;
  const slides = Array.isArray(rawData) ? rawData : (rawData.slides || []);
  
  // Fallback
  if (slides.length === 0) {
      slides.push({ type: "intro", text: data.title, emoji: "🎓" });
      slides.push({ type: "fact", text: data.script || "No detailed notes available.", emoji: "📖" });
      slides.push({ type: "outro", text: "Lesson Complete!" });
  }

  const currentSlide = slides[slideIndex];
  const progress = ((slideIndex + 1) / slides.length) * 100;

  useEffect(() => {
    setSelectedOption(null);
    setStatus("idle");
  }, [slideIndex]);

  // 2. CHECK LOGIC
  const handleCheck = () => {
    if (status !== 'idle') {
        handleNext();
        return;
    }
    if (currentSlide.type === 'quiz') {
        const correctAnswer = currentSlide.answer;
        const isCorrect = typeof correctAnswer === 'number' 
            ? selectedOption === correctAnswer 
            : selectedOption === Number(correctAnswer);
        
        if (isCorrect) {
            setStatus("correct");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 }, colors: ['#000000', '#444444'] }); // Black/Gray confetti (Classy)
        } else {
            setStatus("wrong");
        }
    } else {
        handleNext();
    }
  };

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      onClose(); 
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      className="fixed inset-0 z-50 flex flex-col bg-[#FFFFFF] font-['Inter'] text-gray-900"
    >
      
      {/* --- HEADER --- */}
      <div className="flex items-center gap-6 p-6 w-full max-w-2xl mx-auto border-b border-gray-100">
        <button onClick={onClose} className="text-gray-400 hover:text-black transition p-2 hover:bg-gray-100 rounded-full">
           <X size={24} />
        </button>
        {/* Minimalist Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-full flex-1 overflow-hidden">
            <motion.div 
                className="h-full bg-black rounded-full" 
                animate={{ width: `${progress}%` }} 
                transition={{ type: "spring", stiffness: 50 }}
            />
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto p-6 md:p-10 pb-40">
        <AnimatePresence mode="wait">
            <motion.div
                key={slideIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
            >
                {/* 1. CONTENT SLIDES (Left Aligned, Professional) */}
                {currentSlide.type !== 'quiz' && (
                    <div className="flex flex-col gap-6">
                        {/* Kicker / Tag */}
                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400">
                            <Layers size={14} />
                            <span>{currentSlide.type === 'intro' ? "Overview" : "Key Concept"}</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight text-black tracking-tight">
                             {currentSlide.text}
                        </h2>

                        {/* Placeholder for denser content (We will update Python for this) */}
                        <div className="prose prose-lg text-gray-600 leading-relaxed mt-4">
                            <p>
                                {currentSlide.type === 'intro' 
                                    ? "This concept is fundamental to understanding the topic. Let's break down the mechanics." 
                                    : "Notice how this connects to real-world applications. Understanding this layer allows you to predict system behavior."}
                            </p>
                        </div>

                        {/* Image/Visual Placeholder (Optional) */}
                         <div className="w-full h-48 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 mt-4">
                            {currentSlide.emoji || <BookOpen size={32} />}
                        </div>
                    </div>
                )}

                {/* 2. QUIZ SLIDES (Card UI) */}
                {currentSlide.type === 'quiz' && (
                    <div className="w-full">
                         <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
                            <AlertCircle size={14} />
                            <span>Knowledge Check</span>
                        </div>

                        <h2 className="text-2xl font-bold mb-8 text-black">
                            {currentSlide.question}
                        </h2>
                        
                        <div className="flex flex-col gap-3">
                            {currentSlide.options?.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedOption(i)}
                                    disabled={status !== 'idle'}
                                    className={`
                                        w-full p-5 rounded-lg border text-left text-lg font-medium transition-all
                                        ${selectedOption === i 
                                            ? "bg-gray-50 border-black ring-1 ring-black text-black"  // Selected
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black"} // Default
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-6 h-6 rounded-full border flex items-center justify-center text-[10px]
                                            ${selectedOption === i ? "bg-black border-black text-white" : "border-gray-300 text-gray-400"}
                                        `}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        {opt}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>

      {/* --- FOOTER (ACTION BAR) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 md:p-8">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
            
            {/* FEEDBACK MESSAGE */}
            {status !== 'idle' && (
                <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-lg text-sm font-semibold
                        ${status === 'correct' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}
                    `}
                >
                     {status === 'correct' ? <Check size={18} /> : <AlertCircle size={18} />}
                     {status === 'correct' ? "Correct. Well done." : "Incorrect. Try to recall the previous concept."}
                </motion.div>
            )}

            {/* MAIN BUTTON */}
            <button 
                onClick={handleCheck}
                className={`
                    w-full py-4 rounded-lg text-sm font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2
                    ${status === 'correct' 
                        ? "bg-black text-white hover:bg-gray-800" 
                        : status === 'wrong'
                        ? "bg-gray-200 text-gray-500" // Disabled look for wrong
                        : "bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200"}
                `}
            >
                {status === 'idle' ? "Check Answer" : "Continue"} <ArrowRight size={16} />
            </button>
          </div>
      </div>
    </motion.div>
  );
}