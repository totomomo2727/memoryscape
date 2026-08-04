import { forwardRef, useRef, useState } from 'react';
import { coverImage } from '../lib/spreadImages';
import { useStopBookFlip } from '../lib/useStopBookFlip';

const CoverPage = forwardRef(function CoverPage({ dateRange, onDateRangeChange }, ref) {
  const fieldsRef = useRef(null);
  // Kept local while typing: committing every keystroke straight to the
  // shared album state would re-render Album on each key, handing
  // HTMLFlipBook a new `children` array. react-pageflip treats that as a
  // page-content change and rebuilds its internal DOM, which drops focus
  // from this input after every character. Committing on blur instead
  // avoids that entirely.
  const [localDate, setLocalDate] = useState(dateRange);
  useStopBookFlip(fieldsRef);

  return (
    <div ref={ref} className="relative h-full w-full [container-type:inline-size]">
      <div
        className="absolute inset-0 overflow-hidden rounded-[2px] bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${coverImage})`,
          boxShadow: [
            '5px 6px 0 0 #f6efe0',
            '5px 6px 0 1px rgba(74,56,38,0.25)',
            '10px 12px 0 0 #ecdfc2',
            '10px 12px 0 1px rgba(74,56,38,0.22)',
            '15px 18px 10px 0 rgba(74,56,38,0.35)',
          ].join(', '),
        }}
      />

      <div
        ref={fieldsRef}
        className="absolute inset-x-0 bottom-0 flex justify-center px-[clamp(0.75rem,8cqw,2rem)] pb-[clamp(0.75rem,6cqw,1.75rem)]"
      >
        <input
          value={localDate}
          onChange={(e) => setLocalDate(e.target.value)}
          onBlur={() => onDateRangeChange(localDate)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          placeholder="June — August"
          className="w-full rounded-full bg-ivory/70 px-3 py-1 text-center font-hand text-[clamp(0.85rem,5cqw,1.15rem)] text-terracotta-dark placeholder:text-terracotta-dark/50 focus:outline-none"
        />
      </div>
    </div>
  );
});

export default CoverPage;
