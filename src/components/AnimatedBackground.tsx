 "use client"
 
 import { motion, useReducedMotion } from "framer-motion"
 
 type Props = {
   className?: string
   /** Enable subtle grid + noise overlay */
   showOverlay?: boolean
 }
 
 export default function AnimatedBackground({ className = "", showOverlay = true }: Props) {
   const reduceMotion = useReducedMotion()
 
   return (
     <div
       aria-hidden
       className={[
         "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
         "bg-gradient-to-b from-[#f7f4f1] via-[#f3efea] to-[#fbf7f2]",
         className,
       ].join(" ")}
     >
       {/* Soft blobs */}
       <motion.div
         className="absolute -top-32 -left-28 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-40"
         style={{
           background:
             "radial-gradient(circle at 30% 30%, rgba(204,107,74,0.55), rgba(204,107,74,0.0) 70%)",
         }}
         animate={
           reduceMotion
             ? { opacity: 0.35 }
             : {
                 x: [0, 40, -10, 0],
                 y: [0, 20, 50, 0],
                 opacity: [0.28, 0.42, 0.32, 0.28],
               }
         }
         transition={
           reduceMotion
             ? { duration: 0.01 }
             : { duration: 24, ease: "easeInOut", repeat: Infinity }
         }
       />
 
       <motion.div
         className="absolute -bottom-40 -right-28 h-[30rem] w-[30rem] rounded-full blur-3xl opacity-40"
         style={{
           background:
             "radial-gradient(circle at 60% 60%, rgba(245,165,90,0.55), rgba(245,165,90,0.0) 70%)",
         }}
         animate={
           reduceMotion
             ? { opacity: 0.32 }
             : {
                 x: [0, -30, 20, 0],
                 y: [0, -25, -45, 0],
                 opacity: [0.24, 0.36, 0.28, 0.24],
               }
         }
         transition={
           reduceMotion
             ? { duration: 0.01 }
             : { duration: 28, ease: "easeInOut", repeat: Infinity }
         }
       />
 
       <motion.div
         className="absolute left-1/2 top-1/3 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full blur-3xl opacity-35"
         style={{
           background:
             "radial-gradient(circle at 45% 45%, rgba(148,137,128,0.55), rgba(148,137,128,0.0) 70%)",
         }}
         animate={
           reduceMotion
             ? { opacity: 0.25 }
             : {
                 x: ["-50%", "-46%", "-52%", "-50%"],
                 y: ["-0%", "4%", "-3%", "-0%"],
                 opacity: [0.2, 0.34, 0.24, 0.2],
               }
         }
         transition={
           reduceMotion
             ? { duration: 0.01 }
             : { duration: 22, ease: "easeInOut", repeat: Infinity }
         }
       />
 
       {/* Subtle grid + noise overlay */}
       {showOverlay && (
         <>
           <div
             className="absolute inset-0 opacity-[0.06]"
             style={{
               backgroundImage:
                 "linear-gradient(to right, rgba(120,110,103,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,110,103,0.35) 1px, transparent 1px)",
               backgroundSize: "48px 48px",
               maskImage: "radial-gradient(ellipse at center, black 55%, transparent 78%)",
               WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 78%)",
             }}
           />
           <div
             className="absolute inset-0 opacity-[0.05]"
             style={{
               backgroundImage:
                 "radial-gradient(circle at 1px 1px, rgba(20,18,16,0.22) 1px, transparent 0)",
               backgroundSize: "3px 3px",
             }}
           />
         </>
       )}
     </div>
   )
 }
