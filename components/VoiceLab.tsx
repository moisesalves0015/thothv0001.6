
import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Transcription } from '../types';

const VoiceLab: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(30).fill(0));

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionBufferRef = useRef({ user: '', assistant: '' });

  // Visualizer loop
  useEffect(() => {
    if (!isActive) {
      setVisualizerData(new Array(30).fill(0));
      return;
    }
    const interval = setInterval(() => {
      setVisualizerData(prev => prev.map(() => Math.random() * (isActive ? 100 : 0)));
    }, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsActive(false);
  }, []);

  const startSession = async () => {
    alert("Voice AI features are disabled.");
  };

  return (
    <div className="flex flex-col h-full bg-[#030712]">
      <header className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold">Live Companion</h2>
          <p className="text-sm text-gray-500">Real-time Voice • Low Latency</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center space-y-12">
        {/* Visualizer Orb */}
        <div className="relative group cursor-pointer" onClick={isActive ? stopSession : startSession}>
          <div className={`absolute -inset-10 rounded-full transition-all duration-1000 blur-3xl opacity-20 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-700'}`}></div>
          <div className={`relative h-64 w-64 rounded-full glass border-2 flex items-center justify-center overflow-hidden transition-all duration-500 ${isActive ? 'border-emerald-500/50 scale-110 shadow-2xl shadow-emerald-500/20' : 'border-gray-800 hover:border-gray-700'}`}>
            {isActive ? (
              <div className="flex items-end gap-1 px-4 h-24">
                {visualizerData.map((v, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-500 rounded-full transition-all duration-100"
                    style={{ height: `${Math.max(10, v)}%` }}
                  ></div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <i className="fa-solid fa-microphone text-5xl text-gray-600 group-hover:text-gray-400 transition-colors"></i>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tap to start</span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="text-center space-y-4 max-w-md">
          <h3 className={`text-2xl font-bold transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-400'}`}>
            {isActive ? 'Lumina is Listening...' : 'Disconnected'}
          </h3>
          <p className="text-gray-500 leading-relaxed">
            {isActive
              ? 'Speak naturally! Lumina can hear you in real-time and respond with low latency human-like speech.'
              : 'Click the orb above to establish a secure neural link and begin your voice conversation.'
            }
          </p>
          {isActive && (
            <button
              onClick={stopSession}
              className="px-8 py-3 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-600 hover:text-white transition-all"
            >
              End Session
            </button>
          )}
        </div>

        {/* Transcription Log (Mini) */}
        {transcriptions.length > 0 && (
          <div className="w-full max-w-2xl glass rounded-3xl p-6 border border-white/5 max-h-60 overflow-y-auto space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-[#030712]/50 backdrop-blur-sm pb-2">Recent Exchange</h4>
            {transcriptions.slice(-4).map((t, idx) => (
              <div key={idx} className={`flex gap-3 ${t.role === 'user' ? 'opacity-60' : ''}`}>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${t.role === 'user' ? 'border-blue-500/30 text-blue-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                  {t.role === 'user' ? 'YOU' : 'AI'}
                </span>
                <p className="text-sm text-gray-300 leading-snug">{t.text || "..."}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="p-4 text-center shrink-0">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">Gemini 2.5 Flash Native Audio • PCM 24kHz</p>
      </footer>
    </div>
  );
};

export default VoiceLab;
