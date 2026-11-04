<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const active = ref('home')
const route = useRoute()
</script>

<template>
  <router-view />
  <van-tabbar v-if="!route.meta.hideTabbar" v-model="active">
    <van-tabbar-item to="/" name="home" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/chat" name="chat" icon="chat-o">聊天</van-tabbar-item>
    <van-tabbar-item to="/profile" name="profile" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template> 
