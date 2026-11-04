
<template>
  <div class="chat-page">
   <van-nav-bar fixed placeholder left-arrow title="AI旅游助手" />
   <div class="page-content">
    <!-- 聊天内容 -->
    <van-empty v-if="message.length === 0" description="开始和AI助手对话吧" />
    <div>
      <div class="title">常见问题</div>
      <div class="quick-list">
        <van-tag v-for="item in quickMessage" :key="item" color="#323233" text-color="#ffffff" size="large" mark @click="onQuickQuestion">{{ item }}</van-tag>
      </div>
    </div>
   </div>
   <van-field class="chat-input" v-model="inputMessage" placeholder="输入您的问题" @keyup.enter="sendMessage">
    <template #button>
      <van-button :disabled="!inputMessage.trim()" type="primary" @click="sendMessage">发送</van-button>
    </template>
   </van-field>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const message = ref([]);
const quickMessage = ref(["上海美食推荐","成都三日游攻略","北京有哪些必去的景点","如何选择旅行保险"]);

const inputMessage = ref("")
const onQuickQuestion = (item) => {
  console.log(item);
}

const sendMessage = () => {
  console.log(inputMessage.value);
}
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
