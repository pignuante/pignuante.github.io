import { Link } from "react-router";

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center px-6">
      <h1 className="font-pixel text-8xl font-bold tracking-tight text-[var(--text-tertiary)]">
        404
      </h1>
      <p className="mt-4 text-lg text-[var(--text-secondary)]">
        Page not found.
      </p>
      <Link
        className="mt-8 rounded-full bg-[var(--interactive-hover)] px-6 py-2 text-sm transition-colors hover:bg-[var(--interactive-active)]"
        to="/"
        viewTransition
      >
        Go home
      </Link>
    </section>
  );
}
