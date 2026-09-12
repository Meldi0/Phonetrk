import React, { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Share2, 
  RefreshCw, 
  MapPin, 
  Heart, 
  Sliders, 
  Sun, 
  Moon, 
  Check, 
  Play, 
  ShoppingBag, 
  Layers, 
  Plus, 
  RotateCcw,
  Sparkle,
  Printer,
  Settings,
  User,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio'); // 'studio', 'customize', 'gallery'
  const [darkMode, setDarkMode] = useState(false);
  
  // Camera & Capture state
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState([
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  ]);

  // Filters state
  const [activeFilter, setActiveFilter] = useState('natural');
  const filters = [
    { id: 'natural', name: 'Natural Glow', css: 'contrast(102%) brightness(105%) saturate(105%)' },
    { id: 'sakura', name: 'Sakura Pink', css: 'sepia(20%) hue-rotate(320deg) brightness(108%) saturate(120%)' },
    { id: 'retro', name: '90s Retro', css: 'sepia(35%) contrast(110%) brightness(95%) saturate(130%)' },
    { id: 'noir', name: 'B&W Noir', css: 'grayscale(100%) contrast(120%) brightness(100%)' },
    { id: 'y2k', name: 'Y2K Pastel', css: 'hue-rotate(270deg) brightness(110%) saturate(115%)' },
  ];

  // Frame Styling state
  const [frameColor, setFrameColor] = useState('lavender');
  const [showLocationStamp, setShowLocationStamp] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [customText, setCustomText] = useState('SnapBooth Studio');
  const [activeSticker, setActiveSticker] = useState('❤️');

  const frameThemes = [
    { id: 'lavender', name: 'Pastel Purple', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-300' },
    { id: 'pink', name: 'Berry Pink', bg: 'bg-rose-100 dark:bg-rose-950', text: 'text-rose-800 dark:text-rose-200', border: 'border-rose-300' },
    { id: 'cream', name: 'Soft Vanilla', bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-900 dark:text-amber-200', border: 'border-amber-200' },
    { id: 'black', name: 'Classic Black', bg: 'bg-zinc-900 text-white', text: 'text-zinc-300', border: 'border-zinc-700' },
    { id: 'neon', name: 'Cyber Neon', bg: 'bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-cyan-300', text: 'text-cyan-300', border: 'border-cyan-500' },
    { id: 'y2k', name: 'Y2K Heart', bg: 'bg-pink-200 dark:bg-pink-900 text-pink-700', text: 'text-pink-800 dark:text-pink-100', border: 'border-pink-400' }
  ];

  // Simulation photos database for session capture simulation
  const posePool = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  ];

  const startAutoSession = () => {
    setIsCapturing(true);
    let poseCounter = 0;
    const newPhotos = [];

    const captureNextPose = () => {
      if (poseCounter >= 4) {
        setIsCapturing(false);
        setActiveTab('customize');
        return;
      }

      setCurrentPoseIndex(poseCounter + 1);
      let count = 3;
      setCountdown(count);

      const timer = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(timer);
          setCountdown('SMILE! 📸');
          
          // Add next photo from pool
          const randomPhoto = posePool[(poseCounter * 2 + Math.floor(Math.random() * 2)) % posePool.length];
          newPhotos.push(randomPhoto);
          setCapturedPhotos([...newPhotos]);

          setTimeout(() => {
            setCountdown(null);
            poseCounter++;
            captureNextPose();
          }, 800);
        }
      }, 900);
    };

    captureNextPose();
  };

  const currentTheme = frameThemes.find(f => f.id === frameColor) || frameThemes[0];
  const currentFilterObj = filters.find(f => f.id === activeFilter) || filters[0];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#121116] text-zinc-100' : 'bg-[#FAFAFC] text-zinc-800'} relative font-sans transition-colors duration-300 selection:bg-purple-200 overflow-x-hidden`}>
      
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/40 dark:bg-purple-950/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-0 w-[30rem] h-[30rem] bg-pink-100/40 dark:pink-950/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-zinc-900/85 border-b border-[#E7E4EC] dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-[#6D5AAE] dark:text-purple-300 shadow-sm">
              <Camera size={20} />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight leading-none text-zinc-900 dark:text-white flex items-center gap-1">
                SnapBooth
              </span>
              <p className="text-[10px] font-bold text-[#6D5AAE] dark:text-purple-400 tracking-wider uppercase mt-0.5">
                K-Style Self Photo Studio
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 bg-zinc-100/80 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
            <button 
              onClick={() => setActiveTab('studio')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'studio' 
                  ? 'bg-[#6D5AAE] text-white shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 hover:bg-white/60 dark:hover:bg-zinc-700/60'
              }`}
            >
              Home / Studio
            </button>
            <button 
              onClick={() => setActiveTab('customize')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'customize' 
                  ? 'bg-[#6D5AAE] text-white shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 hover:bg-white/60 dark:hover:bg-zinc-700/60'
              }`}
            >
              Services & Custom
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'gallery' 
                  ? 'bg-[#6D5AAE] text-white shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 hover:bg-white/60 dark:hover:bg-zinc-700/60'
              }`}
            >
              Community Gallery
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer">
              <User size={15} className="text-[#6D5AAE]" />
              <span>My Account</span>
            </div>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
              aria-label="Toggle Theme"
              title="Ganti Tema"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>

        </div>
      </header>

      {/* HERO TITLE */}
      <section className="text-center pt-8 md:pt-10 pb-6 px-4 max-w-3xl mx-auto">
        <span className="inline-block text-[11px] md:text-xs font-bold tracking-widest text-[#6D5AAE] dark:text-purple-400 uppercase mb-2">
          ☆ K-STYLE SELF PHOTO STUDIO
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
          Aesthetic 4-Cut Photo Studio & Polaroid Maker
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
          Ambil foto strip 4-cut aesthetic langsung dan kustom warna, filter, dan frame.
        </p>
      </section>

      {/* MAIN WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-16">
        
        {(activeTab === 'studio' || activeTab === 'customize') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT: DARK LIVE STUDIO */}
            <div className="lg:col-span-6 xl:col-span-6 bg-[#18171C] text-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-zinc-800 flex flex-col gap-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-zinc-200">
                    LIVE STUDIO: {currentFilterObj.name} | Bandung, West Java
                  </span>
                </div>
                <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  <Settings size={15} />
                </button>
              </div>

              <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-zinc-950 rounded-2xl overflow-hidden shadow-inner border border-zinc-800 flex items-center justify-center">
                
                <img 
                  src={capturedPhotos[0]} 
                  alt="Live Camera View" 
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{ filter: currentFilterObj.css }}
                />

                <div className="absolute inset-4 pointer-events-none border border-white/10 rounded-xl flex flex-col justify-between p-2 sm:p-3">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br" />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const randomPhoto = posePool[Math.floor(Math.random() * posePool.length)];
                    setCapturedPhotos([randomPhoto, ...capturedPhotos.slice(0, 3)]);
                  }}
                  className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white flex items-center gap-1.5 font-medium border border-white/10 hover:bg-black/80 active:scale-95 transition-all"
                >
                  <RefreshCw size={12} />
                  <span>Switch Camera</span>
                </button>

                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white flex items-center gap-1.5 font-medium border border-white/10">
                  <Sparkles size={12} className="text-yellow-400" />
                  <span>Capture Mode: 4-Cut</span>
                </div>

                {isCapturing && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg border border-purple-400/30">
                    POSE {currentPoseIndex} / 4
                  </div>
                )}

                {countdown !== null && (
                  <div className="absolute inset-0 bg-purple-950/70 backdrop-blur-sm flex items-center justify-center z-20">
                    <span className="text-6xl md:text-7xl font-black text-white drop-shadow-xl animate-bounce">
                      {countdown}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <button 
                  onClick={() => {
                    const newPhoto = posePool[Math.floor(Math.random() * posePool.length)];
                    setCapturedPhotos([newPhoto, ...capturedPhotos.slice(0, 3)]);
                  }}
                  className="w-full py-3.5 px-4 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
                >
                  <Camera size={16} />
                  <span>Take First Shot / Single Shot</span>
                </button>

                <button 
                  onClick={startAutoSession}
                  disabled={isCapturing}
                  className="w-full py-3 px-4 bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/60 text-white font-semibold rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Play size={16} fill="currentColor" />
                  <span>4-Pose Mode (Automatic)</span>
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-semibold text-zinc-300">
                    <Sparkles size={12} className="text-[#6D5AAE]" /> Filter Aesthetic
                  </span>
                  <span className="text-[11px]">{currentFilterObj.name} Aktif</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeFilter === filter.id 
                          ? 'bg-purple-600 text-white shadow-sm' 
                          : 'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {activeFilter === filter.id && <Check size={11} />}
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Colors Section */}
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Frame Colors</span>
                  <span className="text-[11px] capitalize">{currentTheme.name}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 text-center font-medium">Pastel</span>
                    <div className="flex gap-1.5 justify-center">
                      <button 
                        onClick={() => setFrameColor('lavender')}
                        className={`w-7 h-7 rounded-lg bg-purple-200 border-2 transition-transform ${frameColor === 'lavender' ? 'border-white scale-110' : 'border-transparent opacity-80'}`}
                        title="Pastel Purple"
                      />
                      <button 
                        onClick={() => setFrameColor('pink')}
                        className={`w-7 h-7 rounded-lg bg-rose-200 border-2 transition-transform ${frameColor === 'pink' ? 'border-white scale-110' : 'border-transparent opacity-80'}`}
                        title="Berry Pink"
                      />
                      <button 
                        onClick={() => setFrameColor('cream')}
                        className={`w-7 h-7 rounded-lg bg-amber-100 border-2 transition-transform ${frameColor === 'cream' ? 'border-white scale-110' : 'border-transparent opacity-80'}`}
                        title="Soft Vanilla"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 text-center font-medium">Classic</span>
                    <div className="flex gap-1.5 justify-center">
                      <button 
                        onClick={() => setFrameColor('black')}
                        className={`w-7 h-7 rounded-lg bg-zinc-900 border-2 transition-transform ${frameColor === 'black' ? 'border-white scale-110' : 'border-zinc-700 opacity-80'}`}
                        title="Classic Black"
                      />
                      <button 
                        onClick={() => setFrameColor('neon')}
                        className={`w-7 h-7 rounded-lg bg-indigo-900 border-2 transition-transform ${frameColor === 'neon' ? 'border-white scale-110' : 'border-transparent opacity-80'}`}
                        title="Cyber Neon"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 text-center font-medium">Special</span>
                    <div className="flex gap-1.5 justify-center">
                      <button 
                        onClick={() => setFrameColor('y2k')}
                        className={`w-7 h-7 rounded-lg bg-pink-300 border-2 transition-transform ${frameColor === 'y2k' ? 'border-white scale-110' : 'border-transparent opacity-80'}`}
                        title="Y2K Heart"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT: DIGITAL RESULT GALLERY & CUSTOMIZER */}
            <div className="lg:col-span-6 xl:col-span-6 bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-[#E7E4EC] dark:border-zinc-800 shadow-sm flex flex-col justify-between gap-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                    {activeTab === 'customize' ? 'Frame Customizer & Preview' : 'Digital Result Gallery'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {activeTab === 'customize' ? 'Kustomisasi stiker, teks, dan format cetak' : 'Hasil jepretan foto strip otomatis ter-generate'}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab(activeTab === 'studio' ? 'customize' : 'studio')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-[#6D5AAE] dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-all"
                >
                  <Sliders size={13} className="inline mr-1" />
                  {activeTab === 'customize' ? 'Mode Studio' : 'Edit Frame'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                
                {/* Vertical Strip Frame Preview */}
                <div className="sm:col-span-6 flex justify-center">
                  <div className={`w-48 sm:w-52 p-3.5 rounded-2xl shadow-xl transition-all duration-300 ${currentTheme.bg} border ${currentTheme.border}`}>
                    
                    <div className="text-center mb-2.5">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${currentTheme.text}`}>
                        ★ {customText || 'SNAPBOOTH STUDIO'} ★
                      </p>
                      {showLocationStamp && (
                        <p className="text-[7px] opacity-75 font-semibold tracking-tight">
                          Bandung, West Java • ID
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {capturedPhotos.map((photo, index) => (
                        <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-inner group">
                          <img 
                            src={photo} 
                            alt={`Pose ${index + 1}`} 
                            className="w-full h-full object-cover"
                            style={{ filter: currentFilterObj.css }}
                          />
                          <span className="absolute bottom-1 right-1 text-[8px] bg-black/40 text-white px-1 rounded font-mono">
                            {activeSticker}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-3 pt-1.5 text-center border-t border-black/10 dark:border-white/10 ${currentTheme.text}`}>
                      {showTimestamp && (
                        <p className="text-[7px] font-mono tracking-tighter opacity-80">
                          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • 12:45 PM
                        </p>
                      )}
                      <p className="text-[6px] font-bold tracking-widest uppercase mt-0.5">K-Style Photobooth</p>
                    </div>

                  </div>
                </div>

                {/* Horizontal Saved Strips or Customizer */}
                <div className="sm:col-span-6 flex flex-col gap-3">
                  {activeTab === 'studio' ? (
                    <div className="flex flex-col gap-3.5">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Saved Layouts
                      </span>

                      {/* Strip 1: Lavender */}
                      <div className="bg-purple-50/80 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-purple-100 dark:border-zinc-700 flex flex-col gap-2">
                        <div className="grid grid-cols-4 gap-1">
                          {capturedPhotos.map((img, i) => (
                            <img key={i} src={img} alt="thumb" className="w-full aspect-[4/3] object-cover rounded" />
                          ))}
                        </div>
                        <div className="w-full h-1 bg-purple-200 rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-[#6D5AAE]" />
                        </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => alert('Photostrip berhasil diunduh dalam kualitas HD!')}
                            className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#6D5AAE] flex items-center gap-1"
                          >
                            <Download size={12} /> Download
                          </button>
                        </div>
                      </div>

                      {/* Strip 2: Rose */}
                      <div className="bg-rose-50/80 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-rose-100 dark:border-zinc-700 flex flex-col gap-2">
                        <div className="grid grid-cols-4 gap-1">
                          {[capturedPhotos[3], capturedPhotos[2], capturedPhotos[1], capturedPhotos[0]].map((img, i) => (
                            <img key={i} src={img} alt="thumb" className="w-full aspect-[4/3] object-cover rounded" />
                          ))}
                        </div>
                        <div className="w-full h-1 bg-rose-200 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-rose-500" />
                        </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => alert('Photostrip berhasil diunduh dalam kualitas HD!')}
                            className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-rose-600 flex items-center gap-1"
                          >
                            <Download size={12} /> Download
                          </button>
                        </div>
                      </div>

                      {/* Strip 3: Noir */}
                      <div className="bg-zinc-100 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col gap-2">
                        <div className="grid grid-cols-4 gap-1">
                          {capturedPhotos.map((img, i) => (
                            <img key={i} src={img} alt="thumb" className="w-full aspect-[4/3] object-cover rounded grayscale" />
                          ))}
                        </div>
                        <div className="w-full h-1 bg-zinc-300 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-zinc-800" />
                        </div>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => alert('Photostrip berhasil diunduh dalam kualitas HD!')}
                            className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 flex items-center gap-1"
                          >
                            <Download size={12} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5 bg-zinc-50/80 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5 block">
                          Stempel Mascot:
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          {['❤️', '🎀', '✨', '🐾', '🌸', '⚡'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => setActiveSticker(emoji)}
                              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                                activeSticker === emoji 
                                  ? 'bg-purple-200 dark:bg-purple-900 border-2 border-[#6D5AAE] scale-105' 
                                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 block">
                          Header Strip Custom:
                        </label>
                        <input 
                          type="text" 
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D5AAE]"
                          maxLength={20}
                        />
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                          <span>Stempel Lokasi (Bandung)</span>
                          <input 
                            type="checkbox" 
                            checked={showLocationStamp}
                            onChange={(e) => setShowLocationStamp(e.target.checked)}
                            className="w-4 h-4 rounded text-[#6D5AAE] focus:ring-[#6D5AAE]"
                          />
                        </label>
                        <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                          <span>Stempel Tanggal Otomatis</span>
                          <input 
                            type="checkbox" 
                            checked={showTimestamp}
                            onChange={(e) => setShowTimestamp(e.target.checked)}
                            className="w-4 h-4 rounded text-[#6D5AAE] focus:ring-[#6D5AAE]"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  onClick={() => alert('Photostrip berhasil diunduh dalam kualitas HD!')}
                  className="flex-1 py-3 px-4 bg-[#6D5AAE] hover:bg-[#5c4a99] text-white font-bold rounded-xl shadow-md shadow-purple-200 dark:shadow-none flex items-center justify-center gap-2 text-xs md:text-sm active:scale-[0.98] transition-all"
                >
                  <Download size={16} />
                  <span>SIMPAN STRIP FOTO</span>
                </button>
                <button 
                  onClick={() => alert('Order fisik berhasil ditambahkan ke keranjang!')}
                  className="py-3 px-5 bg-white dark:bg-zinc-800 border border-[#6D5AAE]/40 hover:bg-purple-50 dark:hover:bg-zinc-700 text-[#6D5AAE] dark:text-purple-300 font-bold rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm active:scale-[0.98] transition-all"
                >
                  <Printer size={16} />
                  <span>PESAN CETAK</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* FULL GALLERY VIEW */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Koleksi Hasil Foto</h2>
                <p className="text-xs text-zinc-500">Semua strip foto yang tersimpan di sesi ini</p>
              </div>
              <span className="text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-[#6D5AAE] dark:text-purple-300 px-3 py-1 rounded-full">
                3 Saved Strips
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-purple-100/90 dark:bg-purple-950/60 p-4 rounded-3xl border border-purple-200 dark:border-purple-800 shadow-sm flex flex-col gap-2.5">
                <div className="text-[10px] font-black text-purple-900 dark:text-purple-200 text-center uppercase tracking-wider">
                  ★ SnapBooth Bandung ★
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {capturedPhotos.map((img, i) => (
                    <img key={i} src={img} className="w-full aspect-[4/3] object-cover rounded-lg" alt="strip item" />
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => alert('Membuka opsi cetak...')} className="flex-1 py-2 bg-white dark:bg-purple-900 text-[#6D5AAE] dark:text-purple-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                    <Printer size={13} /> Cetak
                  </button>
                  <button onClick={() => alert('Link siap dibagikan!')} className="p-2 bg-[#6D5AAE] text-white rounded-xl active:scale-95 transition-all">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-rose-100/90 dark:bg-rose-950/60 p-4 rounded-3xl border border-rose-200 dark:border-rose-800 shadow-sm flex flex-col gap-2.5">
                <div className="text-[10px] font-black text-rose-900 dark:text-rose-200 text-center uppercase tracking-wider">
                  ★ Pink Sakura Cut ★
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {[capturedPhotos[3], capturedPhotos[2], capturedPhotos[1], capturedPhotos[0]].map((img, i) => (
                    <img key={i} src={img} className="w-full aspect-[4/3] object-cover rounded-lg filter sepia-[.3]" alt="strip item" />
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => alert('Membuka opsi cetak...')} className="flex-1 py-2 bg-white dark:bg-rose-900 text-rose-700 dark:text-rose-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                    <Printer size={13} /> Cetak
                  </button>
                  <button onClick={() => alert('Link siap dibagikan!')} className="p-2 bg-rose-600 text-white rounded-xl active:scale-95 transition-all">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900 text-white p-4 rounded-3xl border border-zinc-700 shadow-sm flex flex-col gap-2.5">
                <div className="text-[10px] font-black text-zinc-300 text-center uppercase tracking-wider">
                  ★ Classic Noir Studio ★
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {capturedPhotos.map((img, i) => (
                    <img key={i} src={img} className="w-full aspect-[4/3] object-cover rounded-lg grayscale" alt="strip item" />
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => alert('Membuka opsi cetak...')} className="flex-1 py-2 bg-zinc-800 text-zinc-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                    <Printer size={13} /> Cetak
                  </button>
                  <button onClick={() => alert('Link siap dibagikan!')} className="p-2 bg-white text-zinc-900 rounded-xl active:scale-95 transition-all">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

            </div>

            <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Ingin Cetak Fisik & Delivery ke Rumah?</h3>
                <p className="text-xs opacity-90">Kualitas cetak photo-paper premium glossy tahan pudar dan anti air.</p>
              </div>
              <button 
                onClick={() => alert('Layanan pesan cetak antar rumah disimulasikan!')}
                className="px-5 py-2.5 bg-white text-purple-700 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-transform whitespace-nowrap"
              >
                Pesan Sekarang
              </button>
            </div>

          </div>
        )}

      </main>

      {/* DOCKED FLOATING FILTERS CARD (DESKTOP REFERENCE) */}
      <div className="docked-filter-card" id="dockedFilterCard">
        <div className="docked-card-header">
          <span>Filters</span>
          <button type="button" className="docked-close-btn" onClick={() => document.getElementById('dockedFilterCard').style.display='none'}>✕</button>
        </div>
        
        <div className="docked-filter-list">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`docked-filter-item ${activeFilter === filter.id ? 'active' : ''}`}
            >
              <span className="filter-radio-dot"></span> {filter.name}
            </button>
          ))}
        </div>

        <div className="docked-stamps-section">
          <span className="stamps-title">Automatic Stamps</span>
          <label className="stamps-toggle-label">
            <input 
              type="checkbox" 
              checked={showLocationStamp}
              onChange={(e) => setShowLocationStamp(e.target.checked)}
            />
            <span>Aktifkan Stempel Lokasi</span>
          </label>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-400">
        <p>© 2024 SnapBooth. Made with ♥ in Bandung, West Java.</p>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="mobile-bottom-nav">
        <button 
          onClick={() => setActiveTab('studio')} 
          className={`mob-nav-btn ${activeTab === 'studio' ? 'active' : ''}`}
        >
          <Camera size={18} />
          <span>Studio</span>
        </button>
        <button 
          onClick={() => setActiveTab('customize')} 
          className={`mob-nav-btn ${activeTab === 'customize' ? 'active' : ''}`}
        >
          <Sliders size={18} />
          <span>Frame</span>
        </button>
        <button 
          onClick={() => setActiveTab('gallery')} 
          className={`mob-nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
        >
          <ImageIcon size={18} />
          <span>Galeri</span>
        </button>
      </div>

    </div>
  );
}
