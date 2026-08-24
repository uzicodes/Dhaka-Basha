import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2C5745]/15 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xl font-extrabold text-[#2E2910] font-ekush">
              ঢাকা-<span className="text-[#2C5745]">বাসা</span>
            </h3>
            <p className="max-w-md text-sm text-slate-600 leading-relaxed">
              ঢাকা শহরে বাসা, ফ্ল্যাট এবং মেস খোঁজার বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। সহজ অনুসন্ধান, দ্রুত যোগাযোগ, এবং ঝামেলাহীন অভিজ্ঞতা।
            </p>
            <p className="text-xs font-semibold text-[#2C5745]">
              &quot;যেখানে খোঁজ সহজ, সিদ্ধান্ত দ্রুত&quot;
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#2E2910]">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/listings" className="text-slate-600 hover:text-[#EB7D00] transition-colors">
                  টু-লেট তালিকা
                </Link>
              </li>
              <li>
                <Link href="/post" className="text-slate-600 hover:text-[#EB7D00] transition-colors">
                  নতুন পোস্ট দিন
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-[#EB7D00] transition-colors">
                  যোগাযোগ
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-slate-600 hover:text-[#EB7D00] transition-colors">
                  প্রোফাইল
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#2E2910]">সহায়তা</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                ইমেইল: <a href="mailto:support@dhakabasha.com" className="hover:text-[#EB7D00] transition-colors">support@dhakabasha.com</a>
              </li>
              <li>
                ফোন: <a href="tel:+8801700000000" className="hover:text-[#EB7D00] transition-colors">+৮৮০ ১৭০০-০০০০০০</a>
              </li>
              <li>সময়: সকাল ৯টা - রাত ১০টা</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#2C5745]/10 pt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {year} ঢাকা-বাসা. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/about" className="text-slate-500 hover:text-[#EB7D00] transition-colors">
              আমাদের সম্পর্কে
            </Link>
            <Link href="/contact" className="text-slate-500 hover:text-[#EB7D00] transition-colors">
              সহযোগিতা
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
