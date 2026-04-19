export default function Listings() {
  const properties = [
    {
      id: 1,
      title: "মিরপুর ২ এ আধুনিক এপার্টমেন্ট",
      location: "মিরপুর",
      price: "৳ ২৫,০০০",
      bedrooms: 2,
      image: "🏢",
    },
    {
      id: 2,
      title: "ধানমন্ডি লেকসাইড ফ্ল্যাট",
      location: "ধানমন্ডি",
      price: "৳ ৩৫,০০০",
      bedrooms: 3,
      image: "🏠",
    },
    {
      id: 3,
      title: "গুলশানে প্রিমিয়াম বাসস্থান",
      location: "গুলশান",
      price: "৳ ৪৫,০০০",
      bedrooms: 4,
      image: "🏡",
    },
  ];

  return (
    <main className="flex-grow flex flex-col items-center px-4 bg-white pt-20 pb-12">
      <div className="max-w-4xl w-full space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          সকল সম্পত্তি
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-5xl bg-slate-100 h-40 flex items-center justify-center">
                {property.image}
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-slate-900 text-lg">
                  {property.title}
                </h3>
                <p className="text-slate-600 text-sm">📍 {property.location}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {property.price}
                  </span>
                  <span className="text-slate-600 text-sm">
                    {property.bedrooms} শোবার
                  </span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  বিস্তারিত দেখুন
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
