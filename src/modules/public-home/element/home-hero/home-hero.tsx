import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";

interface TutorPreview {
  name: string;
  subject: string;
  rating: string;
  rate: string;
  seed: string;
}

interface Props {
  badge: string;
  title: string;
  subtitle: string;
  browseTutorsLabel: string;
  getStartedLabel: string;
  signInLabel: string;
  socialProof: string;
  rating: string;
  tutors: TutorPreview[];
}

export function HomeHero(props: Readonly<Props>) {
  const {
    badge,
    title,
    subtitle,
    browseTutorsLabel,
    getStartedLabel,
    signInLabel,
    socialProof,
    rating,
    tutors,
  } = props;

  return (
    <section className="grid gap-10 pb-14 md:pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="space-y-6">
        <p className="inline-flex rounded-full bg-[#2D5A3D]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2D5A3D]">
          {badge}
        </p>

        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[#10261c] sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="h-11 rounded-full bg-[#2D5A3D] px-6 text-base hover:bg-[#254b33]">
            <Link href="/tutors">{browseTutorsLabel}</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6 text-base">
            <Link href="/register">{getStartedLabel}</Link>
          </Button>
          <Button asChild variant="ghost" className="h-11 rounded-full px-5 text-base text-[#2D5A3D]">
            <Link href="/login">{signInLabel}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {["Mia", "Noah", "Ava", "Liam"].map((seed) => (
              <img
                key={seed}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                alt={seed}
                className="h-10 w-10 rounded-full border-2 border-white bg-white"
                loading="lazy"
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-[#183426]">{rating}</span> {socialProof}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[#2D5A3D]/15 blur-2xl" />
        <div className="absolute -bottom-8 right-0 h-28 w-28 rounded-full bg-[#2D5A3D]/20 blur-2xl" />
        <div className="relative rounded-3xl border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur md:p-5">
          <div className="space-y-3">
            {tutors.map((tutor, index) => (
              <article
                key={tutor.seed}
                className={`rounded-2xl bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 ${
                  index === 1 ? "ml-4" : ""
                } ${index === 2 ? "mr-4" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.seed}`}
                      alt={tutor.name}
                      className="h-11 w-11 rounded-full bg-muted"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-[#183426]">{tutor.name}</p>
                      <p className="text-sm text-muted-foreground">{tutor.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#2D5A3D]">★ {tutor.rating}</p>
                    <p className="text-sm text-muted-foreground">{tutor.rate}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
