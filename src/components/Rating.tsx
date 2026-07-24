import { Star } from 'lucide-react';
import { classNames } from '../utils/format';

export default function Rating({ value, size = 16, className = '' }: { value: number; size?: number; className?: string }) {
  return (
    <div className={classNames('flex items-center gap-0.5', className)} aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-ink-200 dark:text-ink-700" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-accent-400 fill-accent-400" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
