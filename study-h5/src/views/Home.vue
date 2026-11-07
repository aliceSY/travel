<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import 'vant/es/toast/style'

const router = useRouter()

const subject = ref('')
const dailyHours = ref('')
const days = ref('')
const showPicker = ref(false)

const hotSubjects = ['考研英语', '考研数学', '高等数学', '数据结构', '英语四级', '英语六级', '雅思', '教资']

const subjectOptions = hotSubjects.map((item) => ({ text: item, value: item }))

const onConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  subject.value = selectedValues[0]
  showPicker.value = false
}

const startPlan = () => {
  if(!subject.value) {
    showToast('请选择科目')
    return
  }
  else if (!dailyHours.value) {
    showToast('请先填写每日学习时长')
    return
  }
  else if (!days.value) {
    showToast('请先填写备考天数')
    return
  }
  router.push({
    path: '/plan',
    query: {
      subject: subject.value,
      dailyHours: dailyHours.value,
      days: days.value
    }
  })
}
</script>

<template>
  <div class="home">
    <van-nav-bar title="智能学习规划助手" />

    <div class="page-content">
      <van-notice-bar
        class="notice"
        left-icon="info-o"
        :scrollable="false"
        text="基于 AI 的智能学习规划与备考答疑系统"
      />

      <div class="card">
        <h3 class="card-title">规划你的学习</h3>
        <div class="field-list">
          <van-field
            v-model="subject"
            label="科目"
            readonly
            is-link
            placeholder="请选择备考科目"
            @click="showPicker = true"
          />
          <van-field
            v-model="dailyHours"
            label="每日时长(小时)"
            type="number"
            placeholder="请输入每天可学习的小时数"
          />
          <van-field
            v-model="days"
            label="备考天数"
            type="digit"
            placeholder="请输入备考周期（天）"
          />
        </div>
        <van-button round block type="primary" class="plan-btn" @click="startPlan">
          开始规划
        </van-button>
      </div>

      <div class="card">
        <h3 class="card-title">快捷入口</h3>
        <van-grid :column-num="2" :border="false">
          <van-grid-item icon="chat-o" text="AI 答疑" @click="router.push('/chat')" />
          <van-grid-item icon="user-o" text="我的" @click="router.push('/profile')" />
        </van-grid>
      </div>

      <div class="card">
        <h3 class="card-title">热门科目</h3>
        <div class="subject-tags">
          <span
            v-for="item in hotSubjects"
            :key="item"
            class="subject-tag"
            :class="{ active: item === subject }"
            @click="subject = item"
          >
            {{ item }}
          </span>
        </div>
      </div>
    </div>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        :columns="subjectOptions"
        title="选择科目"
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

.subject-tags {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.subject-tag {
  text-align: center;
  padding: 8px 0;
  border-radius: 999px;
  background: #f7f8fa;
  color: #646566;
  font-size: 14px;
  cursor: pointer;
}

.subject-tag.active {
  background: #4d80f0;
  color: #fff;
}
</style>
