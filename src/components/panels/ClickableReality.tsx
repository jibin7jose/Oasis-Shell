import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Search, X, Loader2, Copy } from "lucide-react";
import Tesseract from "tesseract.js";

interface ClickableRealityProps {
  onClose: () => void;
}

interface BBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface OCRWord {
  text: string;
  bbox: BBox;
}

export const ClickableReality: React.FC<ClickableRealityProps> = ({ onClose }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(1920);
  const [imgHeight, setImgHeight] = useState<number>(1080);
  const [words, setWords] = useState<OCRWord[]>([]);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState("Capturing screen...");

  useEffect(() => {
    let active = true;

    const startOCR = async () => {
      try {
        // 1. Capture Screen via Rust
        setProgress("Capturing neural snapshot...");
        const base64Img = await invoke<string>("capture_screen");
        if (!active) return;
        setImageSrc(base64Img);

        // Get image dimensions for percentage calculation
        const img = new Image();
        img.src = base64Img;
        await new Promise((resolve) => {
          img.onload = () => {
            setImgWidth(img.width);
            setImgHeight(img.height);
            resolve(true);
          };
        });

        // 2. Run Tesseract OCR
        setProgress("Analyzing visual patterns...");
        const result = await Tesseract.recognize(base64Img, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text" && active) {
              setProgress(`Extracting geometry: ${Math.round(m.progress * 100)}%`);
            }
          },
        });

        if (active) {
          setWords(result.data.words);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("OCR Failed:", err);
        if (active) {
          setProgress("Visual analysis failed.");
          setTimeout(onClose, 2000);
        }
      }
    };

    startOCR();

    return () => {
      active = false;
    };
  }, [onClose]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onClose(); // Automatically close after copying
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const filteredWords = (words || []).filter(
    (w) => search.trim().length >= 2 && w?.text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="absolute top-8 w-full max-w-4xl px-8 flex gap-4 items-center z-50">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-xl shadow-2xl">
          <Search className="text-white/40 w-6 h-6" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search your screen..."
            className="bg-transparent border-none outline-none text-white text-xl w-full placeholder:text-white/20 font-light"
            disabled={isProcessing}
          />
          {isProcessing && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
        </div>
        <button
          onClick={onClose}
          className="p-4 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-2xl transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image View */}
      <div className="relative mt-20 w-full max-w-7xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10 bg-black">
        {isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-40">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-indigo-300 font-mono text-sm tracking-widest uppercase">{progress}</p>
          </div>
        ) : null}

        {imageSrc && (
          <div className="relative w-full" style={{ aspectRatio: `${imgWidth}/${imgHeight}` }}>
            <img src={imageSrc} className="w-full h-full object-contain pointer-events-none opacity-80" />
            
            {/* Overlay bounding boxes */}
            {filteredWords.map((word, idx) => {
              const left = (word.bbox.x0 / imgWidth) * 100;
              const top = (word.bbox.y0 / imgHeight) * 100;
              const width = ((word.bbox.x1 - word.bbox.x0) / imgWidth) * 100;
              const height = ((word.bbox.y1 - word.bbox.y0) / imgHeight) * 100;

              return (
                <button
                  key={idx}
                  onClick={() => copyToClipboard(word.text)}
                  title={`Copy: ${word.text}`}
                  className="absolute border-2 border-indigo-400 bg-indigo-500/30 hover:bg-indigo-400/60 transition-all cursor-pointer group flex items-center justify-center rounded-[2px]"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.6)",
                  }}
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black/90 text-white text-xs px-2 py-1 rounded shadow-xl flex items-center gap-1 border border-indigo-500/30 whitespace-nowrap z-50">
                    <Copy className="w-3 h-3" /> {word.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
