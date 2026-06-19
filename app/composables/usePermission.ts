export function usePermission() {
  const { user } = useGlobalState()
  const isViewer = computed(() => user.value?.role === 'viewer')

  const toast = useToast()

  function requireWrite(fn: () => void) {
    if (isViewer.value) {
      toast.add({
        title: '權限不足',
        description: '此帳號僅限瀏覽，無法執行此操作',
        color: 'error',
        icon: 'i-lucide-shield-x'
      })
      return
    }
    fn()
  }

  return { isViewer, requireWrite }
}
