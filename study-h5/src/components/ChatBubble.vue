<template>
  <div :class="messageClass">
    <div class="bubble-content">
      <!-- 用户消息：直接展示 -->
      <div class="message-text" v-if="message.role === 'user'">{{ message.content }}</div>
      <!-- AI 消息：有内容就展示文字，没内容说明还在等 LLM 返回，展示"思考中" loading -->
      <div class="message-text ai-message" v-else>
        <template v-if="message.content">{{ message.content }}</template>
        <van-loading v-else size="16" vertical>思考中...</van-loading>
      </div>
    </div>
    <div class="message-time" v-if="showTime">{{ formatTime }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 一条消息对象：{ id, role: 'user' | 'ai', content, timestamp }
  message: {
    type: Object,
    required: true
  },
  // 是否显示时间，默认显示
  showTime: {
    type: Boolean,
    default: true
  }
})

// 根据角色决定外层样式类，控制气泡靠左还是靠右
const messageClass = computed(() => {
  return props.message.role === 'user' ? 'user-message' : 'ai-message'
})

// 把 timestamp 统一格式化成时分秒，解析失败就返回空串
const formatTime = computed(() => {
  const d = new Date(props.message.timestamp)
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('zh-CN', { hour12: false })
})
</script>

<style scoped>
.user-message {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin: 10px 0;
}

.ai-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 10px 0;
}

.bubble-content {
  max-width: 75%;
}

.message-text {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  /* 保留换行，AI 输出的多行内容不会挤成一行 */
  white-space: pre-wrap;
}

.user-message .message-text {
  background: #1989fa;
  color: #fff;
  border-top-right-radius: 2px;
}

.ai-message .message-text {
  background: #f2f3f5;
  color: #323233;
  border-top-left-radius: 2px;
}

.message-time {
  font-size: 11px;
  color: #969799;
  margin-top: 4px;
}
</style>
