import { useRef, useState, useEffect, type ReactNode } from "react";
import { motion, useScroll, useTransform, cubicBezier } from "framer-motion";

/* ----------------------- Utilities ----------------------- */
const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* Fade wrapper: use for fade + rise */
function Fade({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------- Visual System --------------------- */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {/* Base dark */}
      <div className="absolute inset-0 bg-[#0f1115]" />

      {/* Pulsing gradient blobs */}
      <div
        className="
          absolute -inset-[25%] blur-3xl mix-blend-screen will-change-transform
          opacity-0 animate-[bg-fade-in_420ms_ease-out_forwards]
        "
      >
        {/* Primary Blue */}
        <div
          className="
            absolute left-[12%] top-[18%] h-[55vmax] w-[55vmax] rounded-full
            bg-[radial-gradient(closest-side,#2563EB,transparent_70%)]
            opacity-[0.16]                /* base state to prevent bright flash */
            [animation-fill-mode:both]    /* honor 0%/100% values */
            animate-[blob-pulse_14s_ease-in-out_infinite]
            [-webkit-backface-visibility:hidden] [backface-visibility:hidden]
            will-change-transform
            [-webkit-transform:translateZ(0)]
            [-moz-osx-font-smoothing:grayscale]
            [-webkit-font-smoothing:antialiased]
            [-moz-font-smoothing:antialiased]
            [-ms-font-smoothing:antialiased]
            [animation-delay:-4s]         /* start mid-cycle */
          "
        />

        {/* Steel Blue */}
        <div
          className="
            absolute right-[10%] top-[8%] h-[60vmax] w-[60vmax] rounded-full
            bg-[radial-gradient(closest-side,#3B82F6,transparent_70%)]
            opacity-[0.12]
            [animation-fill-mode:both]
            animate-[blob-pulse-2_16s_ease-in-out_infinite]
            will-change-transform
            [-webkit-transform:translateZ(0)]
            [animation-delay:-9s]
          "
        />

        {/* Cool Slate */}
        <div
          className="
            absolute left-1/3 bottom-[-8%] h-[65vmax] w-[65vmax] rounded-full
            bg-[radial-gradient(closest-side,#64748B,transparent_70%)]
            opacity-[0.16]
            [animation-fill-mode:both]
            animate-[blob-pulse_18s_ease-in-out_infinite]
            will-change-transform
            [-webkit-transform:translateZ(0)]
            [animation-delay:-13s]
          "
        />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.06]
        [background:radial-gradient(rgba(255,255,255,.5)_1px,transparent_1px)]
        [background-size:18px_18px]" />

      {/* Soft static spotlights */}
      <div className="absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full
        bg-[radial-gradient(closest-side,rgba(100,210,255,.12),transparent)] blur-3xl" />
      <div className="absolute -bottom-40 right-1/3 h-[40rem] w-[40rem] rounded-full
        bg-[radial-gradient(closest-side,rgba(255,255,255,.06),transparent)] blur-3xl" />
    </div>
  );
}

/* ------------------- Micro-interactions ------------------- */
function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        setT({ rx: (py - 0.5) * -10, ry: (px - 0.5) * 10 });
      }}
      onMouseLeave={() => setT({ rx: 0, ry: 0 })}
      style={{ rotateX: t.rx, rotateY: t.ry, transformPerspective: 800 }}
      className="card p-5 transition-transform will-change-transform hover:shadow-[0_0_0_1px_var(--color-accent)] h-full flex flex-col"
    >
      {children}
    </motion.div>
  );
}

/* ------------------------ UI atoms ------------------------ */
function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-edge px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Fade><h2 className="text-3xl font-bold sm:text-4xl">{title}</h2></Fade>
        <Fade delay={0.08}><div className="mt-8">{children}</div></Fade>
      </div>
    </section>
  );
}

