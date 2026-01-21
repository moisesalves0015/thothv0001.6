
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedVideo } from '../types';

const MotionLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const isSelected = await window.aistudio.hasSelectedApiKey();
        setHasKey(isSelected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success due to race condition guidance
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStatusMessage('Initiating video generation pipeline...');

    try {
      // Create new GoogleGenAI instance right before API call as per Veo guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      setStatusMessage('Consulting Veo intelligence... (can take up to 2 mins)');
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      let pollCount = 0;
      while (!operation.done) {
        pollCount++;
        setStatusMessage(`Directing the scene... Step ${pollCount} (Processing)`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        // @ts-ignore
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      setStatusMessage('Rendering final frames...');
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video URI not found");

      // Append API key when fetching from the download link as per guidelines
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);

      setVideos(prev => [{
        id: Date.now().toString(),
        url: videoUrl,
        prompt,
        timestamp: Date.now()
      }, ...prev]);
      setPrompt('');
      setStatusMessage('');
    } catch (error: any) {
      console.error('Video gen error:', error);
      // Reset key selection if entity not found (API key session issue)
      if (error.message?.includes('Requested entity was not found')) {
        setHasKey(false);
        alert("API Key session expired. Please re-select your key.");
      } else {
        alert("Error generating video: " + error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="max-w-md glass rounded-[2.5rem] p-10 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-600/30">
            <i className="fa-solid fa-key text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold mb-4">API Key Required</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            To use high-quality Veo video generation, you must select a paid API key from a Google Cloud Project with billing enabled.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full h-14 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            Select API Key
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mt-6 text-sm text-purple-400 hover:underline"
          >
            Learn about billing & keys
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold">Video Synth</h2>
          <p className="text-sm text-gray-500">Veo 3.1 Fast • 1080p Generation</p>
        </div>
        <button onClick={handleSelectKey} className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
          <i className="fa-solid fa-arrows-rotate"></i> Change Key
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Creator Section */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="glass rounded-[2.5rem] p-8 border border-white/5 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-clapperboard text-purple-400"></i> Scene Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A golden retriever wearing futuristic sunglasses surfing on a giant waffle in a syrup ocean..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-3xl p-6 h-40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-lg leading-relaxed text-gray-200 resize-none shadow-inner"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 flex gap-2">
                 <div className="flex-1 glass rounded-2xl px-4 flex items-center justify-between border border-white/5">
                    <span className="text-xs text-gray-500">RESOLUTION</span>
                    <span className="text-xs font-bold text-white">1080P</span>
                 </div>
                 <div className="flex-1 glass rounded-2xl px-4 flex items-center justify-between border border-white/5">
                    <span className="text-xs text-gray-500">FORMAT</span>
                    <span className="text-xs font-bold text-white">MP4 / 16:9</span>
                 </div>
               </div>
               
               <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="h-16 px-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl font-bold text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:grayscale min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <i className="fa-solid fa-clapperboard animate-bounce"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-play"></i>
                    Synthesize Video
                  </>
                )}
              </button>
            </div>

            {isGenerating && (
              <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                <p className="text-sm text-purple-300 font-medium">{statusMessage}</p>
                <div className="ml-auto h-1 bg-gray-800 flex-1 rounded-full overflow-hidden max-w-[150px]">
                  <div className="h-full bg-purple-500 animate-[loading_20s_ease-in-out_infinite]"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Feed */}
        <div className="max-w-6xl mx-auto space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-gray-500"></i> Recent Creations
          </h3>
          
          {videos.length === 0 ? (
            <div className="h-80 glass rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-gray-800">
              <i className="fa-solid fa-film text-4xl text-gray-700 mb-4"></i>
              <p className="text-gray-500">Your video reel will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map(vid => (
                <div key={vid.id} className="glass rounded-[2rem] overflow-hidden border border-white/5 flex flex-col transition-all hover:ring-2 hover:ring-purple-500/20">
                  <video src={vid.url} controls className="w-full aspect-video bg-black" />
                  <div className="p-6 bg-white/5 border-t border-white/5">
                    <p className="text-sm text-gray-300 line-clamp-2 italic">"{vid.prompt}"</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                        {new Date(vid.timestamp).toLocaleDateString()} • 1080p
                      </span>
                      <a 
                        href={vid.url} 
                        download={`veo-${vid.id}.mp4`}
                        className="h-8 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <i className="fa-solid fa-download"></i> Save
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MotionLab;
