import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Image, Video, Wand2, Download, Loader2, Play } from 'lucide-react';
import { generateImage, editImage, generateVeoVideo } from '../services/gemini';

export default function AiMedia() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('t') || 'gen';

  const setMode = (t: string) => {
    setSearchParams({ t });
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8 shrink-0">
        <button onClick={() => setMode('gen')} className={`flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl transition-all flex-1 md:flex-none min-w-[140px] text-sm md:text-base ${mode === 'gen' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-purple-50'}`}>
            <Image size={18} className="md:w-5 md:h-5" /> Gen Image
        </button>
        <button onClick={() => setMode('edit')} className={`flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl transition-all flex-1 md:flex-none min-w-[140px] text-sm md:text-base ${mode === 'edit' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-orange-50'}`}>
            <Wand2 size={18} className="md:w-5 md:h-5" /> Edit Image
        </button>
        <button onClick={() => setMode('veo')} className={`flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl transition-all flex-1 md:flex-none min-w-[140px] text-sm md:text-base ${mode === 'veo' ? 'bg-pink-600 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-pink-50'}`}>
            <Video size={18} className="md:w-5 md:h-5" /> Veo Video
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 min-h-[400px] md:min-h-[500px]">
        {mode === 'gen' && <ImageGenerator />}
        {mode === 'edit' && <ImageEditor />}
        {mode === 'veo' && <VeoGenerator />}
      </div>
    </div>
  );
}

function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [img, setImg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGen = async () => {
        if(!prompt) return;
        setLoading(true);
        try {
            const res = await generateImage(prompt);
            setImg(res);
        } catch(e) {
            alert('Failed to generate image. Try a simpler prompt.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-2xl flex flex-col md:flex-row gap-2">
                <input 
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe the image (e.g. 'A futuristic city with flying cars')"
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-full"
                    onKeyDown={e => e.key === 'Enter' && handleGen()}
                />
                <button onClick={handleGen} disabled={loading} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 w-full md:w-auto">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Generate'}
                </button>
            </div>

            <div className="w-full max-w-2xl aspect-square bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 relative group">
                {img ? (
                    <>
                        <img src={img} alt="Generated" className="w-full h-full object-contain" />
                        <a href={img} download={`gen-${Date.now()}.png`} className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-lg shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-medium text-sm">
                            <Download size={16} /> Download
                        </a>
                    </>
                ) : (
                    <div className="text-slate-400 flex flex-col items-center p-4 text-center">
                        <Image size={48} className="mb-2 opacity-50" />
                        <p>Image will appear here</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function ImageEditor() {
    const [image, setImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => setImage(evt.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = async () => {
        if (!image || !prompt) return;
        setLoading(true);
        try {
            // Extract base64
            const base64 = image.split(',')[1];
            const mime = image.split(';')[0].split(':')[1];
            const res = await editImage(base64, prompt, mime);
            setResult(res);
        } catch (e) {
            alert("Edit failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div 
                    onClick={() => fileInput.current?.click()}
                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                    {image ? (
                        <img src={image} className="w-full h-full object-contain rounded-lg" />
                    ) : (
                        <>
                            <p className="font-medium text-slate-600 text-center px-4">Click to Upload Image</p>
                            <span className="text-sm text-slate-400">JPG or PNG</span>
                        </>
                    )}
                    <input type="file" ref={fileInput} className="hidden" accept="image/*" onChange={handleFile} />
                </div>
                <div className="flex gap-2">
                    <input 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Instruction: 'Add a retro filter'"
                        className="flex-1 p-2 border rounded-lg w-full"
                    />
                    <button onClick={handleEdit} disabled={loading || !image} className="bg-orange-500 text-white px-4 rounded-lg disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                    </button>
                </div>
            </div>

            <div className="aspect-square bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative group">
                 {result ? (
                    <>
                        <img src={result} className="w-full h-full object-contain" />
                        <a href={result} download={`edited-${Date.now()}.png`} className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-lg shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-medium text-sm">
                            <Download size={16} /> Download
                        </a>
                    </>
                 ) : (
                    <span className="text-slate-400 text-center px-4">Edited result will appear here</span>
                 )}
            </div>
        </div>
    )
}

function VeoGenerator() {
    const [image, setImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const fileInput = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => setImage(evt.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        // API Key Check
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
            await window.aistudio.openSelectKey();
            setStatus("Key selected. Click Generate again.");
            return;
        }

        if (!prompt) return;
        setLoading(true);
        setStatus("Initializing Veo...");
        
        try {
            let res;
            if (image) {
                 const base64 = image.split(',')[1];
                 const mime = image.split(';')[0].split(':')[1];
                 res = await generateVeoVideo(prompt, base64, mime);
            } else {
                 res = await generateVeoVideo(prompt);
            }
            setVideoUrl(res);
            setStatus("");
        } catch (e: any) {
             if (e.message === "API_KEY_REQUIRED") {
                 setStatus("Please select a paid API key to use Veo.");
                 await window.aistudio.openSelectKey();
             } else {
                 setStatus("Generation failed. " + e.message);
             }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto">
             <div className="w-full text-center mb-4">
                 <h3 className="font-bold text-xl mb-2">Animate with Veo</h3>
                 <p className="text-sm text-slate-500">Upload an image (optional) and provide a prompt.</p>
                 {window.aistudio && (
                     <button onClick={() => window.aistudio.openSelectKey()} className="text-xs text-blue-500 underline mt-2">
                         Manage API Key
                     </button>
                 )}
             </div>

             <div className="w-full flex flex-col md:flex-row gap-4 items-start">
                 <div 
                    onClick={() => fileInput.current?.click()}
                    className="w-full md:w-32 h-32 flex-shrink-0 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100"
                 >
                     {image ? <img src={image} className="w-full h-full object-cover rounded-lg" /> : <Image className="text-slate-300" />}
                     <input type="file" ref={fileInput} className="hidden" accept="image/*" onChange={handleFile} />
                 </div>
                 <div className="flex-1 w-full space-y-2">
                     <textarea 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Prompt: 'A cinematic drone shot of this landscape' or 'A cyberpunk city'"
                        className="w-full p-3 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-pink-500 outline-none"
                     />
                 </div>
             </div>

             <button 
                onClick={handleGenerate} 
                disabled={loading || !prompt}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
             >
                 {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Generating...</span> : 'Generate Video'}
             </button>
             
             {status && <p className="text-sm text-orange-500 text-center">{status}</p>}

             {videoUrl && (
                 <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl p-2">
                     <video controls src={videoUrl} className="w-full h-auto rounded-lg mb-2" />
                     <div className="flex justify-end px-2">
                        <a href={videoUrl} download={`veo-${Date.now()}.mp4`} className="text-white hover:text-pink-400 flex items-center gap-2 text-sm font-medium">
                            <Download size={16}/> Download MP4
                        </a>
                     </div>
                 </div>
             )}
        </div>
    )
}