import { api } from '@/services/api'
import type { PagedResult } from '@/types/api'
import type { MessagingSettings, QueuedMessage, MessageStatus, MessagePurpose } from '@/features/settings/types/settings'
import type { MessagingSettingsFormValues } from '@/features/settings/schemas/settings.schemas'

export interface QueueFilters {
  status?: MessageStatus | ''
  purpose?: MessagePurpose | ''
  page?: number
  pageSize?: number
}

export const settingsService = {
  messaging: () => api.get<MessagingSettings>('/settings/messaging'),

  saveMessaging: (values: MessagingSettingsFormValues) =>
    api.put<MessagingSettings>('/settings/messaging', values),

  queue: (filters: QueueFilters) =>
    api.get<PagedResult<QueuedMessage>>('/settings/messaging/queue', {
      params: {
        status: filters.status || undefined,
        purpose: filters.purpose || undefined,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 20,
      },
    }),
}
