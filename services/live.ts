import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Audio Utils
function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export class LiveClient {
  private ai: GoogleGenAI;
  private audioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private isConnected = false;
  private sessionPromise: Promise<any> | null = null; // Typing as any to avoid deep import issues

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect(onMessage: (text: string, isUser: boolean) => void) {
    if (this.isConnected) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000, 
    });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Connect to Gemini Live
    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          this.isConnected = true;
          this.setupAudioInput(stream);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio Output
          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && this.audioContext) {
            this.playAudio(audioData);
          }

          // Handle Transcriptions
          if (message.serverContent?.outputTranscription?.text) {
             onMessage(message.serverContent.outputTranscription.text, false);
          }
           if (message.serverContent?.inputTranscription?.text) {
             onMessage(message.serverContent.inputTranscription.text, true);
          }
        },
        onclose: () => {
          this.isConnected = false;
          this.disconnect();
        },
        onerror: (err) => {
          console.error("Live API Error:", err);
          this.disconnect();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: "You are a helpful AI assistant. Be concise and friendly.",
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      }
    });
  }

  private setupAudioInput(stream: MediaStream) {
    if (!this.audioContext) return;
    
    // Create a new context for input at 16kHz for the model
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputCtx.createMediaStreamSource(stream);
    
    // Use ScriptProcessor for raw PCM access
    this.processor = inputCtx.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Downsample/Convert if needed, but here we just convert to PCM16
      const buffer = new ArrayBuffer(inputData.length * 2);
      const view = new DataView(buffer);
      floatTo16BitPCM(view, 0, inputData);
      
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));

      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Audio
          }
        });
      });
    };

    source.connect(this.processor);
    this.processor.connect(inputCtx.destination);
  }

  private async playAudio(base64Data: string) {
    if (!this.audioContext) return;

    const audioBytes = base64ToUint8Array(base64Data);
    
    // Decode raw PCM 24kHz
    const dataInt16 = new Int16Array(audioBytes.buffer);
    const buffer = this.audioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;
    // Schedule seamlessly
    const startTime = Math.max(now, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;
  }

  disconnect() {
    this.isConnected = false;
    this.processor?.disconnect();
    this.inputSource?.disconnect();
    this.audioContext?.close();
    // No explicit close on sessionPromise widely available yet, mostly handled by closing stream/context
    // or if the library exposes a close method on the session object.
    this.sessionPromise?.then((session: any) => {
        if(session.close) session.close();
    });
    this.sessionPromise = null;
    this.audioContext = null;
    this.nextStartTime = 0;
  }
}
