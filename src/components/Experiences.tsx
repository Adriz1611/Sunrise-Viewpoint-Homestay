import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { EXPERIENCES } from "@/lib/site";

export default function Experiences() {
  return (
    <section id="experiences" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="03"
          label="Experiences"
          title={
            <>
              The days write <em className="text-amber">themselves</em> up here.
            </>
          }
        />

        <div className="grid gap-px overflow-hidden rounded-2xl border keyline bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.map((exp, i) => (
            <Reveal
              key={exp.title}
              as="article"
              delay={(i % 3) * 90}
              className="group relative bg-ink p-7 transition-colors duration-500 hover:bg-ink-soft sm:p-9"
            >
              <p className="font-numeric mb-8 text-xs text-ember">
                ({exp.index})
              </p>
              <h3 className="font-display text-2xl tracking-tight text-cream transition-colors group-hover:text-amber">
                {exp.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                {exp.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
