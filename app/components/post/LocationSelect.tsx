import { locations } from "@/src/lib/constants";

export default function LocationSelect({
  register, setValue, errors,
  isSelectOpen, setIsSelectOpen,
  expandedLoc, setExpandedLoc,
  selectedLocation, selectedSubLocation
}: any) {
  return (
    <div className="flex flex-col gap-1.5 relative">
      <label id="location-label" className="text-[#151717] text-sm font-semibold">এলাকা / লোকেশন</label>
      <input type="hidden" {...register("location")} />
      <input type="hidden" {...register("subLocation")} />

      <button
        type="button"
        aria-labelledby="location-label"
        className={`w-full border-[1.5px] bg-white rounded-none h-11 px-3 focus:outline-none transition-colors duration-200 flex items-center justify-between text-left ${errors.location ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"}`}
        onClick={() => setIsSelectOpen(!isSelectOpen)}
        onBlur={() => setTimeout(() => setIsSelectOpen(false), 200)}
      >
        <span className={selectedLocation ? "text-blue-600 truncate pr-4" : "text-blue-600"}>
          {selectedLocation
            ? (() => {
              const loc = locations.find(l => l.value === selectedLocation);
              if (!loc) return "-- নির্বাচন করুন --";
              if (selectedSubLocation) {
                const sub = loc.subLocations?.find(s => s.value === selectedSubLocation);
                if (sub) {
                  const locBn = loc.label.split(" (")[0];
                  const locEn = loc.label.split(" (")[1]?.replace(")", "") || "";
                  const subBn = sub.label.split(" (")[0];
                  const subEn = sub.label.split(" (")[1]?.replace(")", "") || "";
                  return `${locBn} - ${subBn} (${locEn} - ${subEn})`;
                }
              }
              return loc.label;
            })()
            : "-- নির্বাচন করুন --"}
        </span>
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isSelectOpen && (
        <ul
          className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 shadow-xl rounded-none max-h-60 overflow-y-auto z-50 py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {locations.map((loc) => (
            <div key={loc.value}>
              <li
                className={`px-4 py-2.5 text-slate-900 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors flex justify-between items-center ${expandedLoc === loc.value ? 'bg-slate-100 font-semibold' : ''}`}
                onClick={(e) => {
                  if (loc.subLocations) {
                    e.stopPropagation();
                    setExpandedLoc(expandedLoc === loc.value ? "" : loc.value);
                  } else {
                    setValue("location", loc.value, { shouldValidate: true });
                    setValue("subLocation", "");
                    setIsSelectOpen(false);
                    setExpandedLoc("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (loc.subLocations) {
                      e.stopPropagation();
                      setExpandedLoc(expandedLoc === loc.value ? "" : loc.value);
                    } else {
                      setValue("location", loc.value, { shouldValidate: true });
                      setValue("subLocation", "");
                      setIsSelectOpen(false);
                      setExpandedLoc("");
                    }
                  }
                }}
                tabIndex={0}
                role="option"
              >
                <span>{loc.label}</span>
                {loc.subLocations && (
                  <svg className={`w-4 h-4 transition-transform ${expandedLoc === loc.value ? 'rotate-180 text-[#2d79f3]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                )}
              </li>

              {loc.subLocations && expandedLoc === loc.value && (
                <ul className="bg-slate-50 border-y border-gray-100">
                  <li
                    className="px-8 py-2.5 text-slate-700 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors border-b border-gray-100 last:border-0"
                    onClick={() => {
                      setValue("location", loc.value, { shouldValidate: true });
                      setValue("subLocation", "");
                      setIsSelectOpen(false);
                      setExpandedLoc("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setValue("location", loc.value, { shouldValidate: true });
                        setValue("subLocation", "");
                        setIsSelectOpen(false);
                        setExpandedLoc("");
                      }
                    }}
                    tabIndex={0}
                    role="option"
                  >
                    যেকোনো (Any)
                  </li>
                  {loc.subLocations.map((sub) => (
                    <li
                      key={sub.value}
                      className="px-8 py-2.5 text-slate-700 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors border-b border-gray-100 last:border-0"
                      onClick={() => {
                        setValue("location", loc.value, { shouldValidate: true });
                        setValue("subLocation", sub.value, { shouldValidate: true });
                        setIsSelectOpen(false);
                        setExpandedLoc("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setValue("location", loc.value, { shouldValidate: true });
                          setValue("subLocation", sub.value, { shouldValidate: true });
                          setIsSelectOpen(false);
                          setExpandedLoc("");
                        }
                      }}
                      tabIndex={0}
                      role="option"
                    >
                      {sub.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </ul>
      )}
      {errors.location && <span className="text-red-500 text-xs">{errors.location.message as string}</span>}
    </div>
  );
}
