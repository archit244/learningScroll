import React from "react";
import { motion } from "framer-motion";

// Update these paths to where your actual images are stored
const AVATARS = {
  MIA: "/avatars/mia.png", // The Expert
  LEO: "/avatars/leo.png"  // The Skeptic
};

// Reading Speed Configuration
const WORDS_PER_MINUTE = 350; // Fast reader speed
const MIN_PAUSE_SECONDS = 0.6; // Minimum pause between bubbles
const BASE_DELAY_SECONDS = 0.3; // Initial delay before first bubble

export default function DialogueView({ dialogues }) {
  // Parsing logic
  const parsedDialogues = React.useMemo(() => {
    if (!dialogues) return [];

    const parseLine = (line, index) => {
      // Basic safeguard
      if (!line || typeof line !== 'string') {
        return { speaker: index % 2 === 0 ? "MIA" : "LEO", text: "" };
      }

      // 1. Clean the line (remove **, trim)
      let cleanLine = line.replace(/\*\*/g, '').trim();

      // 2. Check for "NAME: message" pattern
      const colonIndex = cleanLine.indexOf(':');
      if (colonIndex !== -1) {
        let speakerRaw = cleanLine.substring(0, colonIndex).trim();
        const text = cleanLine.substring(colonIndex + 1).trim();

        // Normalize Speaker Name
        let speaker = speakerRaw.replace(/[\[\]]/g, '');
        speaker = speaker.split('(')[0].trim().toUpperCase();

        // Valid speakers only
        if (speaker === "MIA" || speaker === "LEO") {
          return { speaker, text };
        }
      }

      // 3. Fallback: Alternating Strategy
      const speaker = index % 2 === 0 ? "MIA" : "LEO";
      return { speaker, text: cleanLine };
    };

    let rawItems = [];
    if (Array.isArray(dialogues)) {
      rawItems = dialogues;
    } else if (typeof dialogues === "string") {
      rawItems = dialogues.split('\n').filter(line => line.trim() !== "");
    }

    // 1. Parse all items first
    const parsedItems = rawItems.map((item, idx) => {
      if (typeof item === 'string') return parseLine(item, idx);
      return item;
    });

    // 2. Calculate Delays
    let currentDelay = BASE_DELAY_SECONDS;

    return parsedItems.map((item) => {
      // Calculate reading time for THIS item
      const wordCount = item.text.split(/\s+/).length;
      // Time to read this bubble = (Words / WPM) * 60
      const readTime = (wordCount / WORDS_PER_MINUTE) * 60;

      // The delay assigned to THIS bubble is the current accumulated delay
      const bubbleDelay = currentDelay;

      // Add this bubble's reading time + pause to the accumulator for the NEXT bubble
      // e.g., Next bubble appears after (This Bubble's Delay + This Bubble's Read Time + Pause)
      currentDelay += readTime + MIN_PAUSE_SECONDS;

      return { ...item, delay: bubbleDelay };
    });

  }, [dialogues]);

  return (
    <div className="flex flex-col gap-4 w-full py-4 overflow-y-auto max-h-full px-4 justify-center items-center h-full">
      <div className="flex flex-col gap-4 w-full">
        {parsedDialogues.map((chat, index) => {
          const isMia = chat.speaker === "MIA";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: chat.delay, // Use the calculated dynamic delay per bubble
                type: "spring",
                stiffness: 280,
                damping: 18
              }}
              className={`flex items-end gap-3 w-full ${isMia ? "justify-start" : "justify-end"}`}
            >
              {/* MIA AVATAR (Left) */}
              {isMia && (
                <div className="shrink-0 z-10 mb-1">
                  <div className="w-14 h-14 rounded-full border-3 border-white shadow-md bg-white overflow-hidden transform hover:scale-110 transition-transform duration-300">
                    <img
                      src={AVATARS.MIA}
                      alt="Mia"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Mia&background=EFF6FF&color=1D4ED8"; }}
                    />
                  </div>
                </div>
              )}

              {/* CHAT BUBBLE */}
              <div className={`relative max-w-[75%] px-6 py-4 rounded-[2rem] text-[15px] md:text-[16px] font-bold leading-relaxed shadow-md
              ${isMia
                  ? "bg-blue-50 text-gray-900 rounded-bl-none border border-blue-100" // Mia
                  : "bg-gray-100 text-gray-900 rounded-br-none border border-gray-200" // Leo
                }
            `}>
                {/* CSS Tail */}
                {isMia && (
                  <div className="absolute bottom-[-1px] -left-3 w-6 h-6 bg-blue-50 border-b border-l border-blue-100 rounded-bl-full" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                )}
                {!isMia && (
                  <div className="absolute bottom-[-1px] -right-3 w-6 h-6 bg-gray-100 border-b border-r border-gray-200 rounded-br-full" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}></div>
                )}

                {chat.text}
              </div>

              {/* LEO AVATAR (Right) */}
              {!isMia && (
                <div className="shrink-0 z-10 mb-1">
                  <div className="w-14 h-14 rounded-full border-3 border-white shadow-md bg-white overflow-hidden transform hover:scale-110 transition-transform duration-300">
                    <img
                      src={AVATARS.LEO}
                      alt="Leo"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Leo&background=F3F4F6&color=374151"; }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}