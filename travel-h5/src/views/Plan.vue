<template>
  <div class="plan-page">
    <van-nav-bar fixed placeholder left-arrow @click-left="onBack" :title="formData.destination + '行程规划'" />

    <div class="page-content">
      <!-- 加载中 -->
      <van-loading v-if="isLoading" size="36px" vertical type="spinner" class="loading">
        正在生成旅游规划 ...
      </van-loading>

      <!-- 失败：空状态 + 重试 -->
      <van-empty v-else-if="isError" :image="isEmpty ? 'default' : 'error'"
        :description="isEmpty ? '暂无行程数据' : '行程规划生成失败，请重试'">
        <van-button round type="primary" class="retry-btn" @click="fetchPlan">
          重新生成
        </van-button>
      </van-empty>

      <!-- 成功：渲染行程 -->
      <template v-else-if="plan">
        <van-collapse v-model="activeNames" class="plan-collapse">
          <!-- 基本信息 -->
          <van-collapse-item v-if="plan['基本信息']" title="基本信息" name="basic">
            <div class="info-row" v-for="(value, key) in plan['基本信息']" :key="key">
              <span class="label">{{ key }}</span>
              <span class="value">{{ value }}</span>
            </div>
          </van-collapse-item>

          <!-- 预算分配 -->
          <van-collapse-item v-if="plan['预算分配']" title="预算分配（元）" name="budget">
            <div class="info-row" v-for="(value, key) in plan['预算分配']" :key="key">
              <span class="label">{{ key }}</span>
              <span class="value money">¥{{ value }}</span>
            </div>
          </van-collapse-item>

          <!-- 每日行程：每天可单独收起 -->
          <van-collapse-item v-for="(day, index) in plan['每日行程']" :key="day['天数']" :name="`day-${index}`">
            <template #title>
              <span class="day-num">{{ day['天数'] }}</span>
              <span class="day-theme">{{ day['主题'] }}</span>
            </template>
            <div class="timeline-item" v-for="(item, i) in day['行程']" :key="i">
              <span class="time">{{ item['时间'] }}</span>
              <span class="desc">{{ item['安排'] }}</span>
            </div>
            <div class="day-cost" v-if="day['当日花费预估']">
              预计花费：{{ day['当日花费预估'] }}
            </div>
          </van-collapse-item>

          <!-- 实用贴士 -->
          <van-collapse-item v-if="plan['实用贴士'] && plan['实用贴士'].length" title="实用贴士" name="tips">
            <ul class="tips">
              <li v-for="(tip, index) in plan['实用贴士']" :key="index">{{ tip }}</li>
            </ul>
          </van-collapse-item>
        </van-collapse>
      </template>
    </div>
    <div class="consult-wrap">
      <van-button v-if="plan" type="primary" block round class="consult-btn" @click="onConsult">/咨询AI助手</van-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { post } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isError = ref(false)
const isEmpty = ref(false)
const plan = ref(null)
const activeNames = ref([])
const formData = reactive({
  destination: '',
  budget: null,
  days: null
})

const fetchPlan = async () => {
  isLoading.value = true
  isError.value = false
  isEmpty.value = false
  try {
    const result = await post('/recommend', {
      destination: formData.destination,
      budget: formData.budget,
      days: formData.days
    })
    plan.value = result.data?.['旅行计划'] || null
    // 默认全部展开
    activeNames.value = [
      'basic',
      'budget',
      ...(plan.value?.['每日行程'] || []).map((_, i) => `day-${i}`),
      'tips'
    ]
    if (!plan.value) {
      isEmpty.value = true
      isError.value = true
    }
  } catch (err) {
    console.error('获取行程规划失败', err)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  formData.destination = route.query.destination || ''
  formData.budget = route.query.budget
  formData.days = route.query.days

  if (formData.destination && formData.budget && formData.days) {
    fetchPlan()
  } 
})

const onBack = () => {
  router.back()
}

const onConsult = () => {
    router.push({
        path: '/chat',
        query: {
           source:'plan',
           city: formData.destination
        }
    })
}
</script>

<style scoped>
.plan-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding-bottom: 24px;
}

.page-content {
  padding: 12px;
}

.loading {
  padding: 120px 0;
}

.retry-btn {
  --van-button-primary-background: #4d80f0;
  --van-button-primary-border-color: #4d80f0;
  padding: 0 40px;
}

.plan-collapse {
  border-radius: 12px;
  overflow: hidden;
}

.consult-wrap {
  padding: 16px 12px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 100;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid #f2f3f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: #969799;
  flex-shrink: 0;
  margin-right: 24px;
}

.info-row .value {
  color: #323233;
  text-align: right;
}

.info-row .money {
  color: #ee6723;
  font-weight: 600;
}

.day-num {
  background: #4d80f0;
  color: #fff;
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 999px;
  margin-right: 10px;
}

.day-theme {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.timeline-item {
  display: flex;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid #f2f3f5;
}

.timeline-item .time {
  color: #4d80f0;
  width: 96px;
  flex-shrink: 0;
}

.timeline-item .desc {
  color: #323233;
  flex: 1;
}

.day-cost {
  margin-top: 10px;
  font-size: 13px;
  color: #ee6723;
  background: #fff7f0;
  border-radius: 8px;
  padding: 8px 12px;
}

.tips {
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
  color: #646566;
  line-height: 1.8;
}
</style>
