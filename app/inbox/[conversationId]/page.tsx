import { getMessages } from "@/app/actions/chat";
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
      <main className="grow flex flex-col items-center justify-center px-4 bg-[#daf2e0] pt-32 pb-12 min-h-screen">
        <div className="bg-white p-8 rounded-[20px] shadow-sm border border-red-200 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">কথোপকথন পাওয়া যায়নি</h2>
          <p className="text-slate-500 mb-6">এই কথোপকথনটি আর নেই বা আপনার অ্যাক্সেস নেই।</p>
          <Link href="/inbox" className="bg-[#2d79f3] text-white px-6 py-2.5 rounded-[10px] font-medium hover:bg-blue-700 transition-colors">
            ইনবক্সে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  const { messages, conversation, currentUserId } = data;

  // Determine the other user in the conversation
  const otherUser =
    conversation.user1Id === currentUserId
      ? conversation.user2
      : conversation.user1;

  return (
    <main className="grow flex flex-col bg-[#daf2e0] pt-32 min-h-screen">
      <div className="w-full max-w-3xl mx-auto flex flex-col flex-1 bg-white shadow-sm border-x border-[#ecedec]">
        {/* Back button */}
        <div className="bg-white px-4 py-2 border-b border-slate-100">
          <Link
            href="/inbox"
            className="text-sm text-slate-500 hover:text-[#2d79f3] transition-colors font-medium"
          >
            ← ইনবক্সে ফিরে যান
          </Link>
        </div>

        {/* Chat Room */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatRoomClient
            initialMessages={JSON.parse(JSON.stringify(messages))}
            conversationId={conversationId}
            currentUserId={currentUserId}
            otherUser={JSON.parse(JSON.stringify(otherUser))}
          />
        </div>
      </div>
    </main>
  );
}
