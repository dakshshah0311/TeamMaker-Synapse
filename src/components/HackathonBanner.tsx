import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import type { HackathonMilestone } from '../types';

interface HackathonBannerProps {
  milestone: HackathonMilestone;
}

export function HackathonBanner({ milestone }: HackathonBannerProps) {
  const [seconds, setSeconds] = useState(milestone.secondsRemaining);
  const [minutes, setMinutes] = useState(milestone.minutesRemaining);
  const [hours, setHours] = useState(milestone.hoursRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds > 0) return prevSeconds - 1;
        setMinutes((prevMinutes) => {
          if (prevMinutes > 0) return prevMinutes - 1;
          setHours((prevHours) => (prevHours > 0 ? prevHours - 1 : 0));
          return 59;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (value: number) => value.toString().padStart(2, '0');

  return (
    <section className="mb-6 flex flex-col gap-4 rounded-xl border border-[#2B322A] bg-[#101310] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-[11px] font-medium text-[#A0A99D]">UPCOMING MILESTONE</span>
          <span className="h-1 w-1 rounded-full bg-[#697366]" />
          <span className="text-xs text-[#A0A99D]">{milestone.deadlineName}</span>
        </div>
        <h2 className="mt-1 truncate text-base font-semibold text-[#F4F6F1]">{milestone.title}</h2>
        <p className="mt-1 text-xs text-[#A0A99D]">
          Find your team before the deadline and get to building.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-[#2B322A] bg-[#090B09] px-3 py-2">
          <Clock size={15} className="text-[#B7F36B]" />
          <span className="font-mono text-sm tabular-nums text-[#F4F6F1]">
            {formatNumber(hours)}:{formatNumber(minutes)}:{formatNumber(seconds)}
          </span>
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <p className="text-[#697366]">Prize pool</p>
            <p className="mt-0.5 font-mono font-medium text-[#75D99A]">{milestone.prizePoolTotal}</p>
          </div>
          <div>
            <p className="text-[#697366]">Participants</p>
            <p className="mt-0.5 font-mono font-medium text-[#F4F6F1]">{milestone.participantsCount}</p>
          </div>
          <div>
            <p className="text-[#697366]">Teams</p>
            <p className="mt-0.5 font-mono font-medium text-[#F4F6F1]">{milestone.teamsFormed}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
