<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'

  import api from '../api/api.js'
  import { ElNotification } from 'element-plus'
  import { paramsForFilters } from '../../services/constants.js'

  import SubGame from '@/components/user_list/SubGame.vue'
  import InfoSkeleton from '@/components/skeletons/InfoSkeleton.vue'
  import ArrowLeft from '@/assets/svg/ArrowLeft.vue'

  const { getSubscribesGamesByUser, getUserInfo } = api;
  const route = useRoute();

  const id = ref(route.params.id);
  const url = `/user/${id.value}`;
  const token = localStorage.getItem('token');
  const data = {
    id: id.value,
    token: token,
  };

  const isLoading = ref(false);
  const info = ref({});
  const getUserGames = async () => {
    const response = await getSubscribesGamesByUser(data);
    info.value = response.data;
    isLoading.value = true;
  }

  const isCollapse = ref({
    playing: true,
    planned: true,
    complete: true,
    dropped: true
  });
  const handlerCollapse = (collapse) => {
    switch (collapse) {
      case 0:
        isCollapse.value.playing = isCollapse.value.playing !== true;
        break;
      case 1:
        isCollapse.value.planned = isCollapse.value.planned !== true;
        break;
      case 2:
        isCollapse.value.complete = isCollapse.value.complete !== true;
        break;
      case 3:
        isCollapse.value.dropped = isCollapse.value.dropped !== true;
        break;
    }
  }

  const userData = ref({});
  const getUser = async () => {
    try {
      const response = await getUserInfo(data);
      if (response) {
        userData.value = response;
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
      }
    }
  }

  const screenWidth = ref(window.innerWidth);
  const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth;
  };

  const isMenuOpen = ref(false);
  const handlerMenuClick = () => {
    isMenuOpen.value = !isMenuOpen.value;
    if (isMenuOpen.value === true) {
      document.getElementById('info').classList.add('info_mobile');
      document.body.classList.add('hidden_scroll');
    }
    else {
      document.getElementById('info').classList.remove('info_mobile');
      document.body.classList.remove('hidden_scroll');
    }
  }

  watch(screenWidth, (newWidth) => {
    if (newWidth > 800) {
      document.getElementById('info').classList.remove('info_mobile');
      document.body.classList.remove('hidden_scroll');
    }
  });

  onMounted(async () => {
    await getUserGames();
    await getUser();

    window.addEventListener('resize', updateScreenWidth);
  });
</script>

