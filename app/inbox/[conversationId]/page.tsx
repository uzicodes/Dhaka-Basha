import { getMessages, markMessagesAsRead } from "@/app/actions/chat";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChatRoomClient from "@/app/components/ChatRoomClient";

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login?redirectUrl=/inbox");

  const { conversationId } = await params;

  let data;
  try {
    data = await getMessages(conversationId);
  } catch {
    return (
      <main className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center px-4 pt-28 pb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900">কথোপকথন পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500">এই কথোপকথনটি আর সক্রিয় নেই অথবা আপনার দেখার অনুমতি নেই।</p>
          <Link
            href="/inbox"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            ইনবক্সে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  const { messages, conversation, currentUserId } = data;

  // Mark messages as read when opening the conversation
  await markMessagesAsRead(conversationId);

  // Determine the other user in the conversation
  const otherUser =
    conversation.user1Id === currentUserId
      ? conversation.user2
      : conversation.user1;

  return (
    <main className="grow flex flex-col bg-slate-50/50 pt-20 md:pt-28 px-2 sm:px-4 min-h-screen h-screen">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-50/80 via-emerald-50/20 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 bg-white shadow-xl rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/80 mb-4 sm:mb-6">
        {/* Chat Room */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatRoomClient
            initialMessages={structuredClone(messages)}
            conversationId={conversationId}
            currentUserId={currentUserId}
            otherUser={structuredClone(otherUser)}
          />
        </div>
      </div>
    </main>
  );
}
