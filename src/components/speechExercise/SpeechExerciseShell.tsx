import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Layout wrapper: enforces ≥44px touch targets for primary actions (design §1.12). */
interface SpeechExerciseShellProps {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SpeechExerciseShell({ header, children, className }: SpeechExerciseShellProps) {
  return (
    <div className={cn("flex min-h-full flex-col bg-background", className)}>
      {header}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-6">{children}</div>
    </div>
  );
}
