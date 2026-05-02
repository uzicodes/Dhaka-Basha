export type SubLocation = { value: string; label: string };
export type LocationType = { value: string; label: string; subLocations?: SubLocation[] };
export type PropertyType = { value: string; label: string };

export const propertyTypes: PropertyType[] = [
  { value: "", label: "-- প্রপার্টির ধরন নির্বাচন করুন --" },
  { value: "single-room", label: "সিঙ্গেল রুম" },
  { value: "single-room-attached", label: "সিঙ্গেল রুম - (ওয়াশরুম)" },
  { value: "flat", label: "ফ্ল্যাট" },
  { value: "master-bedroom", label: "মাস্টার বেডরুম" },
  { value: "office", label: "অফিস / করপোরেট" },
  { value: "bachelors-male", label: "ব্যাচেলর - পুরুষ" },
  { value: "bachelors-female", label: "ব্যাচেলর - মহিলা" }
];

export const locations: LocationType[] = [
  { value: "gulshan", label: "গুলশান (Gulshan)" },
  { value: "banani", label: "বনানী (Banani)" },
  { value: "baridhara", label: "বারিধারা (Baridhara)" },
  { value: "dhanmondi", label: "ধানমন্ডি (Dhanmondi)" },
  { value: "mirpur", label: "মিরপুর (Mirpur)" },
  { value: "uttara", label: "উত্তরা (Uttara)" },
  { value: "mohammadpur", label: "মোহাম্মদপুর (Mohammadpur)" },
  { value: "mohakhali", label: "মহাখালী (Mohakhali)" },
  { value: "bashundhara", label: "বসুন্ধরা (Bashundhara)", subLocations: [{ value: "block-a", label: "ব্লক এ (Block A)" }, { value: "block-b", label: "ব্লক বি (Block B)" }, { value: "block-c", label: "ব্লক সি (Block C)" }, { value: "block-d", label: "ব্লক ডি (Block D)" }, { value: "block-e", label: "ব্লক ই (Block E)" }, { value: "block-f", label: "ব্লক এফ (Block F)" }, { value: "block-g", label: "ব্লক জি (Block G)" }, { value: "block-h", label: "ব্লক এইচ (Block H)" }, { value: "block-i", label: "ব্লক আই (Block I)" }, { value: "block-j", label: "ব্লক জে (Block J)" }] },
  { value: "badda", label: "বাড্ডা (Badda)", subLocations: [{ value: "moddho-badda", label: "মধ্য বাড্ডা (Moddho Badda)" }, { value: "uttar-badda", label: "উত্তর বাড্ডা (Uttar Badda)" }, { value: "merul-badda", label: "মেরুল বাড্ডা (Merul Badda)" }] },
  { value: "niketon", label: "নিকেতন (Niketon)" },
  { value: "motijheel", label: "মতিঝিল (Motijheel)" },
  { value: "aftabnagar", label: "আফতাবনগর (Aftabnagar)" },
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
