<template>
  <UModal v-model:open="open" title="選擇商品圖片" :ui="{ content: 'max-w-3xl' }">
    <template #body>
      <div class="flex items-center gap-3 mb-4">
        <UInput
          v-model="search"
          placeholder="搜尋檔名..."
          icon="i-lucide-search"
          class="flex-1"
          @input="onSearchInput"
        />
        <UButton
          label="上傳新圖片"
          icon="i-lucide-upload"
          size="sm"
          color="neutral"
          variant="outline"
          :loading="uploading"
          type="button"
          @click="uploadInputRef?.click()"
        />
        <input ref="uploadInputRef" type="file" accept="image/*" class="hidden" @change="onUpload" />
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <UIcon name="i-lucide-loader-circle" class="w-6 h-6 animate-spin text-(--ui-text-muted)" />
      </div>

      <div v-else-if="images.length === 0" class="flex flex-col items-center gap-2 py-16 text-(--ui-text-muted)">
        <UIcon name="i-lucide-image-off" class="w-8 h-8 opacity-40" />
        <span class="text-sm">尚無圖片，請先上傳</span>
      </div>

      <div v-else class="grid grid-cols-4 sm:grid-cols-5 gap-3">
        <div
          v-for="image in images"
          :key="image.id"
          class="group flex flex-col gap-1 cursor-pointer"
          @click="pending = image"
        >
          <div
            class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all"
            :class="pending?.id === image.id
              ? 'border-(--ui-primary) ring-2 ring-(--ui-primary)/30'
              : 'border-transparent hover:border-(--ui-border-accented)'"
          >
            <img :src="image.url" :alt="image.filename" class="w-full h-full object-cover" />
            <div
              v-if="pending?.id === image.id"
              class="absolute inset-0 bg-primary/20 flex items-center justify-center"
            >
              <UIcon name="i-lucide-check-circle-2" class="w-8 h-8 text-white drop-shadow" />
            </div>
            <button
              class="absolute top-1 right-1 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/80"
              :class="{ 'opacity-100': deletingId === image.id }"
              type="button"
              @click.stop="deleteImage(image)"
            >
              <UIcon
                :name="deletingId === image.id ? 'i-lucide-loader-circle' : 'i-lucide-trash-2'"
                class="w-3.5 h-3.5"
                :class="{ 'animate-spin': deletingId === image.id }"
              />
            </button>
          </div>
          <p class="text-xs truncate text-center px-0.5" style="color: var(--ui-text-muted)">{{ image.filename }}</p>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center mt-4">
        <UPagination v-model:page="page" :total="total" :items-per-page="pageSize" />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton label="取消" color="neutral" variant="ghost" type="button" @click="open = false" />
        <UButton label="確認選擇" icon="i-lucide-check" type="button" :disabled="!pending" @click="confirm" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  interface ProductImage {
    id: number
    url: string
    filename: string
    size: number
  }

  interface ImageListResponse {
    total: number
    page: number
    totalPages: number
    data: ProductImage[]
  }

  const open = defineModel<boolean>('open', { default: false })
  const emit = defineEmits<{ select: [image: ProductImage] }>()

  const apiFetch = useApiFetch()
  const uploadInputRef = ref<HTMLInputElement | null>(null)

  const images = ref<ProductImage[]>([])
  const total = ref(0)
  const totalPages = ref(1)
  const page = ref(1)
  const pageSize = 20
  const loading = ref(false)
  const uploading = ref(false)
  const pending = ref<ProductImage | null>(null)
  const search = ref('')
  const deletingId = ref<number | null>(null)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  function onSearchInput() {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      page.value = 1
      fetchImages()
    }, 300)
  }

  async function fetchImages() {
    loading.value = true
    try {
      const params: Record<string, unknown> = { page: page.value, limit: pageSize }
      if (search.value.trim()) params.search = search.value.trim()
      const res = await apiFetch<ImageListResponse>('/images', { params })
      images.value = res.data
      total.value = res.total
      totalPages.value = res.totalPages
    } finally {
      loading.value = false
    }
  }

  watch(open, (val) => {
    if (val) {
      page.value = 1
      search.value = ''
      fetchImages()
    }
  })

  watch(page, fetchImages)

  async function onUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    uploading.value = true
    try {
      const formData = new FormData()
      formData.append('media', file)
      const newImage = await apiFetch<ProductImage>('/images', { method: 'POST', body: formData })
      images.value.unshift(newImage)
      total.value++
      pending.value = newImage
    } finally {
      uploading.value = false
      if (uploadInputRef.value) uploadInputRef.value.value = ''
    }
  }

  async function deleteImage(image: ProductImage) {
    deletingId.value = image.id
    try {
      await apiFetch(`/images/${image.id}`, { method: 'DELETE' })
      images.value = images.value.filter(i => i.id !== image.id)
      total.value--
      if (pending.value?.id === image.id) pending.value = null
    } finally {
      deletingId.value = null
    }
  }

  function confirm() {
    if (pending.value) {
      emit('select', pending.value)
      open.value = false
    }
  }
</script>
