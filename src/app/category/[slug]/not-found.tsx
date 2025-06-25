import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="max-w-content mx-auto px-4 py-16 bg-dark-bg min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Category Not Found
        </h1>
        <p className="text-dark-text mb-8">
          The category you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
