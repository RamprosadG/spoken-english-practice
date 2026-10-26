import { PracticeHeader } from "@/components/features/practice/PracticeHeader";
import { PracticeWorkspace } from "@/features/practice/PracticeWorkspace";

export default function PracticePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <PracticeHeader />
      <PracticeWorkspace />
    </div>
  );
}
