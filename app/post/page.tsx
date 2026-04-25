"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

// --- ZOD SCHEMA ---
const formSchema = z.object({
  title: z.string().min(5, "টাইটেল কমপক্ষে ৫ অক্ষরের হতে হবে").max(100, "টাইটেল ১০০ অক্ষরের বেশি হতে পারবে না"),
  rentPrice: z.string().min(3, "ভাড়ার পরিমাণ দিন"),
  propertyType: z.string().min(1, "প্রপার্টির ধরন নির্বাচন করুন"),
  location: z.string().min(1, "লোকেশন নির্বাচন করুন"),
  rentFrom: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "MM/YYYY ফরম্যাটে দিন (যেমন: 06/2026)"),
  address: z.string().min(5, "সম্পূর্ণ ঠিকানা দিন (বাড়ি, ব্লক, রাস্তা)"),
  contactInfo: z.string().min(11, "সঠিক মোবাইল নম্বর দিন").max(11, "সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)"),
  mapLink: z.string().optional(),
  images: z.array(z.string()),
});

type PostFormValues = z.infer<typeof formSchema>;

export default function PostToLet() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize React Hook Form 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      rentPrice: "",
      propertyType: "",
      location: "",
      rentFrom: "",
      address: "",
      contactInfo: "",
      mapLink: "",
      images: [],
    },
  });

  const onSubmit = async (data: PostFormValues) => {
    setIsSubmitting(true);
    try {
      const finalDataForDatabase = {
        ...data,
        rentPrice: Number(data.rentPrice),
      };

      console.log("Data ready for Prisma:", finalDataForDatabase);

      alert("আপনার পোস্ট সফলভাবে তৈরি হয়েছে!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ARRAYS FOR DROPDOWNS ---
  const locations = [
    { value: "gulshan", label: "গুলশান (Gulshan)" },
    { value: "banani", label: "বনানী (Banani)" },
    { value: "baridhara", label: "বারিধারা (Baridhara)" },
    { value: "dhanmondi", label: "ধানমন্ডি (Dhanmondi)" },
    { value: "mirpur", label: "মিরপুর (Mirpur)" },
    { value: "uttara", label: "উত্তরা (Uttara)" },
    { value: "mohammadpur", label: "মোহাম্মদপুর (Mohammadpur)" },
    { value: "mohakhali", label: "মহাখালী (Mohakhali)" },
    { value: "bashundhara", label: "বসুন্ধরা (Bashundhara)" },
    { value: "badda", label: "বাড্ডা (Badda)" },
    { value: "niketon", label: "নিকেতন (Niketon)" },
    { value: "motijheel", label: "মতিঝিল (Motijheel)" },
    { value: "khilgaon", label: "খিলগাঁও (Khilgaon)" },
    { value: "tejgaon", label: "তেজগাঁও (Tejgaon)" },
    { value: "jigatola", label: "জিগাতলা (Jigatola)" },
    { value: "pilkhana", label: "পিলখানা (Pilkhana)" },
    { value: "hazaribagh", label: "হাজারীবাগ (Hazaribagh)" },
    { value: "malibagh", label: "মালিবাগ (Malibagh)" },
    { value: "rampura", label: "রামপুরা (Rampura)" },
    { value: "banasree", label: "বনশ্রী (Banasree)" },
    { value: "shantinagar", label: "শান্তিনগর (Shantinagar)" },
    { value: "demra", label: "ডেমরা (Demra)" },
    { value: "shyamoli", label: "শ্যামলী (Shyamoli)" },
    { value: "kallyanpur", label: "কল্যাণপুর (Kallyanpur)" },
    { value: "agargaon", label: "আগারগাঁও (Agargaon)" },
    { value: "kuril", label: "কুড়িল (Kuril)" },
    { value: "azimpur", label: "আজিমপুর (Azimpur)" },
    { value: "gulistan", label: "গুলিস্তান (Gulistan)" },
    { value: "farmgate", label: "ফার্মগেট (Farmgate)" },
    { value: "karwan bazar", label: "কারওয়ান বাজার (Karwan Bazar)" },
    { value: "shiddheswari", label: "সিদ্ধেশ্বরী (Shiddheswari)" },
    { value: "new eskaton", label: "নিউ ইস্কাটন (New Eskaton)" },
    { value: "old dhaka", label: "পুরান ঢাকা (Old Dhaka)" },
    { value: "rajarbagh", label: "রাজারবাগ (Rajarbagh)" },
    { value: "jatrabari", label: "যাত্রাবাড়ী (Jatrabari)" },
    { value: "sadarghat", label: "সদরঘাট (Sadarghat)" }
  ];

  const propertyTypes = [
    { value: "", label: "-- প্রপার্টির ধরন নির্বাচন করুন --" },
    { value: "single-room", label: "সিঙ্গেল রুম (Single room)" },
    { value: "single-room-attached", label: "সিঙ্গেল রুম - (ওয়াশরুম) (Single Room - Washroom)" },
    { value: "flat", label: "ফ্ল্যাট (Flat)" },
    { value: "master-bedroom", label: "মাস্টার বেডরুম (Master Bedroom)" },
    { value: "office", label: "অফিস / করপোরেট (Office / Corporate)" },
    { value: "bachelors-male", label: "ব্যাচেলর - পুরুষ (Bachelors - Male)" },
    { value: "bachelors-female", label: "ব্যাচেলর - মহিলা (Bachelors - Female)" }
  ];

  return (
    <main className="grow flex flex-col items-center justify-center px-4 bg-slate-50 pt-24 pb-12">
      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-[20px] shadow-sm border-2 border-[#2d79f3]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#151717] mb-6 text-center">টু-লেট পোস্ট করুন</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#151717] text-sm font-semibold">বিজ্ঞাপনের টাইটেল</label>
            <input
              {...register("title")}
              type="text"
              className={`border-[1.5px] rounded-[10px] h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.title ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                }`}
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rent Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">ভাড়ার পরিমাণ (টাকা)</label>
              <input
                {...register("rentPrice")}
                type="number"
                className={`border-[1.5px] rounded-[10px] h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.rentPrice ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              />
              {errors.rentPrice && <span className="text-red-500 text-xs">{errors.rentPrice.message}</span>}
            </div>

            {/* Rent From */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">ভাড়া শুরু (মাস/বছর)</label>
              <input
                {...register("rentFrom")}
                type="text"
                placeholder="MM / YYYY"
                className={`border-[1.5px] rounded-[10px] h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.rentFrom ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              />
              {errors.rentFrom && <span className="text-red-500 text-xs">{errors.rentFrom.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">প্রপার্টির ধরন</label>
              <select
                {...register("propertyType")}
                className={`border-[1.5px] bg-white text-green-600 rounded-[10px] h-11 px-3 focus:outline-none transition-colors duration-200 ${errors.propertyType ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value} className="text-green-600">{type.label}</option>
                ))}
              </select>
              {errors.propertyType && <span className="text-red-500 text-xs">{errors.propertyType.message}</span>}
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">এলাকা / লোকেশন</label>
              <select
                {...register("location")}
                className={`border-[1.5px] bg-white text-green-600 rounded-[10px] h-11 px-3 focus:outline-none transition-colors duration-200 ${errors.location ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value} className="text-green-600">{loc.label}</option>
                ))}
              </select>
              {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
            </div>
          </div>

          {/* Exact Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#151717] text-sm font-semibold">সম্পূর্ণ ঠিকানা</label>
            <input
              {...register("address")}
              type="text"
              placeholder="বাড়ি নং, ব্লক, রাস্তা নং"
              className={`border-[1.5px] rounded-[10px] h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.address ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                }`}
            />
            {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
          </div>

          {/* Contact Info & Map Link placed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Contact Info */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">যোগাযোগের নম্বর</label>
              <input
                {...register("contactInfo")}
                type="text"
                maxLength={11}
                placeholder="01XXXXXXXXX"
                className={`border-[1.5px] rounded-[10px] h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.contactInfo ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              />
              {errors.contactInfo && <span className="text-red-500 text-xs">{errors.contactInfo.message}</span>}
            </div>

            {/* Google Maps Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">গুগল ম্যাপস লিংক / লোকেশন কোড</label>
              <input
                {...register("mapLink")}
                type="text"
                placeholder="লিংক / কোড দিন "
                className={`border-[1.5px] rounded-[10px] h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.mapLink ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              />
              {errors.mapLink && <span className="text-red-500 text-xs">{errors.mapLink.message}</span>}
            </div>

          </div>

          {/* Image Upload Mockup */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[#151717] text-sm font-semibold">ছবি আপলোড</label>
            <div className="border-2 border-dashed border-[#ecedec] rounded-[10px] h-32 flex flex-col items-center justify-center bg-slate-50 text-slate-400 hover:border-[#2d79f3] transition-colors cursor-pointer">
              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">ছবি যোগ করতে এখানে ক্লিক করুন</span>
            </div>
            <span className="text-xs text-slate-400 mt-1">* ছবি আপলোডের লজিক পরবর্তীতে যোগ করা হবে</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-blue-900 text-white text-[15px] font-medium rounded-[10px] h-12 w-full cursor-pointer hover:bg-blue-900 hover:text-green-500 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "প্রসেস হচ্ছে..." : "বিজ্ঞাপন পোস্ট করুন"}
          </button>
        </form>
      </div>
    </main>
  );
}