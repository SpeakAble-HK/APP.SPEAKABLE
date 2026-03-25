import { ReactNode } from "react";

interface FeaturePanelProps {
  title: string;
  description: string;
  illustration: ReactNode;
  reversed?: boolean;
  bg?: string;
}

export function FeaturePanel({
  title,
  description,
  illustration,
  reversed = false,
  bg = "bg-white",
}: FeaturePanelProps) {
  return (
    <section className={`${bg} py-16 sm:py-24 px-6`}>
      <div
        className={`max-w-5xl mx-auto flex flex-col ${
          reversed ? "md:flex-row-reverse" : "md:flex-row"
        } items-center gap-10 md:gap-16`}
      >
        <div className="flex-1 flex justify-center">{illustration}</div>
        <div className="flex-1 text-center md:text-left max-w-lg">
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl md:text-[2.1rem] text-on-surface leading-tight mb-4">
            {title}
          </h2>
          <p className="text-on-surface-variant text-base sm:text-lg leading-[1.75]">{description}</p>
        </div>
      </div>
    </section>
  );
}
