import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QrCode, FileText, Link as LinkIcon, Download, Sliders, Image as ImageIcon, Upload, Minimize2, Maximize2, Check } from 'lucide-react';

export default function Utilities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTool = searchParams.get('t') || 'qr';

  const setTool = (t: string) => {
    setSearchParams({ t });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
            {id: 'qr', label: 'QR Gen', icon: QrCode},
            {id: 'link', label: 'Link Shortener', icon: LinkIcon},
            {id: 'pdf', label: 'PDF Tools', icon: FileText},
            {id: 'compare', label: 'Img Compare', icon: Sliders},
            {id: 'imgtools', label: 'Resizer & Compress', icon: ImageIcon},
        ].map((t) => (
            <button 
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`p-3 rounded-lg flex flex-col items-center gap-1 text-sm font-medium transition-colors min-w-[100px] flex-shrink-0 ${activeTool === t.id ? 'bg-teal-600 text-white' : 'bg-white border hover:bg-slate-50 text-slate-600'}`}
            >
                <t.icon size={20} />
                <span className="whitespace-nowrap">{t.label}</span>
            </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 min-h-[400px]">
        {activeTool === 'qr' && <QrGenerator />}
        {activeTool === 'link' && <LinkShortener />}
        {activeTool === 'pdf' && <PdfTools />}
        {activeTool === 'compare' && <ImageComparison />}
        {activeTool === 'imgtools' && <ImageTools />}
      </div>
    </div>
  );
}

function QrGenerator() {
    const [text, setText] = useState('https://example.com');
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;

    const downloadQr = async () => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const localUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = localUrl;
            a.download = "qrcode.png";
            a.click();
        } catch (e) {
            alert("Could not download QR code");
        }
    }

    return (
        <div className="flex flex-col items-center gap-6 py-4">
            <h3 className="font-bold text-lg">QR Code Generator</h3>
            <input 
                type="text" 
                value={text} 
                onChange={e => setText(e.target.value)} 
                className="w-full max-w-md p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                placeholder="Enter text or URL"
            />
            {text && (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="p-4 bg-white border rounded-xl shadow-sm">
                        <img src={url} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <button onClick={downloadQr} className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 shadow-sm transition-transform active:scale-95">
                        <Download size={16} /> Download QR
                    </button>
                </div>
            )}
        </div>
    )
}

