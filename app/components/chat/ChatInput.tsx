export default function ChatInput({ handleSend, input, handleInputChange, isSending, textareaRef }: any) {
  return (
    <div className="input-area">
      <form onSubmit={handleSend} className="input-row">
        <div className="input-wrap">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="আপনার বার্তা লিখুন..."
            aria-label="বার্তা লিখুন"
            className="chat-textarea"
            disabled={isSending}
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className={`send-btn ${!input.trim() || isSending ? "inactive" : "active"}`}
          aria-label="Send message"
          title="পাঠান"
        >
          {isSending ? (
            <svg className="spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12a8 8 0 018-8" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
      <p className="input-hint">Enter টিপুন বার্তা পাঠাতে • Shift + Enter নতুন লাইন</p>
    </div>
  );
}
