<script setup lang="ts">
import { useRoute } from 'vue-router'

// 高亮状态不再自己维护，直接由当前路由派生：路由到哪，哪个图标点亮
const route = useRoute()
</script>

<template>
  <router-view />
  <van-tabbar v-if="!route.meta.hideTabbar" :model-value="route.name">
    <van-tabbar-item to="/" name="home" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/chat" name="chat" icon="chat-o">聊天</van-tabbar-item>
    <van-tabbar-item to="/profile" name="profile" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template> 
