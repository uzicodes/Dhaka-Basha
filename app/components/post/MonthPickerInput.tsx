const monthsBN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export default function MonthPickerInput({
  register, watch, setValue, errors,
  isMonthPickerOpen, setIsMonthPickerOpen, monthPickerRef,
  viewYear, setViewYear, currentDate
}: any) {
  return (
    <div className="flex flex-col gap-1.5 relative" ref={monthPickerRef}>
      <label id="rentFrom-label" className="text-[#151717] text-sm font-semibold">ভাড়া শুরু (মাস/বছর)</label>
      <div
        role="button"
        tabIndex={0}
        aria-labelledby="rentFrom-label"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsMonthPickerOpen(!isMonthPickerOpen); }}
        onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
        className={`border-[1.5px] rounded-none h-11 px-3 flex items-center justify-between cursor-pointer bg-white transition-colors duration-200 ${errors.rentFrom ? "border-red-500" : "border-[#ecedec] focus-within:border-[#2d79f3]"}`}
      >
        <span className={watch("rentFrom") ? "text-blue-600 font-medium" : "text-slate-400"}>
          {watch("rentFrom") || "মাস / বছর নির্বাচন করুন"}
        </span>
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <input type="hidden" {...register("rentFrom")} />

      {isMonthPickerOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-2xl z-60 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <button
              type="button"
              onClick={() => setViewYear((prev: number) => Math.max(currentDate.year, prev - 1))}
              disabled={viewYear <= currentDate.year}
              className="p-1 hover:bg-slate-100 rounded-full disabled:opacity-30"
              aria-label="পূর্ববর্তী বছর"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="font-bold text-slate-800 text-lg">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((prev: number) => prev + 1)}
              className="p-1 hover:bg-slate-100 rounded-full"
              aria-label="পরবর্তী বছর"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {monthsBN.map((name, index) => {
              const monthNum = index + 1;
              const isPast = viewYear === currentDate.year && monthNum < currentDate.month;
              const currentVal = watch("rentFrom");
              const isSelected = currentVal === `${String(monthNum).padStart(2, '0')}/${viewYear}`;

              return (
                <button
                  key={name}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    const val = `${String(monthNum).padStart(2, '0')}/${viewYear}`;
                    setValue("rentFrom", val, { shouldValidate: true });
                    setIsMonthPickerOpen(false);
                  }}
                  className={`py-2 text-sm rounded-md transition-all ${isSelected
                    ? "bg-[#2d79f3] text-white font-bold"
                    : isPast
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-blue-50 hover:text-[#2d79f3]"
                    }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {errors.rentFrom && <span className="text-red-500 text-xs">{errors.rentFrom.message as string}</span>}
    </div>
  );
}
