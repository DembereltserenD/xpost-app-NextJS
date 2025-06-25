"use client";

export default function BreakingNewsTicker() {
  const breakingNews = [
    "Revolutionary AI Developments",
    "Markets Soar as Economic Recovery Exceeds Expectations",
    "Health Officials Announce New Safety Protocols",
    "Global Climate Summit Reaches Historic Agreement",
    "Tech Giants Announce Major Partnership",
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 border-b border-blue-400 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center py-2">
          <div className="bg-blue-600 px-3 py-1 rounded-full text-white text-xs font-semibold uppercase tracking-wide flex-shrink-0 mr-4">
            Breaking
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-scroll whitespace-nowrap text-white">
              {breakingNews.map((news, index) => (
                <span
                  key={index}
                  className="mx-6 text-sm font-medium hover:text-blue-100 cursor-pointer transition-colors"
                >
                  {news}
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {breakingNews.map((news, index) => (
                <span
                  key={`duplicate-${index}`}
                  className="mx-6 text-sm font-medium hover:text-blue-100 cursor-pointer transition-colors"
                >
                  {news}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 35s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
