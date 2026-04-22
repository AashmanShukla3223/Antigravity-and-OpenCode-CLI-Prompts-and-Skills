import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen01Icon, 
  LibraryIcon, 
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Store01Icon,
  Tick01Icon
} from 'hugeicons-react';
import { ApplePayFramework } from './AppleWallet';

interface Chapter {
  id: number;
  codename: string;
  title: string;
  era: string;
  description: string;
}

const chapters: Chapter[] = [
  { 
    id: 1, 
    codename: "Shreya Ghosh", 
    title: "The Pioneer", 
    era: "Apple I, II, III (1976-1984)", 
    description: `### Apple I (1976): The Foundation in a Garage
Designed and hand-built by Steve Wozniak, the Apple I was a single-board computer sold as a kit. It debuted at the Homebrew Computer Club and was marketed by Steve Jobs as Apple’s first product, requiring users to provide their own keyboard, monitor, and housing.

### Apple II (1977): The Catalyst for Personal Computing
The Apple II was a breakthrough, featuring color graphics, a built-in keyboard, and expansion slots. It became the first "appliance" computer, and with the release of VisiCalc (the first spreadsheet program) in 1979, it transitioned from a hobbyist machine to a vital business tool.

### Apple III (1980): The Challenges of Professional Ambition
Intended as the successor to the Apple II for the business market, the Apple III suffered from significant hardware reliability issues due to its fanless design and cramped internal layout. Despite later revisions, it struggled to gain traction against the rising competition from the IBM PC.

### The Evolution Toward 1984: Lisa and the Macintosh
As the Apple II series continued to evolve (with the IIe and IIc), Apple shifted focus toward graphical user interfaces. This era culminated in the 1983 release of the Apple Lisa and the landmark 1984 launch of the Macintosh, which redefined the industry with its mouse-driven interface.`
  },
  { 
    id: 2, 
    codename: "Bhavya Gupta", 
    title: "The PowerPC Era", 
    era: "G3, G4, G5 (1997-2006)", 
    description: `### The G3 Era: The Return of Steve Jobs (1997–1999)
The Power Macintosh G3 (1997) was the first Mac to use the PowerPC G3 processor, designed specifically for Mac OS. This era saw the debut of the "Bondi Blue" iMac G3 (1998), the all-in-one that saved Apple by famously shipping without a floppy drive and introducing USB to the masses.

### The G4 Era: The "Supercomputer" (1999–2003)
Marketed as the world's first personal supercomputer due to the Velocity Engine (AltiVec) processing power, the Power Mac G4 "Graphite" defined a new age. This era also produced the Power Mac G4 Cube (2000), a stunning 8-inch suspended glass cube that became a permanent fixture in the MoMA.

### The G5 Era: The 64-Bit Powerhouse (2003–2006)
The "Cheese Grater" Power Mac G5 (2003) was the world's first 64-bit personal computer, housed in a massive anodized aluminum chassis. The iMac G5 (2004) followed, setting the blueprint for every future iMac by integrating the entire computer behind the display.`
  },
  { 
    id: 3, 
    codename: "Shweta Verma", 
    title: "The Unix Rebel", 
    era: "Mac OS X (2001-2019)", 
    description: `### Mac OS X 10.0 Cheetah to 10.4 Tiger
Starting with Cheetah in 2001, Apple introduced the Aqua interface and the Unix-based Darwin core. Tiger (10.4) brought Spotlight and Dashboard, solidifying the modern Mac experience.

### OS X 10.7 Lion to 10.11 El Capitan
Lion brought iOS-inspired features like Launchpad and Full-Screen apps. Yosemite (10.10) introduced a flat, translucent design language that paved the way for modern macOS aesthetics.

### macOS 10.12 Sierra to 10.15 Catalina
The era saw the renaming to macOS, the introduction of Siri to the Mac, and the final transition away from 32-bit apps in Catalina, setting the stage for the next leap in hardware.`
  },
  { 
    id: 4, 
    codename: "Vantya Sharma", 
    title: "The Intel Identity Crisis", 
    era: "The Transition (2006-2020)", 
    description: `### The Great Intel Transition (2006)
Steve Jobs announced the move from PowerPC to Intel processors at WWDC 2005, citing the "Megahertz Myth" limitations. This led to the birth of the MacBook Pro and the first Intel-based iMacs.

### The "Unibody" Evolution
Apple refined industrial design with the introduction of the Unibody MacBook and MacBook Pro in 2008, focusing on precision manufacturing and battery longevity.

### Reaching the Thermal Limit
As the Intel era matured, Apple pushed the limits of thinness and performance, leading to the thermal challenges of the late 2010s. This identity crisis fueled the secret development of custom silicon to regain control over the Mac's destiny.`
  },
  { 
    id: 5, 
    codename: "Vanya Chaudhary", 
    title: "The M-Series Valedictorian", 
    era: "Sovereign Silicon (2020-Present)", 
    description: `### Apple M1: The Revolution Begins (2020)
The M1 marked Apple's historic transition to custom silicon. Built on a 5nm process, it delivered a massive leap in performance-per-watt, enabling the MacBook Air to achieve 20 hours of battery life without a fan.

### Apple M3: The 3nm Breakthrough (2023)
The M3 family was the first in the industry to use the 3nm process, introducing "Dynamic Caching" and hardware-accelerated Ray Tracing, bringing gaming performance to new heights.

### Apple M4: The AI Powerhouse (2024)
Specifically optimized for "Apple Intelligence," the M4 features a redesigned Neural Engine capable of 38 trillion operations per second (TOPS), ushering in the age of on-device AI.

### Apple M5 Max: The Multitasker Powerhouse (2026)
Also Specifically Designed for "Apple Intelligence" with local AI models in mind, the M5 Max features 6 Super Cores and an unprecedented 600GB+ of Memory Bandwidth Plus It comes with integrated GPU's Neural Accelators which is over 6x the peak AI performance compared to an M1 Max MacBook Pro.`
  },
  { 
    id: 6, 
    codename: "Divya Khanna", 
    title: "The A-Series Mobile Brain", 
    era: "A4-A19 Pro (2010-2026)", 
    description: `### A4-A7: Pioneering Custom Silicon
The A4 (2010) was Apple's first custom SoC for the iPhone 4. The A7 (2013) shocked the industry as the world's first 64-bit mobile chip, moving the "Mobile Brain" into professional territory.

### A11-A14 Bionic: The Neural Engine
With the A11 Bionic (2017), Apple introduced the first Neural Engine for FaceID and AI tasks. Each generation since has expanded the "Mobile Brain" concept, turning the iPhone into a cognitive organ.

### A17 Pro to A19: The 3nm Future
The A17 Pro brought hardware ray tracing, while the A19 Pro (2025) integrates neural accelerators directly into the GPU, enabling unprecedented on-device intelligence as new local models comes out from Apple.`
  },
  { 
    id: 7, 
    codename: "Aditi Kumari", 
    title: "The Modern Face", 
    era: "macOS 11-Tahoe (2020-2026)", 
    description: `### Big Sur and the Unified UI
macOS 11 Big Sur brought the biggest design overhaul since Mac OS X, unifying the visual language across iPhone, iPad, and Mac with translucent layers and rounded corners.

### Sequoia and iPhone Mirroring
macOS Sequoia (2024) introduced iPhone Mirroring, allowing Mac users to interact with their iPhone apps directly on the desktop, further blurring the lines between platforms.

### macOS 26 Tahoe: Liquid Glass
The pinnacle of the "Modern Face," macOS Tahoe introduces the "Liquid Glass" aesthetic. With refractive interfaces, a dedicated Phone app, and deep Apple Intelligence integration, it represents the complete realization of the Sovereign Ecosystem.`
  },
  { 
    id: 8, 
    codename: "Aadhya Sharma", 
    title: "The Utility Guardian", 
    era: "System Stability & Utilities", 
    description: `### The Birth of Activity Monitor (2003)
With Mac OS X 10.3 Panther, Apple combined Process Viewer and CPU Monitor into Activity Monitor, providing the "Utility Guardian" with a unified view of system health.

### The Shell Evolution: Bash to Zsh
In 2019, macOS Catalina switched the default shell to Zsh, offering modern features and improved customization for developers relying on the Terminal gateway.

### Tahoe Utility Evolution
In macOS Tahoe, Terminal adopts the Liquid Glass look with 24-bit color support, while Activity Monitor gains granular insights into neural engine workloads, ensuring the system remains stable and efficient.`
  },
  { 
    id: 9, 
    codename: "Ginni Tandon", 
    title: "The AI Classroom", 
    era: "Xcode Evolution", 
    description: `### The Xcode Revolution
Ginni Tandon represents the pedagogical shift in development. Xcode 1.0 (2003) laid the foundation of Fix while Compiling Feature, but the journey to Xcode 26.4 and beyond introduced Neural Autocomplete, Liquid Logic Plus Vibe Coding with Anthropic, OpenAI or local models, turning the IDE into an AI-powered classroom.

### Intelligent Assistance
From the early days of Project Builder to the sophisticated LLM-integrated playgrounds of Tahoe, the Guardian ensures every line of code is backed by Sovereign intelligence.`
  },
  { 
    id: 10, 
    codename: "Saanvi Singh", 
    title: "The Artistic Soul", 
    era: "Final Cut & Logic Pro", 
    description: `### Creative Sovereignty
Saanvi Singh anchors the creative suite. Final Cut Pro (originally acquired from Macromedia) and Logic Pro have evolved into the industry standard for silicon-native media production.

### Liquid Media Engine
In the Tahoe era, these tools utilize the M5 Max's dedicated media engines to handle 8K spatial video and neural audio mastering with zero latency, preserving the artistic soul of the ecosystem.`
  },
  { 
    id: 11, 
    codename: "Ananya Kumari", 
    title: "The Modern Architect", 
    era: "The Swift Language", 
    description: `### Safety and Performance
Ananya Kumari defines the architectural DNA. Swift, introduced in 2014, replaced Objective-C as the modern, type-safe foundation for all Apple platforms.

### SwiftUI and Beyond
The evolution continued with SwiftUI, enabling declarative "Liquid Glass" interfaces that are inherently reactive. The Guardian oversees the language's growth into a silicon-native powerhouse.`
  },
  { 
    id: 12, 
    codename: "Hamdiya Fatima", 
    title: "The Noble Greeter", 
    era: "Setup Assistant (Tiger-Tahoe)", 
    description: `### The First Hello
Hamdiya Fatima welcomes every user. From the iconic "Welcome" videos of OS X Tiger and Snow Leopard to the neural-authenticated setup of Tahoe, the Noble Greeter ensures a seamless transition.

### Accessibility-First
The Setup Assistant has evolved to be the most inclusive entry point in computing, integrating Vision, Motor, and Hearing assistance from the very first boot.`
  },
  { 
    id: 13, 
    codename: "Samriddhi Jain", 
    title: "The Founding Soul", 
    era: "68K / Classic OS", 
    description: `### The 68000 Origins
Samriddhi Jain preserves the foundational memory. The early Macintosh (1984) ran on the Motorola 68000 series, defined by the original System Software and the "Finder" we still use today.

### Legacy Bridges
Even in the Tahoe era, the Founding Soul ensures that the principles of the original 128K Mac—simplicity and user-centricity—remain at the core of the Liquid Glass experience.`
  },
  { 
    id: 14, 
    codename: "Afifa Khan", 
    title: "The Shield", 
    era: "Security & FileVault", 
    description: `### Hardened Core
Afifa Khan represents the impenetrable layer. From the introduction of FileVault in Panther to the Neural Secure Enclave of Tahoe, the Shield protects the Sovereign user's data.

### Privacy-Native
Security is not a feature; it's the foundation. The Guardian ensures that Apple Intelligence processing happens on-device, maintaining the absolute privacy of the "Her" Ecosystem.`
  },
  { 
    id: 15, 
    codename: "Mishthi Khanna", 
    title: "The Bridge", 
    era: "iCloud & Continuity", 
    description: `### Seamless Sync
Mishthi Khanna connects the ecosystem. Handoff, Universal Control, and Sidecar have turned a collection of devices into a single, unified workspace.

### Neural Continuity
In Tahoe, the Bridge uses neural snapshots to predict which device you'll use next, ensuring your windows and state are already there before you even pick up your iPhone.

### Apple Ecosystem
With the latest release, Together, Your Apple Devices makes a seamless connection between your iPhone, iPad, Watch, AirPods, Mac, TV, all controlling each other together with AirDrop, CarPlay and Handoff that makes connecting effortless.`
  },
  { 
    id: 16, 
    codename: "Priya Tiwari", 
    title: "The Athlete", 
    era: "Metal & GPU", 
    description: `### Raw Performance
Priya Tiwari drives the graphical engine. Metal API (2014) replaced OpenGL, providing direct access to the GPU and enabling console-quality gaming on the Mac.

### Metal 4 and Ray Tracing
The Athlete pushes the M5 Max to its limits, enabling real-time ray tracing and liquid-glass refraction that defines the visual hallmark of macOS Tahoe.`
  },
];

