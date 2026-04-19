export default function Login() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center px-4 bg-white pt-20 pb-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">লগইন করুন</h1>
          <p className="text-slate-600">আপনার অ্যাকাউন্টে সাইন ইন করুন</p>
        </div>

        <form className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-100">
          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              ইমেইল
            </label>
            <input
              type="email"
              placeholder="আপনার ইমেইল"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              placeholder="আপনার পাসওয়ার্ড"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-slate-300" />
              <span className="text-slate-700">আমাকে মনে রাখুন</span>
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              পাসওয়ার্ড ভুলেছেন?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            লগইন করুন
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-slate-600">
            অ্যাকাউন্ট নেই?{" "}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              সাইন আপ করুন
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
