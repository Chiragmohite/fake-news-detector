import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Scan, Link as LinkIcon, Image as ImageIcon, FileText, Loader2,
  ChevronRight, Zap, AlertTriangle, Upload, X, CheckCircle, FileType
} from "lucide-react";
import axios from "axios";
import ResultCard from "../components/ResultCard";
import ChatBot from "../components/ChatBot";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SAMPLE_ARTICLES = [
  {
    label: "Likely False",
    tab: "text",
    title: "Fake News Sample",
    text: "SHOCKING BOMBSHELL: Scientists are baffled by this miracle cure that doctors HATE. They're hiding the real truth about suppressed information. Wake up sheeple! Share before they delete this! Many people say the government is running a massive cover-up. This 100% confirmed deep state conspiracy will BLOW YOUR MIND!!! You won't believe what they're not telling you about the new world order.",
  },
  {
    label: "Likely True",
    tab: "text",
    title: "Authentic News Sample",
    text: "According to Reuters, scientists at Stanford University have published a peer-reviewed study in Nature journal examining climate change effects on coastal ecosystems. The research, conducted over five years with 200 researchers from 30 countries, found measurable sea level and temperature changes. The Washington Post and BBC News have both reported on the findings, which were confirmed by government reports.",
  },
  {
    label: "Misleading",
    tab: "text",
    title: "Misleading Sample",
    text: "Anonymous sources claim the new policy will destroy the economy. Many experts believe this unnamed official is hiding something massive. People are saying this is the biggest scandal of the century! Some are claiming documents were suppressed. It is rumored that insiders say the fallout will be catastrophic. Everyone knows the real story is being buried by mainstream media.",
  },
];

const SCAN_MESSAGES = [
  "Initializing multimodal analysis engine...",
  "Tokenizing and parsing content...",
  "Extracting core claim from input...",
  "Scanning for suspicious phrases and patterns...",
  "Generating fact-check search queries...",
  "Searching the web for evidence...",
  "Analyzing credibility of sources found...",
  "Scoring fact-checkers and news agencies...",
  "Computing evidence-weighted verdict...",
  "Generating explainable AI reasoning...",
  "Finalizing analysis report...",
];

const URL_SCAN_MESSAGES = [
  "Fetching article from URL...",
  "Extracting readable content...",
  "Parsing article metadata...",
  "Running NLP analysis...",
  "Searching for evidence...",
  "Calculating credibility score...",
  "Finalizing report...",
];

const IMAGE_SCAN_MESSAGES = [
  "Preprocessing image for OCR...",
  "Running Tesseract OCR engine...",
  "Extracting text from image...",
  "Analyzing extracted content...",
  "Scanning for suspicious patterns...",
  "Searching for supporting evidence...",
  "Finalizing analysis report...",
];

const PDF_SCAN_MESSAGES = [
  "Reading PDF document...",
  "Extracting text content...",
  "Parsing article structure...",
  "Running NLP analysis...",
  "Checking for misinformation patterns...",
  "Searching for supporting evidence...",
  "Calculating credibility score...",
  "Finalizing analysis report...",
];

