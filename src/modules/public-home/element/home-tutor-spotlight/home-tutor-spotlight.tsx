interface TutorCard {
  name: string;
  subject: string;
  rating: string;
  rate: string;
  seed: string;
}

interface Props {
  title: string;
  subtitle: string;
  tutors: TutorCard[];
}

export function HomeTutorSpotlight({ title, subtitle, tutors }: Readonly<Props>) {
  return (
    <section className="py-14">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#132a20] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tutors.map((tutor) => (
          <article
            key={tutor.seed}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#2D5A3D]/10 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.seed}`}
                alt={tutor.name}
                className="h-12 w-12 rounded-full bg-muted"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-[#1d3b2c]">{tutor.name}</p>
                <p className="text-sm text-muted-foreground">{tutor.subject}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="font-semibold text-[#2D5A3D]">★ {tutor.rating}</p>
              <p className="text-muted-foreground">{tutor.rate}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
