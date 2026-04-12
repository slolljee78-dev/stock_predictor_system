import React, { ReactNode, useState } from "react";

interface HoverCardProps {
  children: ReactNode;
  content: ReactNode;
  delay?: number;
}

export default function HoverCard({ children, content, delay = 200 }: HoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-fade-in-up">
          <div className="card-premium text-sm whitespace-nowrap shadow-lg">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
