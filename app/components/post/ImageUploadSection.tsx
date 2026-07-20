import Image from "next/image";

export default function ImageUploadSection({
  existingImages,
  isDeletingImage,
  removeExistingImage,
  fileInputRef,
  handleFileSelect,
  totalImageCount,
  selectedFiles,
  removeFile,
}: any) {
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      <label className="text-[#151717] text-sm font-semibold">ছবি আপলোড (সর্বোচ্চ ৫টি, প্রতিটি সর্বোচ্চ ৫MB)</label>

      {existingImages.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-slate-500 font-medium mb-1.5">বর্তমান ছবিসমূহ</p>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((url: string, idx: number) => (
              <div key={url} className="relative group w-20 h-20 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src={url}
                  alt={`ছবি ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized={url.startsWith('blob:')}
                />
                <button
                  type="button"
                  disabled={isDeletingImage}
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow disabled:opacity-50"
                  aria-label="মুছুন"
                >
                  <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {totalImageCount < 5 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload Images"
          className="border-2 border-dashed border-[#ecedec] rounded-none h-32 flex flex-col items-center justify-center bg-slate-50 text-slate-400 hover:border-[#2d79f3] hover:bg-blue-50/40 transition-colors cursor-pointer"
        >
          <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">ছবি যোগ করতে এখানে ক্লিক করুন</span>
          <span className="text-xs mt-1">{totalImageCount}/৫ টি ছবি</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1.5">নতুন ছবি</p>
          <div className="flex flex-wrap gap-3">
            {selectedFiles.map((file: File, idx: number) => (
              <div key={`${file.name}-${idx}`} className="relative group w-20 h-20 rounded-md overflow-hidden border border-green-300 shadow-sm">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  title="সরান"
                >
                  ✕
                </button>
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center truncate px-1 py-0.5">
                  {file.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
