interface Step {
  key: "search" | "book" | "learn";
  title: string;
  description: string;
}

interface Props {
  title: string;
  subtitle: string;
  steps: Step[];
}

const iconByStep = {
  search: (
    <path
      d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-3.8-3.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  book: (
    <path
      d="M8 2v4M16 2v4M3 10h18M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  learn: (
    <path
      d="M4 6.5 12 3l8 3.5-8 3.5L4 6.5Zm0 5 8 3.5 8-3.5M4 16.5 12 20l8-3.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
} as const;

export function HomeHowItWorks({ title, subtitle, steps }: Readonly<Props>) {
  return (
    <section className="py-14">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#132a20] sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.key}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#2D5A3D]/10 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2D5A3D]/10 text-[#2D5A3D]">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                {iconByStep[step.key]}
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f8f7f]">
              {`0${index + 1}`}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-[#1d3b2c]">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