export default function AnalyzerPage() {
  const [activeTab, setActiveTab] = useState("text");

  // Text input state
  const [text, setText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");

  // URL input state
  const [articleUrl, setArticleUrl] = useState("");

  // Image input state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // PDF input state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDragActive, setPdfDragActive] = useState(false);
  const pdfInputRef = useRef(null);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [capabilities, setCapabilities] = useState({ ocr: true, url_extraction: true, pdf: true });

  useEffect(() => {
    axios.get(`${API}/capabilities`, { withCredentials: true })
      .then((res) => setCapabilities(res.data))
      .catch(() => {});
  }, []);

  const runLoadingAnimation = (messages) => {
    let step = 0;
    setScanStep(0);
    setProgress(0);
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min(92, step * 14));
      setScanStep(step % messages.length);
      if (step >= messages.length) clearInterval(interval);
    }, 280);
    return interval;
  };

  const finishLoading = async (interval) => {
    clearInterval(interval);
    setProgress(100);
    await new Promise((r) => setTimeout(r, 300));
  };

  // ── Text Analysis ──
  const runTextAnalysis = async () => {
    if (!text.trim()) { setError("Please paste some text content to analyze."); return; }
    if (text.split(" ").filter(Boolean).length < 5) { setError("Please provide at least 5 words for analysis."); return; }
    setError(""); setResult(null); setLoading(true);
    const interval = runLoadingAnimation(SCAN_MESSAGES);
    try {
      await new Promise((r) => setTimeout(r, 2200));
      const { data } = await axios.post(`${API}/analyze`, { text, url: sourceUrl || undefined, title: title || undefined }, { withCredentials: true });
      await finishLoading(interval);
      setResult(data);
    } catch (e) {
      clearInterval(interval);
      setError(e.response?.data?.detail || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── URL Analysis ──
  const runUrlAnalysis = async () => {
    if (!articleUrl.trim()) { setError("Please enter a URL to analyze."); return; }
    if (!articleUrl.startsWith("http")) { setError("Please enter a valid URL starting with http:// or https://"); return; }
    setError(""); setResult(null); setLoading(true);
    const interval = runLoadingAnimation(URL_SCAN_MESSAGES);
    try {
      const { data } = await axios.post(`${API}/analyze/url`, { url: articleUrl }, { withCredentials: true });
      await finishLoading(interval);
      setResult(data);
    } catch (e) {
      clearInterval(interval);
      setError(e.response?.data?.detail || "URL analysis failed. The page may be inaccessible or behind a paywall.");
    } finally {
      setLoading(false);
    }
  };

  // ── Image Analysis ──
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });

  const runImageAnalysis = async () => {
    if (!imageFile) { setError("Please select an image to analyze."); return; }
    setError(""); setResult(null); setLoading(true);
    const interval = runLoadingAnimation(IMAGE_SCAN_MESSAGES);
    try {
      const imageData = await toBase64(imageFile);
      const { data } = await axios.post(`${API}/analyze/image`, { image_data: imageData, filename: imageFile.name }, { withCredentials: true });
      await finishLoading(interval);
      setResult(data);
    } catch (e) {
      clearInterval(interval);
      setError(e.response?.data?.detail || "Image analysis failed. Ensure the image contains clear, readable text.");
    } finally {
      setLoading(false);
    }
  };

  // ── PDF Analysis ──
  const runPdfAnalysis = async () => {
    if (!pdfFile) { setError("Please select a PDF file to analyze."); return; }
    setError(""); setResult(null); setLoading(true);
    const interval = runLoadingAnimation(PDF_SCAN_MESSAGES);
    try {
      const pdfData = await toBase64(pdfFile);
      const { data } = await axios.post(`${API}/analyze/pdf`, { pdf_data: pdfData, filename: pdfFile.name }, { withCredentials: true });
      await finishLoading(interval);
      setResult(data);
    } catch (e) {
      clearInterval(interval);
      setError(e.response?.data?.detail || "PDF analysis failed. Ensure the PDF contains selectable text (not a scanned image).");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "text") runTextAnalysis();
    else if (activeTab === "url") runUrlAnalysis();
    else if (activeTab === "image") runImageAnalysis();
    else if (activeTab === "pdf") runPdfAnalysis();
  };

  const handleReset = () => {
    setResult(null); setText(""); setSourceUrl(""); setTitle("");
    setArticleUrl(""); setImageFile(null); setImagePreview(null);
    setPdfFile(null); setError("");
  };

  // ── Image drag & drop ──
  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  // ── PDF drag & drop ──
  const handlePdfSelect = (file) => {
    if (!file || file.type !== "application/pdf") { setError("Please select a valid PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("PDF file is too large. Maximum size is 10MB."); return; }
    setPdfFile(file);
    setError("");
  };

  const handlePdfDrop = useCallback((e) => {
    e.preventDefault(); setPdfDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfSelect(file);
  }, []);

  const currentMessages = activeTab === "url" ? URL_SCAN_MESSAGES : activeTab === "image" ? IMAGE_SCAN_MESSAGES : activeTab === "pdf" ? PDF_SCAN_MESSAGES : SCAN_MESSAGES;

  return (
    <div className="min-h-screen bg-[#05050A] grid-bg pt-20">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/a158118b-a259-491f-8471-f9e3d36f0e02/images/682fa33c55a74974aacb530a614876d5de99967e3505b18582eda66b9492dbef.png)` }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-5">
            <Zap size={11} />
            Multimodal Analysis · Text + URL + Image + PDF
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Fact <span className="gradient-text-cyan">Verification</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-xl mx-auto leading-relaxed">
            Paste text, enter a URL, or upload an image — our AI engine verifies credibility and finds supporting evidence.
          </p>
        </div>

        {!result && !loading && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up stagger-1">
            {/* Input Type Tabs */}
            <div className="p-1.5 rounded-xl border border-white/10 bg-white/3 grid grid-cols-4 gap-1.5">
              {[
                { id: "text", icon: <FileText size={15} />, label: "Text" },
                { id: "url", icon: <LinkIcon size={15} />, label: "URL / Article", disabled: !capabilities.url_extraction },
                { id: "image", icon: <ImageIcon size={15} />, label: "Image / Screenshot", disabled: !capabilities.ocr },
                { id: "pdf", icon: <FileType size={15} />, label: "PDF", disabled: !capabilities.pdf },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { if (!tab.disabled) { setActiveTab(tab.id); setError(""); } }}
                  disabled={tab.disabled}
                  data-testid={`tab-${tab.id}`}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                      : tab.disabled
                      ? "text-zinc-600 cursor-not-allowed"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
                </button>
              ))}
            </div>

            {/* ── Text Tab ── */}
            {activeTab === "text" && (
              <div className="glass-card p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <FileText size={12} /> Article Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your news article, headline, social media post, or any text to verify..."
                    rows={8}
                    data-testid="article-text-input"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-zinc-600 text-sm leading-relaxed resize-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all font-body"
                  />
                  {text.length > 0 && (
                    <div className="text-right text-[10px] font-mono text-zinc-600">
                      {text.split(" ").filter(Boolean).length} words
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <LinkIcon size={12} /> Source URL <span className="text-zinc-600">(optional)</span>
                    </label>
                    <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." data-testid="article-url-input" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      Title <span className="text-zinc-600">(optional)</span>
                    </label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article headline..." data-testid="article-title-input" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* ── URL Tab ── */}
            {activeTab === "url" && (
              <div className="glass-card p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <LinkIcon size={12} /> News Article URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    placeholder="https://www.bbc.com/news/article-title"
                    data-testid="url-analyze-input"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-zinc-600 text-base focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all"
                  />
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-400/80 space-y-1">
                  <div className="flex items-center gap-2 font-medium"><CheckCircle size={12} /> Works with most public news articles</div>
                  <div className="text-cyan-400/50">Powered by trafilatura — free, no API key</div>
                  <div className="text-zinc-500">Note: Paywalled or JS-heavy pages may not extract correctly.</div>
                </div>
              </div>
            )}

            {/* ── Image Tab ── */}
            {activeTab === "image" && (
              <div className="glass-card p-6 space-y-4">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <ImageIcon size={12} /> Upload Image / Screenshot <span className="text-red-400">*</span>
                </label>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="image-drop-zone"
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-cyan-500/60 bg-cyan-500/8"
                      : "border-white/15 hover:border-cyan-500/30 hover:bg-white/3"
                  }`}
                >
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img src={imagePreview} alt="Preview" className="max-h-52 mx-auto rounded-xl object-contain border border-white/10" />
                      <div className="text-sm text-zinc-400">{imageFile?.name}</div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto">
                        <X size={12} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Upload size={28} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-zinc-300 font-medium">Drop image here or click to upload</p>
                        <p className="text-xs text-zinc-500 mt-1">Screenshots, news images, WhatsApp forwards · JPG, PNG, WEBP</p>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0])} data-testid="image-file-input" />
                </div>

                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-xs text-purple-400/80 space-y-1">
                  <div className="flex items-center gap-2 font-medium"><CheckCircle size={12} /> OCR powered by Tesseract (100% free, offline)</div>
                  <div className="text-zinc-500">Best for screenshots with clear text. Blurry or handwritten text may not extract correctly.</div>
                </div>
              </div>
            )}

            {/* ── PDF Tab ── */}
            {activeTab === "pdf" && (
              <div className="glass-card p-6 space-y-4">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <FileType size={12} /> Upload PDF Document <span className="text-red-400">*</span>
                </label>

                <div
                  onDrop={handlePdfDrop}
                  onDragOver={(e) => { e.preventDefault(); setPdfDragActive(true); }}
                  onDragLeave={() => setPdfDragActive(false)}
                  onClick={() => pdfInputRef.current?.click()}
                  data-testid="pdf-drop-zone"
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                    pdfDragActive
                      ? "border-orange-500/60 bg-orange-500/8"
                      : "border-white/15 hover:border-orange-500/30 hover:bg-white/3"
                  }`}
                >
                  {pdfFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <FileType size={28} className="text-orange-400" />
                      </div>
                      <div className="text-sm text-zinc-300 font-medium">{pdfFile.name}</div>
                      <div className="text-xs text-zinc-500">{(pdfFile.size / 1024).toFixed(1)} KB</div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto">
                        <X size={12} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <Upload size={28} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-zinc-300 font-medium">Drop PDF here or click to upload</p>
                        <p className="text-xs text-zinc-500 mt-1">News articles, research papers, reports · Max 10MB</p>
                      </div>
                    </div>
                  )}
                  <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => handlePdfSelect(e.target.files?.[0])} data-testid="pdf-file-input" />
                </div>

                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 text-xs text-orange-400/80 space-y-1">
                  <div className="flex items-center gap-2 font-medium"><CheckCircle size={12} /> Text extraction via pdfminer (100% free, offline)</div>
                  <div className="text-zinc-500">Works with text-based PDFs. Scanned/image PDFs are not supported — use the Image tab instead.</div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="analyze-error">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              data-testid="analyze-submit-btn"
              className="w-full py-4 rounded-xl font-bold text-base btn-neon flex items-center justify-center gap-3 group"
            >
              <Scan size={20} />
              {activeTab === "url" ? "Fetch & Verify Article" : activeTab === "image" ? "Extract & Analyze Image" : activeTab === "pdf" ? "Extract & Analyze PDF" : "Analyze Credibility"}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs text-zinc-600 font-mono">
              100% free · No API keys · Guest mode supported · Powered by NLP + DuckDuckGo + pdfminer
            </p>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="glass-card p-10 text-center space-y-8 animate-fade-in-up">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 animate-spin" style={{ animationDirection: "reverse" }} />
              <div className="absolute inset-4 rounded-full border-2 border-cyan-500/40 animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan size={28} className="text-cyan-400" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-cyan-400 font-mono text-sm font-medium tracking-wide typing-cursor">
                {currentMessages[scanStep]}
              </div>
              <div className="text-zinc-600 text-xs font-mono">{progress}% complete</div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden max-w-sm mx-auto">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg,#00F0FF,#B500FF)", boxShadow: "0 0 12px rgba(0,240,255,0.6)" }} />
            </div>
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
              {[["Extract", 0], ["Web Search", 30], ["Analyze", 60], ["Score", 80]].map(([label, threshold]) => (
                <div key={label} className="px-2 py-2 rounded-lg text-xs font-mono text-center transition-all duration-500"
                  style={{
                    background: progress > threshold ? "rgba(0,240,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${progress > threshold ? "rgba(0,240,255,0.3)" : "rgba(255,255,255,0.05)"}`,
                    color: progress > threshold ? "#00F0FF" : "#52525b",
                  }}>
                  {progress > threshold + 20 ? "✓" : "…"} {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="animate-fade-in-up space-y-4">
            <ResultCard result={result} onReset={handleReset} />
            <ChatBot context={result} />
          </div>
        )}

        {/* Sample Articles */}
        {!loading && !result && activeTab === "text" && (
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Try Sample Content</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SAMPLE_ARTICLES.map((sample, i) => {
                const cmap = { "Likely False": "#FF3366", "Likely True": "#00FF66", Misleading: "#FF7A00" };
                const bmap = { "Likely False": "rgba(255,51,102,0.05)", "Likely True": "rgba(0,255,102,0.05)", Misleading: "rgba(255,122,0,0.05)" };
                const color = cmap[sample.label] || "#00F0FF";
                return (
                  <button key={i} onClick={() => { setText(sample.text); setTitle(sample.title); }} data-testid={`sample-${sample.label.replace(/\s+/g, "-").toLowerCase()}`}
                    className="glass-card p-4 text-left space-y-2 group" style={{ borderColor: `${color}25` }}>
                    <div className="text-xs font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded inline-block" style={{ background: bmap[sample.label], color }}>{sample.label}</div>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 group-hover:text-zinc-300 transition-colors">{sample.text}</p>
                    <div className="flex items-center gap-1 text-xs" style={{ color }}>Try this <ChevronRight size={12} /></div>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-zinc-600">
              Not signed in?{" "}
              <Link to="/signup" className="text-cyan-400 hover:underline">Create an account</Link>{" "}
              to save your analysis history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
