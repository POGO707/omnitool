import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, FileText, Image, Mic, Camera, 
  Scissors, Search, Video, PenTool, Type, 
  CheckCircle, Globe, QrCode, FileCheck, DollarSign, 
  Percent, GraduationCap, Link as LinkIcon, Sliders, 
  Maximize2
} from 'lucide-react';
import { GoogleAd } from '../App';

export default function Dashboard() {
  const navigate = useNavigate();

  const tools = [
    // Calculators
    { title: "Expense Calc", desc: "Track daily spending", icon: DollarSign, color: "bg-blue-500", path: "/calc?t=expense" },
    { title: "GST Calc", desc: "Calculate Tax", icon: Percent, color: "bg-blue-500", path: "/calc?t=gst" },
    { title: "Exam Marks", desc: "Average & Total", icon: GraduationCap, color: "bg-blue-500", path: "/calc?t=exam" },
    
    // Utilities
    { title: "QR Generator", desc: "Create QR Codes", icon: QrCode, color: "bg-teal-500", path: "/utils?t=qr" },
    { title: "Link Shortener", desc: "TinyURL API", icon: LinkIcon, color: "bg-teal-500", path: "/utils?t=link" },
    { title: "PDF Tools", desc: "HTML to PDF", icon: FileText, color: "bg-teal-500", path: "/utils?t=pdf" },
    { title: "Img Compare", desc: "Before/After Slider", icon: Sliders, color: "bg-teal-500", path: "/utils?t=compare" },
    { title: "Img Resizer", desc: "Resize & Compress", icon: Maximize2, color: "bg-teal-500", path: "/utils?t=imgtools" },

    // AI Text
    { title: "Smart Search", desc: "Google Grounded AI", icon: Search, color: "bg-indigo-500", path: "/text?t=search" },
    { title: "Grammar & Spell", desc: "Fix text instantly", icon: CheckCircle, color: "bg-indigo-500", path: "/text?t=grammar" },
    { title: "CV Builder", desc: "Create Resume", icon: FileText, color: "bg-indigo-500", path: "/text?t=cv" },
    { title: "YouTube Tools", desc: "Titles & Desc", icon: YoutubeIcon, color: "bg-red-600", path: "/text?t=youtube" },

    // AI Media
    { title: "Image Gen", desc: "Create AI Art", icon: Image, color: "bg-purple-500", path: "/media?t=gen" },
    { title: "Image Editor", desc: "Modify Images", icon: PenTool, color: "bg-orange-500", path: "/media?t=edit" },
    { title: "Veo Video", desc: "Image to Video", icon: Video, color: "bg-pink-600", path: "/media?t=veo" },

    // Others
    { title: "Live Voice", desc: "Real-time Chat", icon: Mic, color: "bg-red-500", path: "/live" },
    { title: "GPS Camera", desc: "Geo-tag Photos", icon: Camera, color: "bg-orange-500", path: "/camera" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome to OmniTool</h1>
        <p className="text-sm md:text-base text-slate-500">Select a tool to get started.</p>
      </div>

      <div className="mb-8">
        <GoogleAd />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tools.map((tool, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate(tool.path)}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 group flex flex-col items-center text-center h-full"
          >
            <div className={`${tool.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
              <tool.icon size={20} />
            </div>
            <h3 className="font-semibold text-sm text-slate-800 mb-1 leading-tight">{tool.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2">{tool.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function YoutubeIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
    )
}