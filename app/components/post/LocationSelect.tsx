import { locations } from "@/src/lib/constants";

export default function LocationSelect({
  register, setValue, errors,
  isSelectOpen, setIsSelectOpen,
  expandedLoc, setExpandedLoc,
  selectedLocation, selectedSubLocation
}: any) {
  return (
    <div className="flex flex-col gap-1.5 relative">
      <label id="location-label" htmlFor="location-select-button" className="text-[#2E2910] text-sm font-semibold">
        এলাকা / লোকেশন
      </label>
      <input type="hidden" {...register("location")} />
      <input type="hidden" {...register("subLocation")} />

      <button
        id="location-select-button"
        type="button"
        aria-labelledby="location-label"
        aria-haspopup="listbox"
        aria-controls="location-listbox"
        aria-expanded={isSelectOpen}
        className={`w-full border bg-[#EBE3A7]/20 rounded-xl h-12 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#EB7D00]/20 transition-colors duration-200 flex items-center justify-between text-left ${errors.location ? "border-red-500" : "border-[#2C5745]/20 focus:border-[#EB7D00]"}`}
        onClick={() => setIsSelectOpen(!isSelectOpen)}
        onBlur={() => setTimeout(() => setIsSelectOpen(false), 200)}
      >
        <span className={selectedLocation ? "text-[#2C5745] truncate pr-4" : "text-[#2C5745]"}>
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
          id="location-listbox"
          role="listbox"
          aria-labelledby="location-label"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1 w-full bg-white border border-[#2C5745]/15 shadow-xl rounded-xl max-h-60 overflow-y-auto overscroll-contain z-50 py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {locations.map((loc) => {
            const isParentSelected = selectedLocation === loc.value;

            return (
              <li key={loc.value} role="presentation" className="border-b border-[#2C5745]/10 last:border-0">
                <button
                  type="button"
                  role={loc.subLocations ? undefined : "option"}
                  aria-selected={loc.subLocations ? undefined : isParentSelected}
                  className={`w-full px-4 py-2.5 text-slate-900 hover:bg-[#EBE3A7] hover:text-[#2E2910] text-sm transition-colors flex justify-between items-center text-left cursor-pointer ${
                    expandedLoc === loc.value ? "bg-[#EBE3A7] font-semibold" : ""
                  }`}
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
                  aria-expanded={loc.subLocations ? expandedLoc === loc.value : undefined}
                >
                  <span>{loc.label}</span>
                  {loc.subLocations && (
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedLoc === loc.value ? "rotate-180 text-[#EB7D00]" : "text-slate-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {loc.subLocations && expandedLoc === loc.value && (
                  <ul role="group" aria-label={loc.label} className="bg-[#EBE3A7]/30 border-t border-[#2C5745]/10">
                    <li role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isParentSelected && (!selectedSubLocation || selectedSubLocation === "")}
                        className="w-full text-left px-8 py-2.5 text-slate-700 hover:bg-[#EBE3A7] hover:text-[#2E2910] text-sm transition-colors border-b border-[#2C5745]/10 cursor-pointer"
                        onClick={() => {
                          setValue("location", loc.value, { shouldValidate: true });
                          setValue("subLocation", "");
                          setIsSelectOpen(false);
                          setExpandedLoc("");
                        }}
                      >
                        যেকোনো (Any)
                      </button>
                    </li>
                    {loc.subLocations.map((sub) => {
                      const isSubSelected = isParentSelected && selectedSubLocation === sub.value;

                      return (
                        <li key={sub.value} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSubSelected}
                            className="w-full text-left px-8 py-2.5 text-slate-700 hover:bg-[#EBE3A7] hover:text-[#2E2910] text-sm transition-colors border-b border-[#2C5745]/10 last:border-0 cursor-pointer"
                            onClick={() => {
                              setValue("location", loc.value, { shouldValidate: true });
                              setValue("subLocation", sub.value, { shouldValidate: true });
                              setIsSelectOpen(false);
                              setExpandedLoc("");
                            }}
                          >
                            {sub.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {errors.location && <span className="text-red-500 text-xs">{errors.location.message as string}</span>}
    </div>
  );
}
