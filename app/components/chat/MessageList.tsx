export default function MessageList({
  messages,
  groupedMessages,
  currentUserId,
  formatTime,
  formatDateLabel,
  messagesEndRef,
}: any) {
  return (
    <div className="messages-scroll">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="empty-label">কথোপকথন শুরু করুন</p>
        </div>
      ) : (
        groupedMessages.map((msg: any) => {
          const isOwn = msg.senderId === currentUserId;

          return (
            <div key={msg.id}>
              {msg.showDateSeparator && (
                <div className="date-separator">
                  <div className="date-separator-line" />
                  <span className="date-separator-label">{formatDateLabel(msg.createdAt)}</span>
                  <div className="date-separator-line" />
                </div>
              )}
              <div className={`msg-row ${isOwn ? "own" : "other"} ${msg.isGrouped ? "grouped" : ""}`}>
                <div className={`bubble ${isOwn ? "own" : "other"} ${msg.isGrouped ? "grouped" : ""}`}>
                  <p className="bubble-text">{msg.content}</p>
                  <div className={`bubble-meta ${isOwn ? "own" : "other"}`}>
                    <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                    {isOwn && (
                      <svg className="tick-icon" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