/* ------------------------- Navbar ------------------------- */
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-edge bg-black/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Brand */}
          <button onClick={() => scrollToId("home")} className="text-base font-semibold">
            <span className="rounded-xl border border-edge px-2 py-1">Stephen Colandro</span>
          </button>

          {/* Right: Links */}
          <nav className="hidden sm:flex items-center gap-8">
            {links.map((l) => (
              <button key={l.id} onClick={() => scrollToId(l.id)} className="text-sm hover:opacity-80">
                {l.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button className="sm:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">☰</button>
        </div>

        {open && (
          <div className="sm:hidden border-t border-edge py-3">
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    scrollToId(l.id);
                    setOpen(false);
                  }}
                  className="text-left text-sm"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------------------- Typewriter ----------------------- */
function Typewriter({
  phrases,
  typingSpeed = 60,
  deletingSpeed = 40,
  pause = 1200,
  className = "",
}: {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
  className?: string;
}) {
  const [loop, setLoop] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[loop % phrases.length];
    const speed = isDeleting ? deletingSpeed : typingSpeed;

    const tick = () => {
      const next = isDeleting
        ? current.substring(0, text.length - 1)
        : current.substring(0, text.length + 1);

      setText(next);

      if (!isDeleting && next === current) {
        setTimeout(() => setIsDeleting(true), pause);
      } else if (isDeleting && next === "") {
        setIsDeleting(false);
        setLoop((l) => l + 1);
      }
    };

    const id = setTimeout(tick, speed);
    return () => clearTimeout(id);
  }, [text, isDeleting, loop, phrases, typingSpeed, deletingSpeed, pause]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{text}</span>
      <span className="ml-1 inline-block w-[1ch] translate-y-[1px] border-r-2 border-white/80 animate-pulse" />
    </span>
  );
}

/* ------------------- FancyTitle (word reveal) ------------------- */
function FancyTitle({ text }: { text: string }) {
  const words = text.split(" ");

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: cubicBezier(0.16, 1, 0.3, 1) },
    },
  };

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      className="font-sans text-6xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight text-white"
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={item} className="inline-block mr-2">
          {w}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/* ---------------------- Parallax Hero --------------------- */
function ParallaxHero() {
  const { scrollY } = useScroll();
  const yHeading = useTransform(scrollY, [0, 600], [0, -60]);
  const yMedia   = useTransform(scrollY, [0, 600], [0, -120]);
  const oMedia   = useTransform(scrollY, [0, 300], [1, 0.5]);

  return (
    <section id="home" className="relative min-h-[78vh] flex items-center pt-14">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 lg:gap-16">
        {/* Left: Text */}
        <motion.div style={{ y: yHeading }} className="space-y-6 md:pr-8">
          <Fade delay={0.04}>
            <FancyTitle text="Hi, I’m Stephen" />
          </Fade>

          <Fade delay={0.1}>
            <div className="h-[1.75rem]">
              <Typewriter
                phrases={[
                  "Systems Administrator & SecOps Analyst Experience",
                  "Graduate of Kean University",
                ]}
                className="text-lg text-white/70"
                typingSpeed={55}
                deletingSpeed={38}
                pause={1100}
              />
            </div>
          </Fade>

          <Fade delay={0.18}>
            <div className="flex flex-wrap gap-3 pt-0">
              <a
                href="#projects"
                onClick={(e) => { e.preventDefault(); scrollToId("projects"); }}
                className="btn transition-transform hover:-translate-y-0.5"
              >
                View Projects
              </a>
              <a
                href="/scresumeIT.pdf"
                className="btn transition-transform hover:-translate-y-0.5"
              >
                Download Résumé
              </a>
            </div>
          </Fade>
        </motion.div>

        {/* Right: Portrait */}
        <motion.div style={{ y: yMedia, opacity: oMedia }} className="relative md:pl-8">
          <div className="card aspect-square w-full overflow-hidden">
            <img
              src="/portrait.png"
              alt="Stephen Colandro"
              loading="lazy"
              className="h-full w-full object-contain opacity-90"
            />
          </div>
          <motion.div
            className="absolute -left-6 -top-6 h-24 w-24 rounded-2xl border border-edge"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120 }}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------ Lightboxes ---------------------- */
