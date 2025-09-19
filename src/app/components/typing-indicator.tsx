export default function TypingIndicator() {
  return (
    <div className="flex gap-1 p-2">
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
    </div>
  )
}
