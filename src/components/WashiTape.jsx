import gingham from '../assets/album/washi-gingham.png';
import stars from '../assets/album/washi-stars.png';

const TAPE_IMAGE = { gingham, stars };

const CORNER_POSITION = {
  'top-left': 'left-[-16px] top-[-12px]',
  'top-right': 'right-[-16px] top-[-12px]',
};

export default function WashiTape({ kind = 'gingham', corner = 'top-left', rotate = -8 }) {
  return (
    <img
      src={TAPE_IMAGE[kind]}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 w-20 drop-shadow-sm ${CORNER_POSITION[corner]}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}
