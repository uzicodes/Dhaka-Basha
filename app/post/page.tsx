export default function PostToLet() {
  return (
    <main className="flex-grow flex flex-col items-center px-4 bg-white pt-32 pb-12">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          আপনার সম্পত্তি বিজ্ঞাপন দিন
        </h1>

        <form className="space-y-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              সম্পত্তির শিরোনাম
            </label>
            <input
              type="text"
              placeholder="যেমন: মিরপুরে সুন্দর এপার্টমেন্ট"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              এলাকা
            </label>
            <input
              type="text"
              placeholder="এলাকার নাম"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                মাসিক ভাড়া (৳)
              </label>
              <input
                type="number"
                placeholder="২৫০০০"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                শোবার ঘর
              </label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500">
                <option>১</option>
                <option>২</option>
                <option>৩</option>
                <option>৪</option>
                <option>৫+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              বিবরণ
            </label>
            <textarea
              placeholder="সম্পত্তির বিস্তারিত বিবরণ লিখুন"
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                আপনার নাম
              </label>
              <input
                type="text"
                placeholder="নাম"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                ফোন নম্বর
              </label>
              <input
                type="tel"
                placeholder="০১X XXX XXXXX"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            বিজ্ঞাপন প্রকাশ করুন
          </button>
        </form>
      </div>
    </main>
  );
}
