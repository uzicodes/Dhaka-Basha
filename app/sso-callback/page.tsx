import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="animate-pulse text-lg font-medium text-[#2d79f3]">
        যাচাই করা হচ্ছে... (Verifying...)
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  )
}
