<script setup>
  import { ref, onMounted } from 'vue'
  import { ElNotification } from 'element-plus'

  import api from '@/api/api.js'
  import { useUserStore } from '@/stores/user/store.js'
  import { exitFromAccount } from '../../services/helpers.js'

  import SearchGame from '@/components/SearchGame.vue'
  import SearchGameSkeleton from '@/components/skeletons/SearchGameSkeleton.vue'
  import ModalDefault from '@/components/ModalDefault.vue'

  const { getUserInfo, getGameByName } = api;
  const userStore = useUserStore();

  const idUser = Number(localStorage.getItem('idUser'));
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

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
        userStore.id = idUser;
        userData.value.name = response.data.name;
        userData.value.photo = response.data.photo;

        userStore.setName(userData.value.name);
      }
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      if (e.status !== 403) {
        ElNotification({
          message: e.response.data.message,
          type: 'error',
        });
      }
      else {
        userStore.isTokenInvalid = true;
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
      isLoading.value = false;

      if (search.value.trim() === '') {
        search_data.value = [];
        return;
      }

      const response = await getGameByName(search.value);
      if (response.data.length > 0) {
        search_data.value = response.data;
        isLoading.value = true;
      }
      else {
        search_data.value = [];
        isLoading.value = false;
        search.value = '';

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
      isLoading.value = false;
    }
  }
  
  const isUserMenuOpened = ref(false);
  const userMenuHandler = () => {
    isUserMenuOpened.value = isUserMenuOpened.value !== true;
  }

  onMounted(async () => {
    if (idUser !== 0) {
      await getUser();
    }
  });
</script>

<template>
  <ModalDefault
      v-if="userStore.isTokenInvalid"
      :info="'У вас нет прав доступа к этой странице'"
  />
  <header>
    <div>
      <router-link to="/" class="logo">
        <img src="../assets/bosinn.gif" class="logo" alt="Logo">
      </router-link>
    </div>
    <div class="search">
      <el-input
          placeholder="Поиск"
          v-model="search"
          @input="onInput"
          clearable
      />
      <div class="search_items" v-if="search !== ''">
        <template v-if="isLoading">
          <SearchGame
              v-for="item in search_data"
              :key="item.id"
              :id="item.id"
              :name="item.name"
              :picture="item.main_picture"
          />
        </template>
        <div class="loading" v-else>
          <SearchGameSkeleton v-for="item in 8" />
        </div>
      </div>
    </div>
    <div>
      <router-link to="/login" class="a_user_non_auth" v-if="idUser === 0">Вход</router-link>
      <div v-else class="user_info">
        <img
            :src="userData.photo"
            alt="user logo"
            class="img_user"
            v-if="userData.photo"
            @click="userMenuHandler"
        />
        <img
            v-else
            src="../assets/images/default_profile_photo.png"
            class="img_user"
            alt="user logo"
            @click="userMenuHandler"
        >
        <transition name="user_menu">
          <div class="user-menu based" v-if="isUserMenuOpened">
            <div>
              <router-link :to="userUrl" @click="userMenuHandler">Профиль</router-link>
            </div>
            <div>
              <router-link :to="userUrl + '/list'" @click="userMenuHandler">Мои игры</router-link>
            </div>
            <div v-if="userRole !== '0'">
              <router-link :to="userUrl" @click="userMenuHandler">Мои посты</router-link>
            </div>
            <div>
              <router-link :to="userUrl" @click="userMenuHandler">Мои комментарии</router-link>
            </div>
            <div>
              <router-link :to="userUrl" @click="userMenuHandler">Подписки</router-link>
            </div>
            <div>
              <router-link :to="userUrl" @click="userMenuHandler">Настройки</router-link>
            </div>
            <div class="exit-div">
              <p @click="exitFromAccount('/')">Выйти из аккаунта</p>
            </div>
          </div>
        </transition>
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
    height: 60px;
    width: 60px;
    max-width: 100%;
    border-radius: 50%;
    border: 2px solid #55c51c;
    cursor: pointer;
  }
  .logo:hover {
    transform: scale(1.05);
  }
  .user_info {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
  }
  .img_user {
    object-fit: cover;
    width: 50px;
    height: 50px;
    max-width: 100%;
    border-radius: 50%;
    border: 2px solid #ffd700;
    cursor: pointer;
  }
  .user-menu {
    position: absolute;
    top: 100%;
    background: rgba(255, 255, 255);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    gap: 12px;
    z-index: 1000;
  }
  .user-menu div a,
  .exit-div p {
    transition: .1s linear;
    font-size: large;
  }
  .user-menu div a:hover,
  .exit-div p:hover {
    color: #ccb23a;
  }
  .exit-div {
    border-top: 2px solid #5e5e5e;
    padding-top: 8px;
    cursor: pointer;
  }
  .user_menu-enter-from {
    opacity: 0;
    top: 0;
  }
  .user_menu-enter-to {
    opacity: 1;
    top: 100%;
  }
  .user_menu-leave-to {
    opacity: 0;
    top: 0;
  }
  .user_menu-enter-active,
  .user_menu-leave-active {
    transition: .2s linear;
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
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  @media screen and (max-width: 1050px) {
    .search {
      width: 250px;
    }
    .search_items {
      width: 400px;
      margin-left: -90px;
    }
  }

  @media screen and (max-width: 768px) {
    header {
      gap: 1rem;
    }
    .selector {
      width: 100px;
    }
    .search {
      width: 180px;
    }
    .search_items {
      margin-top: 25px;
      margin-left: -120px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
    .user-menu {
      right: 0;
    }
  }
</style>
