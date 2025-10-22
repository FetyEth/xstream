import Image from "next/image";

export default function UploadBanner() {
  return (
    <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="xStream Logo" width={36} height={36} />
            <div>
              <h2 className="text-white font-light text-lg">
                Creator Studio - Upload
              </h2>
              <p className="text-white/70 text-xs">
                Share your content and start earning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
