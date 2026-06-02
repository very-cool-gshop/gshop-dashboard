<template>
  <UDashboardPanel id="order-edit" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar :title="order ? `訂單 #${order.id}` : '訂單詳情'">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="返回" color="neutral" variant="ghost" to="/orders" />
          <UButton
            label="儲存狀態"
            icon="i-lucide-check"
            :loading="saving"
            :disabled="!statusChanged"
            @click="saveStatus"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-24">
        <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-(--ui-text-muted)" />
      </div>

      <div v-else-if="order" class="flex flex-col gap-6 w-full max-w-3xl mx-auto">
        <!-- 訂單資訊 -->
        <UPageCard title="訂單資訊" variant="subtle">
          <div class="divide-y divide-(--ui-border)">
            <div class="flex justify-between items-center py-3">
              <span class="text-sm text-muted">訂單編號</span>
              <span class="font-mono font-medium">#{{ order.id }}</span>
            </div>
            <div class="flex justify-between items-center py-3">
              <span class="text-sm text-muted">建立時間</span>
              <span>{{ order.createdAt.slice(0, 10) }}</span>
            </div>
            <div class="flex justify-between items-center py-3">
              <span class="text-sm text-muted">訂單狀態</span>
              <USelect v-model="status" :items="statusOptions" :color="statusColorMap[status]" class="w-36" />
            </div>
          </div>
        </UPageCard>

        <!-- 收件資訊 -->
        <UPageCard title="收件資訊" variant="subtle">
          <div class="divide-y divide-(--ui-border)">
            <div class="flex justify-between items-center py-3">
              <span class="text-sm text-muted">收件人</span>
              <span class="font-medium">{{ order.recipientName }}</span>
            </div>
            <div class="flex justify-between items-center py-3">
              <span class="text-sm text-muted">電話</span>
              <span>{{ order.recipientPhone }}</span>
            </div>
            <div class="flex justify-between items-start py-3 gap-8">
              <span class="text-sm text-muted shrink-0">地址</span>
              <span class="text-right">{{ order.address }}</span>
            </div>
            <div v-if="order.note" class="flex justify-between items-start py-3 gap-8">
              <span class="text-sm text-muted shrink-0">備註</span>
              <span class="text-right">{{ order.note }}</span>
            </div>
          </div>
        </UPageCard>

        <!-- 訂單明細 -->
        <UPageCard title="訂單明細" variant="subtle">
          <div class="divide-y divide-(--ui-border)">
            <div class="flex gap-4 text-xs font-medium text-muted pb-2">
              <span class="flex-1">商品</span>
              <span class="w-24 text-right">單價</span>
              <span class="w-16 text-center">數量</span>
              <span class="w-24 text-right">小計</span>
            </div>
            <div v-for="item in order.OrderItems" :key="item.id" class="flex gap-4 items-center py-3">
              <div class="flex-1">
                <p class="font-medium text-sm">{{ item.productName }}</p>
                <p v-if="item.variantName" class="text-xs text-muted">{{ item.variantName }}</p>
              </div>
              <span class="w-24 text-right text-sm">NT$ {{ Number(item.unitPrice).toLocaleString() }}</span>
              <span class="w-16 text-center text-sm">× {{ item.quantity }}</span>
              <span class="w-24 text-right text-sm font-medium">NT$ {{ Number(item.subtotal).toLocaleString() }}</span>
            </div>
            <div v-if="Number(order.discountAmount) > 0" class="flex justify-between items-center py-3">
              <span class="text-sm text-muted">折扣</span>
              <span class="text-error">- NT$ {{ Number(order.discountAmount).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center py-3">
              <span class="font-semibold">總計</span>
              <span class="font-semibold text-lg">NT$ {{ Number(order.totalAmount).toLocaleString() }}</span>
            </div>
          </div>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { Order, OrderItem } from '~/types'

  interface OrderDetail extends Order {
    OrderItems: OrderItem[]
    User: { id: number; username: string; email: string }
  }

  const route = useRoute()
  const orderId = route.params.id as string
  const toast = useToast()
  const apiFetch = useApiFetch()

  const order = ref<OrderDetail | null>(null)
  const status = ref<Order['status']>('pending')
  const loading = ref(true)
  const saving = ref(false)

  const statusOptions = [
    { label: '待確認', value: 'pending' },
    { label: '已付款', value: 'paid' },
    { label: '已出貨', value: 'shipped' },
    { label: '已送達', value: 'delivered' },
    { label: '已取消', value: 'cancelled' }
  ]

  const statusColorMap = {
    pending: 'warning',
    paid: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  } as const

  onMounted(async () => {
    try {
      const data = await apiFetch<OrderDetail>(`/orders/${orderId}`)
      order.value = data
      status.value = data.status
    } catch {
      toast.add({ title: '載入失敗', description: '找不到此訂單', color: 'error' })
      await navigateTo('/orders')
    } finally {
      loading.value = false
    }
  })

  async function saveStatus() {
    if (!order.value || status.value === order.value.status) return
    saving.value = true
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: status.value }
      })
      order.value.status = status.value
      toast.add({ title: '狀態已更新', color: 'success' })
    } catch {
      toast.add({ title: '更新失敗', description: '請稍後再試', color: 'error' })
    } finally {
      saving.value = false
    }
  }

  const statusChanged = computed(() => order.value && status.value !== order.value.status)
</script>
