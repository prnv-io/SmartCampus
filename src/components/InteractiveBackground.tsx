 "use client"
 
 import { useEffect, useMemo, useRef } from "react"
 
 type Props = {
   className?: string
   /** Enable subtle background tint shift based on cursor position */
   enableTintShift?: boolean
 }
 
 type Vec2 = { x: number; y: number }
 
 function lerp(a: number, b: number, t: number) {
   return a + (b - a) * t
 }
 
 export default function InteractiveBackground({ className = "", enableTintShift = true }: Props) {
   const rootRef = useRef<HTMLDivElement | null>(null)
   const blobARef = useRef<HTMLDivElement | null>(null)
   const blobBRef = useRef<HTMLDivElement | null>(null)
  const blobCRef = useRef<HTMLDivElement | null>(null)
 
   const prefersReducedMotion = useMemo(() => {
     if (typeof window === "undefined") return false
     return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
   }, [])
 
   useEffect(() => {
     const root = rootRef.current
     const a = blobARef.current
     const b = blobBRef.current
    const c = blobCRef.current
    if (!root || !a || !b || !c) return
 
     // Target is where the mouse is; current is the smoothed position.
     let target: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
     let posA: Vec2 = { ...target }
     let posB: Vec2 = { ...target }
    let posC: Vec2 = { ...target }
 
     let raf = 0
     let running = true
 
     const onMove = (e: PointerEvent) => {
       target = { x: e.clientX, y: e.clientY }
     }
 
     const onLeave = () => {
       // Drift back to center when leaving the window.
       target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
     }
 
     window.addEventListener("pointermove", onMove, { passive: true })
     window.addEventListener("pointerleave", onLeave)
 
     const tick = () => {
       if (!running) return
 
       // Smooth trailing. B follows more slowly than A.
       const tA = prefersReducedMotion ? 1 : 0.12
       const tB = prefersReducedMotion ? 1 : 0.08
      const tC = prefersReducedMotion ? 1 : 0.05
 
       posA = { x: lerp(posA.x, target.x, tA), y: lerp(posA.y, target.y, tA) }
       posB = { x: lerp(posB.x, target.x, tB), y: lerp(posB.y, target.y, tB) }
      posC = { x: lerp(posC.x, target.x, tC), y: lerp(posC.y, target.y, tC) }
 
       // Translate blobs. Use translate3d for better perf.
       a.style.transform = `translate3d(${posA.x}px, ${posA.y}px, 0)`
       b.style.transform = `translate3d(${posB.x}px, ${posB.y}px, 0)`
      c.style.transform = `translate3d(${posC.x}px, ${posC.y}px, 0)`
 
       if (enableTintShift) {
         const vw = Math.max(1, window.innerWidth)
         const vh = Math.max(1, window.innerHeight)
         const xp = Math.round((posA.x / vw) * 100)
         const yp = Math.round((posA.y / vh) * 100)
         root.style.setProperty("--ib-x", `${xp}%`)
         root.style.setProperty("--ib-y", `${yp}%`)
       }
 
       raf = window.requestAnimationFrame(tick)
     }
 
     raf = window.requestAnimationFrame(tick)
 
     return () => {
       running = false
       window.removeEventListener("pointermove", onMove)
       window.removeEventListener("pointerleave", onLeave)
       if (raf) window.cancelAnimationFrame(raf)
     }
   }, [enableTintShift, prefersReducedMotion])
 
   return (
     <div
       ref={rootRef}
       aria-hidden
       className={[
         "pointer-events-none fixed inset-0 overflow-hidden",
        // Keep visible even if pages use solid bg-* by rendering above them.
        // Ensure app content has a higher z-index (handled in layout).
        "z-10",
         className,
       ].join(" ")}
       style={
         enableTintShift
           ? {
              // Subtle tint that shifts with cursor
               background:
                "radial-gradient(1200px 800px at var(--ib-x, 50%) var(--ib-y, 45%), rgba(204,107,74,0.12), transparent 60%)",
             }
           : undefined
       }
     >
       {/* Glow blob A (leading) */}
       <div
         ref={blobARef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-55"
         style={{
           width: 520,
           height: 520,
           background:
            "radial-gradient(circle at 35% 35%, rgba(204,107,74,0.45), rgba(245,165,90,0.25), rgba(204,107,74,0) 70%)",
           willChange: "transform",
         }}
       />
 
       {/* Glow blob B (trailing, slightly larger + softer) */}
       <div
         ref={blobBRef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 blur-[90px] opacity-45"
         style={{
           width: 620,
           height: 620,
           background:
            "radial-gradient(circle at 55% 55%, rgba(245,165,90,0.35), rgba(204,107,74,0.16), rgba(245,165,90,0) 72%)",
           willChange: "transform",
         }}
       />

      {/* Glow blob C (very soft ambient layer) */}
      <div
        ref={blobCRef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 blur-[110px] opacity-20"
        style={{
          width: 820,
          height: 820,
          background:
            "radial-gradient(circle at 50% 50%, rgba(204,107,74,0.20), rgba(245,165,90,0.10), rgba(204,107,74,0) 74%)",
          willChange: "transform",
        }}
      />
     </div>
   )
 }
