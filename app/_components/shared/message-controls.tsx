import Transcriber from "@/app/_components/ui/transcriber"
import { Conversation } from "@/app/_lib/conversations"
import { Message as MessageType } from "@/app/_types"

export function MessageControls({ conversation, msgs }: { conversation: Conversation[], msgs: MessageType[] }) {
  if (conversation.length === 0) return null

  return (
    <div className="space-y-2">
      <Transcriber conversation={conversation.slice(-1)} />
    </div>
  )
}