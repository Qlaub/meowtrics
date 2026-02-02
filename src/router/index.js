import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/datasets/:datasetId',
      name: 'dataset',
      component: () => import('../views/DatasetView.vue'),
    },
  ],
})

export default router
