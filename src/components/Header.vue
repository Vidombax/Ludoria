<script setup>
  import { ref, onMounted } from 'vue'

  import api from '@/api/api.js'
  import { useUserStore } from '@/stores/user/store.js'

  import SearchGame from '@/components/SearchGame.vue'
  import {ElNotification} from 'element-plus'

  const { getUserInfo, getGameByName } = api;
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

  const isLoading = ref(false);
  const search = ref('');
  const search_data = ref([]);

  let timeoutId = null;

  const onInput = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      searchHandler();
    }, 500);
  };

  const searchHandler = async () => {
    try {
      if (search.value.trim() === '') {
        search_data.value = [];
        return;
      }

      const response = await getGameByName(search.value);
      if (response.data.length > 0) {
        search_data.value = response.data;
        isLoading.value = true;
      } else {
        search_data.value = [];
        isLoading.value = true;

        ElNotification({
          message: 'Ничего не найдено',
          type: 'error',
        });
      }
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
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
      <el-input
          placeholder="Поиск"
          v-model="search"
          @input="onInput"
          clearable
      />
      <div class="search_items" v-if="search !== ''">
        <SearchGame
            v-if="isLoading"
            v-for="item in search_data"
            :key="item.id"
            :id="item.id"
            :name="item.name"
            :picture="item.main_picture"
        />
        <div class="loading" v-else>
          <p>Загрузка...</p>
        </div>
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
    background-color: rgba(39, 68, 80);
    color: #fff;
    position: absolute;
    height: 750px;
    z-index: 1;
    overflow-y: auto;
    width: 500px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 1rem;
  }

  .selector {
    width: 150px;
  }

  @media screen and (max-width: 1050px) {
    .search {
      width: 150px;
    }
    .search_items {
      width: 400px;
      margin-left: -130px;
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
    .search_items {
      margin-left: -110px;
    }
  }
</style>
