const ITEMS = [
  "180° sunrise over Kanchenjunga",
  "Home-cooked in our tea garden",
  "Orange orchards of Sittong",
  "Hornbills of Latpanchar",
  "Teesta river far below",
  "Nights built for stargazing",
];

export default function Marquee() {
  const strip = [...ITEMS, ...ITEMS];
  return (
    <div
      aria-hidden
      className="overflow-hidden border-y keyline bg-ink-soft py-4"
    >
      <div className="animate-marquee flex w-max items-center gap-8">
        {strip.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 whitespace-nowrap font-display text-lg text-cream-dim sm:text-xl"
          >
            {item}
            <span className="text-ember">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}
