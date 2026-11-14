<template>
  <div>
    <van-nav-bar title="个人中心" />

    <!-- 未登录：登录 / 注册表单 -->
    <van-form v-if="!isLoggedIn" @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          clearable
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码（至少6位）"
          :rules="[
            { required: true, message: '请输入密码' },
            { validator: (val) => val.length >= 6, message: '密码至少6位' },
          ]"
        />
      </van-cell-group>
      <div class="btn-group">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
        <van-button
          round
          block
          plain
          type="primary"
          native-type="button"
          class="btn-gap"
          :disabled="loading"
          @click="handleRegister"
        >
          注册
        </van-button>
      </div>
    </van-form>

    <!-- 已登录：用户信息 + 退出 -->
    <div v-else>
      <van-cell-group inset>
        <van-cell title="当前用户" :value="username" />
      </van-cell-group>
      <div class="btn-group">
        <van-button round block type="danger" @click="handleLogout">
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { post } from '@/utils/request'

// setup 每次进入页面都会执行，直接读 localStorage 初始化状态
const isLoggedIn = ref(!!localStorage.getItem('token'))
const username = ref(localStorage.getItem('username') || '')

const form = reactive({
  username: '',
  password: '',
})
const loading = ref(false)

// 登录（van-form 校验通过后才触发 @submit）
const handleLogin = async () => {
  if (loading.value) return // 防重复提交：请求在飞时忽略后续点击
  loading.value = true
  try {
    // 响应拦截器已返回 response.data，这里拿到的就是后端的 { success, data: { token, username } }
    const res = await post('/auth/login', {
      username: form.username,
      password: form.password,
    })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    username.value = res.data.username
    isLoggedIn.value = true
    showSuccessToast('登录成功')
    form.username = ''
    form.password = ''
  } catch (err) {
    showToast({
      message: err.response?.data?.message || '登录失败，请检查用户名或密码',
      type: 'fail',
      duration: 2000, 
    })
  } finally {
    loading.value = false
  }
}

// 注册：成功后自动登录，省去再点一次
const handleRegister = async () => {
  if (loading.value) return // 防重复提交（disabled 渲染有延迟，必须在逻辑层拦）
  if (!form.username || form.password.length < 6) {
    showToast('用户名不能为空，密码至少6位')
    return
  }
  loading.value = true
  try {
    await post('/auth/register', {
      username: form.username,
      password: form.password,
    })
    showSuccessToast('注册成功')
    loading.value = false
    await handleLogin() // 注册完直接登录
  } catch (err) {
    showToast(err.response?.data?.message || '注册失败，用户名可能已存在')
    loading.value = false
  }
}

// 退出登录：清 token 和用户名，切回未登录视图
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  username.value = ''
  isLoggedIn.value = false
  showToast('已退出登录')
}
</script>

<style scoped>
.btn-group {
  margin: 24px 16px 0;
}
.btn-gap {
  margin-top: 12px;
}
</style>
