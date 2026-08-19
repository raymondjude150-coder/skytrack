import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-lg font-black text-white">
            S
          </div>
          <span className="text-lg font-bold tracking-tight">SkyTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-muted hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accentDark"
          >
            Get started
          </Link>
        </div>
      </nav>

      <header className="mx-auto max-w-3xl px-6 pb-16 pt-10 text-center sm:pb-24 sm:pt-16">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Free to start · no card required
        </span>
        <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[1.05] tracking-tight">
          Build habits that
          <br />
          <span className="text-accent">actually stick.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[clamp(1rem,2vw,1.25rem)] text-muted">
          Daily tracking that resets itself at midnight, in your timezone —
          not the server's. No manual resets, no fudged streaks.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-accent px-8 py-4 text-base font-bold text-white hover:bg-accentDark sm:w-auto"
          >
            Create your account
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-line px-8 py-4 text-base font-bold text-ink hover:border-accent sm:w-auto"
          >
            I already have one
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            title: "Real daily cycles",
            body: "Your day rolls over exactly at your local midnight — checked habits reset automatically, no refresh needed.",
          },
          {
            title: "Streaks that mean something",
            body: "Every completion is a real database record tied to a real calendar date, not a number that can drift.",
          },
          {
            title: "Built for consistency",
            body: "A progress ring and week view built around one job: showing you exactly where today stands.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-surface p-6">
            <h3 className="mb-2 text-base font-bold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} SkyTrack. Built to never miss a day.
      </footer>
    </div>
  );
}