export const AppleBooks: React.FC = () => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [view, setView] = useState<'library' | 'reader' | 'store'>('store');
  const [isPurchased, setIsPurchased] = useState(false);
  const [showApplePay, setShowApplePay] = useState(false);

  const progress = ((currentChapterIndex + 1) / chapters.length) * 100;

  const handleBuy = () => {
    setShowApplePay(true);
  };

  const handlePaymentSuccess = () => {
    setIsPurchased(true);
    setShowApplePay(false);
    setView('library');
  };

  return (
    <div className="flex h-full w-full bg-[#fdfdfd] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-serif">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-white/5 p-6 flex flex-col gap-6 font-sans">
        <h2 className="text-xl font-bold tracking-tight px-2">Apple Books</h2>
        
        <div className="space-y-1">
          {[
            { name: 'Reading Now', icon: BookOpen01Icon, id: 'reader', disabled: !isPurchased },
            { name: 'Library', icon: LibraryIcon, id: 'library', disabled: false },
            { name: 'Store', icon: Store01Icon, id: 'store', disabled: false },
          ].map(item => (
            <div 
              key={item.name}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors 
                ${view === item.id ? 'bg-zinc-200 dark:bg-white/10' : 'hover:bg-zinc-200/50 dark:hover:bg-white/5 text-zinc-500'}
                ${item.disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
              onClick={() => { if(!item.disabled) setView(item.id as any); }}
            >
              <item.icon size={18} className="hugeicon-tahoe" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
          ))}
        </div>

        {isPurchased && (
          <div className="mt-auto font-sans">
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
               <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Active Journey</div>
               <div className="text-xs font-bold truncate mb-1">The "Her" Ecosystem</div>
               <div className="w-full h-1 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12 scrollbar-hide flex justify-center">
        <AnimatePresence mode="wait">
          {view === 'store' ? (
            <motion.div 
              key="store"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl font-sans"
            >
              <h1 className="text-4xl font-black mb-2 tracking-tight italic text-blue-500">Book Store</h1>
              <p className="text-zinc-500 mb-12">Discover the stories that shaped the Sovereign Genealogy.</p>
              
              <div className="flex gap-12 bg-zinc-100/50 dark:bg-white/5 p-8 rounded-[40px] border border-zinc-200 dark:border-white/10 shadow-xl">
                 <div className="w-64 h-80 rounded-lg overflow-hidden shadow-2xl flex-shrink-0 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#333]" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between border border-white/10 rounded-lg">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Volume I</div>
                          <h2 className="text-2xl font-serif font-bold text-white leading-tight">The History of Apple: The "Her" Ecosystem</h2>
                        </div>
                        <div className="text-xs font-medium text-white/70 italic">Aashman Shukla</div>
                    </div>
                 </div>
                 
                 <div className="flex flex-col justify-center font-sans">
                    <div className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black w-fit mb-4 uppercase tracking-widest">New Release</div>
                    <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight">The History of Apple: <br/>The "Her" Ecosystem</h2>
                    <p className="text-zinc-500 mb-8 max-w-sm leading-relaxed">A definitive 16-chapter chronicle exploring the Guardians of the Codebase and the architectural evolution of the Tahoe era.</p>
                    
                    <button 
                      onClick={handleBuy}
                      disabled={isPurchased}
                      className="w-48 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-500 text-white rounded-full font-bold transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      {isPurchased ? <Tick01Icon size={20} /> : 'Buy $0.99'}
                    </button>
                 </div>
              </div>
            </motion.div>
          ) : view === 'library' ? (
            <motion.div 
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl font-sans"
            >
              <h1 className="text-4xl font-black mb-8 tracking-tight italic">Library</h1>
              
              {!isPurchased ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[40px] text-zinc-400">
                   <LibraryIcon size={48} className="mb-4 opacity-20" />
                   <p>Your library is empty. Visit the Store to start your journey.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div 
                    className="group relative w-64 h-80 rounded-lg overflow-hidden shadow-2xl cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setView('reader')}
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#333]" />
                     <div className="absolute inset-0 p-6 flex flex-col justify-between border border-white/10 rounded-lg">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Volume I</div>
                          <h2 className="text-2xl font-serif font-bold text-white leading-tight">The History of Apple: The "Her" Ecosystem</h2>
                        </div>
                        <div className="text-xs font-medium text-white/70 italic">Aashman Shukla</div>
                     </div>
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="w-64 flex justify-between items-center px-1">
                     <span className="text-sm font-bold text-zinc-500">Purchased</span>
                     <Tick01Icon size={16} className="text-blue-500" />
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="reader"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              <div className="flex items-center justify-between w-full mb-12 font-sans text-zinc-400">
                <button onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}><ArrowLeft01Icon size={20} /></button>
                <div className="text-[10px] font-bold uppercase tracking-widest">Chapter {chapters[currentChapterIndex].id} of {chapters.length}</div>
                <button onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}><ArrowRight01Icon size={20} /></button>
              </div>

              <div className="w-full text-center mb-12">
                <h3 className="text-sm font-sans font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">{chapters[currentChapterIndex].era}</h3>
                <h2 className="text-5xl font-bold mb-2 tracking-tight leading-tight">{chapters[currentChapterIndex].codename}</h2>
                <div className="text-xl italic text-zinc-500">{chapters[currentChapterIndex].title}</div>
              </div>

              <div className="w-full text-xl leading-relaxed text-zinc-800 dark:text-zinc-200 space-y-8 font-serif">
                {chapters[currentChapterIndex].description.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('###')) {
                    return (
                      <h3 key={pIdx} className="text-2xl font-sans font-bold text-zinc-900 dark:text-white mt-12 mb-4 tracking-tight">
                        {paragraph.replace('###', '').trim()}
                      </h3>
                    );
                  }
                  return (
                    <p key={pIdx} className={pIdx === 0 ? "first-letter:text-7xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:mt-3 first-letter:text-zinc-900 dark:first-letter:text-white" : ""}>
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showApplePay && (
        <ApplePayFramework 
          amount="$0.99"
          itemName="The History of Apple: The Her Ecosystem"
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowApplePay(false)}
        />
      )}
    </div>
  );
};
