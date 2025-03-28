import './assets/main.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import VueTheMask from 'vue-the-mask'
import { createPinia } from 'pinia'

import Index from '@/pages/Index.vue'
import Login from '@/pages/Login.vue'
import User from '@/pages/User.vue'
import Game from '@/pages/Game.vue'
import UserList from '@/pages/UserList.vue'

const pinia = createPinia();
const app = createApp(App);

const routes = [
    { path: '/', name: 'Index', component: Index },
    { path: '/login', name: 'Login', component: Login },
    { path: '/user/:id', name: 'User', component: User, query: { settingModal: 'settingModal' } },
    { path: '/game/:id', name: 'Game', component: Game },
    { path: '/user/:id/list', name: 'UserList', component: UserList },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

app.use(router);
app.use(VueTheMask);
app.use(ElementPlus);
app.use(pinia);
app.mount('#app');
