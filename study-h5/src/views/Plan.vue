<template>
  <div class="plan-page">
    <van-nav-bar fixed placeholder left-arrow @click-left="onBack" :title="formData.subject + '学习计划'" />

    <div class="page-content">
      <!-- 加载中 -->
      <van-loading v-if="isLoading" size="36px" vertical type="spinner" class="loading">
        正在生成学习计划 ...
      </van-loading>

      <!-- 失败：空状态 + 重试 -->
      <van-empty v-else-if="isError" :image="isEmpty ? 'default' : 'error'"
        :description="isEmpty ? '暂无计划数据' : '学习计划生成失败，请重试'">
        <van-button round type="primary" class="retry-btn" @click="fetchPlan">
          重新生成
        </van-button>
      </van-empty>

      <!-- 成功：渲染计划 -->
      <template v-else-if="plan">
        <van-collapse v-model="activeNames" class="plan-collapse">
          <!-- 基本信息 -->
          <van-collapse-item v-if="plan['基本信息']" title="基本信息" name="basic">
            <div class="info-row" v-for="(value, key) in plan['基本信息']" :key="key">
              <span class="label">{{ key }}</span>
              <span class="value">{{ value }}</span>
            </div>
          </van-collapse-item>

          <!-- 时长分配 -->
          <van-collapse-item v-if="plan['时长分配']" title="时长分配（小时）" name="hours">
            <div class="info-row" v-for="(value, key) in plan['时长分配']" :key="key">
              <span class="label">{{ key }}</span>
              <span class="value hours">{{ value }}h</span>
            </div>
          </van-collapse-item>

          <!-- 每日计划：每天可单独收起 -->
          <van-collapse-item v-for="(day, index) in plan['每日计划']" :key="day['天数']" :name="`day-${index}`">
            <template #title>
              <span class="day-num">{{ day['天数'] }}</span>
              <span class="day-theme">{{ day['主题'] }}</span>
            </template>
            <div class="timeline-item" v-for="(item, i) in day['安排']" :key="i">
              <span class="time">{{ item['时间'] }}</span>
              <span class="desc">{{ item['内容'] }}</span>
            </div>
            <div class="day-task" v-if="day['当日学习任务']">
              当日任务：{{ day['当日学习任务'] }}
            </div>
          </van-collapse-item>

          <!-- 学习建议 -->
          <van-collapse-item v-if="plan['学习建议'] && plan['学习建议'].length" title="学习建议" name="tips">
            <ul class="tips">
              <li v-for="(tip, index) in plan['学习建议']" :key="index">{{ tip }}</li>
            </ul>
          </van-collapse-item>
        </van-collapse>
      </template>
    </div>
    <div class="consult-wrap">
      <van-button v-if="plan" type="primary" block round class="consult-btn" @click="onConsult">咨询AI助手</van-button>
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
  subject: '',
  dailyHours: null,
  days: null
})

const fetchPlan = async () => {
  isLoading.value = true
  isError.value = false
  isEmpty.value = false
  try {
    const result = await post('/recommend', {
      subject: formData.subject,
      dailyHours: formData.dailyHours,
      days: formData.days
    })
    plan.value = result.data?.['学习计划'] || null
    // 默认全部展开
    activeNames.value = [
      'basic',
      'hours',
      ...(plan.value?.['每日计划'] || []).map((_, i) => `day-${i}`),
      'tips'
    ]
    if (!plan.value) {
      isEmpty.value = true
      isError.value = true
    }
  } catch (err) {
    console.error('获取学习计划失败', err)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  formData.subject = route.query.subject || ''
  formData.dailyHours = route.query.dailyHours
  formData.days = route.query.days

  if (formData.subject && formData.dailyHours && formData.days) {
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
           subject: formData.subject
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

.info-row .hours {
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

.day-task {
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
