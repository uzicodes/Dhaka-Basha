import { Loader } from "@/app/components/GlobalLoader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <Loader />
    </div>
  );
}
