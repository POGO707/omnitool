import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Activity, User, Bot } from 'lucide-react';
import { LiveClient } from '../services/live';

interface Log {
    text: string;
    isUser: boolean;
}

export default function LiveConversation() {
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const liveClientRef = useRef<LiveClient | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on log update
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const toggle = async () => {
    if (active) {
        liveClientRef.current?.disconnect();
        setActive(false);
        setLogs(prev => [...prev, { text: "Session ended.", isUser: false }]);
    } else {
        setLogs(prev => [...prev, { text: "Connecting to Gemini Live...", isUser: false }]);
        try {
            const client = new LiveClient();
            liveClientRef.current = client;
            await client.connect((text, isUser) => {
                setLogs(prev => {
                    // Simple logic to debounce or append partials
                    // For this demo, just append
                    const last = prev[prev.length - 1];
                    if (last && last.isUser === isUser) {
                        // Very naive accumulation for demo visual
                        // Ideally we use IDs or overwrite partials
                        return [...prev.slice(0, -1), { text: last.text + text, isUser }];
                    }
                    return [...prev, { text, isUser }];
                });
            });
            setActive(true);
            setLogs(prev => [...prev, { text: "Connected! Start speaking.", isUser: false }]);
        } catch (e) {
            console.error(e);
            setLogs(prev => [...prev, { text: "Connection failed.", isUser: false }]);
        }
    }
  };

  // Cleanup
  useEffect(() => {
      return () => {
          liveClientRef.current?.disconnect();
      }
  }, []);

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-6rem)] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Live Conversation</h2>
            <p className="text-sm text-slate-500">Gemini 2.5 Native Audio</p>
          </div>
          <div className="flex items-center gap-2">
              {active && <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>}
              <span className="text-sm font-medium text-slate-600">{active ? 'Live' : 'Offline'}</span>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Activity size={64} className="mb-4" />
                  <p>Tap the microphone to start talking</p>
              </div>
          )}
          {logs.map((log, i) => (
              <div key={i} className={`flex gap-3 ${log.isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${log.isUser ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                      {log.isUser ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${log.isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                      {log.text}
                  </div>
              </div>
          ))}
      </div>

      <div className="p-6 bg-white border-t flex justify-center">
          <button 
            onClick={toggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${active ? 'bg-red-500 text-white scale-110' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
              {active ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
      </div>
    </div>
  );
}
