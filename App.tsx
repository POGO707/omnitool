import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { 
  Calculator, FileText, Image, Video, Mic, Camera, 
  Menu, X, Home, Search, Scissors, Link as LinkIcon, 
  CheckCircle, QrCode, PenTool, Youtube,
  Maximize2, Sliders, GraduationCap, 
  DollarSign, Percent
} from 'lucide-react';

import Dashboard from './views/Dashboard';
import Calculators from './views/Calculators';
import Utilities from './views/Utilities';
import AiText from './views/AiText';
import AiMedia from './views/AiMedia';
import LiveConversation from './views/LiveConversation';
import CameraTool from './views/CameraTool';

// Reusable Google Ad Component
export const GoogleAd = ({ className }: { className?: string }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // Ignore ad errors in dev/if blocked
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden bg-slate-100 border border-slate-200 rounded-lg text-center ${className}`}>
      <div className="text-[10px] text-slate-400 uppercase tracking-widest py-1 bg-slate-50">Advertisement</div>
      <div className="min-h-[90px] flex items-center justify-center text-slate-300 text-xs">
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" 
             data-ad-slot="1234567890"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, close }: { isOpen: boolean, close: () => void }) => {
  const location = useLocation();
  
  const groups = [
    {
        label: 'Dashboard',
        path: '/',
        icon: Home
    },
    {
        label: 'Calculators',
        icon: Calculator,
        items: [
            { label: 'Expenses', path: '/calc?t=expense', icon: DollarSign },
            { label: 'GST Calc', path: '/calc?t=gst', icon: Percent },
            { label: 'Exam Marks', path: '/calc?t=exam', icon: GraduationCap },
        ]
    },
    {
        label: 'Utilities',
        icon: Scissors,
        items: [
            { label: 'QR Generator', path: '/utils?t=qr', icon: QrCode },
            { label: 'Link Shortener', path: '/utils?t=link', icon: LinkIcon },
            { label: 'PDF Tools', path: '/utils?t=pdf', icon: FileText },
            { label: 'Img Compare', path: '/utils?t=compare', icon: Sliders },
            { label: 'Resizer', path: '/utils?t=imgtools', icon: Maximize2 },
        ]
    },
    {
        label: 'AI Text',
        icon: FileText,
        items: [
            { label: 'Smart Search', path: '/text?t=search', icon: Search },
            { label: 'Grammar', path: '/text?t=grammar', icon: CheckCircle },
            { label: 'YouTube', path: '/text?t=youtube', icon: Youtube },
            { label: 'CV Builder', path: '/text?t=cv', icon: FileText },
        ]
    },
    {
        label: 'AI Media',
        icon: Image,
        items: [
            { label: 'Generator', path: '/media?t=gen', icon: Image },
            { label: 'Editor', path: '/media?t=edit', icon: PenTool },
            { label: 'Veo Video', path: '/media?t=veo', icon: Video },
        ]
    },
    {
        label: 'Live Voice',
        path: '/live',
        icon: Mic
    },
    {
        label: 'GPS Camera',
        path: '/camera',
        icon: Camera
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={close} />
      )}
      
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto flex flex-col h-full shadow-2xl lg:shadow-none border-r border-slate-800`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0 bg-slate-900">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">OmniTool</h1>
          <button onClick={close} className="lg:hidden p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {groups.map((group, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                  {group.items ? (
                      <div className="space-y-1">
                          <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                               <group.icon size={14} className="opacity-70" /> {group.label}
                          </div>
                          {group.items.map((item, j) => {
                              const isActive = location.pathname + location.search === item.path;
                              return (
                                  <NavLink 
                                      key={j} 
                                      to={item.path} 
                                      onClick={() => window.innerWidth < 1024 && close()}
                                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm ml-2 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                  >
                                      <item.icon size={16} />
                                      <span className="truncate">{item.label}</span>
                                  </NavLink>
                              )
                          })}
                      </div>
                  ) : (
                      <NavLink 
                          to={group.path!} 
                          onClick={() => window.innerWidth < 1024 && close()}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all text-sm font-bold ${location.pathname === group.path ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                      >
                          <group.icon size={20} />
                          <span>{group.label}</span>
                      </NavLink>
                  )}
              </div>
          ))}
          {/* Bottom spacing for scrolling */}
          <div className="h-4" />
        </nav>
        
        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-900 z-10">
          <GoogleAd className="bg-slate-800 border-slate-700 h-[100px]" />
        </div>
      </div>
    </>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden selection:bg-blue-200">
        <Sidebar isOpen={sidebarOpen} close={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center shadow-sm z-10 lg:hidden shrink-0 justify-between">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Menu size={24} />
              </button>
              <span className="ml-3 font-semibold text-slate-800">OmniTool</span>
            </div>
            {/* Optional header action or small avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
          </header>

          <main className="flex-1 overflow-auto p-4 lg:p-8 scroll-smooth">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calc" element={<Calculators />} />
              <Route path="/utils" element={<Utilities />} />
              <Route path="/text" element={<AiText />} />
              <Route path="/media" element={<AiMedia />} />
              <Route path="/live" element={<LiveConversation />} />
              <Route path="/camera" element={<CameraTool />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}