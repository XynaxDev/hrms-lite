import * as React from 'react';
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const reduceMotion = prefersReducedMotion || isMobile;
  const allowLogoScrollMotion = !prefersReducedMotion;

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, reduceMotion ? 0 : 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, reduceMotion ? 0 : -150]);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans selection:bg-slate-900 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {reduceMotion ? (
            <>
              <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 blur-[100px]" />
              <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-50/80 to-pink-50/80 blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-emerald-50/60 to-teal-50/60 blur-[120px]" />
            </>
          ) : (
            <>
              <motion.div 
                animate={{ x: [0, 30, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 blur-[100px]" 
              />
              <motion.div 
                animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-50/80 to-pink-50/80 blur-[100px]" 
              />
              <motion.div 
                 style={{ y: y1 }}
                 className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-emerald-50/60 to-teal-50/60 blur-[120px]" 
              />
            </>
          )}
      </div>

      {/* Navbar */}
      {reduceMotion ? (
        <nav
          className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/55 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                <span className="material-symbols-outlined text-xl">blur_on</span>
              </div>
              <span className="text-sm font-black uppercase tracking-[0.15em] text-slate-900">HRMS LITE</span>
            </div>

            <div className="flex flex-1 items-center justify-end md:hidden">
              <button
                onClick={onEnter}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/20 active:scale-95 transition-transform"
              >
                Launch App
              </button>
            </div>

            <div className="hidden md:flex flex-1 items-center justify-end gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/40 bg-gradient-to-b from-white/30 to-white/10 px-2 py-1 backdrop-blur-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5">
                <button onClick={() => scrollToSection('about')} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all">About</button>
                <button onClick={() => scrollToSection('features')} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all">Features</button>
                <button onClick={() => scrollToSection('tech')} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all">Tech Stack</button>
              </div>

              <button 
                onClick={onEnter}
                className="hidden sm:block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Launch App
              </button>
            </div>
          </div>
        </nav>
      ) : (
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/55 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                <span className="material-symbols-outlined text-xl">blur_on</span>
              </div>
              <span className="text-sm font-black uppercase tracking-[0.15em] text-slate-900">HRMS LITE</span>
            </div>

            <div className="flex flex-1 items-center justify-end md:hidden">
              <button
                onClick={onEnter}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/20 active:scale-95 transition-transform"
              >
                Launch App
              </button>
            </div>

            <div className="hidden md:flex flex-1 items-center justify-end gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/40 bg-gradient-to-b from-white/30 to-white/10 px-2 py-1 backdrop-blur-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5">
                <button onClick={() => scrollToSection('about')} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all">About</button>
                <button onClick={() => scrollToSection('features')} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all">Features</button>
                <button onClick={() => scrollToSection('tech')} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all">Tech Stack</button>
              </div>

              <button 
                onClick={onEnter}
                className="hidden sm:block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Launch App
              </button>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white isolate">
        {/* Blurry animated background elements */}
        {reduceMotion ? (
          <>
            <div className="absolute -z-10 top-[8%] left-[4%] w-[520px] h-[520px] rounded-full bg-blue-200/70 blur-[90px] pointer-events-none mix-blend-multiply" />
            <div className="absolute -z-10 top-[22%] right-[6%] w-[480px] h-[480px] rounded-full bg-indigo-200/65 blur-[85px] pointer-events-none mix-blend-multiply" />
            <div className="absolute -z-10 bottom-[18%] left-[12%] w-[420px] h-[420px] rounded-full bg-purple-200/55 blur-[80px] pointer-events-none mix-blend-multiply" />
          </>
        ) : (
          <>
            <motion.div 
              animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -z-10 top-[8%] left-[4%] w-[520px] h-[520px] rounded-full bg-blue-200/70 blur-[90px] pointer-events-none mix-blend-multiply"
            />
            <motion.div 
              animate={{ x: [0, -25, 0], y: [0, -15, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute -z-10 top-[22%] right-[6%] w-[480px] h-[480px] rounded-full bg-indigo-200/65 blur-[85px] pointer-events-none mix-blend-multiply"
            />
            <motion.div 
              animate={{ x: [0, 20, 0], y: [0, -25, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -z-10 bottom-[18%] left-[12%] w-[420px] h-[420px] rounded-full bg-purple-200/55 blur-[80px] pointer-events-none mix-blend-multiply"
            />
          </>
        )}
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-20 text-center lg:pt-48">
          {reduceMotion ? (
            <>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 backdrop-blur-md mb-10 shadow-sm border-t-slate-100">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span>Powered by OPEN ROUTER</span>
              </div>

              <h1 className="mx-auto max-w-5xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-8 leading-[0.95]">
                HRMS evolved for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">intelligent teams.</span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 mb-12 leading-relaxed font-medium tracking-tight">
                Redefining workforce management by blending modular design with advanced intelligence. 
                Automate logs, manage people, and scale your culture effortlessly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <button 
                  onClick={onEnter}
                  className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold text-sm tracking-widest uppercase hover:bg-blue-600 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center gap-3 group active:scale-95"
                >
                  Get Started
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </button>
                <button className="h-14 px-10 rounded-2xl bg-white text-slate-800 border border-slate-200 font-bold text-sm tracking-widest uppercase hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center gap-3 shadow-sm active:scale-95">
                  <span className="material-symbols-outlined text-xl text-blue-600">play_circle</span>
                  Watch Demo
                </button>
              </div>
            </>
          ) : (
            <>
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 backdrop-blur-md mb-10 shadow-sm border-t-slate-100"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span>Powered by OPEN ROUTER</span>
              </motion.div>
              
              <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto max-w-5xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-8 leading-[0.95]"
              >
                HRMS evolved for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">intelligent teams.</span>
              </motion.h1>
              
              <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 mb-12 leading-relaxed font-medium tracking-tight"
              >
                 Redefining workforce management by blending modular design with advanced intelligence. 
                 Automate logs, manage people, and scale your culture effortlessly.
              </motion.p>
      
              <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-5"
              >
                <button 
                  onClick={onEnter}
                  className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold text-sm tracking-widest uppercase hover:bg-blue-600 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center gap-3 group active:scale-95"
                >
                  Get Started
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </button>
                <button className="h-14 px-10 rounded-2xl bg-white text-slate-800 border border-slate-200 font-bold text-sm tracking-widest uppercase hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center gap-3 shadow-sm active:scale-95">
                   <span className="material-symbols-outlined text-xl text-blue-600">play_circle</span>
                   Watch Demo
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

        {/* Dashboard Preview */}
        {reduceMotion ? (
          <div className="mt-16 relative mx-auto max-w-6xl perspective-[2000px] mb-10 group">
            <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-2 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
                <div className="rounded-xl overflow-hidden bg-slate-50 aspect-[16/9] relative shadow-inner group cursor-pointer">
                    <img 
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
                        alt="App Dashboard" 
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                    />
                     <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors"></div>
                     
                     {/* Overlay Card - Smart Analytics */}
                     <div
                        className="absolute bottom-3 left-3 sm:bottom-8 sm:left-8 bg-white/95 backdrop-blur-xl p-3 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 max-w-[200px] sm:max-w-[280px] z-20"
                     >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                    <span className="material-symbols-outlined text-2xl">insights</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Analytics Core</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[10px] font-bold text-emerald-600">Live Insights</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-100 italic">
                                "3 employees on leave today. Suggesting meeting reschedule for optimal team availability."
                            </p>
                        </div>
                     </div>
                </div>
            </div>
          </div>
        ) : (
          <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              className="mt-16 relative mx-auto max-w-6xl perspective-[2000px] mb-10 group"
          >
              <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-2 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
                  <div className="rounded-xl overflow-hidden bg-slate-50 aspect-[16/9] relative shadow-inner group cursor-pointer">
                      <img 
                          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
                          alt="App Dashboard" 
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                      />
                       <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors"></div>
                       
                       {/* Overlay Card - Smart Analytics */}
                       <motion.div 
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="absolute bottom-3 left-3 sm:bottom-8 sm:left-8 bg-white/95 backdrop-blur-xl p-3 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 max-w-[200px] sm:max-w-[280px] z-20"
                       >
                          <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                      <span className="material-symbols-outlined text-2xl">insights</span>
                                  </div>
                                  <div>
                                      <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Analytics Core</h3>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                          <span className="text-[10px] font-bold text-emerald-600">Live Insights</span>
                                      </div>
                                  </div>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-100 italic">
                                  "3 employees on leave today. Suggesting meeting reschedule for optimal team availability."
                              </p>
                          </div>
                       </motion.div>
                  </div>
              </div>
          </motion.div>
        )}
      
      {/* Infinite Logo Scroll - Professional Polish */}
      <div className="py-16 border-y border-slate-100 bg-slate-50/50 overflow-hidden relative">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
              <div className="text-center mb-12">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-80">Empowering the world's most innovative teams</span>
              </div>
              
              <div className="relative">
                  {/* Premium Masking for smooth edge fading */}
                  <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-slate-50/50 to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-slate-50/50 to-transparent z-10 pointer-events-none"></div>
                  
                  <motion.div 
                    animate={allowLogoScrollMotion ? { x: ["0%", "-50%"] } : undefined}
                    transition={allowLogoScrollMotion ? { duration: isMobile ? 80 : 50, repeat: Infinity, ease: "linear" } : undefined}
                    className="flex gap-28 whitespace-nowrap items-center"
                  >
                    {[...Array(2)].map((_, i) => (
                        <React.Fragment key={i}>
                            {[
                                { name: 'Acme Corp', logo: '/logos/acme.svg' },
                                { name: 'GlobalTech', logo: '/logos/globaltech.svg' },
                                { name: 'Nebula', logo: '/logos/nebula.svg' },
                                { name: 'CloudScale', logo: '/logos/cloudscale.svg' },
                                { name: 'BlockChain', logo: '/logos/blockchain.svg' },
                                { name: 'GemStones', logo: '/logos/gemstones.svg' },
                                { name: 'SpaceX', logo: '/logos/spacex.svg' },
                                { name: 'GreenEnergy', logo: '/logos/greenenergy.svg' }
                            ].map((company, idx) => (
                                <div key={idx} className="flex items-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer scale-110">
                                    <img 
                                        src={company.logo} 
                                        alt={company.name} 
                                        className="h-8 w-auto object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">${company.name}</span>`;
                                        }}
                                    />
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                  </motion.div>
              </div>
          </div>
      </div>

      {/* About / Showcase Section - Fixing the Gap */}
      <section id="about" className="py-20 relative overflow-hidden bg-slate-50/30">
          <div className="mx-auto max-w-7xl px-6">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                  {reduceMotion ? (
                    <div className="flex-1 text-left">
                      <h2 className="text-sm font-bold text-blue-600 tracking-[0.2em] uppercase mb-4">Intelligent Operations</h2>
                      <h3 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
                          Manage your workforce <br />
                          <span className="text-blue-600">without the chaos.</span>
                      </h3>
                      <p className="text-lg text-slate-600 leading-relaxed mb-8">
                          HRMS Lite isn't just a database; it's a productivity powerhouse. By combining real-time attendance tracking with OpenRouter intelligence, we turn raw data into actionable insights that help your team thrive. 
                      </p>
                      <ul className="space-y-4 mb-10">
                          {[
                              { icon: 'bolt', text: 'Automated attendance reporting' },
                              { icon: 'auto_awesome', text: 'AI-powered leave analysis' },
                              { icon: 'shield', text: 'Privacy-focused data handling' }
                          ].map((item, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                  <span className="material-symbols-outlined text-blue-500 font-black">{item.icon}</span>
                                  {item.text}
                              </li>
                          ))}
                      </ul>
                      <button 
                        onClick={onEnter}
                        className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                      >
                        Explore Workforce Tools
                      </button>
                    </div>
                  ) : (
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 text-left"
                    >
                        <h2 className="text-sm font-bold text-blue-600 tracking-[0.2em] uppercase mb-4">Intelligent Operations</h2>
                        <h3 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
                            Manage your workforce <br />
                            <span className="text-blue-600">without the chaos.</span>
                        </h3>
                        <p className="text-lg text-slate-600 leading-relaxed mb-8">
                            HRMS Lite isn't just a database; it's a productivity powerhouse. By combining real-time attendance tracking with OpenRouter intelligence, we turn raw data into actionable insights that help your team thrive. 
                        </p>
                        <ul className="space-y-4 mb-10">
                            {[
                                { icon: 'bolt', text: 'Automated attendance reporting' },
                                { icon: 'auto_awesome', text: 'AI-powered leave analysis' },
                                { icon: 'shield', text: 'Privacy-focused data handling' }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                    <span className="material-symbols-outlined text-blue-500 font-black">{item.icon}</span>
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                        <button 
                          onClick={onEnter}
                          className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                          Explore Workforce Tools
                        </button>
                    </motion.div>
                  )}
                  
                  {reduceMotion ? (
                    <div className="flex-1 relative">
                      <div className="absolute -inset-6 bg-gradient-to-tr from-blue-100/50 to-indigo-100/50 rounded-[3rem] blur-3xl opacity-60"></div>
                      <div className="relative z-10 p-2 bg-white/50 backdrop-blur-sm border border-white rounded-[2.5rem] shadow-2xl">
                        <img 
                            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                            alt="Team Collaboration" 
                            className="rounded-[2rem] object-cover aspect-video shadow-inner"
                        />
                        {/* Static Status Pill Overlay */}
                        <div className="absolute top-8 right-8 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl border border-white/50 animate-bounce [animation-duration:3s]">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Insight</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex-1 relative"
                    >
                        <div className="absolute -inset-6 bg-gradient-to-tr from-blue-100/50 to-indigo-100/50 rounded-[3rem] blur-3xl opacity-60"></div>
                        <div className="relative z-10 p-2 bg-white/50 backdrop-blur-sm border border-white rounded-[2.5rem] shadow-2xl">
                          <img 
                              src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                              alt="Team Collaboration" 
                              className="rounded-[2rem] object-cover aspect-video shadow-inner"
                          />
                          {/* Static Status Pill Overlay */}
                          <div className="absolute top-8 right-8 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl border border-white/50 animate-bounce [animation-duration:3s]">
                              <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Insight</span>
                              </div>
                          </div>
                        </div>
                    </motion.div>
                  )}
              </div>
          </div>
      </section>



      {/* Features Grid */}
      <section id="features" className="py-32 bg-white relative">
          <div className="mx-auto max-w-7xl px-6">
              <div className="text-center mb-20 max-w-3xl mx-auto">
                  <h2 className="text-sm font-bold text-indigo-600 tracking-widest uppercase mb-3">Core Features</h2>
                  <h3 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">Everything you need to scale</h3>
                  <p className="text-xl text-slate-500 font-light">
                      We focus on the features that actually matter to growing teams, ensuring every interaction feels purposeful.
                  </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      {
                          icon: 'person_search',
                          title: 'People Operations',
                          desc: 'A complete directory of your workforce. Track roles, departments, locations, and status with visual cues.',
                          accent: 'from-blue-100/50 to-blue-50/20',
                          iconColor: 'bg-blue-50 text-blue-600'
                      },
                      {
                          icon: 'calendar_clock',
                          title: 'Time & Attendance',
                          desc: 'Effortless tracking of check-ins and check-outs. Generate monthly CSV reports in seconds.',
                          accent: 'from-emerald-100/50 to-emerald-50/20',
                          iconColor: 'bg-emerald-50 text-emerald-600'
                      },
                      {
                          icon: 'neurology',
                          title: 'AI Insights',
                          desc: 'Powered by Arcee AI Trinity. Ask "Who is on leave?" or "Count employees in Engineering" and get instant answers.',
                          accent: 'from-indigo-100/50 to-indigo-50/20',
                          iconColor: 'bg-indigo-50 text-indigo-600'
                      },
                      {
                          icon: 'shield_lock',
                          title: 'Secure & Private',
                          desc: 'Your data is yours. Built with privacy-first architecture and secure local state management.',
                          accent: 'from-rose-100/50 to-rose-50/20',
                          iconColor: 'bg-rose-50 text-rose-600'
                      },
                      {
                          icon: 'bolt',
                          title: 'Lightning Fast',
                          desc: 'Built on React 18 and Vite. Zero loading states, instant transitions, and buttery smooth animations.',
                          accent: 'from-amber-100/50 to-amber-50/20',
                          iconColor: 'bg-amber-50 text-amber-600'
                      },
                      {
                          icon: 'devices',
                          title: 'Fully Responsive',
                          desc: 'Manage your team from anywhere. The interface adapts perfectly to mobile, tablet, and desktop.',
                          accent: 'from-cyan-100/50 to-cyan-50/20',
                          iconColor: 'bg-cyan-50 text-cyan-600'
                      }
                  ].map((feature, i) => (
                      reduceMotion ? (
                        <div 
                          key={i}
                          className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            <div className="relative z-10">
                              <div className={`h-16 w-16 rounded-2xl border border-white/50 ${feature.iconColor} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-all duration-500`}>
                                  <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                              <p className="text-slate-500 leading-relaxed font-medium text-sm">{feature.desc}</p>
                            </div>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            <div className="relative z-10">
                              <div className={`h-16 w-16 rounded-2xl border border-white/50 ${feature.iconColor} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-all duration-500`}>
                                  <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                              <p className="text-slate-500 leading-relaxed font-medium text-sm">{feature.desc}</p>
                            </div>
                        </motion.div>
                      )
                  ))}
              </div>
          </div>
      </section>

      {/* Tech Stack Section - Enhanced Connection Network */}
      <section id="tech" className="py-40 bg-[#05070a] text-white relative overflow-hidden">
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
          
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 relative z-10">
             <div className="text-center mb-24 relative z-20">
                <h2 className="text-sm font-bold text-blue-400 tracking-[0.3em] uppercase mb-4">Core Ecosystem</h2>
                <h3 className="text-4xl font-bold">Interconnected Stability</h3>
             </div>

             <div className="relative h-[650px] flex items-center justify-center">
                {/* Core Light - Large Radial Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-blue-400/20 rounded-full blur-[60px] pointer-events-none"></div>

                {/* SVG Wiring - Radiant Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                    <defs>
                        <radialGradient id="radiantWire" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="rgba(37,99,235,0.8)" />
                            <stop offset="30%" stopColor="rgba(37,99,235,0.4)" />
                            <stop offset="100%" stopColor="rgba(37,99,235,0)" />
                        </radialGradient>
                    </defs>
                    {[
                        { x: "15%", y: "0%" }, { x: "85%", y: "0%" },
                        { x: "15%", y: "100%" }, { x: "85%", y: "100%" },
                        { x: "0%", y: "35%" }, { x: "100%", y: "35%" },
                        { x: "0%", y: "65%" }, { x: "100%", y: "65%" }
                    ].map((pos, idx) => (
                        reduceMotion ? (
                          <line
                            key={idx}
                            x1="50%" y1="50%" x2={pos.x} y2={pos.y}
                            stroke="url(#radiantWire)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            opacity={1}
                          />
                        ) : (
                          <motion.line 
                              key={idx}
                              initial={{ pathLength: 0, opacity: 0 }}
                              whileInView={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 2.5, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                              x1="50%" y1="50%" x2={pos.x} y2={pos.y} 
                              stroke="url(#radiantWire)" 
                              strokeWidth="2"
                              strokeLinecap="round"
                          />
                        )
                    ))}
                    
                    {/* Background Orbits */}
                    {reduceMotion ? (
                      <>
                        <circle cx="50%" cy="50%" r="200" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5 5" className="opacity-5" />
                        <circle cx="50%" cy="50%" r="300" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5 5" className="opacity-5" />
                      </>
                    ) : (
                      <>
                        <motion.circle initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} cx="50%" cy="50%" r="200" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5 5" className="opacity-5" />
                        <motion.circle initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} cx="50%" cy="50%" r="300" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5 5" className="opacity-5" />
                      </>
                    )}
                </svg>

                {/* Center Node - The Energy Source */}
                {reduceMotion ? (
                  <div className="relative z-30 h-28 w-28 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_100px_rgba(37,99,235,0.6)] border-4 border-white/30 backdrop-blur-md group">
                      <div className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-20"></div>
                      <div className="text-center relative z-10">
                          <span className="material-symbols-outlined text-4xl mb-1 text-white drop-shadow-lg">blur_on</span>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Core Hub</p>
                      </div>
                  </div>
                ) : (
                  <motion.div 
                      initial={{ scale: 0, rotate: -45 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="relative z-30 h-28 w-28 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_100px_rgba(37,99,235,0.6)] border-4 border-white/30 backdrop-blur-md group"
                  >
                      <div className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-20"></div>
                      <div className="text-center relative z-10">
                          <span className="material-symbols-outlined text-4xl mb-1 text-white drop-shadow-lg">blur_on</span>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Core Hub</p>
                      </div>
                  </motion.div>
                )}

                {/* Satellite Nodes with Hover Popups */}
                {[
                    { id: 1, name: 'Supabase', logo: 'supabase.svg', color: 'text-emerald-400', pos: 'top-[0%] left-[15%]', desc: 'Enterprise-grade Postgres with Realtime & Auth.', tagline: 'DATA LAYER' },
                    { id: 2, name: 'Arcee AI', logo: 'arcee.svg', color: 'text-indigo-400', pos: 'top-[0%] right-[15%]', desc: 'Trinity-large-preview model for advanced RAG insights.', tagline: 'INTELLIGENCE' },
                    { id: 3, name: 'FastAPI', logo: 'fastapi.svg', color: 'text-amber-400', pos: 'bottom-[0%] left-[15%]', desc: 'Modern, high-performance web framework for Python.', tagline: 'CORE BACKEND' },
                    { id: 4, name: 'React 18', logo: 'react.svg', color: 'text-blue-400', pos: 'bottom-[0%] right-[15%]', desc: 'Standard for building fluid & responsive UIs.', tagline: 'FRONTEND UI' },
                    { id: 5, name: 'Tailwind', logo: 'tailwind-css.svg', color: 'text-cyan-400', pos: 'top-[35%] left-[0%]', desc: 'Utility-first CSS for professional, sleek designs.', tagline: 'STYLING' },
                    { id: 6, name: 'TypeScript', logo: 'typescript.svg', color: 'text-blue-500', pos: 'top-[35%] right-[0%]', desc: 'Static typing for rock-solid, bug-free codebase.', tagline: 'LANGUAGE' },
                    { id: 7, name: 'Framer', logo: 'framer-motion.svg', color: 'text-pink-400', pos: 'bottom-[35%] left-[0%]', desc: 'Buttery smooth physics-based motion & layouts.', tagline: 'MOTION' },
                    { id: 8, name: 'Pydantic', logo: 'Pydantic.svg', color: 'text-rose-400', pos: 'bottom-[35%] right-[0%]', desc: 'Strict data validation for backend integrity.', tagline: 'VALIDATION' },
                ].map((tech, i) => (
                    reduceMotion ? (
                      <div 
                        key={tech.id}
                        className={`absolute ${tech.pos} group cursor-default z-20`}
                      >
                          {/* Connection Line to Center (Mockup) */}
                          <div className="relative">
                              <div className="h-16 w-32 md:w-40 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md p-4 flex items-center gap-3 hover:border-white/20 transition-all hover:bg-slate-900/60 shadow-xl">
                                  {tech.logo ? (
                                      <img src={`/logos/${tech.logo}`} alt={tech.name} className="h-8 w-8 object-contain" />
                                  ) : (
                                      <span className={`material-symbols-outlined text-2xl ${tech.color}`}>{tech.name ? tech.name.charAt(0) : ''}</span>
                                  )}
                                  <div>
                                      <h4 className="font-bold text-xs">{tech.name}</h4>
                                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">{tech.tagline}</p>
                                  </div>
                              </div>
                              
                              {/* Hover Popup */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-3 rounded-xl bg-white text-slate-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none shadow-2xl z-50">
                                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                                  <p className="text-[11px] leading-relaxed font-medium">{tech.desc}</p>
                              </div>
                          </div>
                      </div>
                    ) : (
                      <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={tech.id} 
                          className={`absolute ${tech.pos} group cursor-default z-20`}
                      >
                          {/* Connection Line to Center (Mockup) */}
                          <div className="relative">
                              <div className="h-16 w-32 md:w-40 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md p-4 flex items-center gap-3 hover:border-white/20 transition-all hover:bg-slate-900/60 shadow-xl">
                                  {tech.logo ? (
                                      <img src={`/logos/${tech.logo}`} alt={tech.name} className="h-8 w-8 object-contain" />
                                  ) : (
                                      <span className={`material-symbols-outlined text-2xl ${tech.color}`}>{tech.name ? tech.name.charAt(0) : ''}</span>
                                  )}
                                  <div>
                                      <h4 className="font-bold text-xs">{tech.name}</h4>
                                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">{tech.tagline}</p>
                                  </div>
                              </div>
                              
                              {/* Hover Popup */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-3 rounded-xl bg-white text-slate-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none shadow-2xl z-50">
                                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                                  <p className="text-[11px] leading-relaxed font-medium">{tech.desc}</p>
                              </div>
                          </div>
                      </motion.div>
                    )
                ))}
             </div>
          </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="mx-auto max-w-4xl px-6 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-sm font-bold text-indigo-600 tracking-widest uppercase mb-3">Questions & Answers</h2>
                  <h3 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">Common Inquiries</h3>
              </div>

              <div className="space-y-4">
                  {[
                      {
                          q: "How does the AI analyze my data?",
                          a: "The HRMS AI uses Retrieval-Augmented Generation (RAG). It securely indexes your employee and attendance data into a temporary context, allowing Arcee AI's Trinity model to answer queries with precise, real-time facts about your workforce."
                      },
                      {
                          q: "Is my employee data secure?",
                          a: "Safety is our priority. We use Supabase's Row Level Security (RLS) to ensure that only authorized admins can access data. Communications are encrypted via SSL, and we don't store your AI query history on our servers."
                      },
                      {
                          q: "Can I customize the dashboard layout?",
                          a: "Yes! The dashboard is designed to be modular. You can toggle widgets, export reports in various formats, and we're currently developing a drag-and-drop interface for deeper customization."
                      },
                      {
                          q: "Does it support international payroll?",
                          a: "While currently focused on attendance and operations, HRMS Lite integrates with external payroll providers through our upcoming API sync feature, allowing you to bridge domestic and international data easily."
                      },
                      {
                          q: "Is the platform mobile-responsive?",
                          a: "Absolutely! The entire HRMS Lite platform is built with a mobile-first approach. Whether you're on a smartphone or a high-res desktop, the layout adjusts automatically to provide a seamless management experience."
                      }
                  ].map((faq, i) => {
                      const [isOpen, setIsOpen] = React.useState(false);
                      return (
                        <div 
                          key={i}
                          className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 open:shadow-md"
                        >
                            <button 
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full flex items-center justify-between p-7 cursor-pointer text-left outline-none"
                            >
                                <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                                <div className={`h-8 w-8 rounded-full border transition-all flex items-center justify-center ${isOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>
                                    <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                </div>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-7 pb-7 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-5">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                      );
                  })}
              </div>
          </div>
      </section>

      {/* Footer - Professional Executive Transition */}
      <footer className="bg-slate-950 text-white pt-32 pb-16 relative overflow-hidden">
          {/* Refined Transition Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent z-20"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-blue-500/10 rounded-full blur-[80px] -z-10 pointer-events-none -translate-y-1/2"></div>
          
          <div className="mx-auto max-w-7xl px-6 relative z-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
                  <div className="col-span-1 md:col-span-1">
                      <div className="flex items-center gap-2 text-white font-bold mb-6">
                        <span className="material-symbols-outlined text-3xl font-black text-blue-500">blur_on</span>
                        <span className="text-xl uppercase tracking-[0.2em]">HRMS Lite</span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                        Revolutionizing workforce management with state-of-the-art design, seamless user experience, and open-source transparency.
                      </p>
                      <div className="flex gap-4">
                          <a href="https://github.com/XynaxDev" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors">
                              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                          </a>
                          <a href="mailto:akashkumar.cs27@gmail.com" className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors">
                              <span className="material-symbols-outlined text-xl">mail</span>
                          </a>
                      </div>
                  </div>

                  <div>
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Ecosystem</h4>
                      <ul className="space-y-4">
                          <li><button onClick={() => scrollToSection('features')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Platform Features</button></li>
                          <li><button onClick={() => scrollToSection('tech')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Technology Stack</button></li>
                          <li><button onClick={onEnter} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Admin Portal View</button></li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">System Security</h4>
                      <div className="bg-slate-900/50 border border-slate-800/60 rounded-[2rem] p-8 shadow-2xl backdrop-blur-sm">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]"></div>
                              <span className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.2em]">Hardened Engine</span>
                          </div>
                          <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-blue-500 text-sm">shield_check</span>
                                  <span className="text-[11px] text-slate-300 font-bold uppercase tracking-tighter">Vulnerability Shield Active</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-indigo-500 text-sm">lock</span>
                                  <span className="text-[11px] text-slate-300 font-bold uppercase tracking-tighter">End-to-End Encryption</span>
                              </div>
                          </div>
                          <p className="mt-6 text-[10px] text-slate-500 leading-relaxed font-medium pt-5 border-t border-slate-800">
                             Protected by standard encryption and rate-limiting protocols. Data leakage protection enabled.
                          </p>
                      </div>
                  </div>
              </div>

              <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] text-slate-500 font-medium tracking-tight">© 2026 HRMS Enterprise Systems. All rights reserved.</p>
                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em] opacity-40">Engineered with passion by Akash Kumar</p>
                  </div>
                  <div className="flex gap-8">
                      <a href="#" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
                      <a href="#" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Terms of Service</a>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;