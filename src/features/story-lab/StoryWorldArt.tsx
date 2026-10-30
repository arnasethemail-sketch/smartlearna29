import { useId } from "react";
import type { ExperienceId } from "./types";

export function StoryWorldArt({ world }: { world: ExperienceId }) {
  const id = useId().replaceAll(":", "");
  const isHotel = world === "hotel";
  return (
    <svg
      viewBox="0 0 640 380"
      role="img"
      aria-label={isHotel
        ? "A crooked violet hotel with glowing windows, a friendly ghost, and a key beneath a crescent moon"
        : "A hidden observatory beneath a luminous constellation, with a telescope and a path across the stars"}
      className="story-lab-art"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2="1" y2="1">
          <stop stopColor={isHotel ? "#231334" : "#071f32"} />
          <stop offset="1" stopColor={isHotel ? "#6a346c" : "#145859"} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor={isHotel ? "#f4b16e" : "#81e2d5"} stopOpacity=".38" />
          <stop offset="1" stopColor={isHotel ? "#f4b16e" : "#81e2d5"} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="380" fill={`url(#${id}-sky)`} />
      <circle cx="340" cy="205" r="210" fill={`url(#${id}-glow)`} />
      {[[43,64],[110,37],[194,84],[251,31],[355,53],[429,30],[523,96],[601,51],[563,181],[65,194],[153,139],[468,147]].map(([x,y], index) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} fill={index % 3 === 0 ? "#f7d69a" : "#fff2d8"} opacity={index % 2 ? .45 : .85}>
          <path d="M0 -4 1 -1 4 0 1 1 0 4 -1 1 -4 0 -1 -1Z" />
        </g>
      ))}
      {isHotel ? (
        <>
          <path d="M543 43a37 37 0 1 0 24 62 32 32 0 0 1-24-62" fill="#ffe4ac" />
          <path d="M0 321Q100 282 195 314T405 310T640 307V380H0Z" fill="#23172f" />
          <path d="M0 350Q114 327 233 350T490 344T640 341V380H0Z" fill="#181525" />
          <path d="M337 380 311 326 349 326 398 380Z" fill="#c598a9" opacity=".4" />
          <path d="m192 313 8-150 98-8 6 165Z" fill="#58396d" stroke="#d7a5c3" strokeWidth="2" />
          <path d="m185 169 64-73 58 66Z" fill="#9e527d" stroke="#ecbcbd" strokeWidth="2" />
          <path d="m289 322 6-207 95-4 13 216Z" fill="#6d447e" stroke="#d7a5c3" strokeWidth="2" />
          <path d="m283 118 57-95 62 94Z" fill="#bf6888" stroke="#f3beb5" strokeWidth="2" />
          <path d="m389 325 3-139 77 10 12 134Z" fill="#50345f" stroke="#d7a5c3" strokeWidth="2" />
          <path d="m381 190 50-62 48 70Z" fill="#9e527d" stroke="#ecbcbd" strokeWidth="2" />
          <path d="m342 24 3-19m-10 5 18-3" stroke="#ffc67f" strokeWidth="3" />
          {[ [217,192],[255,187],[216,240],[255,238],[315,143],[354,142],[316,190],[356,190],[317,237],[357,236],[412,217],[443,222],[413,267],[445,271] ].map(([x,y]) => (
            <g key={`${x}-${y}`}>
              <path d={`M${x} ${y+25}v-19a8 8 0 0 1 16 0v19Z`} fill="#ffd797" stroke="#382344" strokeWidth="3" />
              <path d={`M${x+8} ${y-2}v26m-7-11h14`} stroke="#8e5578" strokeWidth="2" />
            </g>
          ))}
          <path d="M319 328v-33a20 20 0 0 1 40 0v33" fill="#23172f" stroke="#eebf91" strokeWidth="3" />
          <circle cx="347" cy="307" r="2" fill="#ffdc97" />
          <path d="m279 269 119-5-1 19-118 5Z" fill="#3d273e" stroke="#e0b681" />
          <text x="337" y="280" textAnchor="middle" fill="#ffdfaa" fontFamily="Georgia,serif" fontSize="11" letterSpacing="3">MIDNIGHT</text>
          <g transform="translate(124 219) rotate(-12)">
            <path d="M0 30V0a22 22 0 0 1 44 0v39l-10-8-10 8-10-8-14 8Z" fill="#eee4ff" opacity=".95" />
            <ellipse cx="14" cy="4" rx="3" ry="5" fill="#3a2853" /><ellipse cx="30" cy="4" rx="3" ry="5" fill="#3a2853" />
            <path d="M17 16q6 6 12-1" fill="none" stroke="#8261a0" strokeWidth="2" />
          </g>
          <g transform="translate(522 254) rotate(24)" stroke="#ffd38b" strokeWidth="5" fill="none">
            <circle r="13" /><path d="M0 13v43m0-9h13v-8m-13 1h-9" />
          </g>
          <path d="M91 119q18-22 29 1 11-23 30-3-20-5-28 13-10-17-31-11" fill="#21162d" />
        </>
      ) : (
        <>
          <circle cx="471" cy="78" r="36" fill="#a9ddd6" opacity=".15" />
          <circle cx="471" cy="78" r="22" fill="#cfede0" />
          <g fill="none" stroke="#d3e9c0" strokeWidth="1.5">
            <path d="m106 84 70 34 62-61 74 52 87-42" opacity=".5" />
            <path d="m176 118 18 66 90-8 28-67" opacity=".35" />
          </g>
          {[[106,84],[176,118],[238,57],[312,109],[399,67],[194,184],[284,176]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#f5dda1" />)}
          <path d="M0 305 70 280 117 299 197 239 255 286 312 252 380 288 451 246 522 281 579 250 640 279V380H0Z" fill="#092d37" />
          <path d="m0 351 109-29 72 17 101-31 110 15 62-22 89 34 97-12v57H0Z" fill="#081e2c" />
          <path d="m195 380 66-54 77-3 108 57" fill="#385358" />
          <path d="m265 351 105-2m-124 14h151m-170 14h197" stroke="#87a8a3" strokeWidth="3" opacity=".55" />
          <path d="M244 320V204h151v116Z" fill="#35656c" stroke="#82b6b2" strokeWidth="2" />
          <path d="M227 207a94 94 0 0 1 187 0Z" fill="#53858a" stroke="#a1cac2" strokeWidth="2" />
          <path d="M297 112q-38 47-32 94h40q-8-57 16-105" fill="#143b4b" />
          <path d="M236 225h168m-164 69h160" stroke="#b6cbb4" strokeWidth="4" />
          <path d="M294 321v-43a25 25 0 0 1 50 0v43" fill="#0a2a39" stroke="#afc9ad" strokeWidth="3" />
          <path d="M307 308v-29a12 12 0 0 1 24 0v29" fill="#dcd79b" opacity=".85" />
          <circle cx="266" cy="255" r="9" fill="#f5dba0" stroke="#b6cbb4" strokeWidth="3" />
          <circle cx="373" cy="255" r="9" fill="#f5dba0" stroke="#b6cbb4" strokeWidth="3" />
          <g transform="translate(475 249) rotate(-29)">
            <path d="M0 0h86v23H0Z" fill="#b3c9b5" stroke="#112d36" strokeWidth="2" />
            <path d="M73-4h14v31H73Z" fill="#e5d49a" /><path d="M0 5h-14v13H0" fill="#e5d49a" />
          </g>
          <path d="m509 264-29 63m29-63 30 63m-30-63v64" stroke="#8bb3a8" strokeWidth="5" />
          <g transform="translate(124 270)" stroke="#dcd6a4" fill="none">
            <circle r="30" /><ellipse rx="12" ry="30" transform="rotate(35)" /><ellipse rx="30" ry="10" transform="rotate(-25)" /><circle r="5" fill="#f5dba0" />
          </g>
          <path d="M54 337q28-37 55-1m448 0q25-38 51-10" fill="none" stroke="#4b7c6c" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}
