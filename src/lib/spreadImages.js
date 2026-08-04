import cover from '../assets/album/cover.jpg';
import s1l from '../assets/album/spread_1_left.png';
import s1r from '../assets/album/spread_1_right.png';
import s2l from '../assets/album/spread_2_left.png';
import s2r from '../assets/album/spread_2_right.png';
import s3l from '../assets/album/spread_3_left.png';
import s3r from '../assets/album/spread_3_right.png';
import s4l from '../assets/album/spread_4_left.png';
import s4r from '../assets/album/spread_4_right.png';

export const coverImage = cover;

const spreadImages = [
  { left: s1l, right: s1r },
  { left: s2l, right: s2r },
  { left: s3l, right: s3r },
  { left: s4l, right: s4r },
];

// pageNumber is 1-indexed within album.pages (the cover is separate).
// Once the album grows past the 4 supplied templates, cycle back through
// them (1,2,3,4,1,2,3,4,...) instead of falling back to a blank page.
export function backgroundForPage(pageNumber) {
  const spreadIndex = (Math.ceil(pageNumber / 2) - 1) % spreadImages.length;
  const side = pageNumber % 2 === 1 ? 'left' : 'right';
  return spreadImages[spreadIndex][side];
}
