import Transcriber from "@/components/ui/transcriber"
import { Conversation } from "@/lib/conversations"
import { Message as MessageType } from "@/types"

export function MessageControls({ conversation, msgs }: { conversation: Conversation[], msgs: MessageType[] }) {
  if (conversation.length === 0) return null

  return (
    <div className="space-y-2">
      <Transcriber conversation={conversation.slice(-1)} />
    </div>
  )
}