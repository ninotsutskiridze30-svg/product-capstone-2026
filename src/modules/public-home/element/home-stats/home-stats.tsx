interface StatItem {
  value: string;
  label: string;
}

interface Props {
  items: StatItem[];
}

export function HomeStats({ items }: Readonly<Props>) {
  return (
    <section className="pb-14">
      <div className="grid gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-[#2D5A3D]/10 sm:grid-cols-2 md:grid-cols-4">
        {items.map((item) => (
          <article key={item.label} className="rounded-xl bg-[#f8fbf9] p-4 text-center">
            <p className="text-xl font-bold text-[#1d3b2c]">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
