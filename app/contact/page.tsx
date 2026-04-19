export default function Contact() {
  return (
    <main className="flex-grow flex flex-col items-center px-4 bg-white pt-20 pb-12">
      <div className="max-w-2xl w-full space-y-8">
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
      </div>
    </main>
  );
}
