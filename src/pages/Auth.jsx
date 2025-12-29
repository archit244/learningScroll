import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Layers } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login/Signup
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign Up Logic
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        // Log In Logic
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex items-center justify-center gap-8">
        
        {/* --- LEFT SIDE: THE PHONE SHOWCASE (Hidden on mobile) --- */}
        <div className="hidden md:block w-1/2 relative h-[500px]">
          {/* We simulate the 'Phone' look using CSS borders */}
          <div className="absolute right-0 top-0 border-[8px] border-black rounded-[2rem] overflow-hidden h-full w-[280px] shadow-2xl bg-black">
            {/* The Screen Content */}
            <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white relative">
              {/* Fake Video Feed UI */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
              <h3 className="z-20 font-bold text-xl mb-2 text-center px-4">Learn Physics in 60 Seconds</h3>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md z-20">
                <Layers size={32} className="text-yellow-400" />
              </div>
              <div className="absolute bottom-10 left-4 z-20 flex gap-2">
                 <div className="w-8 h-8 rounded-full bg-red-500"></div>
                 <div className="flex flex-col justify-center">
                   <div className="w-20 h-2 bg-gray-500 rounded mb-1"></div>
                   <div className="w-12 h-2 bg-gray-600 rounded"></div>
                 </div>
              </div>
            </div>
          </div>
          {/* Second Phone (Behind) for style */}
          <div className="absolute right-12 top-6 border-[8px] border-black rounded-[2rem] h-[480px] w-[270px] bg-gray-800 -z-10 transform -rotate-6"></div>
        </div>

        {/* --- RIGHT SIDE: THE LOGIN BOX --- */}
        <div className="w-full md:w-[350px] flex flex-col gap-4">
          
          {/* Box 1: The Form */}
          <div className="bg-white border border-gray-300 rounded-sm p-8 flex flex-col items-center">
            {/* Logo */}
            <h1 className="text-3xl font-bold mb-8 tracking-tighter italic">LearningScroll</h1>

            <form onSubmit={handleAuth} className="w-full flex flex-col gap-2">
              <input
                type="email"
                placeholder="Phone number, username, or email"
                className="w-full bg-gray-50 border border-gray-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-gray-50 border border-gray-300 rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0095f6] text-white font-bold text-sm rounded px-4 py-1.5 mt-2 hover:bg-[#1877f2] transition disabled:opacity-70"
              >
                {loading ? "Loading..." : (isSignUp ? "Sign up" : "Log in")}
              </button>
            </form>

            <div className="flex w-full items-center gap-4 my-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-xs text-gray-400 font-bold">OR</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <button className="text-[#385185] text-sm font-bold flex items-center gap-2">
              Log in with Facebook
            </button>

            {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}
            <button className="text-xs text-[#00376b] mt-3">Forgot password?</button>
          </div>

          {/* Box 2: The Toggle */}
          <div className="bg-white border border-gray-300 rounded-sm p-4 text-center text-sm">
            {isSignUp ? (
              <p>Have an account? <button onClick={() => setIsSignUp(false)} className="text-[#0095f6] font-bold">Log in</button></p>
            ) : (
              <p>Don't have an account? <button onClick={() => setIsSignUp(true)} className="text-[#0095f6] font-bold">Sign up</button></p>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-2">Get the app.</p>
          <div className="flex justify-center gap-2">
            <div className="h-10 w-32 bg-black rounded border border-gray-300 flex items-center justify-center text-white text-xs">App Store</div>
            <div className="h-10 w-32 bg-black rounded border border-gray-300 flex items-center justify-center text-white text-xs">Google Play</div>
          </div>
        </div>
      </div>
    </div>
  );
}