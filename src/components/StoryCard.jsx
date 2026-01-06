import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Check, ArrowRight, AlertCircle, Layers, Activity } from "lucide-react";
import ReactMarkdown from "react-markdown";

// New Component Imports
import DialogueView from "./slides/DialogueView";
import ThinkTimer from "./slides/ThinkTimer";
import CongratsSlide from "./slides/CongratsSlide";
import SimulatorWrapper from "./simulators/SimulatorWrapper";

export default function StoryCard({ data, onClose }) {
  console.log("🔍 STORYCARD DATA:", data);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [status, setStatus] = useState("idle");

  // Normalize data structure (Handles both flat arrays and nested Python agent output)
  const processData = (lessonData) => {
    if (!lessonData) return [];
    if (Array.isArray(lessonData)) return lessonData;
    if (lessonData.slides && Array.isArray(lessonData.slides)) {
      return lessonData.slides;
    }
    return [];
  };

  const slides = processData(data?.lesson_data);
  if (slides.length === 0) return null;

  const currentSlide = slides[slideIndex];
  // Determine if this slide contains a quiz for interaction state
  const quizBlock = currentSlide.blocks?.find(b => b.type === 'quiz');
  const progress = ((slideIndex + 1) / slides.length) * 100;

  // Dynamic Font Scaling handled via CSS clamp() now

  useEffect(() => {
    setSelectedOption(null);
    setStatus("idle");
  }, [slideIndex]);

  const handleCheck = () => {
    if (status !== 'idle') {
      handleNext();
      return;
    }
    if (quizBlock) {
      if (selectedOption === Number(quizBlock.answer)) {
        setStatus("correct");
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
      } else {
        setStatus("wrong");
      }
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    slideIndex < slides.length - 1 ? setSlideIndex(prev => prev + 1) : onClose();
  };

  // Reusable Markdown Styles to ensure "Next Line" structure and Bold Headers
  const markdownStyles = {
    h1: ({ node, ...props }) => (
      <h1 className="font-extrabold text-black mt-6 mb-3 block tracking-tight" style={{ fontSize: '1.4em', fontWeight: '900', lineHeight: 1.2 }} {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="font-extrabold text-black mt-5 mb-2 block tracking-tight" style={{ fontSize: '1.25em', fontWeight: '900' }} {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="font-black text-black mt-6 mb-2 block uppercase tracking-tight" style={{ fontSize: '1.4em', fontWeight: '900' }} {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-extrabold text-black" style={{ fontWeight: '900' }} {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="text-gray-600 font-medium leading-relaxed mt-3 mb-3 block" style={{ fontSize: '1em' }} {...props} />
    ),
    ul: ({ node, ...props }) => <ul className="mt-4 space-y-2" {...props} />,
    li: ({ node, ...props }) => (
      <li className="flex items-start gap-3">
        <span className="h-px w-3 bg-black mt-3 shrink-0" />
        <span className="text-gray-700 font-bold leading-snug" style={{ fontSize: '1em' }}>{props.children}</span>
      </li>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        height: '100dvh',
        width: '100vw',
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        zIndex: 9999,
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* --- TOP NAV --- */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
        maxWidth: '672px',
        margin: '0 auto',
        padding: '20px 20px 10px 20px',
        flexShrink: 0
      }}>
        <button
          onClick={onClose}
          style={{
            color: '#9ca3af',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#000'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
        >
          <X size={24} strokeWidth={2.5} />
        </button>
        <div style={{
          height: '6px',
          backgroundColor: '#f3f4f6',
          borderRadius: '9999px',
          flex: 1,
          overflow: 'hidden'
        }}>
          <motion.div
            style={{ height: '100%', backgroundColor: '#000' }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '20px',
        fontSize: 'clamp(1rem, 2.5vh, 1.8rem)'
      }}>
        <div style={{ width: '100%', maxWidth: '672px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tag / Breadcrumb */}
              {currentSlide.type !== 'congrats' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 900,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  marginBottom: '12px',
                  fontSize: '0.5em'
                }}>
                  {currentSlide.type === 'simulator' ? <Activity size={12} /> : <Layers size={12} />}
                  <span>{(currentSlide.type || "Lesson").replace('_', ' ')}</span>
                </div>
              )}

              {/* Content Render Logic - Handles Strings and Arrays + Custom Symbols (@@/!!) */}
              {(() => {
                let blocksToRender = currentSlide.blocks || [];

                return (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {blocksToRender.map((block, i) => (
                        <div key={i}>
                          {(() => {
                            switch (block.type) {
                              case "conversation":
                              case "dialogue":
                                return <DialogueView dialogues={block.content} />;

                              case "delayed_question":
                              case "think_timer":
                                return (
                                  <ThinkTimer
                                    question={block.content || block.question}
                                    answer={block.answer}
                                    duration={block.duration}
                                  />
                                );

                              case "congrats":
                                return <CongratsSlide data={block} />;

                              case "quiz":
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <h2 style={{
                                      fontWeight: 900,
                                      lineHeight: 1.2,
                                      letterSpacing: '-0.025em',
                                      color: '#000',
                                      fontSize: '1.2em'
                                    }}>
                                      {block.question}
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                      {block.options?.map((opt, k) => (
                                        <button
                                          key={k}
                                          onClick={() => setSelectedOption(k)}
                                          disabled={status !== "idle"}
                                          style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '16px',
                                            border: selectedOption === k ? '2px solid #000' : '2px solid #f3f4f6',
                                            textAlign: 'left',
                                            fontWeight: 700,
                                            transition: 'all 0.2s',
                                            backgroundColor: selectedOption === k ? '#000' : '#fff',
                                            color: selectedOption === k ? '#fff' : '#6b7280',
                                            cursor: status === "idle" ? 'pointer' : 'default',
                                            fontSize: '0.8em'
                                          }}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );

                              case "simulator":
                                return (
                                  <div style={{
                                    marginTop: '16px',
                                    borderRadius: '24px',
                                    border: '2px solid #f3f4f6',
                                    overflow: 'hidden',
                                    backgroundColor: '#f9fafb'
                                  }}>
                                    <SimulatorWrapper data={block.interactionData} />
                                  </div>
                                );

                              case "markdown":
                              default:
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div className="prose prose-lg max-w-none">
                                      {(() => {
                                        // Handle input: Explicitly handle valid Array or String
                                        let lines = [];
                                        if (Array.isArray(block.content)) {
                                          // Flatten array input
                                          lines = block.content;
                                        } else if (typeof block.content === 'string') {
                                          // Split string input
                                          lines = block.content.split('\n');
                                        }

                                        const elements = [];
                                        let currentMarkdown = "";

                                        lines.forEach((line, lineIdx) => {
                                          const trimmed = line.trim();

                                          // 1. Custom Symbol: @@ -> H2 (Subtitle)
                                          if (trimmed.startsWith('@@')) {
                                            if (currentMarkdown) {
                                              elements.push(
                                                <ReactMarkdown key={`md-${lineIdx}-pre-h2-custom`} components={markdownStyles}>
                                                  {currentMarkdown}
                                                </ReactMarkdown>
                                              );
                                              currentMarkdown = "";
                                            }
                                            elements.push(
                                              <h2 key={`h2-${lineIdx}-custom`} className="font-extrabold text-black mt-5 mb-2 block tracking-tight" style={{ fontSize: '1.25em', fontWeight: '900' }}>
                                                {trimmed.substring(2).trim()}
                                              </h2>
                                            );
                                          }
                                          // 2. Custom Symbol: !! -> H1 (Title)
                                          else if (trimmed.startsWith('!!')) {
                                            if (currentMarkdown) {
                                              elements.push(
                                                <ReactMarkdown key={`md-${lineIdx}-pre-h1-custom`} components={markdownStyles}>
                                                  {currentMarkdown}
                                                </ReactMarkdown>
                                              );
                                              currentMarkdown = "";
                                            }
                                            elements.push(
                                              <h1 key={`h1-${lineIdx}-custom`} className="font-extrabold text-black mt-6 mb-3 block tracking-tight" style={{ fontSize: '1.4em', fontWeight: '900', lineHeight: 1.2 }}>
                                                {trimmed.substring(2).trim()}
                                              </h1>
                                            );
                                          }
                                          // 3. Legacy: ## -> H2 (Subtitle)
                                          else if (trimmed.startsWith('##')) {
                                            if (currentMarkdown) {
                                              elements.push(
                                                <ReactMarkdown key={`md-${lineIdx}-pre-lh2`} components={markdownStyles}>
                                                  {currentMarkdown}
                                                </ReactMarkdown>
                                              );
                                              currentMarkdown = "";
                                            }
                                            elements.push(
                                              <h2 key={`h2-${lineIdx}`} className="font-extrabold text-black mt-5 mb-2 block tracking-tight" style={{ fontSize: '1.25em', fontWeight: '900' }}>
                                                {trimmed.substring(2).trim()}
                                              </h2>
                                            );
                                          }
                                          // 4. Legacy: # -> H1 (Title)
                                          else if (trimmed.startsWith('#')) {
                                            if (currentMarkdown) {
                                              elements.push(
                                                <ReactMarkdown key={`md-${lineIdx}-pre-lh1`} components={markdownStyles}>
                                                  {currentMarkdown}
                                                </ReactMarkdown>
                                              );
                                              currentMarkdown = "";
                                            }
                                            elements.push(
                                              <h1 key={`h1-${lineIdx}`} className="font-extrabold text-black mt-6 mb-3 block tracking-tight" style={{ fontSize: '1.4em', fontWeight: '900', lineHeight: 1.2 }}>
                                                {trimmed.substring(1).trim()}
                                              </h1>
                                            );
                                          }
                                          else {
                                            // Accumulate normal lines
                                            currentMarkdown += line + "\n";
                                          }
                                        });

                                        // Final flush of remaining text
                                        if (currentMarkdown) {
                                          elements.push(
                                            <ReactMarkdown key="md-end" components={markdownStyles}>
                                              {currentMarkdown}
                                            </ReactMarkdown>
                                          );
                                        }

                                        return elements;
                                      })()}
                                    </div>
                                  </div>
                                );
                            }
                          })()}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- FIXED FOOTER (OUTSIDE SCROLLABLE AREA) --- */}
      <div style={{
        width: '100%',
        maxWidth: '672px',
        margin: '0 auto',
        padding: '10px 20px 20px 20px',
        flexShrink: 0
      }}>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '12px',
              padding: '12px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.75rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              backgroundColor: status === "correct" ? '#f0fdf4' : '#fef2f2',
              color: status === "correct" ? '#16a34a' : '#dc2626',
              border: status === "correct" ? '1px solid #bbf7d0' : '1px solid #fecaca'
            }}
          >
            {status === "correct" ? <Check size={16} strokeWidth={3} /> : <AlertCircle size={16} strokeWidth={3} />}
            {status === "correct" ? "Insight correct" : "Check the logic again"}
          </motion.div>
        )}

        <button
          onClick={handleCheck}
          disabled={quizBlock && selectedOption === null}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: (quizBlock && selectedOption === null) ? 0.1 : 1,
            cursor: (quizBlock && selectedOption === null) ? 'not-allowed' : 'pointer',
            border: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)'
          }}
        >
          {status === "idle" ? "Check" : "Continue"} <ArrowRight size={18} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
}