"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="w-full px-4 pb-6 pt-10 sm:px-6 lg:px-8 mt-auto">
      <div className="mx-auto w-full max-w-6xl rounded-3xl md:rounded-[36px] bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-[#2E2910]/5 p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xl font-extrabold text-[#2E2910] font-ekush">
              ঢাকা-<span className="text-[#2C5745]">বাসা</span>
            </h3>
            <p className="max-w-md text-sm text-slate-600 leading-relaxed">
              ঢাকা শহরে বাসা, ফ্ল্যাট এবং মেস খোঁজার বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। সহজ অনুসন্ধান, দ্রুত যোগাযোগ, এবং ঝামেলাহীন অভিজ্ঞতা।
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBE3A7]/25 border border-[#EBE3A7]/40 text-xs font-semibold text-[#2C5745]">
                &quot;যেখানে খোঁজ সহজ, সিদ্ধান্ত দ্রুত&quot;
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#2E2910]">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/listings" className="inline-flex items-center text-slate-600 hover:text-[#2C5745] hover:bg-[#EBE3A7]/20 px-2 py-1 -ml-2 rounded-full transition-all">
                  টু-লেট তালিকা
                </Link>
              </li>
              <li>
                <Link href="/post" className="inline-flex items-center text-slate-600 hover:text-[#2C5745] hover:bg-[#EBE3A7]/20 px-2 py-1 -ml-2 rounded-full transition-all">
                  নতুন পোস্ট দিন
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex items-center text-slate-600 hover:text-[#2C5745] hover:bg-[#EBE3A7]/20 px-2 py-1 -ml-2 rounded-full transition-all">
                  যোগাযোগ
                </Link>
              </li>
              <li>
                <Link href="/profile" className="inline-flex items-center text-slate-600 hover:text-[#2C5745] hover:bg-[#EBE3A7]/20 px-2 py-1 -ml-2 rounded-full transition-all">
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

        <div className="mt-8 border-t border-slate-200/80 pt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {year} ঢাকা-বাসা. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/contact" className="px-3 py-1 rounded-full text-slate-500 hover:text-[#2C5745] hover:bg-[#EBE3A7]/20 transition-colors">
              আমাদের সম্পর্কে
            </Link>
            <Link href="/contact" className="px-3 py-1 rounded-full text-slate-500 hover:text-[#2C5745] hover:bg-[#EBE3A7]/20 transition-colors">
              সহযোগিতা
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
