import AnimatedTitle from "@/components/AnimatedTitle";
import Reveal from "@/components/Reveal";

type SectionHeadingProps = {
  index: string;
  label: string;
  title: React.ReactNode;
};

export default function SectionHeading({ index, label, title }: SectionHeadingProps) {
  return (
    <div className="mb-12 sm:mb-16">
      <Reveal className="mb-5 flex items-center gap-4">
        <span className="font-numeric text-sm text-teal">({index})</span>
        <span className="h-px flex-1 bg-ink-line" />
        <span className="font-numeric text-[0.65rem] uppercase tracking-[0.25em] text-cream-dim">
          {label}
        </span>
      </Reveal>
      <AnimatedTitle
        as="h2"
        className="font-display max-w-3xl text-4xl leading-[1.05] tracking-tight text-cream sm:text-6xl"
      >
        {title}
      </AnimatedTitle>
    </div>
  );
}