<template>
  <div class="container">
    <div class="games">
      <router-link :to="url">
        <div class="back_to_profile">
          <ArrowLeft style="transform: rotate(90deg)"/>
          <p v-if="userData.data">К профилю <span class="h">{{ userData.data.name }}</span></p>
        </div>
      </router-link>
      <div class="playing">
        <div class="header">
          <p class="h">Играю</p>
          <p class="collapse_btn" v-if="isCollapse.playing" @click="handlerCollapse(0)">Свернуть</p>
          <p class="collapse_btn" v-else @click="handlerCollapse(0)">Развернуть</p>
        </div>
        <div class="legend" v-if="isCollapse.playing">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <transition name="collapse">
          <div class="items" v-if="isCollapse.playing">
            <SubGame
                v-if="isLoading"
                v-for="item in info.playing"
                :key="item.id"
                :name="item.name"
                :id="item.id_game"
                :score="item.score"
            />
            <InfoSkeleton
                v-else
                v-for="item in 5"
                :key="item.key"
            />
          </div>
        </transition>
      </div>
      <div class="planned">
        <div class="header">
          <p class="h">Запланировано</p>
          <p class="collapse_btn" v-if="isCollapse.planned" @click="handlerCollapse(1)">Свернуть</p>
          <p class="collapse_btn" v-else @click="handlerCollapse(1)">Развернуть</p>
        </div>
        <div class="legend" v-if="isCollapse.planned">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <transition name="collapse">
          <div class="items" v-if="isCollapse.planned">
            <SubGame
                v-if="isLoading"
                v-for="item in info.planned"
                :key="item.id"
                :name="item.name"
                :id="item.id_game"
                :score="item.score"
            />
            <InfoSkeleton
                v-else
                v-for="item in 5"
                :key="item.key"
            />
          </div>
        </transition>
      </div>
      <div class="complete">
        <div class="header">
          <p class="h">Пройдено</p>
          <p class="collapse_btn" v-if="isCollapse.complete" @click="handlerCollapse(2)">Свернуть</p>
          <p class="collapse_btn" v-else @click="handlerCollapse(2)">Развернуть</p>
        </div>
        <div class="legend" v-if="isCollapse.complete">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <transition name="collapse">
          <div class="items" v-if="isCollapse.complete">
            <SubGame
                v-if="isLoading"
                v-for="item in info.complete"
                :key="item.id"
                :name="item.name"
                :id="item.id_game"
                :score="item.score"
            />
            <InfoSkeleton
                v-else
                v-for="item in 5"
                :key="item.key"
            />
          </div>
        </transition>
      </div>
      <div class="dropped">
        <div class="header">
          <p class="h">Заброшено</p>
          <p class="collapse_btn" v-if="isCollapse.dropped" @click="handlerCollapse(3)">Свернуть</p>
          <p class="collapse_btn" v-else @click="handlerCollapse(3)">Развернуть</p>
        </div>
        <div class="legend" v-if="isCollapse.dropped">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <transition name="collapse">
          <div class="items" v-if="isCollapse.dropped">
            <SubGame
                v-if="isLoading"
                v-for="item in info.dropped"
                :key="item.id"
                :name="item.name"
                :id="item.id_game"
                :score="item.score"
            />
            <InfoSkeleton
                v-else
                v-for="item in 5"
                :key="item.key"
            />
          </div>
        </transition>
      </div>
    </div>
    <div class="menu_btn" @click="handlerMenuClick">
      <p>Меню</p>
    </div>
    <div class="info" id="info">
      <div class="menu_close_btn" @click="handlerMenuClick">X</div>
      <div class="photo_user based">
        <router-link :to="url">
          <img v-if="userData.data && userData.data.photo" :src="userData.data.photo" alt="user logo" class="img_user">
          <img v-else src="../assets/images/default_profile_photo.png" alt="user logo" class="img_user">
        </router-link>
      </div>
      <div class="scores">
        <div class="header">
          <p class="h">Оценки</p>
        </div>
        <div class="items">
          <el-checkbox :label="item + 1" v-for="item in paramsForFilters.scores" :key="item.id" />
        </div>
      </div>
      <div class="genres">
        <div class="header">
          <p class="h">Жанры</p>
        </div>
        <div class="items">
          <el-checkbox label="RPG" v-for="item in 4" />
        </div>
      </div>
      <div class="studios">
        <div class="header">
          <p class="h">Разработчики</p>
        </div>
        <div class="items">
          <el-checkbox label="Atlus" v-for="item in 4" />
        </div>
      </div>
      <div class="years">
        <div class="header">
          <p class="h">Годы</p>
        </div>
        <div class="items">
          <el-checkbox label="2025" v-for="item in 4" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .container {
    display: grid;
    grid-template-columns: 1fr 0.3fr;
    width: 100%;
  }
  .games {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
    gap: 16px;
    padding: 24px;
  }
  .menu_btn {
    display: none;
    position: fixed;
    right: -10px;
    top: 20%;
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    padding: 8px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    transform: rotate(-90deg);
    cursor: pointer;
  }
  .menu_close_btn {
    display: none;
    cursor: pointer;
    font-size: x-large;
    font-weight: bolder;
  }
  .header {
    border: 0;
    background: rgba(255, 255, 255);
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .items {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .h {
    font-weight: 800;
    font-size: larger;
  }
  .collapse_btn {
    cursor: pointer;
  }
  .collapse_btn:hover {
    text-decoration: underline;
  }
  .legend {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    gap: 16px;
    padding: 0 0.4rem;
    border-bottom: 2px solid #e0e0e0;
  }
  .back_to_profile {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .back_to_profile p {
    font-weight: 800;
  }
  .back_to_profile p:hover {
    text-decoration: underline;
  }
  .collapse-enter-from {
    opacity: 0;
  }
  .collapse-enter-to {
    opacity: 1;
  }
  .collapse-leave-to {
    opacity: 0;
  }
  .collapse-enter-active {
    transition: 0.15s ease;
  }
  .photo_user {
    margin-bottom: 40px;
  }
  .img_user {
    object-fit: cover;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 4px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .info_mobile {
    display: flex !important;
    position: fixed !important;
    flex-direction: column;
    left: 0;
    right: 0;
    padding: 14px;
    background-color: #ffffff;
    height: 94vh;
    overflow-y: scroll;
  }

  @media screen and (max-width: 768px) {
    .container {
      grid-template-columns: 1fr;
    }
    .info {
      display: none;
    }
    .menu_btn {
      display: block;
    }
    .menu_close_btn {
      display: block;
    }
  }

  @media screen and (max-width: 400px) {
    .info_mobile {
      height: 90vh;
      top: 0;
    }
  }
</style>
