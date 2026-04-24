import { auth, currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const { userId } = await auth();

  // If they aren't logged in, send them to the login page
  if (!userId) {
    redirect("/login");
  }

  // Fetch the real logged-in user from Clerk
  let user = null;
  try {
    user = await currentUser();
  } catch {
    redirect("/login");
  }

  // If they aren't logged in, send them to the login page
  if (!user) {
    redirect("/login");
  }

  const isGoogleUser = user.externalAccounts?.some(
    (account) => account.provider === "oauth_google" || account.provider === "google",
  );

  // --- DUMMY DATA FOR THE UI ---
  const myListings = [
    {
      id: "1",
      title: "মিরপুর ১০ এ দক্ষিণমুখী ৩ বেডরুমের ফ্ল্যাট",
      location: "মিরপুর",
      price: "15,000",
      status: "Active",
      date: "12 May, 2026",
    },
    {
      id: "2",
      title: "বনানীতে ২ বেডরুমের সাবলেট",
      location: "বনানী",
      price: "8,500",
      status: "Rented",
      date: "05 May, 2026",
    },
  ];

  return (
    <main className="grow flex flex-col items-center px-4 bg-slate-50 pt-32 pb-12 min-h-screen">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white p-6 md:p-8 rounded-[20px] shadow-sm border-2 border-[#2d79f3] flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture (From Clerk) */}
          <div className="shrink-0">
            {isGoogleUser && user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 object-cover shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm flex items-center justify-center text-slate-500">
                <svg
                  className="w-12 h-12 md:w-16 md:h-16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center md:items-start grow text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-[#151717]">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-slate-500 mt-1">{user.emailAddresses[0]?.emailAddress}</p>
            
            <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                ভেরিফাইড ইউজার
              </span>
              <button className="px-4 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium rounded-full transition-colors cursor-pointer">
                প্রোফাইল এডিট করুন
              </button>
            </div>
          </div>
        </div>

        {/* --- DASHBOARD SECTIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sidebar / Quick Links */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-[20px] shadow-sm border-[1.5px] border-[#ecedec]">
              <h2 className="text-lg font-bold text-[#151717] mb-4 border-b pb-2">ড্যাশবোর্ড মেনু</h2>
              <ul className="space-y-2">
                <li>
                  <button className="w-full text-left px-4 py-2.5 bg-[#2d79f3] text-white rounded-[10px] font-medium transition-colors">
                    আমার বিজ্ঞাপন সমূহ
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-[10px] font-medium transition-colors cursor-pointer">
                    সংরক্ষিত বিজ্ঞাপন (Saved)
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-[10px] font-medium transition-colors cursor-pointer">
                    ম্যাসেজ সমূহ
                  </button>
                </li>
                <li>
                  <SignOutButton redirectUrl="/">{(
                    <button className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-[10px] font-medium transition-colors cursor-pointer">
                      লগ আউট
                    </button>
                  )}</SignOutButton>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content Area (My Listings) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#151717]">আমার বিজ্ঞাপন সমূহ</h2>
              <Link 
                href="/post" 
                className="text-sm font-medium text-[#2d79f3] hover:underline"
              >
                + নতুন পোস্ট করুন
              </Link>
            </div>

            {/* Dummy Listing Cards */}
            {myListings.map((listing) => (
              <div 
                key={listing.id} 
                className="bg-white p-4 rounded-[15px] shadow-sm border-[1.5px] border-[#ecedec] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#2d79f3] transition-colors"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[#151717]">{listing.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {listing.location}
                    </span>
                    <span>• {listing.date}</span>
                  </div>
                  <div className="text-[#2d79f3] font-bold mt-2">
                    ৳ {listing.price} / মাস
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    listing.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {listing.status === 'Active' ? 'সক্রিয়' : 'ভাড়া হয়েছে'}
                  </span>
                  
                  <div className="flex gap-2 ml-auto sm:ml-0">
                    <button className="p-2 text-slate-400 hover:text-[#2d79f3] hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </main>
  );
}