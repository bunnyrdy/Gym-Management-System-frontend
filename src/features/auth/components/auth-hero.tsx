// /**
//  * Left panel of the split auth layout (`code 4.html`). Hidden below `lg`.
//  *
//  * The Stitch mockup pointed at a temporary lh3.googleusercontent.com asset, so
//  * the runner is inline SVG instead — no external request, no broken image when
//  * that URL expires, and it recolours with the theme tokens.
//  */

// export function AuthHero() {
//   return (
//     <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-surface-container-low p-xl lg:flex fade-in">
//       <div className="ambient-panel pointer-events-none absolute inset-0 h-full w-full opacity-50" />

//       <svg
//         viewBox="0 0 320 320"
//         className="z-10 max-h-[70%] max-w-[70%] drop-shadow-2xl"
//         role="img"
//         aria-label="Abstract geometric illustration of a runner in motion"
//       >
//         {/* Angular polygons in deep charcoal and vibrant orange — speed and vigour. */}
//         <polygon points="150,40 178,58 168,88 140,74" className="fill-on-surface" />
//         <polygon points="140,74 176,86 186,150 152,144" className="fill-inverse-surface" />
//         <polygon points="176,86 224,104 236,126 200,120" className="fill-primary-container" />
//         <polygon points="152,144 186,150 214,208 178,204" className="fill-on-surface" />
//         <polygon points="178,204 214,208 240,268 206,272" className="fill-primary-container" />
//         <polygon points="152,144 178,204 118,232 100,204" className="fill-inverse-surface" />
//         <polygon points="100,204 118,232 74,276 54,252" className="fill-primary" />
//         <polygon points="140,74 152,144 96,132 92,102" className="fill-tertiary" />
//         <polygon points="92,102 96,132 42,140 40,116" className="fill-primary-container" />
//         {/* Motion streaks */}
//         <rect x="14" y="88" width="58" height="6" rx="3" className="fill-outline-variant" />
//         <rect x="30" y="106" width="40" height="6" rx="3" className="fill-outline-variant" />
//         <rect x="4" y="124" width="26" height="6" rx="3" className="fill-outline-variant" />
//       </svg>
//     </div>
//   )
// }

import { Logo } from '@/components/brand/logo'

export function AuthHero() {
  return (
    <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-surface-container-low lg:flex">
      {/* Background effect */}
      <div className="ambient-panel pointer-events-none absolute inset-0 opacity-50" />

      {/* Large centered logo */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-12">
        <Logo
          variant="full"
          plateClassName="w-full max-w-[650px] bg-transparent p-0 shadow-none"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  )
}
