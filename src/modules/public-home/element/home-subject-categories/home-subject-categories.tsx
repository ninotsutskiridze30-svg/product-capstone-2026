interface Props {
  title: string;
  subtitle: string;
  subjects: string[];
}

export function HomeSubjectCategories({ title, subtitle, subjects }: Readonly<Props>) {
  return (
    <section className="py-8">
      <div className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-[#2D5A3D]/10 md:p-8">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#132a20]">{title}</h2>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              className="rounded-full border border-[#2D5A3D]/20 bg-[#f8fbf9] px-4 py-2 text-sm font-medium text-[#2D5A3D] transition hover:-translate-y-0.5 hover:bg-[#2D5A3D] hover:text-white"
            >
              {subject}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
