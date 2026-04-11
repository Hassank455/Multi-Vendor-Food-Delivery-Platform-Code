import { enhance as zenStackEnhance } from '@/generated/zenstack/enhance'

export function enhance(...args: Parameters<typeof zenStackEnhance>) {
  return zenStackEnhance(...args)
}
