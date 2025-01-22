import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isAi: boolean;
}

export const ChatMessage = ({ message, isAi }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg max-w-[80%] mb-4",
        isAi ? "bg-aimsg text-white self-start" : "bg-usermsg text-white self-end"
      )}
    >
      <p className="whitespace-pre-wrap">{message}</p>
    </div>
  );
};