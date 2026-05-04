export default function About() {
  return (
    <main className="flex-grow flex flex-col items-center px-4 bg-white pt-20 pb-12">
      <div className="max-w-3xl w-full space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          আমাদের সম্পর্কে
        </h1>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">
              <span className="font-ekush font-bold">ঢাকা-বাসা</span> এর সূচনা
            </h2>
            <p>
              <span className="font-ekush">ঢাকা-বাসা</span> হল ঢাকা শহরে ভাড়া বাড়ি খুঁজে পাওয়ার জন্য একটি আধুনিক এবং নির্ভরযোগ্য প্ল্যাটফর্ম। আমরা বিশ্বাস করি যে প্রতিটি ব্যক্তি তাদের স্বপ্নের বাড়ি খুঁজে পাওয়ার অধিকার রাখে।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">
              আমাদের মিশন
            </h2>
            <p>
              আমাদের মিশন হল বাড়ি খোঁজার প্রক্রিয়াটিকে সহজ, স্বচ্ছ এবং দ্রুত করা। আমরা ভাড়াটেদের এবং সম্পত্তি মালিকদের মধ্যে একটি সেতু তৈরি করি।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">
              কেন আমাদের বেছে নিন?
            </h2>
            <ul className="space-y-2">
              <li>✓ হাজারো যাচাইকৃত সম্পত্তি তালিকা</li>
              <li>✓ নিরাপদ এবং স্বচ্ছ লেনদেন</li>
              <li>✓ ২৪/৭ গ্রাহক সহায়তা</li>
              <li>✓ দ্রুত এবং সহজ যোগাযোগ</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">
              আমাদের টিম
            </h2>
            <p>
              আমাদের টিম অভিজ্ঞ পেশাদারদের নিয়ে গঠিত যারা রিয়েল এস্টেট এবং প্রযুক্তিতে বিশেষজ্ঞ। আমরা প্রতিদিন কাজ করি আপনার অভিজ্ঞতা আরও ভাল করতে।
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
