import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function CongratsSlide({ data }) {
  return (
    <div className="flex flex-col space-y-10 py-4 h-full justify-center">
      {/* Part 1: Acknowledgment */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={20} strokeWidth={3} />
            <span className="font-black text-[11px] uppercase tracking-[0.3em]">Module Complete</span>
        </div>
        <h2 className="text-4xl font-black text-black tracking-tight leading-tight">
          Now you've mastered {data.topic_name || "this concept"}.
        </h2>
      </div>

      {/* Part 2: Observations/Benefits */}
      <div className="space-y-5">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Real World Observation</h3>
        <ul className="space-y-4">
          {data.observations?.map((item, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className="h-px w-4 bg-black mt-3 shrink-0" />
              <span className="text-lg font-bold text-gray-700 leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Part 3: Deep Dives & Related */}
      <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Continue Your Journey</h3>
        <div className="flex flex-col gap-4">
          {data.related_topics?.map((topic, i) => (
            <div key={i} className="flex items-center gap-3 text-black font-black hover:translate-x-2 transition-transform cursor-pointer group">
              <ArrowRight size={18} className="text-gray-300 group-hover:text-black" /> 
              <span className="text-base">{topic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}