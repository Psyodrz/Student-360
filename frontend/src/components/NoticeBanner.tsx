import React, { useState, useEffect, useRef } from 'react';
import { cmsAPI } from '../lib/api';
import { 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  Pause,
  Play,
  Calendar
} from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at?: string;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 101,
    title: "Mid-Term Academic Review & Early Intervention Mandate",
    content: "Faculty mentors are requested to review flagged student interventions for Mid-Term before the end of the current cycle. Strict attendance compliance (>75%) is enforced across all engineering departments.",
    priority: "urgent",
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    title: "Remedial Tutoring Sessions Schedule Active",
    content: "Remedial tutoring sessions for students scoring below 60% in internal tests are scheduled every Wednesday in Block B. Check your student portal for assigned subject mentors.",
    priority: "normal",
    created_at: new Date().toISOString()
  }
];

export default function NoticeBanner({ className = "" }: { className?: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const timerRef = useRef<any>(null);

  const fetchAnnouncements = () => {
    cmsAPI.getPublicAnnouncements()
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAnnouncements(res.data);
        } else {
          setAnnouncements(DEFAULT_ANNOUNCEMENTS);
        }
      })
      .catch(() => {
        setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      });
  };

  useEffect(() => {
    // Check if dismissed during current session
    if (sessionStorage.getItem('student360_notice_dismissed') === 'true') {
      setIsDismissed(true);
    }
    fetchAnnouncements();

    // Auto refresh notices every 45s
    const pollInterval = setInterval(fetchAnnouncements, 45000);
    return () => clearInterval(pollInterval);
  }, []);

  // Auto rotation timer
  useEffect(() => {
    if (announcements.length <= 1 || isPaused || isDismissed) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcements.length, isPaused, isDismissed]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % announcements.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem('student360_notice_dismissed', 'true');
  };

  if (isDismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex] || announcements[0];
  const isUrgent = current?.priority === 'urgent' || current?.priority === 'high';

  return (
    <>
      {/* 🌟 Dynamic Luxury Notice Ticker Bar */}
      <div 
        role="region"
        aria-label="Institutional Campus Notices"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`w-full bg-[#1C1815] border-b border-[#3D332B] text-[#FAF7F2] select-none shadow-sm relative z-30 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Badge & Live Indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
              isUrgent 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs' 
                : 'bg-amber-400 text-[#1F1B18] font-bold shadow-xs'
            }`}>
              {isUrgent ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping inline-block" />
                  <AlertTriangle className="w-2.5 h-2.5" />
                  URGENT
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F1B18]" />
                  NOTICE
                </>
              )}
            </span>

            {/* Counter pill (e.g. 1/3) */}
            {announcements.length > 1 && (
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium text-[#A69788] bg-[#27211C] px-1.5 py-0.5 rounded border border-[#3D332B]">
                {currentIndex + 1}/{announcements.length}
              </span>
            )}
          </div>

          {/* Center: Dynamic Announcement Text (Clickable on Mobile) */}
          <div 
            onClick={() => setMobileModalOpen(true)}
            className="flex-1 min-w-0 cursor-pointer sm:cursor-default group flex items-center gap-2"
          >
            <div className="flex items-center gap-1.5 truncate text-xs">
              <span className="font-semibold text-amber-200 group-hover:text-amber-100 transition-colors flex-shrink-0">
                {current.title}:
              </span>
              <span className="text-[#D8CEBE] truncate font-normal group-hover:text-white transition-colors">
                {current.content}
              </span>
            </div>

            {/* Mobile tap indicator icon */}
            <span className="sm:hidden text-[10px] text-amber-400/90 font-medium whitespace-nowrap underline underline-offset-2 flex items-center gap-0.5 flex-shrink-0">
              Read <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>

          {/* Right: Controls (Previous, Next, Pause, Close) */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {announcements.length > 1 && (
              <div className="flex items-center gap-0.5 bg-[#27211C] p-0.5 rounded-md border border-[#3D332B]">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous announcement"
                  className="p-1 text-[#A69788] hover:text-white hover:bg-[#3D332B] rounded transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  aria-label={isPaused ? "Play announcement cycle" : "Pause announcement cycle"}
                  className="p-1 text-[#A69788] hover:text-white hover:bg-[#3D332B] rounded transition-colors hidden sm:inline-flex"
                >
                  {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next announcement"
                  className="p-1 text-[#A69788] hover:text-white hover:bg-[#3D332B] rounded transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss notice"
              className="p-1 text-[#A69788] hover:text-white hover:bg-[#27211C] rounded transition-colors ml-1"
              title="Dismiss announcement banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 🌟 Mobile Bottom Sheet / Modal for Easy Reading on Handheld Devices */}
      {mobileModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setMobileModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-[#FAF7F2] rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl border border-[#D5C7B7] text-[#2C2621] max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E8DEC8]">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isUrgent 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  <Bell className="w-3 h-3" />
                  {isUrgent ? 'Urgent Alert' : 'Campus Notice'}
                </span>
                {announcements.length > 1 && (
                  <span className="text-xs font-mono font-medium text-[#7D6E61]">
                    {currentIndex + 1} of {announcements.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7D6E61] hover:text-[#2C2621] hover:bg-[#EADBCE] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-[#1F1B18] mt-4 leading-snug">
              {current.title}
            </h3>

            {/* Timestamp if present */}
            {current.created_at && (
              <div className="flex items-center gap-1.5 text-xs text-[#8C7B6D] mt-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>Posted {new Date(current.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}

            {/* Full Content */}
            <div className="mt-4 p-4 rounded-xl bg-[#F4EDE4] border border-[#E3D6C5] text-sm text-[#423830] leading-relaxed whitespace-pre-wrap">
              {current.content}
            </div>

            {/* Mobile Footer Navigation */}
            <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-[#E8DEC8]">
              {announcements.length > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-3 py-1.5 rounded-lg bg-[#EADBCE] hover:bg-[#DFD1C1] text-xs font-semibold text-[#2C2621] flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-3 py-1.5 rounded-lg bg-[#EADBCE] hover:bg-[#DFD1C1] text-xs font-semibold text-[#2C2621] flex items-center gap-1 transition-colors"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : <div />}

              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#2C2621] hover:bg-[#1F1B18] text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
