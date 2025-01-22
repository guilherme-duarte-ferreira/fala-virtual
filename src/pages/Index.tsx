import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";

interface Message {
  text: string;
  isAi: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const simulateAiResponse = async (userMessage: string) => {
    setIsTyping(true);
    // Simula um delay de resposta
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
    setMessages(prev => [...prev, {
      text: `Essa é uma resposta simulada para: "${userMessage}"`,
      isAi: true
    }]);
  };

  const handleSendMessage = (message: string) => {
    setMessages(prev => [...prev, { text: message, isAi: false }]);
    simulateAiResponse(message);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-screen bg-chatbg">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col"
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.text}
            isAi={message.isAi}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isTyping}
      />
    </div>
  );
};

export default Index;