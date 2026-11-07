
<template>
  <div class="chat-page">
   <van-nav-bar fixed placeholder left-arrow title="AI学习助手" @click-left="onClickLeft" />
   <div class="page-content" ref="pageContentRef">
    <!-- 聊天内容：没有消息时显示空状态，有消息后渲染气泡列表 -->
    <van-empty v-if="streamMessage.length === 0" description="开始和AI助手对话吧" />
    <div v-else class="msg-list">
      <ChatBubble v-for="msg in streamMessage" :key="msg.id" :message="msg" />
    </div>
    <!-- 常见问题：只在空状态时显示 -->
    <div v-if="streamMessage.length === 0">
      <div class="title">常见问题</div>
      <div class="quick-list">
        <van-tag v-for="item in quickMessage" :key="item" color="#323233" text-color="#ffffff" size="large" mark @click="onQuickQuestion(item)">{{ item }}</van-tag>
      </div>
    </div>
   </div>
   <van-field class="chat-input" v-model="inputMessage" placeholder="输入您的问题" @keyup.enter="sendMessage" :disabled="isStreaming">
    <template #button>
      <van-button :disabled="!inputMessage.trim()" type="primary" @click="sendMessage">发送</van-button>
    </template>
   </van-field>
  </div>
</template>
<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter , useRoute} from 'vue-router'
import { fetchStream } from '@/utils/request'
import { showToast } from 'vant'
import ChatBubble from '@/components/ChatBubble.vue'


const streamMessage = ref([]);
const quickMessage = ref(["考研英语30天怎么复习？","高数基础差怎么补？","四六级备考顺序建议","如何高效背单词"]);

const inputMessage = ref("")

const isStreaming = ref(false);

const route = useRoute();
// 导航栏返回：回到上一页（浏览历史回退，不指定具体路由）
const router = useRouter()
const onClickLeft = () => {
  if (isStreaming.value) {
    showToast('AI正在回答中，请稍候')
    return
  }
  router.back()
}

// 滚动容器引用 + 自动滚到底部
const pageContentRef = ref(null)
const scrollToBottom = async () => {
  await nextTick() // 等本次数据变化触发的 DOM 更新完成，否则量到的是旧高度
  if (pageContentRef.value) {
    pageContentRef.value.scrollTop = pageContentRef.value.scrollHeight
  }
}

const onQuickQuestion = (item) => {
  addUserMessage(item);
  fetchAIResponse(item);
}


const addUserMessage = (msg) => {
  streamMessage.value.push({
    id: Date.now(),
    role: 'user',
    content: msg,
    timestamp: new Date().toLocaleString()
  });
  scrollToBottom() // 用户消息上屏后滚到底部
}


const fetchAIResponse = (msg) => {
  isStreaming.value = true;
  streamMessage.value.push({
    id: Date.now() + 1,
    role: 'ai',
    content: '',
    timestamp: new Date().toISOString()
  });
  scrollToBottom() // "思考中"气泡出现时也滚到底部

  let fullResponse = '';

  fetchStream('/chat', { message: msg },(chunk)=>{
    fullResponse += chunk;
    streamMessage.value[streamMessage.value.length - 1].content = fullResponse;
    scrollToBottom() // AI 逐字输出过程中持续跟随滚动
  }, ()=>{
    isStreaming.value = false;
  },(errMsg)=>{
    streamMessage.value[streamMessage.value.length - 1].content = 'AI发生错误' + errMsg;
    isStreaming.value = false;
    showToast('AI发生错误' + errMsg);
  });

}

const sendMessage = () => {
  const msg = inputMessage.value.trim();
  if(!msg || isStreaming.value) {
    return;
  }
  addUserMessage(msg);
  inputMessage.value = "";
  fetchAIResponse(msg);
}


onMounted(() => {
  if(route.query.source === 'plan' && route.query.subject) {
    inputMessage.value = `请帮我制定${route.query.subject}的复习计划`;
  }
})

</script>
<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  /* 视口高度减去底部 tabbar 的 50px，避免输入框被 tabbar 盖住 */
  height: calc(100vh - 50px);
}

.page-content {
  flex: 1;
  overflow-y: auto;
}

.chat-input {
  flex-shrink: 0;
}

.msg-list {
  padding: 10px;
}
.title {
  font-size: 16px;
  margin: 20px auto 10px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
}
</style>
