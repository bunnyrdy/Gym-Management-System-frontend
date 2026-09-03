import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'
import { settingsService, type QueueFilters } from '@/features/settings/services/settings.service'
import type { MessagingSettingsFormValues } from '@/features/settings/schemas/settings.schemas'

export const keys = {
  all: ['settings'] as const,
  messaging: ['settings', 'messaging'] as const,
  queue: (f: QueueFilters) => ['settings', 'messaging', 'queue', f] as const,
}

function message(err: unknown, fallback: string) {
  return (err as AxiosError<ApiError>)?.response?.data?.message ?? fallback
}

/**
 * `staleTime` is short on purpose. Everything here is a live counter — how much
 * of today's allowance is gone, how many messages are waiting — and a screen
 * whose whole job is to answer "is mail going out right now" must not cache the
 * answer for five minutes.
 */
export function useMessagingSettings() {
  return useQuery({
    queryKey: keys.messaging,
    queryFn: () => settingsService.messaging().then((r) => r.data),
    staleTime: 15_000,
  })
}

export function useMessageQueue(filters: QueueFilters) {
  return useQuery({
    queryKey: keys.queue(filters),
    queryFn: () => settingsService.queue(filters).then((r) => r.data),
    staleTime: 15_000,
  })
}

export function useSaveMessagingSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: MessagingSettingsFormValues) => settingsService.saveMessaging(values),
    onSuccess: () => {
      // Both the settings and the queue: changing the limits changes the
      // "remaining today" figure the queue panel sits next to.
      queryClient.invalidateQueries({ queryKey: keys.all })
      toast.success('Messaging settings saved.')
    },
    onError: (err) => toast.error(message(err, 'Could not save the settings.')),
  })
}
