import { MapPin, User, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CurrentClassProps {
  className: string;
  room: string;
  instructor: string;
  timeRemaining?: string; // optional; will be computed when times provided
  status?: 'ongoing' | 'upcoming';
  progressPercentage?: number; // optional; will be computed when times provided
  startTime?: string; // ISO or 'HH:MM[:SS]' today
  endTime?: string;   // ISO or 'HH:MM[:SS]' today
  autoProgress?: boolean; // default true for ongoing
}

export function CurrentClass({ className, room, instructor, timeRemaining, status = 'ongoing', progressPercentage = 0, startTime, endTime, autoProgress = true }: CurrentClassProps) {
  const isOngoing = status === 'ongoing';
  // Use the same UI styling for both ongoing and upcoming
  const gradientClass = 'from-blue-600 to-blue-800';
  const shadowClass = 'shadow-blue-500/20';

  // Compute live progress/time when start/end provided
  const [liveProgress, setLiveProgress] = useState<number>(progressPercentage || 0);
  const [liveTime, setLiveTime] = useState<string>(timeRemaining || (isOngoing ? 'Live now' : ''));

  const parseTime = (t?: string): Date | null => {
    if (!t) return null;
    try {
      // If already ISO
      const iso = new Date(t);
      if (!isNaN(iso.getTime())) return iso;
    } catch {}
    try {
      // Assume HH:MM or HH:MM:SS for today
      const now = new Date();
      const [hh, mm, ss] = t.split(':');
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hh), parseInt(mm || '0'), parseInt(ss || '0'));
      return d;
    } catch { return null; }
  };

  const start = useMemo(() => parseTime(startTime), [startTime]);
  const end = useMemo(() => parseTime(endTime), [endTime]);

  useEffect(() => {
    // Only auto-update if we have valid times
    if (!autoProgress || (!start && !end)) {
      setLiveProgress(progressPercentage || 0);
      setLiveTime(timeRemaining || (isOngoing ? 'Live now' : ''));
      return;
    }

    const compute = () => {
      const now = new Date();
      if (isOngoing && start && end) {
        const total = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const pct = Math.max(0, Math.min(100, (elapsed / Math.max(total, 1)) * 100));
        setLiveProgress(pct);
        const remainingMs = end.getTime() - now.getTime();
        if (remainingMs <= 0) setLiveTime('Done'); else {
          const mins = Math.ceil(remainingMs / 60000);
          if (mins >= 60) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            setLiveTime(`${h}h ${m}m left`);
          } else setLiveTime(`${mins} min left`);
        }
      } else if (!isOngoing && start) {
        const untilMs = start.getTime() - now.getTime();
        if (untilMs <= 0) setLiveTime('Starting soon'); else {
          const mins = Math.ceil(untilMs / 60000);
          if (mins >= 60) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            setLiveTime(`Starts in ${h}h ${m}m`);
          } else setLiveTime(`Starts in ${mins} min`);
        }
        setLiveProgress(0);
      }
    };

    compute();
    const id = setInterval(compute, 30000); // update every 30s
    return () => clearInterval(id);
  }, [autoProgress, isOngoing, start, end, progressPercentage, timeRemaining]);
  
  return (
    <div className="px-5 mb-6">
      <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-5 shadow-xl ${shadowClass}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className={`text-blue-100 text-xs font-medium uppercase tracking-wider mb-1`}>
              {isOngoing ? 'Current Class' : 'Next Class'}
            </p>
            <h2 className="text-white text-lg font-bold leading-tight">{className}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className={`w-4 h-4 bg-white rounded-full opacity-30 ${isOngoing ? 'animate-pulse' : ''}`}></div>
              <div className="absolute inset-0 w-2 h-2 bg-white rounded-full m-1"></div>
            </div>
            <span className="text-white text-xs font-bold tracking-wider">
              {isOngoing ? 'LIVE' : 'UPCOMING'}
            </span>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          {room && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <MapPin size={12} className={'text-blue-100'} />
              </div>
              <span className={`text-blue-100 text-sm font-medium`}>{room}</span>
            </div>
          )}
          
          {instructor && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <User size={12} className={'text-blue-100'} />
              </div>
              <span className={`text-blue-100 text-sm font-medium`}>{instructor}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Clock size={12} className={'text-blue-100'} />
            </div>
            <span className="text-white text-sm font-semibold">{liveTime}</span>
          </div>
        </div>
        
        {/* Always show progress bar for consistent UI; upcoming will show 0% */}
        <div className="mt-4">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, liveProgress))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}