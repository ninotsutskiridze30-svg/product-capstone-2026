import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";

interface Props {
  title: string;
  subtitle: string;
  ctaLabel: string;
}

export function HomeFinalCta({ title, subtitle, ctaLabel }: Readonly<Props>) {
  return (
    <section className="py-12">
      <div className="rounded-3xl bg-gradient-to-r from-[#2D5A3D] to-[#3b7050] p-8 text-white shadow-xl md:flex md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-xl text-white/85">{subtitle}</p>
        </div>
        <Button
          asChild
          className="mt-6 h-11 rounded-full bg-white px-6 text-base text-[#2D5A3D] hover:bg-white/90 md:mt-0"
        >
          <Link href="/tutors">{ctaLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
