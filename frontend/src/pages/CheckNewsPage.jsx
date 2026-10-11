import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Layers,
  Upload,
  Search,
  Sparkles,
  AlertCircle,
  Camera,
  Trash2,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import LoadingAnalysisModal from '../components/common/LoadingAnalysisModal';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import {
  analyzeTextNews,
  analyzeUrlNews,
  analyzeImageNews,
  analyzePdfNews,
  getDemoCases,
} from '../services/newsService';

export const CheckNewsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'text';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form states
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCases, setDemoCases] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemo = async () => {
      try {
        const res = await getDemoCases();
        if (res.success) setDemoCases(res.data);
      } catch (e) {
        // demo cases fallback
      }
    };
    fetchDemo();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !headline.trim()) {
      setError('Please provide at least a news headline or article text.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await analyzeTextNews({ headline, content, sourceUrl });
      if (res.success && res.data) {
        navigate(`/result/${res.data._id || res.data.id}`);
      } else {
        setError(res.message || 'Analysis could not be completed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'AI verification service temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid HTTP/HTTPS URL.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await analyzeUrlNews(url);
      if (res.success && res.data) {
        navigate(`/result/${res.data._id || res.data.id}`);
      } else {
        setError(res.message || 'Unable to extract news article.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'URL verification error. If blocked by the publisher, copy and paste the article text into the Text tab.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose or capture an image screenshot.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('headline', headline);

      const res = await analyzeImageNews(formData);
      if (res.success && res.data) {
        navigate(`/result/${res.data._id || res.data.id}`);
      } else {
        setError(res.message || 'Image text OCR failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not extract readable text from image.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a PDF document.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('headline', headline);

      const res = await analyzePdfNews(formData);
      if (res.success && res.data) {
        navigate(`/result/${res.data._id || res.data.id}`);
      } else {
        setError(res.message || 'PDF analysis failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not parse text from PDF.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoCase = (demo) => {
    navigate(`/result/${demo.id}`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading Tracker Modal */}
      <LoadingAnalysisModal isOpen={loading} />

      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400">
          SDG 16 & SDG 4 • Multi-Source Verification Pipeline
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          TruthLens AI Claim Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Deconstruct online claims, extract factual assertions, retrieve verified evidence, and analyze epistemic credibility.
        </p>
      </div>

      {/* Input Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => { setActiveTab('text'); setError(''); }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeTab === 'text'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Text / Post
        </button>

        <button
          onClick={() => { setActiveTab('url'); setError(''); }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeTab === 'url'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Article URL
        </button>

        <button
          onClick={() => { setActiveTab('image'); setError(''); }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeTab === 'image'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Screenshot (OCR)
        </button>

        <button
          onClick={() => { setActiveTab('pdf'); setError(''); }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeTab === 'pdf'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          PDF Document
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs md:text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">{error}</div>
        </div>
      )}

      {/* Main Analysis Input Card */}
      <div className="bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* OPTION 1: TEXT */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Headline / Title (Optional)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Scientists announce major clean energy breakthrough..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Article Body / Social Media Claim *
              </label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste full news story, tweet content, WhatsApp message, or controversial statement here..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Supports extensive multi-paragraph articles</span>
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Source Domain / Website (Optional)
              </label>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="e.g. https://example-news-blog.org"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm md:text-base shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Analyze News Content
            </button>
          </form>
        )}

        {/* OPTION 2: URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Article Web Address (URL) *
              </label>
              <div className="relative">
                <LinkIcon className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.reuters.com/world/article-slug..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Our engine extracts the title, body content, publisher, and checks SSL domain authority automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm md:text-base shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Verify Article URL
            </button>
          </form>
        )}

        {/* OPTION 3: IMAGE */}
        {activeTab === 'image' && (
          <form onSubmit={handleImageSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Headline / Context (Optional)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Screenshot circulating on social media..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all mb-4"
              />
            </div>

            {/* Drag & Drop Upload Zone */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-3xl p-6 sm:p-10 text-center bg-slate-50/50 dark:bg-slate-900/40 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {filePreview ? (
                <div className="space-y-4">
                  <img
                    src={filePreview}
                    alt="Uploaded screenshot"
                    className="max-h-60 mx-auto rounded-xl shadow-md object-contain border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {selectedFile?.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 block">
                      Drag & Drop Your News Screenshot Here
                    </span>
                    <span className="text-xs text-slate-400">
                      or click to browse from device / use mobile camera
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">JPG</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">PNG</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">WEBP</span>
                    <span>Max: 10MB</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full py-4 rounded-2xl bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-white font-bold text-sm md:text-base shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Extract Text & Verify Image
            </button>
          </form>
        )}

        {/* OPTION 4: PDF */}
        {activeTab === 'pdf' && (
          <form onSubmit={handlePdfSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Headline / Title (Optional)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Investigation Report or Press Document..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all mb-4"
              />
            </div>

            {/* Drag & Drop PDF Zone */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-3xl p-6 sm:p-10 text-center bg-slate-50/50 dark:bg-slate-900/40 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <FileCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 block">
                      Drag & Drop Your News PDF Document
                    </span>
                    <span className="text-xs text-slate-400">
                      Extracts multi-page text and tabular assertions automatically
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">PDF Format (Max: 10MB)</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full py-4 rounded-2xl bg-indigo-600 disabled:opacity-50 hover:bg-indigo-500 text-white font-bold text-sm md:text-base shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Extract PDF Text & Audit
            </button>
          </form>
        )}
      </div>

      {/* College Presentation Quick Demo Presets */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Instant Demo Presets (Zero-API College Demo Mode)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Demonstrate all verification outcomes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {demoCases.map((demo) => {
            const pred = (demo.outcomeCategory || demo.prediction || '').toLowerCase();
            const isSupp = pred.includes('supporting') || pred.includes('real') || pred.includes('ஆதரிக்கும்');
            const isConf = pred.includes('conflicting') || pred.includes('fake') || pred.includes('முரண்பாடான');
            const isCont = pred.includes('context') || pred.includes('misleading') || pred.includes('கூடுதல்');
            
            return (
              <button
                key={demo.id}
                onClick={() => loadDemoCase(demo)}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/50 hover:shadow-md text-left transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400 truncate max-w-[140px]">{demo.category}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isSupp
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isConf
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : isCont
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {demo.localizedOutcome || demo.outcomeCategory || demo.prediction}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-sky-400 transition-colors">
                  {demo.title}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};

export default CheckNewsPage;
