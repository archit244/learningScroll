import React from "react";
import { motion } from "framer-motion";
import { X, BookOpen, Lightbulb, Zap } from "lucide-react";

export default function LessonCard({ data, onClose }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#09090b] text-white overflow-y-auto"
    >
      <div className="sticky top-0 bg-[#09090b]/90 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center z-10">
        <h2 className="text-lg font-bold text-gray-100">Quick Lesson</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-8 pb-20">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight mb-2">
          {data.title}
        </h1>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-3 text-yellow-400">
            <Lightbulb size={20} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Simply Put</h3>
          </div>
          <p className="text-gray-300 leading-relaxed text-lg">
            {data.lesson_data.eli5}
          </p>
        </div>

        <div className="bg-blue-500/10 p-5 rounded-2xl border border-blue-500/20">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Zap size={20} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Think of it like...</h3>
          </div>
          <p className="text-blue-100 leading-relaxed italic">
            "{data.lesson_data.analogy}"
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 text-green-400">
            <BookOpen size={20} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Key Facts</h3>
          </div>
          <ul className="space-y-4">
            {data.lesson_data.how_it_works.map((point, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold border border-green-500/30">
                  {index + 1}
                </span>
                <span className="text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}