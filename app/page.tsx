import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative grow flex flex-col items-center px-4 pt-34 bg-[url('/hero_bg.jpg')] bg-cover bg-center bg-no-repeat">
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/50"></div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-3xl w-full text-center space-y-8">
        <Image
          src="/logo.png"
          alt="ঢাকা-বাসা"
          width={120}
          height={120}
          className="mx-auto mb-4 w-auto h-auto"
        />
        <h1 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tight font-ekush">
          ঢাকা-<span className="text-blue-600">বাসা</span>
        </h1>

        <p className="text-lg md:text-lg text-slate-600 font-medium">
          আপনার পরবর্তী গন্তব্য খুঁজে নিন সহজেই।
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-5 -mt-2">
          <Link
            href="/listings"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-none hover:bg-green-200 transition-colors font-semibold shadow-sm"
          >
            টু-লেট দেখুন
          </Link>
          <Link
            href="/post"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-none hover:bg-green-200 transition-colors font-semibold shadow-sm"
          >
            বিজ্ঞাপন দিন
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-2 text-slate-500 font-medium text-sm z-10">
        © ২০২৬  <span className="font-ekush text-base">ঢাকা-বাসা</span> প্ল্যাটফর্ম
      </footer>
    </main>
  );
}
