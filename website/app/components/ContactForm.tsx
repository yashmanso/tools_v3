'use client';

export function ContactForm() {
  const handleContactClick = () => {
    // Create a mailto link that opens the user's default email client
    const subject = encodeURIComponent('Contact from Sustainability Atlas');
    const body = encodeURIComponent('Hello,\n\n');
    const mailtoLink = `mailto:yashar.mansoori@chalmers.se?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <button
      onClick={handleContactClick}
      className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
      aria-label="Contact us via email"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      Contact us
    </button>
  );
}
