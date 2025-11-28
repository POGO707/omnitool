import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, CheckCircle, FileText, Youtube, Loader2, Send, 
  Download, Upload, ArrowLeft, Mail, Phone, MapPin, 
  User, Briefcase, GraduationCap 
} from 'lucide-react';
import { generateTextWithSearch, generateSpecializedText, generateCVJson } from '../services/gemini';

export default function AiText() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tool = searchParams.get('t') || 'search';

  const setTool = (t: string) => {
    setSearchParams({ t });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex space-x-2 mb-4 overflow-x-auto p-1 scrollbar-hide shrink-0">
        {[
            {id: 'search', label: 'Smart Search', icon: Search},
            {id: 'grammar', label: 'Grammar & Spell', icon: CheckCircle},
            {id: 'youtube', label: 'YouTube', icon: Youtube},
            {id: 'cv', label: 'CV Builder', icon: FileText},
        ].map((t) => (
            <button 
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${tool === t.id ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
            >
                <t.icon size={16} />
                {t.label}
            </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 overflow-hidden flex flex-col">
        {tool === 'search' && <SearchTool />}
        {(tool === 'grammar' || tool === 'spelling') && <GrammarTool />}
        {tool === 'youtube' && <YouTubeTool />}
        {tool === 'cv' && <CVBuilder />}
      </div>
    </div>
  );
}

const downloadTxt = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

function SearchTool() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<{text: string, sources: any[]} | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if(!query) return;
        setLoading(true);
        try {
            const res = await generateTextWithSearch(query, true);
            setResult(res);
        } catch (e) {
            alert('Search failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Ask anything (e.g., 'Latest renewable energy trends 2024')"
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-w-0"
                />
                <button 
                    onClick={handleSearch} 
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 md:px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Search />}
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {result && (
                    <>
                         <div className="flex justify-end">
                            <button onClick={() => downloadTxt(result.text, 'search_result.txt')} className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600">
                                <Download size={12}/> Save as Text
                            </button>
                         </div>
                         <div className="prose prose-slate max-w-none prose-sm md:prose-base">
                             {result.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                         </div>
                         {result.sources.length > 0 && (
                             <div className="mt-6 pt-4 border-t">
                                 <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Sources</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                     {result.sources.map((src, idx) => (
                                         <a key={idx} href={src.uri} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                             {src.title || src.uri}
                                         </a>
                                     ))}
                                 </div>
                             </div>
                         )}
                    </>
                )}
            </div>
        </div>
    )
}

function GrammarTool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const check = async (mode: 'grammar' | 'spelling') => {
        if(!input) return;
        setLoading(true);
        const instruction = mode === 'grammar' 
            ? "Fix grammar, punctuation, and style. Only output the corrected text." 
            : "Correct all spelling errors. Only output the corrected text.";
        try {
            const res = await generateSpecializedText(input, instruction);
            setOutput(res);
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    }

    return (
        <div className="grid md:grid-cols-2 gap-6 h-full overflow-y-auto md:overflow-hidden pb-2">
            <div className="flex flex-col min-h-[200px]">
                <label className="font-medium mb-2">Original Text</label>
                <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 h-32 md:h-auto"
                    placeholder="Paste text here..."
                />
                <div className="flex gap-2 mt-4">
                    <button onClick={() => check('grammar')} disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 text-sm">Check Grammar</button>
                    <button onClick={() => check('spelling')} disabled={loading} className="flex-1 bg-teal-600 text-white py-2 rounded hover:bg-teal-700 disabled:opacity-50 text-sm">Check Spelling</button>
                </div>
            </div>
            <div className="flex flex-col min-h-[200px]">
                <div className="flex justify-between items-center mb-2">
                    <label className="font-medium">Corrected Text</label>
                    {output && (
                        <button onClick={() => downloadTxt(output, 'corrected_text.txt')} className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
                            <Download size={12}/> Download
                        </button>
                    )}
                </div>
                <div className="flex-1 p-3 bg-slate-50 border rounded-lg overflow-y-auto whitespace-pre-wrap h-32 md:h-auto">
                    {loading ? <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={16} /> Fixing...</div> : output}
                </div>
            </div>
        </div>
    )
}

function YouTubeTool() {
    const [topic, setTopic] = useState('');
    const [type, setType] = useState<'title' | 'description'>('title');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        const prompt = type === 'title' 
            ? `Generate 5 catchy, SEO-optimized YouTube titles for a video about: ${topic}`
            : `Write a compelling YouTube video description (including hashtags) for a video about: ${topic}`;
        
        try {
            const res = await generateSpecializedText(topic, prompt);
            setResult(res);
        } catch(e) { console.error(e) }
        finally { setLoading(false) }
    }

    return (
        <div className="max-w-xl mx-auto w-full space-y-6 overflow-y-auto h-full">
            <div className="space-y-4">
                <input 
                    type="text" 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Video Topic (e.g. 'How to bake a cake')"
                    className="w-full p-3 border rounded-lg"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded flex-1"><input type="radio" checked={type==='title'} onChange={()=>setType('title')} /> Titles</label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded flex-1"><input type="radio" checked={type==='description'} onChange={()=>setType('description')} /> Description</label>
                </div>
                <button onClick={generate} disabled={loading || !topic} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2">
                    {loading && <Loader2 className="animate-spin" size={18} />} Generate
                </button>
            </div>
            {result && (
                <div className="relative bg-slate-50 p-4 rounded-lg border whitespace-pre-wrap">
                    <button onClick={() => downloadTxt(result, 'youtube_content.txt')} className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-800" title="Download">
                        <Download size={16}/>
                    </button>
                    {result}
                </div>
            )}
        </div>
    )
}

function CVBuilder() {
    const [formData, setFormData] = useState({
        name: '', 
        role: '', 
        email: '', 
        phone: '', 
        location: '',
        experience: '', 
        education: '', 
        skills: ''
    });
    const [photo, setPhoto] = useState<string | null>(null);
    const [cvData, setCvData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => setPhoto(evt.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
             // Use the service to get structured JSON
             const data = await generateCVJson(formData);
             setCvData(data);
        } catch (e) {
            console.error(e);
            alert("Failed to generate CV. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (cvData) {
        return (
            <div className="h-full flex flex-col relative">
                <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50 p-2 rounded border">
                    <button onClick={() => setCvData(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded flex items-center gap-2 text-sm">
                        <ArrowLeft size={16}/> Edit Info
                    </button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={handlePrint} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 shadow-sm hover:bg-blue-700 text-sm">
                            <Download size={16}/> Download / Print PDF
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-slate-300 p-2 md:p-8 rounded-lg shadow-inner">
                    <div className="overflow-x-auto">
                        {/* The CV Paper - A4 Ratio approximately */}
                        <div className="print-area bg-white w-[210mm] min-h-[297mm] mx-auto shadow-2xl p-8 md:p-12 text-slate-800 scale-90 md:scale-100 origin-top-left md:origin-top">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row gap-8 border-b-2 border-slate-900 pb-8 mb-8 items-center md:items-start">
                                {photo && (
                                    <img src={photo} className="w-32 h-32 object-cover rounded-full border-4 border-slate-100 shadow-sm flex-shrink-0" alt="Profile" />
                                )}
                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-4xl font-bold uppercase tracking-wider mb-2 text-slate-900">{formData.name}</h1>
                                    <h2 className="text-xl text-indigo-600 font-medium mb-4 uppercase tracking-widest">{formData.role}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-600">
                                        {formData.email && <span className="flex items-center gap-1"><Mail size={14}/> {formData.email}</span>}
                                        {formData.phone && <span className="flex items-center gap-1"><Phone size={14}/> {formData.phone}</span>}
                                        {formData.location && <span className="flex items-center gap-1"><MapPin size={14}/> {formData.location}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Column (Skills & Education) */}
                                <div className="col-span-1 space-y-8">
                                    <section>
                                        <h3 className="font-bold text-lg uppercase border-b-2 border-slate-200 pb-2 mb-4 text-slate-800 tracking-wide">Education</h3>
                                        <div className="space-y-4">
                                            {cvData.education?.map((edu: any, i: number) => (
                                                <div key={i}>
                                                    <div className="font-bold text-slate-800">{edu.degree}</div>
                                                    <div className="text-sm text-slate-600">{edu.institution}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{edu.year}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-lg uppercase border-b-2 border-slate-200 pb-2 mb-4 text-slate-800 tracking-wide">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {cvData.technical_skills?.map((skill: string, i: number) => (
                                                <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm font-medium border border-slate-200">{skill}</span>
                                            ))}
                                        </div>
                                    </section>
                                    
                                    {cvData.soft_skills && (
                                        <section>
                                            <h3 className="font-bold text-lg uppercase border-b-2 border-slate-200 pb-2 mb-4 text-slate-800 tracking-wide">Soft Skills</h3>
                                            <div className="space-y-1">
                                                {cvData.soft_skills.map((skill: string, i: number) => (
                                                    <div key={i} className="text-sm text-slate-700">• {skill}</div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Right Column (Summary & Experience) */}
                                <div className="col-span-2 space-y-8">
                                    <section>
                                        <h3 className="font-bold text-lg uppercase border-b-2 border-slate-200 pb-2 mb-4 text-slate-800 tracking-wide">Professional Profile</h3>
                                        <p className="text-sm leading-relaxed text-slate-600 text-justify">{cvData.summary}</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-lg uppercase border-b-2 border-slate-200 pb-2 mb-4 text-slate-800 tracking-wide">Work Experience</h3>
                                        <div className="space-y-8">
                                            {cvData.work_history?.map((job: any, i: number) => (
                                                <div key={i} className="relative pl-4 border-l-2 border-slate-100">
                                                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-300"></div>
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h4 className="font-bold text-md text-slate-800">{job.role}</h4>
                                                        <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">{job.duration}</span>
                                                    </div>
                                                    <div className="text-sm font-semibold text-indigo-600 mb-2">{job.company}</div>
                                                    <ul className="list-disc list-outside ml-4 text-sm text-slate-600 space-y-1.5 leading-relaxed">
                                                        {job.description?.map((desc: string, j: number) => (
                                                            <li key={j}>{desc}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Edit Form
    return (
        <div className="max-w-3xl mx-auto py-2 h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Professional CV Builder</h2>
                <div className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 hidden sm:block">
                    AI-Powered Formatting
                </div>
            </div>
            
            <div className="space-y-6 pb-20">
                {/* Personal Info */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20} className="text-indigo-600"/> Personal Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="col-span-2 flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                             <div className="relative group cursor-pointer w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {photo ? (
                                    <img src={photo} className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="text-slate-400 group-hover:text-slate-600" />
                                )}
                                <input type="file" accept="image/*" onChange={handlePhoto} className="absolute inset-0 opacity-0 cursor-pointer" />
                             </div>
                             <div className="text-center sm:text-left">
                                 <p className="font-medium text-sm">Profile Photo</p>
                                 <p className="text-xs text-slate-500">Click circle to upload (Optional)</p>
                             </div>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                            <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Jane Doe" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Target Role</label>
                            <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Senior Product Designer" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                            <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                            <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Location (City, Country)</label>
                            <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="New York, USA" />
                        </div>
                    </div>
                </div>

                {/* Experience */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Briefcase size={20} className="text-indigo-600"/> Experience & Skills</h3>
                    <p className="text-sm text-slate-500 mb-6 bg-blue-50 p-3 rounded text-blue-800 border border-blue-100">
                        ✨ <strong>AI Magic:</strong> Just paste your rough notes, old resume points, or a brain dump. Our AI will fix the grammar, formatting, and make it sound professional.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Work History (Rough Notes)</label>
                            <textarea 
                                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                                placeholder="e.g. 2020-2023 at Google as Engineer. Built a scalable chat app using React. Managed a team of 3 juniors. Increased performance by 50%."
                                value={formData.experience} 
                                onChange={e => setFormData({...formData, experience: e.target.value})}
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><GraduationCap size={16}/> Education</label>
                            <textarea 
                                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                                placeholder="e.g. BS Computer Science, MIT, 2019. GPA 3.8."
                                value={formData.education} 
                                onChange={e => setFormData({...formData, education: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Skills</label>
                            <textarea 
                                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                                placeholder="e.g. React, Node.js, Python, Leadership, Public Speaking, Agile Methodology"
                                value={formData.skills} 
                                onChange={e => setFormData({...formData, skills: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:shadow-none flex justify-center items-center gap-2"
                >
                    {loading ? <><Loader2 className="animate-spin" /> Generating Professional CV...</> : <><FileText /> Generate Professional CV</>}
                </button>
            </div>
        </div>
    )
}