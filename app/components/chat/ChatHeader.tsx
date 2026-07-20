import Link from "next/link";
import Image from "next/image";

export default function ChatHeader({
  otherUser,
  isMenuOpen,
  setIsMenuOpen,
  handleDelete,
  isPending,
  menuRef,
}: any) {
  const avatarInitial = otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="chat-header">
      <Link href="/inbox" className="back-btn" aria-label="Go back">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="avatar-wrap">
        {otherUser.profileImage ? (
          <Image
            src={otherUser.profileImage}
            alt={otherUser.name || "User"}
            width={40}
            height={40}
            className="avatar-img"
          />
        ) : (
          <div className="avatar-fallback">{avatarInitial}</div>
        )}
      </div>

      <div className="header-info">
        <div className="header-name">{otherUser.name || "ব্যবহারকারী"}</div>
      </div>

      <div className="header-actions" ref={menuRef}>
        {otherUser.phone && (
          <a href={`tel:${otherUser.phone}`} className="icon-btn" title="Call" aria-label="Call user">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        )}
        <button
          type="button"
          className="icon-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="dropdown-menu">
            <button
              type="button"
              className="dropdown-item danger"
              onClick={handleDelete}
              disabled={isPending}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              কথোপকথন মুছুন
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
