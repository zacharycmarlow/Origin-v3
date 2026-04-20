import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoldCompassRose } from '@/components/GoldCompassRose';
import { TealTreeRoots } from '@/components/TealTreeRoots';
import { SpiralOrb } from '@/components/SpiralOrb';
import { BrushstrokeLabel } from '@/components/BrushstrokeLabel';
import { GoldVineDivider } from '@/components/GoldVineDivider';
import { GoldFrame } from '@/components/GoldFrame';
import { Brain, Lightbulb, Circle } from 'lucide-react';

export default function OriginHome() {
  const [activeNav, setActiveNav] = useState(0);
  const [activeMenu, setActiveMenu] = useState(0);
  const [reflectionText, setReflectionText] = useState('');

  // Simple scroll spy could go here
  
  return (
    <div className="min-h-screen w-full selection:bg-[#4AC4B4] selection:text-white pb-32">
      {/* Fixed Header Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 pt-6 px-8 pointer-events-none">
        <div className="max-w-4xl mx-auto relative h-16 pointer-events-auto">
          {/* Gold connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#C4A35A] opacity-40 -translate-y-1/2" />
          
          <div className="flex justify-between items-center h-full relative">
            {[
              { id: 0, icon: <GoldCompassRose className="w-8 h-8" active={activeNav === 0} />, label: "Journey" },
              { id: 1, icon: <Brain className="w-5 h-5 text-[#C4A35A]" strokeWidth={1.5} />, label: "Memory" },
              { id: 2, icon: <Lightbulb className="w-5 h-5 text-[#C4A35A]" strokeWidth={1.5} />, label: "Thought" },
              { id: 3, icon: <Circle className="w-5 h-5 text-[#C4A35A]" strokeWidth={1.5} />, label: "Present" },
            ].map((item, i) => (
              <div 
                key={item.id}
                className="relative group cursor-pointer flex flex-col items-center justify-center bg-[#F0E8D8] px-4"
                onClick={() => setActiveNav(i)}
              >
                <div className={`relative flex items-center justify-center w-10 h-10 transition-all duration-500 ${activeNav === i ? 'scale-110' : 'scale-100 hover:scale-105'}`}>
                  {/* Diamond node background */}
                  <div className="absolute inset-0 rotate-45 border border-[#C4A35A] opacity-30" />
                  {item.id === 0 ? item.icon : React.cloneElement(item.icon as React.ReactElement, { 
                    className: `w-5 h-5 transition-colors duration-500 ${activeNav === i ? 'text-[#4AC4B4] drop-shadow-[0_0_8px_rgba(74,196,180,0.8)]' : 'text-[#C4A35A] group-hover:text-[#D4B56A]'}`
                  })}
                </div>
                <span className={`absolute -bottom-6 font-display text-[10px] tracking-widest transition-opacity duration-300 ${activeNav === i ? 'opacity-100 text-[#3DB8A8]' : 'opacity-0 group-hover:opacity-70 text-[#C4A35A]'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="pt-32">
        {/* INNER ATLAS - Hero */}
        <section className="relative min-h-[80vh] flex items-center justify-center py-20 px-8">
          <div className="absolute inset-0 watercolor-wash-warm pointer-events-none opacity-50" />
          
          {/* Tree Roots Background */}
          <div className="absolute bottom-0 left-0 w-1/3 h-2/3 pointer-events-none opacity-60 mix-blend-multiply">
            <TealTreeRoots />
          </div>

          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="flex flex-col items-start gap-12"
            >
              <div>
                <h1 className="text-6xl md:text-8xl font-display text-[#8B7355] leading-none mb-4 tracking-[0.15em]">
                  Inner<br/>Atlas
                </h1>
                <p className="text-xl md:text-2xl text-[#6B5A40] italic max-w-md leading-relaxed tracking-wide">
                  A cartography of the self. The space between memory and becoming.
                </p>
              </div>

              <div className="flex flex-col gap-4 items-start">
                {['Inner Atlas', 'Reflections', 'Seeds of Thought', 'Intentions'].map((label, i) => (
                  <BrushstrokeLabel 
                    key={label}
                    active={activeMenu === i}
                    onClick={() => setActiveMenu(i)}
                  >
                    {label}
                  </BrushstrokeLabel>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              className="relative flex justify-center items-center"
            >
              <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px]">
                <SpiralOrb />
              </div>
            </motion.div>
          </div>
          
          {/* Gold Slider */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-8 flex items-center justify-center">
            <div className="w-full h-[1px] bg-[#C4A35A] opacity-50" />
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-6 border border-[#C4A35A] rotate-45 bg-[#F0E8D8] shadow-[0_0_10px_rgba(196,163,90,0.5)] cursor-grab" />
          </div>
        </section>

        <GoldVineDivider />

        {/* ORIGIN SECTION */}
        <section className="relative min-h-[60vh] py-24 px-8 flex justify-center">
          <div className="absolute inset-0 watercolor-wash-warm pointer-events-none opacity-70" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-3xl w-full"
          >
            <h2 className="text-4xl font-display text-[#8B7355] text-center tracking-[0.2em] mb-16">Origin</h2>
            
            <GoldFrame cornerSize={60} className="bg-white/5 backdrop-blur-sm">
              <div className="p-4 md:p-8">
                <p className="text-2xl leading-loose text-[#3A3530] mb-12 italic">
                  Where does the thread begin? Trace back the fibers of your current state. What dormant seeds are waiting to be acknowledged?
                </p>
                
                <div className="flex flex-col gap-6">
                  <input type="text" className="ink-input" placeholder="Today, I noticed..." />
                  <input type="text" className="ink-input" placeholder="A recurring memory is..." />
                  <input type="text" className="ink-input" placeholder="" />
                </div>
              </div>
            </GoldFrame>
          </motion.div>
        </section>

        <GoldVineDivider />

        {/* CALLING SECTION */}
        <section className="relative min-h-[70vh] py-24 px-8 flex justify-center">
          <div className="absolute inset-0 watercolor-wash-teal pointer-events-none opacity-50" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-5xl w-full"
          >
            <h2 className="text-4xl font-display text-[#3DB8A8] text-center tracking-[0.2em] mb-16 teal-text-glow">Calling</h2>
            
            <div className="relative w-full h-[400px] flex items-center justify-center">
              {/* Branching visualization concept */}
              <div className="absolute w-4 h-4 rounded-full bg-[#4AC4B4] teal-glow z-20" />
              
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <div 
                  key={i} 
                  className="absolute w-1/2 h-[1px] origin-left border-t border-dashed border-[#4AC4B4] opacity-40"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className="absolute right-0 -top-1.5 w-3 h-3 rounded-full bg-[#4AC4B4] opacity-60" />
                  <div className="absolute right-8 -top-8 bg-[#F0E8D8]/80 px-3 py-1 font-display text-[10px] tracking-widest text-[#3DB8A8] border border-[#3DB8A8]/30 rounded-sm" style={{ transform: `rotate(${-angle}deg)` }}>
                    {['CREATIVITY', 'STILLNESS', 'CONNECTION', 'MASTERY', 'HEALING'][i]}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <GoldVineDivider />

        {/* VISION SECTION */}
        <section className="relative min-h-[60vh] py-24 px-8 flex justify-center">
          <div className="absolute inset-0 watercolor-wash-warm pointer-events-none opacity-30" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-4xl w-full"
          >
            <h2 className="text-4xl font-display text-[#8B7355] text-center tracking-[0.2em] mb-16">Vision</h2>
            
            <div className="flex flex-col items-center gap-12">
              <p className="text-xl leading-relaxed text-center text-[#5A5040] italic max-w-2xl">
                Where are you going? Plant the seeds of tomorrow in the fertile ground of today.
              </p>
              
              <div className="flex gap-16 justify-center">
                {[1, 2, 3].map((seed) => (
                  <motion.div 
                    key={seed}
                    whileHover={{ scale: 1.1 }}
                    className="relative w-16 h-24 flex items-center justify-center group cursor-pointer"
                  >
                    <svg viewBox="0 0 40 60" className="w-10 h-16 absolute z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 0 C30 20, 40 40, 20 60 C0 40, 10 20, 20 0 Z" className="gold-stroke" strokeWidth="1" fill="none" />
                      <path d="M20 0 C25 20, 30 40, 20 60" className="gold-stroke" strokeWidth="0.5" opacity="0.5" />
                    </svg>
                    <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-[#4AC4B4] opacity-0 group-hover:opacity-100 group-hover:teal-glow transition-all duration-700" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <GoldVineDivider />

        {/* CONSCIOUSNESS ARCHIVE */}
        <section className="relative min-h-[80vh] py-24 px-8 flex justify-center">
          <div className="max-w-6xl w-full">
            <h2 className="text-4xl font-display text-[#8B7355] text-center tracking-[0.2em] mb-20">Consciousness Archive</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { date: "IX . XI . MMXXIV", text: "The realization that urgency is often a disguise for fear. A slow unraveling of the need to perform." },
                { date: "X . XII . MMXXIV", text: "Found a quiet space beneath the noise today. The answers were already there, just waiting for the water to clear." },
                { date: "II . I . MMXXV", text: "Roots go deeper when the wind blows hard. Embracing the friction." },
                { date: "IV . II . MMXXV", text: "A strange resonance with an old memory. Why does it return now? What is it asking to be integrated?" },
              ].map((entry, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  className="relative p-6 group cursor-pointer"
                >
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#C4A35A]/60 transition-colors duration-300 group-hover:border-[#4AC4B4]" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#C4A35A]/60 transition-colors duration-300 group-hover:border-[#4AC4B4]" />
                  
                  <div className="text-[10px] font-display text-[#C4A35A] tracking-widest mb-4 group-hover:text-[#3DB8A8] transition-colors duration-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4AC4B4] opacity-0 group-hover:opacity-100 group-hover:teal-glow transition-all duration-500" />
                    {entry.date}
                  </div>
                  <p className="text-lg leading-relaxed text-[#5A5040] italic">
                    "{entry.text}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer subtle mark */}
        <div className="w-full flex justify-center py-12">
          <div className="w-2 h-2 rotate-45 bg-[#C4A35A] opacity-50" />
        </div>
      </main>
    </div>
  );
}
