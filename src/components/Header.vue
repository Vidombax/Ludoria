<script setup>
  import { ref, onMounted } from 'vue'
  import api from '@/api/api.js'
  import SearchGame from "@/components/SearchGame.vue"
  import {ElNotification} from "element-plus";

  const { getUserInfo } = api;

  const idUser = Number(localStorage.getItem('idUser'));
  const token = localStorage.getItem('token');

  const userUrl = `/user/${idUser}`;

  const userData = ref({
    token: token,
    id: idUser,
    name: '',
    photo: ''
  });

  const getUser = async () => {
    try {
      const response = await getUserInfo(userData.value);
      if (response) {
        userData.value.name = response.data.name;
        userData.value.photo = response.data.photo;
      }
    }
    catch (e) {
      if (e.response.data.message !== 'Invalid or expired token.') {
        console.error('Ошибка при выполнении запроса:', e);
        ElNotification({
          message: e.response.data.message,
          type: 'error',
        });
      }
      else {
        localStorage.clear();
        location.reload();
      }
    }
  }

  const search = ref('');

  const card_info = {
    name: 'Persona 4 Golden',
    date: '2012-11-20',
    developers: [
      'Atlus',
      'SEGA'
    ],
    picture: 'https://media.rawg.io/media/games/b2c/b2c9c6115114c8f7d461b5430e8a7d4a.jpg',
    id: 5,
    score: 4.7
  }

  onMounted(async () => {
    if (idUser !== 0) {
      await getUser();
    }
  });
</script>

<template>
  <header>
    <div>
      <a href="/">
        <el-image src="./src/assets/bosinn.gif" alt="Logo" class="logo" style="height: 25px; width: 100px;" />
      </a>
    </div>
    <div class="search">
      <el-input placeholder="Поиск" v-model="search" />
      <div class="search_items" v-if="search !== ''">
        <SearchGame
            v-for="item in 12"
            :key="item.id"
            :id="card_info.id"
            :name="card_info.name"
            :picture="card_info.picture"
            :developers="card_info.developers"
            :score="card_info.score"
        />
      </div>
    </div>
    <div>
      <a href="/login" class="text-xl" v-if="idUser === 0">Вход</a>
      <div v-else class="user_info">
        <a :href="userUrl">
          <img :src="userData.photo" alt="user logo" v-if="userData.photo !== null"/>
        </a>
        <a :href="userUrl" class="text-xl">{{ userData.name }}</a>
      </div>
    </div>
  </header>
</template>

<style scoped>
  header {
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #3b92a3;
  }
  .user_info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
  }
  .user_info img {
    width: 40px;
    height: 40px;
  }
  .search {
    width: 500px;
  }
  .search_items {
    background-color: #f2f2f2;
    position: absolute;
    height: 750px;
    z-index: 1;
    overflow-y: auto;
    width: 500px;
  }
  .selector {
    width: 150px;
  }
  @media screen and (max-width: 1050px) {
    .search {
      width: 150px;
    }
    .search_items {
      width: 300px;
      margin-left: -75px;
    }
  }
  @media screen and (max-width: 768px) {
    .logo {
      display: none;
    }
    .selector {
      width: 100px;
    }
  }
</style>