function LinkShortener() {
    const [url, setUrl] = useState('');
    const [short, setShort] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const shorten = async () => {
        if(!url) return;
        // Basic URL validation
        let validUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            validUrl = 'https://' + url;
        }

        setLoading(true);
        setCopied(false);
        try {
            // Use TinyURL API
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(validUrl)}`);
            if (response.ok) {
                const text = await response.text();
                setShort(text);
            } else {
                throw new Error("Failed to shorten");
            }
        } catch (e) {
            alert("Unable to shorten link. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    }

    const copy = () => {
        navigator.clipboard.writeText(short);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="space-y-1">
                <h3 className="font-bold text-lg">URL Shortener</h3>
                <p className="text-sm text-slate-500">Create a working short link using TinyURL.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
                <input 
                    type="url" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                    placeholder="Paste long URL here..." 
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none shadow-sm w-full"
                    onKeyDown={e => e.key === 'Enter' && shorten()}
                />
                <button 
                    onClick={shorten} 
                    disabled={loading || !url}
                    className="bg-teal-600 text-white px-6 py-3 sm:py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
                >
                    {loading ? '...' : 'Shorten'}
                </button>
            </div>
            
            {short && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between animate-in fade-in slide-in-from-top-2 shadow-sm gap-3">
                    <a href={short} target="_blank" rel="noopener noreferrer" className="text-green-800 font-medium hover:underline truncate w-full sm:w-auto">
                        {short}
                    </a>
                    <button 
                        onClick={copy} 
                        className={`w-full sm:w-auto text-xs font-bold px-3 py-2 rounded transition-all flex items-center justify-center gap-1 ${copied ? 'bg-green-200 text-green-800' : 'bg-white border border-green-200 text-green-700 hover:bg-green-100'}`}
                    >
                        {copied ? <Check size={14}/> : null}
                        {copied ? 'COPIED!' : 'COPY'}
                    </button>
                </div>
            )}
        </div>
    )
}

function PdfTools() {
    const [html, setHtml] = useState('<h1>Hello World</h1><p>This is a PDF test.</p>');
    
    const printPdf = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if(printWindow) {
            printWindow.document.write('<html><head><title>Print</title></head><body>');
            printWindow.document.write(html);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><FileText size={20} className="text-slate-600"/> HTML to PDF</h3>
                    <textarea 
                        value={html} 
                        onChange={e => setHtml(e.target.value)} 
                        className="w-full h-40 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="Enter HTML here..."
                    />
                    <button onClick={printPdf} className="flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 shadow-sm w-full md:w-auto">
                        <Download size={16} /> Print/Save as PDF
                    </button>
                </div>
                <div className="space-y-4 md:border-l md:pl-8 border-slate-200">
                    <h3 className="font-bold flex items-center gap-2"><FileText size={20} className="text-slate-600"/> PDF to Word</h3>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 relative group hover:bg-slate-100 transition-colors">
                        <Upload className="mx-auto mb-3 text-slate-400 group-hover:text-slate-600 transition-colors" size={32} />
                        <p className="text-slate-600 font-medium mb-1">Drag & Drop PDF here</p>
                        <p className="text-xs text-slate-400 mb-4">or click to browse</p>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" id="pdf-upload" accept=".pdf" />
                        <span className="inline-block bg-white border px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-slate-700">Select File</span>
                    </div>
                    <p className="text-xs text-slate-400 italic text-center">*Simulation only. Full conversion requires server-side processing.</p>
                </div>
            </div>
        </div>
    )
}

function ImageComparison() {
    const [slider, setSlider] = useState(50);
    return (
        <div className="max-w-2xl mx-auto py-4">
            <h3 className="font-bold mb-6 text-center text-lg">Image Comparison Slider</h3>
            <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-xl select-none group cursor-ew-resize shadow-lg border border-slate-200">
                <img src="https://picsum.photos/800/600?grayscale" className="absolute inset-0 w-full h-full object-cover" alt="Before" />
                <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">BEFORE</div>
                
                <div 
                    className="absolute inset-0 w-full h-full overflow-hidden" 
                    style={{ width: `${slider}%` }}
                >
                    <img src="https://picsum.photos/800/600" className="absolute top-0 left-0 w-full h-full object-cover max-w-none" style={{ width: '100vw' }} alt="After" /> 
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm transform translate-x-[calc(100vw-4rem)]">AFTER</div>
                </div>
                
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={slider} 
                    onChange={e => setSlider(parseInt(e.target.value))} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                />
                <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ left: `${slider}%` }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-lg text-teal-600 border border-slate-100">
                        <Sliders size={20} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ImageTools() {
    const [image, setImage] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState<{w: number, h: number} | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [quality, setQuality] = useState<number>(80);
    const fileInput = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    setImage(evt.target?.result as string);
                    setOriginalSize({ w: img.width, h: img.height });
                    setWidth(img.width);
                    setHeight(img.height);
                }
                img.src = evt.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = (type: 'resize' | 'compress') => {
        if (!image) return;
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                
                let dataUrl;
                let filename;
                
                if (type === 'compress') {
                    dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
                    filename = `compressed_${Date.now()}.jpg`;
                } else {
                    dataUrl = canvas.toDataURL('image/png');
                    filename = `resized_${width}x${height}_${Date.now()}.png`;
                }
                
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.click();
            }
        };
        img.src = image;
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-4">
                 <div 
                    onClick={() => fileInput.current?.click()}
                    className="aspect-video bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group"
                 >
                    {image ? (
                        <img src={image} className="w-full h-full object-contain rounded-lg p-2" />
                    ) : (
                        <>
                            <Upload className="text-slate-400 mb-2 group-hover:text-slate-600" size={32}/>
                            <p className="font-medium text-slate-600">Upload Image</p>
                            <span className="text-xs text-slate-400">JPG, PNG</span>
                        </>
                    )}
                    <input type="file" ref={fileInput} className="hidden" accept="image/*" onChange={handleFile} />
                 </div>
                 {originalSize && (
                    <div className="text-center bg-slate-100 py-2 rounded-lg text-xs font-mono text-slate-600">
                        Original: {originalSize.w} x {originalSize.h} px
                    </div>
                 )}
             </div>

             <div className="space-y-6">
                 {/* Resizer */}
                 <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
                     <h4 className="font-bold flex items-center gap-2 mb-4 text-slate-800"><Maximize2 size={18}/> Resizer</h4>
                     <div className="flex gap-4 mb-4">
                         <div className="flex-1">
                             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Width</label>
                             <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                         </div>
                         <div className="flex-1">
                             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Height</label>
                             <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                         </div>
                     </div>
                     <button onClick={() => processImage('resize')} disabled={!image} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm font-medium transition-colors">
                        <Download size={16}/> Download Resized
                     </button>
                 </div>

                 {/* Compressor */}
                 <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
                     <h4 className="font-bold flex items-center gap-2 mb-4 text-slate-800"><Minimize2 size={18}/> Compressor (JPEG)</h4>
                     <div className="mb-4">
                         <label className="text-xs font-semibold text-slate-500 uppercase mb-2 flex justify-between">
                            <span>Quality</span> 
                            <span className="bg-slate-200 px-2 rounded text-slate-700">{quality}%</span>
                         </label>
                         <input type="range" min="1" max="100" value={quality} onChange={e => setQuality(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                     </div>
                     <button onClick={() => processImage('compress')} disabled={!image} className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm font-medium transition-colors">
                         <Download size={16}/> Download Compressed
                     </button>
                 </div>
             </div>
        </div>
    )
}