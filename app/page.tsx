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
      <footer className="fixed bottom-2 text-slate-500 font-medium text-sm z-10 flex flex-col items-center gap-1.5">
        <p>
          © ২০২৬ <span className="font-ekush text-base">ঢাকা-বাসা</span> প্ল্যাটফর্ম
        </p>
        
        {/* Our Developer Section */}
        <div className="flex items-center gap-3">
          <span>Our Developer:</span>
          
          {/* GitHub Icon */}
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-blue-600 transition-colors"
            aria-label="GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.06c3-.36 6-2.08 6-6.38 0-1.36-.5-2.6-1.3-3.5.14-.3.6-1.6-.1-3.4 0 0-1.05-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.25 2.5 5.2 2.8 5.2 2.8c-.7 1.8-.2 3.1-.1 3.4-.8.9-1.3 2.1-1.3 3.5 0 4.3 3 6 6 6.38a4.8 4.8 0 0 0-1 3.06v4"/>
            </svg>
          </a>
          
          {/* LinkedIn Icon */}
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-blue-600 transition-colors"
            aria-label="LinkedIn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect width="4" height="12" x="2" y="9"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          
          {/* Mail Icon */}
          <a 
            href="mailto:your_email@example.com" 
            className="hover:text-blue-600 transition-colors"
            aria-label="Email"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}
