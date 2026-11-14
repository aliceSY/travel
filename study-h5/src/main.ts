import { createApp } from 'vue'
import './style.css'
// showToast 等函数组件不走模板，unplugin-vue-components 识别不到，必须手动引样式
import 'vant/es/toast/style'
import App from './App.vue'
import router from './router/index.js'

createApp(App).use(router).mount('#app')
