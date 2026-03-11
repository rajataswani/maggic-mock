import React, { useMemo, useState, useEffect, useRef } from 'react';

interface InteractiveLoginCharacterProps {
    isEmailFocused: boolean;
    isPasswordFocused: boolean;
    emailLength: number;
}

export const InteractiveLoginCharacter: React.FC<InteractiveLoginCharacterProps> = ({
    isEmailFocused,
    isPasswordFocused,
    emailLength,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isGreeting, setIsGreeting] = useState(true);

    // Turn off greeting after 2.5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsGreeting(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    // Track mouse global position to make eyes follow
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            // Center of the SVG
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Offset from center
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;

            // Normalize and limit movement radius
            const maxRadiusX = 500;
            const maxRadiusY = 500;
            const factorX = Math.max(-1, Math.min(1, dx / maxRadiusX));
            const factorY = Math.max(-1, Math.min(1, dy / maxRadiusY));

            setMousePos({ x: factorX * 12, y: factorY * 12 });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Max email length we track for pupil movement
    const maxChars = 30;

    // Calculate how far the pupils should look horizontally
    const pupilX = useMemo(() => {
        if (isEmailFocused) {
            const boundedLength = Math.min(emailLength, maxChars);
            const percentage = boundedLength / maxChars;
            // Map 0 to -10, 1 to 10 for typing tracking
            return -10 + percentage * 20;
        }
        if (isPasswordFocused) return 0;
        return mousePos.x;
    }, [emailLength, isEmailFocused, isPasswordFocused, mousePos.x]);

    // Calculate how far the pupils should look vertically
    const pupilY = useMemo(() => {
        if (isEmailFocused) return 2; // Look down slightly at input
        if (isPasswordFocused) return 0;
        return mousePos.y;
    }, [isEmailFocused, isPasswordFocused, mousePos.y]);

    // When focused on password, hands go up, otherwise they stay down
    const showHands = isPasswordFocused;

    return (
        <div ref={containerRef} className="relative w-48 h-48 mx-auto -mb-8 z-10 select-none pointer-events-none">
            {isGreeting && (
                <div className="absolute -top-4 right-[-10px] bg-white px-5 py-2 rounded-2xl shadow-xl border border-indigo-100 z-20 animate-bounce" style={{ animationDuration: '2s' }}>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Hi! 👋
                    </span>
                    <div className="absolute -bottom-2 left-1/4 w-4 h-4 bg-white border-b border-r border-indigo-100 transform rotate-45"></div>
                </div>
            )}

            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-xl overflow-visible"
            >
                <style>
                    {`
                        @keyframes bearWave {
                            0% { transform: translate(30px, -60px) rotate(20deg); }
                            100% { transform: translate(30px, -60px) rotate(60deg); }
                        }
                    `}
                </style>

                {/* Shadow under the bear */}
                <ellipse cx="100" cy="180" rx="60" ry="10" fill="#E2E8F0" />

                {/* --- Ears --- */}
                {/* Left Ear */}
                <circle cx="50" cy="70" r="24" fill="#6366F1" />
                <circle cx="50" cy="70" r="14" fill="#A5B4FC" />
                {/* Right Ear */}
                <circle cx="150" cy="70" r="24" fill="#6366F1" />
                <circle cx="150" cy="70" r="14" fill="#A5B4FC" />

                {/* --- Head Base --- */}
                <circle cx="100" cy="110" r="70" fill="#818CF8" />

                {/* --- Face Area --- */}
                <path
                    d="M 60 110 C 60 85, 140 85, 140 110 C 140 145, 60 145, 60 110 Z"
                    fill="#EEF2FF"
                />

                {/* --- Eyes --- */}
                <g stroke="#312E81" strokeWidth="4" fill="#FFFFFF">
                    <circle cx="75" cy="100" r="12" />
                    <circle cx="125" cy="100" r="12" />
                </g>

                {/* --- Pupils --- */}
                <g fill="#1E1B4B" style={{ transition: 'transform 0.1s ease-out' }}>
                    {/* If password focused, pupil looks vaguely forward/closed visually, but handled by hands.
              If email focused, tracking. Otherwise center. */}
                    <circle
                        cx="75"
                        cy="100"
                        r="5"
                        transform={`translate(${pupilX}, ${pupilY})`}
                    />
                    <circle
                        cx="125"
                        cy="100"
                        r="5"
                        transform={`translate(${pupilX}, ${pupilY})`}
                    />
                </g>

                {/* --- Nose & Snout --- */}
                <ellipse cx="100" cy="120" rx="16" ry="10" fill="#A5B4FC" />
                <path
                    d="M 90 118 Q 100 125 110 118"
                    stroke="#312E81"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />
                <circle cx="100" cy="115" r="5" fill="#312E81" />

                {/* --- Mouth --- */}
                <path
                    d="M 90 135 Q 100 145 110 135"
                    stroke="#312E81"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                        transition: 'd 0.3s ease-in-out',
                    }}
                />

                {/* --- Cheeks (blush when typed/focused) --- */}
                <g
                    fill="#FDA4AF"
                    opacity={isEmailFocused || isPasswordFocused || isGreeting ? 0.6 : 0}
                    style={{ transition: 'opacity 0.3s ease' }}
                >
                    <ellipse cx="55" cy="115" rx="8" ry="4" />
                    <ellipse cx="145" cy="115" rx="8" ry="4" />
                </g>

                {/* --- Left Hand (Covers eye) --- */}
                <g
                    style={{
                        transformOrigin: '40px 180px',
                        transform: showHands
                            ? 'translate(25px, -70px) rotate(30deg)'
                            : 'translate(0px, 0px) rotate(0deg)',
                        transition: 'transform 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    }}
                >
                    <path
                        d="M 30 150 C 30 120, 70 120, 70 150 C 70 180, 50 190, 30 170 Z"
                        fill="#6366F1"
                    />
                    {/* Paw pads */}
                    <circle cx="50" cy="145" r="8" fill="#A5B4FC" />
                    <circle cx="42" cy="135" r="3" fill="#A5B4FC" />
                    <circle cx="50" cy="132" r="3" fill="#A5B4FC" />
                    <circle cx="58" cy="135" r="3" fill="#A5B4FC" />
                </g>

                {/* --- Right Hand (Covers eye or Waves) --- */}
                <g
                    style={{
                        transformOrigin: '160px 180px',
                        transform: showHands
                            ? 'translate(-25px, -70px) rotate(-30deg)'
                            : isGreeting && !isEmailFocused && !isPasswordFocused
                                ? 'translate(30px, -60px) rotate(45deg)'
                                : 'translate(0px, 0px) rotate(0deg)',
                        transition: 'transform 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        animation: (isGreeting && !isEmailFocused && !isPasswordFocused)
                            ? 'bearWave 0.6s infinite alternate ease-in-out'
                            : 'none',
                    }}
                >
                    <path
                        d="M 130 150 C 130 120, 170 120, 170 150 C 170 180, 150 190, 130 170 Z"
                        fill="#6366F1"
                    />
                    {/* Paw pads */}
                    <circle cx="150" cy="145" r="8" fill="#A5B4FC" />
                    <circle cx="142" cy="135" r="3" fill="#A5B4FC" />
                    <circle cx="150" cy="132" r="3" fill="#A5B4FC" />
                    <circle cx="158" cy="135" r="3" fill="#A5B4FC" />
                </g>
            </svg>
        </div>
    );
};

