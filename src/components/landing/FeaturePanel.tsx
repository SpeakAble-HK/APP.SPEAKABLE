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
  bg = "bg-cream",
}: FeaturePanelProps) {
  return (
    <section className={`${bg} py-16 sm:py-20 px-6`}>
      <div
        className={`max-w-5xl mx-auto flex flex-col ${
          reversed ? "md:flex-row-reverse" : "md:flex-row"
        } items-center gap-10 md:gap-16`}
      >
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border-2 border-white">
            {illustration}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left max-w-lg">
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl md:text-[2.25rem] text-ink leading-tight mb-4">
            {title}
          </h2>
          <p className="text-slate text-base sm:text-lg leading-[1.75]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
