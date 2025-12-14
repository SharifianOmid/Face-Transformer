import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Icons (Inline SVGs for portability) ---
const Icons = {
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  Wand: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M10.6 6.6 9 5"/><path d="M15.1 13.5l-2.6 2.6a1 1 0 0 1-1.4 0l-2.6-2.6a1 1 0 0 1 0-1.4l2.6-2.6a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4z"/></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
  Stop: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="6" height="6"/><path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"/></svg>
  ),
  Loader: () => (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  )
};

// --- Types ---
type StyleOption = {
  id: string;
  name: string;
  description: string;
  promptMod: string;
};

type AgeOption = {
  value: number;
  label: string;
  promptMod: string;
};

// --- Configuration (Translated to Farsi) ---
const STYLES: StyleOption[] = [
  { 
    id: '3d-render', 
    name: 'انیمیشن', 
    description: 'کارتونی شاد و کودکانه (۳بعدی)', 
    promptMod: 'Transform all people into cute, happy, 3D animated cartoon characters designed for children. Use vibrant, colorful, and cheerful aesthetics. Soft shapes, expressive joyful faces, Pixar/Disney style animation.' 
  },
  { 
    id: '2d-anime', 
    name: 'انیمه ژاپنی', 
    description: 'استایل انیمه دو بعدی', 
    promptMod: 'Transform all people into Japanese 2D Anime style characters. Use traditional anime cel-shading, large expressive eyes, and manga aesthetics.' 
  },
  { 
    id: 'caricature', 
    name: 'کاریکاتور', 
    description: 'طراحی اغراق آمیز و طنز', 
    promptMod: 'Transform all people into HIGHLY EXAGGERATED and funny caricatures. Significantly distort facial features: very large heads, tiny bodies, exaggerated noses, mouths, and eyes. Create a humorous, grotesque, but artistic cartoon style.'
  },
  { 
    id: 'charcoal', 
    name: 'طراحی سیاه قلم', 
    description: 'طراحی هنری با ذغال', 
    promptMod: 'Create a realistic black and white charcoal drawing of all people in the image. Sketchy texture, dramatic shading, pencil strokes, high contrast, artistic sketch on paper.' 
  },
  { 
    id: 'digital', 
    name: 'دیجیتال رئال', 
    description: 'هنر دیجیتال با کیفیت بالا', 
    promptMod: 'Create a hyper-realistic digital painting of all people. Smooth blending, perfect lighting, high fidelity, concept art style, detailed digital illustration.' 
  },
  { 
    id: 'pastel', 
    name: 'پاستل', 
    description: 'بافت نرم گچی', 
    promptMod: 'Create a soft pastel painting of all people. Chalky texture, gentle blending, soft light, warm color palette, traditional art style.' 
  },
  { 
    id: 'oil', 
    name: 'رنگ روغن', 
    description: 'نقاشی کلاسیک روی بوم', 
    promptMod: 'Transform this image into a classic oil painting. Visible brushstrokes, rich textures, canvas grain, classical lighting, masterpiece quality.' 
  },
  { 
    id: 'watercolor', 
    name: 'آبرنگ', 
    description: 'نقاشی نرم و هنری', 
    promptMod: 'Paint all people in a watercolor style. Soft edges, bleeding colors, artistic splatters, paper texture background, dreamy and ethereal atmosphere.' 
  }
];

const AGES: AgeOption[] = [
  { value: 0, label: 'سن فعلی', promptMod: '' },
  { value: 10, label: '۱۰ سال بعد', promptMod: 'Make EVERY person look 10 years older. Add slight natural signs of aging.' },
  { value: 20, label: '۲۰ سال بعد', promptMod: 'Make EVERY person look 20 years older. Add visible wrinkles and mature skin texture.' },
  { value: 30, label: '۳۰ سال بعد', promptMod: 'Make EVERY person look 30 years older. Add significant signs of aging, deep wrinkles, and hair graying.' },
  { value: 50, label: '۵۰ سال بعد', promptMod: 'Make EVERY person look 50 years older. Add very deep wrinkles, sagging skin, white hair, and elderly features.' },
];

// --- Helper Functions ---

// Reduces image size to prevent API 500/XHR errors
const compressImage = (base64Str: string, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      // Export as JPEG with 0.8 quality to reduce payload size
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      // Fallback to original if loading fails
      resolve(base64Str);
    }
  });
};

