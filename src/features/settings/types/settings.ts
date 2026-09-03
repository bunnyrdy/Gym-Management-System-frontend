/** Mirrors MessagingSettingsResponse in SettingsContracts.cs. */
export interface MessagingSettings {
  emailsEnabled: boolean
  suspendTransactional: boolean
  dailyEmailLimit: number
  highPriorityReserve: number
  reminderDaysBefore: number[]

  /** Spent today against the vendor's UTC day, not the gym's. */
  highSentToday: number
  normalSentToday: number

  /**
   * What the reminder queue may still spend today. The server computes this
   * with the same two ceilings claim_message_batch() applies, so the number on
   * screen is the one the worker will honour rather than a second, drifting
   * calculation of it.
   */
  normalRemainingToday: number

  pendingCount: number
  failedCount: number

  quotaResetsAtUtc: string
  /** The same instant in the branch's clock — 5:30 AM on Asia/Kolkata. */
  quotaResetsAtLocal: string
}

export type MessageStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped'

export type MessagePurpose =
  | 'password_reset'
  | 'password_changed'
  | 'renewal_reminder'
  | 'offer'

/**
 * One row of the queue. Note there is no body: a pending reset row holds a live
 * link, and nothing in the app should be able to read one back out.
 */
export interface QueuedMessage {
  id: number
  purpose: MessagePurpose
  priority: 'high' | 'normal'
  status: MessageStatus
  skipReason: string | null
  toAddress: string
  subject: string | null
  attempts: number
  lastError: string | null
  createdAt: string
  sentAt: string | null
  expiresAt: string
}
