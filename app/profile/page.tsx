export default function Profile() {
  return (
    <main className="flex-grow flex flex-col items-center px-4 bg-white pt-32 pb-12">
      <div className="max-w-3xl w-full space-y-8">
        {/* Profile Header */}
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl shadow-lg">
              👥
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">আপনার প্রোফাইল</h1>
              <p className="text-slate-600">আপনার অ্যাকাউন্ট তথ্য পরিচালনা করুন</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-slate-700 font-semibold text-sm">নাম</label>
                <input
                  type="text"
                  placeholder="আপনার নাম"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-700 font-semibold text-sm">ইমেইল</label>
                <input
                  type="email"
                  placeholder="আপনার ইমেইল"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-700 font-semibold text-sm">ফোন নম্বর</label>
                <input
                  type="tel"
                  placeholder="০১X XXX XXXXX"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-700 font-semibold text-sm">শহর</label>
                <input
                  type="text"
                  placeholder="ঢাকা"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 font-semibold text-sm">জীবনী</label>
              <textarea
                placeholder="আপনার সম্পর্কে কিছু লিখুন"
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              পরিবর্তন সংরক্ষণ করুন
            </button>
          </div>

          {/* Account Settings */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">অ্যাকাউন্ট সেটিংস</h2>
            
            <button className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-white transition-colors text-slate-700 font-medium">
              পাসওয়ার্ড পরিবর্তন করুন
            </button>

            <button className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-white transition-colors text-slate-700 font-medium">
              আমার বিজ্ঞাপনগুলি দেখুন
            </button>

            <button className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-white transition-colors text-slate-700 font-medium">
              সংরক্ষিত সম্পত্তি
            </button>

            <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium">
              অ্যাকাউন্ট মুছুন
            </button>
          </div>

          {/* Logout */}
          <button className="w-full px-6 py-3 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 transition-colors font-semibold text-lg">
            লগ আউট করুন
          </button>
        </div>
      </div>
    </main>
  );
}