// --- Main Component ---
const App = () => {
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<number>(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const executionRef = useRef<number>(0); // To handle cancellation logically

  // -- Handlers --

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (end) => {
        setImage(end.target?.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("خطا در دسترسی به دوربین");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      setGeneratedImage(null);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleStopProcessing = () => {
     setLoading(false);
     executionRef.current = 0; // Invalidate current run
  };

  const handleGenerate = async () => {
    if (!image) return;
    if (!selectedStyle && selectedAge === 0 && !removeBackground) {
      alert("لطفا حداقل یک سبک، تغییر سن یا حذف پس زمینه را انتخاب کنید.");
      return;
    }

    setLoading(true);
    setGeneratedImage(null);
    
    // Start new execution ID
    const currentRunId = Date.now();
    executionRef.current = currentRunId;

    try {
      // 1. Optimize image before sending
      const compressedImage = await compressImage(image);

      if (executionRef.current !== currentRunId) return;

      // Construct prompt
      const styleConfig = STYLES.find(s => s.id === selectedStyle);
      const ageConfig = AGES.find(a => a.value === selectedAge);

      // Enhanced prompt for multiple faces
      let prompt = "Analyze the image and identify EVERY SINGLE PERSON present, including those in the background. Apply the following transformations to ALL detected faces:";
      
      if (styleConfig) {
        prompt += ` ${styleConfig.promptMod}`;
      } else {
        prompt += " Keep the style photorealistic.";
      }

      if (ageConfig && ageConfig.value > 0) {
        prompt += ` ${ageConfig.promptMod} Apply this age transformation to EVERY single person found in the image, regardless of their position.`;
      }

      if (removeBackground) {
        prompt += " COMPLETELY REMOVE the background. Isolate all people detected in the image and place them on a solid clean white background. Do NOT affect the people's appearance unless specified by other styles.";
      }

      prompt += " STRICTLY PRESERVE the identity, facial structure, key features (eyes, nose, lips, face shape), and ethnicity of ALL people in the image. High resolution, 8k, highly detailed.";

      // Extract base64 data (remove header)
      const base64Data = compressedImage.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            },
            { text: prompt }
          ]
        }
      });

      // Check if cancelled during await
      if (executionRef.current !== currentRunId) return;

      // Parse response
      let foundImage = null;
      let textResponse = "";

      if (response.candidates?.[0]?.content?.parts) {
         for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              foundImage = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            } else if (part.text) {
              textResponse += part.text;
            }
         }
      }

      if (foundImage) {
        setGeneratedImage(foundImage);
      } else {
        console.error("No image found. Text response:", textResponse);
        if (textResponse) {
           alert("تصویر تولید نشد. مدل پاسخ داد: " + textResponse.substring(0, 100) + "...");
        } else {
           alert("خطا در تولید تصویر. لطفا دوباره تلاش کنید.");
        }
      }

    } catch (error) {
      if (executionRef.current === currentRunId) {
        console.error("Generation error:", error);
        alert("خطایی رخ داد. لطفا دوباره تلاش کنید.");
      }
    } finally {
      if (executionRef.current === currentRunId) {
        setLoading(false);
      }
    }
  };

  const resetAll = () => {
    setImage(null);
    setGeneratedImage(null);
    setSelectedStyle(null);
    setSelectedAge(0);
    setRemoveBackground(false);
  };

  // -- Render --

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-8 px-4" dir="rtl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-l from-violet-400 to-fuchsia-400 mb-2">
          تغییر چهره هوشمند
        </h1>
        <p className="text-slate-400 font-medium">چهره خود را به آثار هنری تبدیل کنید یا آینده خود را ببینید</p>
      </header>

      <main className="w-full max-w-5xl bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        
        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-slate-800 rounded-xl overflow-hidden border border-slate-600">
               <video ref={videoRef} autoPlay playsInline className="w-full h-auto transform -scale-x-100" />
               <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                 <button onClick={stopCamera} className="p-3 rounded-full bg-red-500/80 hover:bg-red-600 text-white">
                   <Icons.X />
                 </button>
                 <button onClick={capturePhoto} className="p-3 rounded-full bg-white text-black hover:bg-slate-200">
                   <Icons.Camera />
                 </button>
               </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Controls & Input */}
          <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-l border-slate-700 flex flex-col gap-6">
            
            {/* Input Area */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-300">
                <span className="bg-violet-500/20 p-1.5 rounded-lg"><Icons.Upload /></span>
                انتخاب تصویر
              </h2>
              
              {!image ? (
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-violet-500 hover:bg-slate-700/30 transition-all cursor-pointer group h-64"
                     onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <div className="p-4 bg-slate-700 rounded-full group-hover:scale-110 transition-transform">
                     <Icons.Upload />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-200">برای آپلود کلیک کنید</p>
                    <p className="text-sm">یا تصویر را اینجا بکشید</p>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-px bg-slate-600 flex-1"></div>
                    <span className="text-xs uppercase">یا</span>
                    <div className="h-px bg-slate-600 flex-1"></div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); startCamera(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Icons.Camera /> استفاده از دوربین
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-600 group h-64 bg-black flex items-center justify-center">
                  <img src={image} alt="Original" className="max-h-full max-w-full object-contain" />
                  <button 
                    onClick={resetAll}
                    className="absolute top-2 left-2 p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors"
                    title="حذف تصویر"
                  >
                    <Icons.X />
                  </button>
                </div>
              )}
            </div>

            {/* Style Selector */}
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-violet-300">
                  <span className="bg-violet-500/20 p-1.5 rounded-lg"><Icons.Wand /></span>
                  تنظیمات تغییر
                </h2>
                
                {/* Remove Background Toggle */}
                <button 
                  onClick={() => setRemoveBackground(!removeBackground)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${removeBackground ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}
                >
                   <div className={`w-3 h-3 rounded-full ${removeBackground ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                   حذف پس زمینه
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">سبک هنری</label>
                  <div className="grid grid-cols-3 gap-2">
                     <button
                        onClick={() => setSelectedStyle(null)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-all h-20 flex flex-col items-center justify-center gap-1
                          ${selectedStyle === null 
                            ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/50' 
                            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                          }`}
                      >
                        <span className="text-lg">🚫</span>
                        بدون سبک
                      </button>
                    {STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-all h-20 flex flex-col items-center justify-center gap-1 text-center
                          ${selectedStyle === style.id 
                            ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/50' 
                            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                          }`}
                        title={style.description}
                      >
                        <span>{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">تغییر سن</label>
                  <div className="grid grid-cols-5 gap-1 bg-slate-700/50 p-1 rounded-xl">
                    {AGES.map((age) => (
                      <button
                        key={age.value}
                        onClick={() => setSelectedAge(age.value)}
                        className={`py-2 text-[10px] sm:text-xs font-medium rounded-lg transition-all
                          ${selectedAge === age.value 
                            ? 'bg-fuchsia-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {age.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={!image || loading || (selectedStyle === null && selectedAge === 0 && !removeBackground)}
                className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                  ${!image || loading || (selectedStyle === null && selectedAge === 0 && !removeBackground)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-900/20 active:scale-[0.98]'
                  }`}
              >
                {loading ? (
                  <>
                    <Icons.Loader /> در حال پردازش...
                  </>
                ) : (
                  <>
                    <Icons.Wand /> اعمال تغییرات
                  </>
                )}
              </button>
              
              {loading && (
                 <button 
                    onClick={handleStopProcessing}
                    className="w-16 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 rounded-xl flex items-center justify-center transition-colors"
                    title="توقف پردازش"
                 >
                    <Icons.Stop />
                 </button>
              )}
            </div>
          </div>

          {/* Result Area */}
          <div className="w-full lg:w-1/2 bg-black/20 p-6 flex flex-col items-center justify-center relative min-h-[400px]">
            {!generatedImage && !loading && (
              <div className="text-center text-slate-500 max-w-xs">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Icons.Wand />
                </div>
                <p>تصویر خود را انتخاب کرده و تنظیمات را اعمال کنید تا جادو را ببینید.</p>
              </div>
            )}

            {loading && (
               <div className="text-center text-violet-400 animate-pulse">
                 <div className="w-20 h-20 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="text-lg font-bold">در حال پردازش...</p>
                 <p className="text-sm text-slate-500 mt-2">
                    اعمال {STYLES.find(s => s.id === selectedStyle)?.name || 'تغییرات'} روی چهره‌ها
                 </p>
               </div>
            )}

            {generatedImage && !loading && (
              <div className="w-full h-full flex flex-col gap-4 animate-in fade-in duration-700">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 group">
                  <img src={generatedImage} alt="Generated" className="w-full h-auto object-cover" />
                  
                  {/* Compare Overlay */}
                  {image && (
                     <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/70 backdrop-blur text-xs px-2 py-1 rounded text-white mb-2">
                           برای مشاهده تصویر اصلی موس را نگه دارید
                        </div>
                     </div>
                  )}
                  {image && (
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 cursor-crosshair"
                      style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                       <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-white">تصویر اصلی</div>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-violet-600/90 px-3 py-1 rounded-full text-xs font-bold text-white group-hover:opacity-0 transition-opacity">
                    تصویر جدید
                  </div>
                </div>

                <div className="flex gap-3 justify-center mt-auto">
                   <a 
                     href={generatedImage} 
                     download={`ai-transform-${Date.now()}.png`}
                     className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-white transition-colors"
                   >
                     <Icons.Download /> دانلود
                   </a>
                   <button 
                     onClick={() => { setGeneratedImage(null); }}
                     className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-slate-300 transition-colors"
                   >
                     <Icons.Refresh /> شروع مجدد
                   </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
      
      <footer className="mt-8 text-slate-600 text-sm dir-ltr">
        <p>Powered by Google Gemini 2.5</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
