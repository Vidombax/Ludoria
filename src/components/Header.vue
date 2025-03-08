<script setup>
  import { ref, onMounted } from 'vue'
  import api from '@/api/api.js'
  import { useUserStore } from '@/stores/user/store.js'
  import SearchGame from '@/components/SearchGame.vue'
  import {ElNotification} from 'element-plus'

  const { getUserInfo } = api;
  const userStore = useUserStore();

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

        userStore.setName(userData.value.name);
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
      <a href="/" class="logo">
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
      <a href="/login" class="a_user_non_auth" v-if="idUser === 0">Вход</a>
      <div v-else class="user_info">
        <a :href="userUrl">
          <img
              :src="userData.photo"
              alt="user logo"
              class="img_user"
              v-if="userData.photo !== null"
          />
        </a>
        <a :href="userUrl"  class="a_user">{{ userStore.name }}</a>
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
    background: linear-gradient(135deg, #0f2027, #203a43);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  .logo {
    transition: transform 0.3s ease;
  }

  .logo:hover {
    transform: scale(1.05);
  }

  .user_info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
  }

  .img_user {
    object-fit: cover;
    width: 50px;
    height: 50px;
    max-width: 100%;
    border-radius: 50%;
    border: 2px solid #ffd700;
  }

  .a_user {
    display: block;
    color: #fff;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .a_user:hover {
    color: #ffd700;
  }

  .a_user_non_auth {
    display: block;
    color: #fff;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .a_user_non_auth:hover {
    color: #ffd700;
  }

  .search {
    width: 500px;
  }

  .search_items {
    background-color: rgba(15, 32, 39);
    color: #fff;
    position: absolute;
    height: 750px;
    z-index: 1;
    overflow-y: auto;
    width: 500px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    margin-top: 8px;
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
    .selector {
      width: 100px;
    }
    .a_user {
      display: none;
    }
    .logo {
      display: none;
    }
  }
</style>
