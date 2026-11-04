import { createRouter, createWebHashHistory } from "vue-router";
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/Chat.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/plan',
    name: 'plan',
    component: () => import('@/views/Plan.vue'),
    meta: { hideTabbar: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router;
