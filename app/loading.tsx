import Image from "next/image";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative flex flex-col items-center">
                <Image
                    src="/icon.png"
                    alt="Bobo Logo"
                    width={120}
                    height={120}
                    className="animate-pulse"
                    priority
                />
                <p className="mt-4 text-sm font-medium text-[#598c58] animate-pulse">Đang tải dữ liệu...</p>
            </div>
        </div>
    );
}
