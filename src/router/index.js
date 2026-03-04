import { createRouter, createWebHistory } from 'vue-router';

import ClazzView from '@/views/clazz/index.vue';
import DeptView from '@/views/dept/index.vue';
import EmpView from '@/views/emp/index.vue';
import LogView from '@/views/log/index.vue';
import StuView from '@/views/stu/index.vue';
import ReportEmpView from '@/views/report/emp/index.vue';
import ReportStuView from '@/views/report/stu/index.vue';
import IndexView from '@/views/index/index.vue';
import LoginView from '@/views/login/index.vue';
import LayoutView from '@/views/layout/index.vue';

const routes = [
  {
    path: '/',
    name: '',
    component: LayoutView,
    redirect: '/index',
    children: [
      { path: 'clazz', name: 'clazz', component: ClazzView },
      { path: 'dept', name: 'dept', component: DeptView },
      { path: 'emp', name: 'emp', component: EmpView },
      { path: 'log', name: 'log', component: LogView },
      { path: 'stu', name: 'stu', component: StuView },
      { path: 'empReport', name: 'report-emp', component: ReportEmpView },
      { path: 'stuReport', name: 'report-stu', component: ReportStuView },
      { path: 'index', name: 'index', component: IndexView },
    ],
  },

  { path: '/login', name: 'login', component: LoginView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
