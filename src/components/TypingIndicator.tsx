export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-aimsg rounded-lg self-start mb-4">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-blink"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-blink [animation-delay:0.2s]"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-blink [animation-delay:0.4s]"></div>
    </div>
  );
};