function Lightbox({
  images,
  startIndex = 0,
  onClose,
}: {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(startIndex);
  const len = images.length;

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const prev = () => setI((v) => (v - 1 + len) % len);
  const next = () => setI((v) => (v + 1) % len);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        className="absolute inset-0 mx-auto flex max-w-6xl items-center justify-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={i}
          src={images[i]}
          alt=""
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl"
          loading="lazy"
        />

        {/* Controls */}
        {len > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-6 top-1/2 -translate-y-1/2 rounded-xl border border-edge bg-card/70 px-3 py-2"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={next}
              className="absolute right-6 top-1/2 -translate-y-1/2 rounded-xl border border-edge bg-card/70 px-3 py-2"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-xl border border-edge bg-card/70 px-3 py-2"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

function VideoLightbox({
  sources,
  poster,
  onClose,
}: {
  sources: ReadonlyArray<{ src: string; type: string }>; // <-- readonly
  poster?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        className="absolute inset-0 mx-auto flex max-w-6xl items-center justify-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl"
          controls
          playsInline
          poster={poster}
          autoPlay
        >
          {sources.map((s, k) => (
            <source key={k} src={s.src} type={s.type} />
          ))}
          Your browser does not support the video tag.
        </video>

        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-xl border border-edge bg-card/70 px-3 py-2"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

/* -------------------------- About ------------------------- */
function About() {
  return (
    <Section id="about" title="About Me">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="card p-6 md:p-7 space-y-6">
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-white/80">
                I’m a recent IT graduate with experience as a systems administrator and
                sec-ops analyst on a university scale. While my background is in IT, I’m
                also drawn to software engineering and web development.
              </p>
              <p className="text-lg leading-relaxed text-white/80">
                I enjoy learning new technologies and focus on clarity, documentation,
                and making complex things understandable.
              </p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold tracking-wide text-white/90 uppercase">
                Technical Skills
              </h4>
              <ul className="space-y-1.5 text-white/70">
                <li>
                  <span className="text-white/50">Languages:</span> Python, PowerShell, HTML, CSS,
                  TypeScript/JavaScript, Java, SQL
                </li>
                <li>
                  <span className="text-white/50">Web:</span> React, Vite, Tailwind, Vercel
                </li>
                <li>
                  <span className="text-white/50">Infra & Cloud:</span> AWS, VMware, Hyper-V
                </li>
                <li>
                  <span className="text-white/50">Admin & Security:</span> Active Directory, Okta, IAM, patch
                  management, MDM
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: facts (kept as its own card for rhythm) */}
        <div>
          <div className="card p-6 md:p-7 space-y-3">
            <h4 className="font-semibold text-white">Quick Facts</h4>
            <ul className="space-y-2 text-sm text-white/80">
                <li>📍 Based in NYC area</li>
                <li>🎌 Learning Japanese, aiming to live in Japan</li>
                <li>📷 Hobbies: photography, music, skating</li>
                <li>💿 Collector: 100+ records, CDs, and cassettes</li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------ Projects ------------------------ */
function Projects() {
  const items = [
    {
      title: "Wi-Flight – Mobile Networking",
      desc: "Modular firewall stack (pfSense/FortiGate), Pi-hole DNS, Grafana dashboards, and AI chatbot support.",
      tags: ["pfSense", "Fortinet", "Grafana", "React", "AI"],
      images: ["/wiflight1.1.png", "/wiflight2.1.png"],
    },
    {
      title: "Personal Website",
      desc: "Vite + React + TypeScript + Tailwind deployed with Vercel.",
      tags: ["Vite", "TypeScript", "Tailwind", "Vercel"],
      images: ["/rvt.png"],
    },
    {
      title: "Unity AR Retail Gallery",
      desc: "Tracked image markers, color/scale toggles, and interactive lighting for product demos.",
      tags: ["Unity", "C#", "AR"],
      video: {
        sources: [{ src: "/unityvid.mp4", type: "video/mp4" }],
        poster: "/madwithunity.png", 
        vertical: true,
      },
    },
  ] as const;

  // Lightboxes
  const [imageLightbox, setImageLightbox] = useState<null | { idx: number; img: number }>(null);
  const [videoLightbox, setVideoLightbox] = useState< | null | { sources: ReadonlyArray<{ src: string; type: string }>; poster?: string } >(null);

  return (
    <Section id="projects" title="Projects">
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch" // added items-stretch
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {items.map((p, i) => (
          <ProjectCard
            key={i}
            proj={p}
            onOpenImage={(imgIndex) => setImageLightbox({ idx: i, img: imgIndex })}
            onOpenVideo={(payload) => setVideoLightbox(payload)}
          />
        ))}
      </motion.div>

      {/* Image Lightbox */}
      {imageLightbox && (
        <Lightbox
          images={(items as any)[imageLightbox.idx].images}
          startIndex={imageLightbox.img}
          onClose={() => setImageLightbox(null)}
        />
      )}

      {/* Video Lightbox */}
      {videoLightbox && (
        <VideoLightbox
          sources={videoLightbox.sources}
          poster={videoLightbox.poster}
          onClose={() => setVideoLightbox(null)}
        />
      )}
    </Section>
  );
}

/* -------------- Single Project Card with Media ----------- */
function ProjectCard({
  proj,
  onOpenImage,
  onOpenVideo,
}: {
  proj: {
    title: string;
    desc: string;
    tags: readonly string[];                         // readonly
    images?: ReadonlyArray<string>;                  // readonly
    video?: {
      sources: ReadonlyArray<{ src: string; type: string }>; // readonly
      poster?: string;
      vertical?: boolean;
    };
  };
  onOpenImage: (imgIndex: number) => void;
  onOpenVideo: (payload: {
    sources: ReadonlyArray<{ src: string; type: string }>;   // readonly
    poster?: string;
  }) => void;
}) {
  // carousel (for image projects)
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const images = proj.images ?? [];
  const hasCarousel = images.length > 1;

  useEffect(() => {
    if (!hasCarousel || paused) return;
    const id = setInterval(() => setIdx((v) => (v + 1) % images.length), 3500);
    return () => clearInterval(id);
  }, [hasCarousel, paused, images.length]);

  const open = () => {
    if (proj.video) onOpenVideo({ sources: proj.video.sources, poster: proj.video.poster });
    else onOpenImage(idx);
  };

  return (
  <motion.div variants={fadeInUp} className="group block h-full">
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open()}
    >
      <TiltCard>
        {/* Media area (VIDEO or IMAGES) */}
        {proj.video ? (
          // --- VIDEO ---
          <motion.div
            className="mb-3 overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-full aspect-[16/10]">
              <video
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 bg-black"
                poster={proj.video.poster}
                muted
                playsInline
                preload="metadata"
                onMouseEnter={(e) => {
                  const v = e.currentTarget;
                  v.currentTime = 0;
                  v.play().catch(() => {});
                }}
                onMouseLeave={(e) => e.currentTarget.pause()}
              >
                {proj.video.sources.map((s, k) => (
                  <source key={k} src={s.src} type={s.type} />
                ))}
                Your browser does not support the video tag.
              </video>

              <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                video
              </span>
            </div>
          </motion.div>
        ) : (
          // --- IMAGES ---
          proj.images && proj.images.length > 0 && (
            <motion.div
              className="mb-3 overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="relative w-full aspect-[16/10]">
                <motion.img
                  key={idx}
                  src={images[idx]}
                  alt={proj.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  initial={{ opacity: 0.0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                />
                {hasCarousel && (
                  <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                    {images.map((_, d) => (
                      <span
                        key={d}
                        className={`h-1.5 w-1.5 rounded-full ${d === idx ? "bg-white" : "bg-white/40"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )
        )}

        {/* ---------- Text area (balanced + uniform height) ---------- */}
        <div className="flex flex-col grow">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold clamp-1">{proj.title}</h3>
            <span aria-hidden className="shrink-0 transition-transform group-hover:translate-x-1">→</span>
          </div>

          <div className="mt-2 min-h-[3.75rem]">
            <p className="text-sm text-muted-foreground clamp-2">{proj.desc}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {proj.tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
        {/* ---------- /Text area ---------- */}
      </TiltCard>
    </div>
  </motion.div>
);
}

/* -------------------------- Footer ------------------------ */
function Footer() {
  return (
    <footer className="border-t border-edge py-10">
      <div className="mx-auto max-w-7xl px-6 text-sm text-muted-foreground text-center">
        © {new Date().getFullYear()} Stephen Colandro — Built with Vite + React + TS
      </div>
    </footer>
  );
}

/* --------------------------- App -------------------------- */
export default function App() {
  return (
    <>
      {/* Background lives behind everything */}
      <Backdrop />

      {/* All content above the background */}
      <div className="relative z-10 min-h-screen text-white">
        <Navbar />
        <ParallaxHero />
        <About />
        <Projects />
        <Footer />
      </div>
    </>
  );
}