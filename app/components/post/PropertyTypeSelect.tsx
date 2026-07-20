import { propertyTypes } from "@/src/lib/constants";

export default function PropertyTypeSelect({
  register, watch, setValue, errors,
  isPropertyTypeOpen, setIsPropertyTypeOpen, propertyTypeRef
}: any) {
  return (
    <div className="flex flex-col gap-1.5 relative" ref={propertyTypeRef}>
      <label id="propertyType-label" className="text-[#151717] text-sm font-semibold">প্রপার্টির ধরন</label>
      <input type="hidden" {...register("propertyType")} />

      <button
        type="button"
        aria-labelledby="propertyType-label"
        className={`w-full border-[1.5px] bg-white rounded-none h-11 px-3 focus:outline-none transition-colors duration-200 flex items-center justify-between text-left ${errors.propertyType ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"}`}
        onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
        onBlur={() => setTimeout(() => setIsPropertyTypeOpen(false), 200)}
      >
        <span className="text-blue-600 truncate pr-4">
          {watch("propertyType") ? propertyTypes.find(p => p.value === watch("propertyType"))?.label : "-- নির্বাচন করুন --"}
        </span>
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isPropertyTypeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isPropertyTypeOpen && (
        <ul
          className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 shadow-xl rounded-none max-h-60 overflow-y-auto z-50 py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {propertyTypes.map((type) => (
            <li
              key={type.value}
              className="px-4 py-2.5 text-slate-700 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors"
              onClick={() => {
                setValue("propertyType", type.value, { shouldValidate: true });
                setIsPropertyTypeOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setValue("propertyType", type.value, { shouldValidate: true });
                  setIsPropertyTypeOpen(false);
                }
              }}
              tabIndex={0}
              role="option"
            >
              {type.label}
            </li>
          ))}
        </ul>
      )}
      {errors.propertyType && <span className="text-red-500 text-xs">{errors.propertyType.message as string}</span>}
    </div>
  );
}
