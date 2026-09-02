import { propertyTypes } from "@/src/lib/constants";

export default function PropertyTypeSelect({
  register, watch, setValue, errors,
  isPropertyTypeOpen, setIsPropertyTypeOpen, propertyTypeRef
}: any) {
  return (
    <div className="flex flex-col gap-1.5 relative" ref={propertyTypeRef}>
      <label id="propertyType-label" htmlFor="propertyType-select-button" className="text-[#2E2910] text-sm font-semibold">
        প্রপার্টির ধরন
      </label>
      <input type="hidden" {...register("propertyType")} />

      <button
        id="propertyType-select-button"
        type="button"
        aria-labelledby="propertyType-label"
        aria-haspopup="listbox"
        aria-controls="propertyType-listbox"
        aria-expanded={isPropertyTypeOpen}
        className={`w-full border bg-[#EBE3A7]/20 rounded-xl h-12 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#EB7D00]/20 transition-colors duration-200 flex items-center justify-between text-left ${errors.propertyType ? "border-red-500" : "border-[#2C5745]/20 focus:border-[#EB7D00]"}`}
        onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
        onBlur={() => setTimeout(() => setIsPropertyTypeOpen(false), 200)}
      >
        <span className="text-[#2C5745] truncate pr-4">
          {watch("propertyType") ? propertyTypes.find(p => p.value === watch("propertyType"))?.label : "-- নির্বাচন করুন --"}
        </span>
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isPropertyTypeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isPropertyTypeOpen && (
        <ul
          id="propertyType-listbox"
          role="listbox"
          aria-labelledby="propertyType-label"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1 w-full bg-white border border-[#2C5745]/15 shadow-xl rounded-xl max-h-60 overflow-y-auto overscroll-contain z-50 py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {propertyTypes.map((type) => {
            const isSelected = watch("propertyType") === type.value;

            return (
              <li key={type.value} role="presentation" className="border-b border-[#2C5745]/10 last:border-0">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    isSelected ? "bg-[#EBE3A7] font-semibold text-[#2E2910]" : "text-slate-700 hover:bg-[#EBE3A7] hover:text-[#2E2910]"
                  }`}
                  onClick={() => {
                    setValue("propertyType", type.value, { shouldValidate: true });
                    setIsPropertyTypeOpen(false);
                  }}
                >
                  {type.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {errors.propertyType && <span className="text-red-500 text-xs">{errors.propertyType.message as string}</span>}
    </div>
  );
}
