import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Calendar,
  Zap,
  ShieldCheck,
  RotateCcw,
  Unlink,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';

export default function TelegramModal({ isOpen, onClose }) {
  const [status, setStatus] = useState(null);
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    try {
      const data = await api.getTelegramStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.generateTelegramLinkCode();
      setLinkData(data);
    } catch (e) {
      setError(e.message || 'Failed to generate linking code');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Telegram account from Lumora?')) return;
    setLoading(true);
    try {
      await api.unlinkTelegram();
      setLinkData(null);
      await fetchStatus();
    } catch (e) {
      setError(e.message || 'Failed to disconnect Telegram');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (linkData?.code) {
      navigator.clipboard.writeText(linkData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setCopied(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const botUsername = status?.bot_username || 'Lumora_App_Bot';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white border border-[#D2E2D8] rounded-3xl shadow-2xl overflow-hidden text-[#152F26]">
        
        {/* Header with Botanical Gradient & Glow */}
        <div className="relative p-6 bg-gradient-to-br from-[#152F26] via-[#1F6B4F] to-[#2E855F] text-white overflow-hidden">
          {/* Subtle Ambient Orbs */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#86EFAC]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#38BDF8]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                <Send className="w-6 h-6 text-[#86EFAC]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">Telegram Quick Access</h2>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#86EFAC]/25 border border-[#86EFAC]/40 text-[#86EFAC] rounded-full">
                    Pocket Mode
                  </span>
                </div>
                <p className="text-xs text-[#E3F2E9]/80 mt-0.5">
                  Capture tasks & view your daily Rule of 3 schedule in seconds
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Connection Status Card */}
          <div className="p-4 rounded-2xl bg-[#F0F9F4] border border-[#C2E2D0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status?.is_connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <div className="text-sm font-semibold text-[#152F26]">
                  {status?.is_connected ? (
                    <span>Connected to <span className="text-[#1F6B4F]">@{status.telegram_username || 'Telegram'}</span></span>
                  ) : (
                    <span>Not Linked Yet</span>
                  )}
                </div>
                <div className="text-xs text-[#638379] mt-0.5">
                  Bot: <a href={`https://t.me/${botUsername}`} target="_blank" rel="noreferrer" className="text-[#1F6B4F] font-medium underline">@{botUsername}</a>
                </div>
              </div>
            </div>

            {status?.is_connected && (
              <button
                onClick={handleUnlink}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100/60 rounded-xl border border-rose-200 transition-colors"
              >
                <Unlink className="w-3.5 h-3.5" />
                Disconnect
              </button>
            )}
          </div>

          {/* Linking Section if Not Connected */}
          {!status?.is_connected && (
            <div className="p-5 rounded-2xl bg-[#FAFDFB] border border-[#D2E2D8] space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#E3F2E9] text-[#1F6B4F] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#152F26]">Link with One-Time Code</h4>
                  <p className="text-xs text-[#638379] mt-0.5">
                    Generate a temporary, single-use code to bind your Telegram user to this Lumora account.
                  </p>
                </div>
              </div>

              {linkData ? (
                <div className="p-4 rounded-xl bg-white border-2 border-[#1F6B4F]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#638379]">One-Time Code (Expires in 15m)</span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 text-xs font-medium text-[#1F6B4F] hover:text-[#152F26]"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center py-2.5 bg-[#EBF7E9] rounded-xl border border-[#C2E2D0]">
                    <span className="font-mono text-2xl font-bold tracking-widest text-[#152F26]">
                      {linkData.code}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={linkData.deep_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1F6B4F] hover:bg-[#152F26] text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      1-Click Open & Connect Bot
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>

                    <button
                      onClick={handleGenerateCode}
                      disabled={loading}
                      className="p-2.5 text-[#638379] hover:text-[#152F26] hover:bg-slate-100 rounded-xl border border-[#D2E2D8] transition-colors"
                      title="Generate new code"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-[#638379] text-center">
                    Or open <b>@{botUsername}</b> and send: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-[#152F26]">/link {linkData.code}</code>
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCode}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1F6B4F] hover:bg-[#152F26] text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Code...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-[#86EFAC]" />
                      Generate Linking Code
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Feature Highlights Grid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#638379]">Pocket Capabilities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <div className="p-3 rounded-xl bg-white border border-[#D2E2D8] hover:border-[#1F6B4F]/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#E3F2E9] text-[#1F6B4F] flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-[#152F26]">Natural Capture</h5>
                <p className="text-[11px] text-[#638379] mt-0.5">
                  Type <i>"FYP meeting Thursday at 2pm"</i> and AI extracts it conflict-free.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D2E2D8] hover:border-[#1F6B4F]/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#EBF4FB] text-[#2B6CB0] flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-[#152F26]">Daily Rule of 3</h5>
                <p className="text-[11px] text-[#638379] mt-0.5">
                  Check today's top 3 commitments and what's next with <code className="text-[#2B6CB0]">/schedule</code>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D2E2D8] hover:border-[#1F6B4F]/40 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#FFF1F3] text-[#B85D6F] flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-[#152F26]">Overload Guard</h5>
                <p className="text-[11px] text-[#638379] mt-0.5">
                  Instant capacity recalculation with direct links to rebalance when heavy.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAF9] border-t border-[#D2E2D8] flex items-center justify-between text-xs text-[#638379]">
          <span>Protected by Lumora's zero-shame privacy model.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-[#152F26] hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
