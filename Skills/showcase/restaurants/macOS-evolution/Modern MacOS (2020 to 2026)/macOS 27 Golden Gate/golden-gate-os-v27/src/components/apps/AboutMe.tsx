import React from 'react';

export const AboutMe: React.FC = () => {
  return (
    <div className="h-full w-full bg-[#0a0a0a]">
      <iframe
        src="https://aashman-homepage.vercel.app"
        className="w-full h-full border-none"
        title="About Me"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        allow="camera; microphone; geolocation"
      />
    </div>
  );
};
