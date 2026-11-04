<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import 'vant/es/toast/style'

const router = useRouter()

const destination = ref('')
const budget = ref('')
const days = ref('')
const showPicker = ref(false)

const hotCities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆']

const cityOptions = hotCities.map((city) => ({ text: city, value: city }))

const onConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  destination.value = selectedValues[0]
  showPicker.value = false
}

const startPlan = () => {
  if(!destination.value) {
    showToast('请选择目的地')
    return
  } 
  else if (!budget.value) {
    showToast('请先填写预算')
    return
  }
  else if (!days.value) {
    showToast('请先填写天数')
    return
  }
  router.push({
    path: '/plan',
    query: {
      destination: destination.value,
      budget: budget.value,
      days: days.value
    }
  })
}
</script>

<template>
  <div class="home">
    <van-nav-bar title="智能旅游助手" />

    <div class="page-content">
      <van-notice-bar
        class="notice"
        left-icon="info-o"
        :scrollable="false"
        text="基于 AI 的智能景点介绍与行程规划系统"
      />

      <div class="card">
        <h3 class="card-title">规划你的旅程</h3>
        <div class="field-list">
          <van-field
            v-model="destination"
            label="目的地"
            readonly
            is-link
            placeholder="请选择目的地"
            @click="showPicker = true"
          />
          <van-field
            v-model="budget"
            label="预算(元)"
            type="number"
            placeholder="请输入预算金额"
          />
          <van-field
            v-model="days"
            label="天数"
            type="digit"
            placeholder="请输入旅行天数"
          />
        </div>
        <van-button round block type="primary" class="plan-btn" @click="startPlan">
          开始规划
        </van-button>
      </div>

      <div class="card">
        <h3 class="card-title">快捷入口</h3>
        <van-grid :column-num="2" :border="false">
          <van-grid-item icon="chat-o" text="AI 对话" @click="router.push('/chat')" />
          <van-grid-item icon="user-o" text="我的" @click="router.push('/profile')" />
        </van-grid>
      </div>

      <div class="card">
        <h3 class="card-title">热门目的地</h3>
        <div class="city-tags">
          <span
            v-for="city in hotCities"
            :key="city"
            class="city-tag"
            :class="{ active: city === destination }"
            @click="destination = city"
          >
            {{ city }}
          </span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        :columns="cityOptions"
        title="选择目的地"
        @confirm="onConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f7fb;
}

.page-content {
  padding: 12px;
}

.notice {
  --van-notice-bar-background: #fdf3e0;
  --van-notice-bar-color: #d9822b;
  border-radius: 8px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.card-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.field-list :deep(.van-field) {
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.plan-btn {
  margin-top: 6px;
  --van-button-primary-background: #4d80f0;
  --van-button-primary-border-color: #4d80f0;
}

.city-tags {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.city-tag {
  text-align: center;
  padding: 8px 0;
  border-radius: 999px;
  background: #f7f8fa;
  color: #646566;
  font-size: 14px;
  cursor: pointer;
}

.city-tag.active {
  background: #4d80f0;
  color: #fff;
}
</style>
