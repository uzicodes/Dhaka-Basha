export default function Contact() {
  return (
    <main className="grow flex flex-col items-center px-4 bg-white pt-32 pb-12">
      <div className="max-w-3xl w-full space-y-12">
        {/* About Section */}
        <section className="space-y-6">
          <div className="space-y-6 text-slate-700 leading-relaxed">
            <div className="space-y-3">
              <p>
                ঢাকা-বাসা হল ঢাকা শহরে ভাড়া বাড়ি খুঁজে পাওয়ার জন্য একটি আধুনিক এবং নির্ভরযোগ্য প্ল্যাটফর্ম। আমরা বিশ্বাস করি যে প্রতিটি ব্যক্তি তাদের স্বপ্নের বাড়ি খুঁজে পাওয়ার অধিকার রাখে।
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">
                আমাদের মিশন
              </h2>
              <p>
                আমাদের মিশন হল বাড়ি খোঁজার প্রক্রিয়াটিকে সহজ, স্বচ্ছ এবং দ্রুত করা। আমরা ভাড়াটেদের এবং সম্পত্তি মালিকদের মধ্যে একটি সেতু তৈরি করি।
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">
                কেন আমাদের বেছে নিন?
              </h2>
              <ul className="space-y-2">
                <li>✓ হাজারো যাচাইকৃত সম্পত্তি তালিকা</li>
                <li>✓ নিরাপদ এবং স্বচ্ছ লেনদেন</li>
                <li>✓ ২৪/৭ গ্রাহক সহায়তা</li>
                <li>✓ দ্রুত এবং সহজ যোগাযোগ</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">
                ঢাকা-বাসা টিম
              </h2>
              <p>
                আমাদের টিম অভিজ্ঞ পেশাদারদের নিয়ে গঠিত যারা রিয়েল এস্টেট এবং প্রযুক্তিতে বিশেষজ্ঞ। আমরা প্রতিদিন কাজ করি আপনার অভিজ্ঞতা আরও ভাল করতে।
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-6 border-t border-slate-200 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            আমাদের সাথে যোগাযোগ করুন
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">ঠিকানা</h3>
                <p className="text-slate-600">
                  ঢাকা শহর, বাংলাদেশ
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">ফোন</h3>
                <p className="text-slate-600">
                  +৮৮০ ১X XXX XXXXX
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">ইমেইল</h3>
                <p className="text-slate-600">
                  info@dhakabasha.com
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">সোশ্যাল মিডিয়া</h3>
                <div className="flex gap-3">
                  <a href="#" className="text-blue-600 hover:text-blue-700">
                    Facebook
                  </a>
                  <a href="#" className="text-blue-600 hover:text-blue-700">
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-100">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  নাম
                </label>
                <input
                  type="text"
                  placeholder="আপনার নাম"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  ইমেইল
                </label>
                <input
                  type="email"
                  placeholder="আপনার ইমেইল"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  বার্তা
                </label>
                <textarea
                  placeholder="আপনার বার্তা লিখুন"
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                পাঠান
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
