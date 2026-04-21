import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="grow flex flex-col items-center justify-center px-4 bg-white pt-2">
      {/* Hero Section */}
      <div className="max-w-3xl w-full text-center space-y-8">
        <Image
          src="/logo.png"
          alt="ঢাকা-বাসা"
          width={120}
          height={120}
          className="mx-auto mb-4"
        />
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight">
          ঢাকা-<span className="text-blue-600">বাসা</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 font-medium">
          আপনার পরবর্তী গন্তব্য খুঁজে নিন সহজেই।
        </p>

        {/* Minimal Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            className="w-full px-6 py-4 text-lg border-2 border-slate-100 rounded-full bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-sm"
          />
          <button className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-full hover:bg-blue-700 transition-colors font-semibold">
            খুঁজুন
          </button>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
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
      <footer className="fixed bottom-8 text-slate-400 text-sm">
        © ২০২৬ ঢাকা-বাসা প্ল্যাটফর্ম
      </footer>
    </main>
  );
}