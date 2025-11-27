<script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import { useRoute } from 'vue-router'

  import api from '../api/api.js'
  import { useUserStore } from '@/stores/user/store.js'
  import { ElNotification } from 'element-plus'
  import { paramsForFilters } from '../../services/constants.js'

  import SubGame from '@/components/user_list/SubGame.vue'
  import InfoSkeleton from '@/components/skeletons/InfoSkeleton.vue'
  import ArrowLeft from '@/assets/svg/ArrowLeft.vue'
  import MenuButton from '@/components/MenuButton.vue'
  import ModalDefault from "@/components/ModalDefault.vue";

  const { getSubscribesGamesByUser, getUserInfo, getSubscribesGamesByQueries } = api;
  const route = useRoute();

  const id = ref(route.params.id);
  const url = `/user/${id.value}`;
  const token = localStorage.getItem('token');
  const isLogin = ref(true);
  let data = {
    id: id.value,
    token: token,
    scores: "",
    developers: "",
    genres: ""
  };

  const userStore = useUserStore();

  const isLoading = ref(false);
  const info = ref({});

  const userFilters = ref();

  const isNeedCollapseGenres = ref(false);
  const showAllGenres = ref(false);

  const isNeedCollapseDevelopers = ref(false);
  const showAllDevelopers = ref(false);

  const visibleGenres = computed(() => {
    if (!userFilters.value.genres) return [];
    return showAllGenres.value
        ? userFilters.value.genres
        : userFilters.value.genres.slice(0, 5);
  });

  const visibleDevelopers = computed(() => {
    if (!userFilters.value.developers) return [];
    return showAllDevelopers.value
        ? userFilters.value.developers
        : userFilters.value.developers.slice(0, 5);
  });

  const toggleGenresCollapse = () => {
    showAllGenres.value = !showAllGenres.value;
  };

  const toggleDevelopersCollapse = () => {
    showAllDevelopers.value = !showAllDevelopers.value;
  };

  const getUserGames = async () => {
    const response = await getSubscribesGamesByUser(data);
    info.value = response.data;

    userFilters.value = response.filters;
    
    isNeedCollapseGenres.value = userFilters.value.genres.length > 5;
    isNeedCollapseDevelopers.value = userFilters.value.developers.length > 5;

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

  const screenWidth = ref(window.innerWidth);
  const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth;
  };

  const activeScoresCheckboxes = ref([]);
  const handlerCheckBoxScores = async (id) => {
    try {
      if (activeScoresCheckboxes.value.includes(id)) {
        activeScoresCheckboxes.value = activeScoresCheckboxes.value.filter(item => item !== id);
      }
      else {
        activeScoresCheckboxes.value.push(id);
      }

      data.scores = activeScoresCheckboxes.value.join(',');

      const response = await getSubscribesGamesByQueries(data);
      if (response.data) {
        info.value = response.data;
      }
      else {
        info.value = {};
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  const activeGenresCheckboxes = ref([]);
  const handlerCheckBoxGenres = async (id) => {
    try {
      if (activeGenresCheckboxes.value.includes(id)) {
        activeGenresCheckboxes.value = activeGenresCheckboxes.value.filter(item => item !== id);
      }
      else {
        activeGenresCheckboxes.value.push(id);
      }

      data.genres = activeGenresCheckboxes.value.join(',');

      const response = await getSubscribesGamesByQueries(data);
      if (response.data) {
        info.value = response.data;
      }
      else {
        info.value = {};
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  const activeDeveloperCheckboxes = ref([]);
  const handlerCheckBoxDeveloper = async (id) => {
    try {
      if (activeDeveloperCheckboxes.value.includes(id)) {
        activeDeveloperCheckboxes.value = activeDeveloperCheckboxes.value.filter(item => item !== id);
      }
      else {
        activeDeveloperCheckboxes.value.push(id);
      }

      data.developers = activeDeveloperCheckboxes.value.join(',');

      const response = await getSubscribesGamesByQueries(data);
      if (response.data) {
        info.value = response.data;
      }
      else {
        info.value = {};
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  watch(screenWidth, (newWidth) => {
    if (newWidth > 800) {
      document.getElementById('info').classList.remove('info_mobile');
      document.body.classList.remove('hidden_scroll');
    }
  });

  onMounted(async () => {
    if (localStorage.getItem('idUser')) {
      await getUserGames();
      await getUser();
    }
    else {
      isLogin.value = false;
    }

    window.addEventListener('resize', updateScreenWidth);
  });
</script>

<template>
  <transition name="modal">
    <ModalDefault v-if="!isLogin" info="Авторизуйтесь чтобы продолжить!" />
  </transition>
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
    <MenuButton />
    <div class="info" id="info">
      <div class="menu_close_btn" @click="userStore.setStatusMenu()">X</div>
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
          <el-checkbox
              v-for="item in paramsForFilters.scores"
              :label="item + 1"
              :key="item.id"
              @click="handlerCheckBoxScores(item + 1)"
          />
        </div>
      </div>
      <div class="genres">
        <div class="header">
          <p class="h">Жанры</p>
        </div>
        <div class="items" v-if="userFilters">
          <el-checkbox
              v-for="item in visibleGenres"
              :key="item.id"
              :label="item.name"
              @click="handlerCheckBoxGenres(item.id_genre)"
          />
          <div v-if="isNeedCollapseGenres" class="show_more">
            <p @click="toggleGenresCollapse">{{ showAllGenres ? 'Скрыть' : 'Показать все' }}</p>
          </div>
        </div>
      </div>
      <div class="studios">
        <div class="header">
          <p class="h">Разработчики</p>
        </div>
        <div class="items" v-if="userFilters">
          <el-checkbox
              v-for="item in visibleDevelopers"
              :key="item.id"
              :label="item.name"
              @click="handlerCheckBoxDeveloper(item.id_developer)"
          />
          <div v-if="isNeedCollapseDevelopers" class="show_more">
            <p @click="toggleDevelopersCollapse">{{ showAllDevelopers ? 'Скрыть' : 'Показать все' }}</p>
          </div>
        </div>
      </div>
<!--      <div class="years">-->
<!--        <div class="header">-->
<!--          <p class="h">Годы</p>-->
<!--        </div>-->
<!--        <div class="items">-->
<!--          <el-checkbox label="2025" v-for="item in 4" />-->
<!--        </div>-->
<!--      </div>-->
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
    margin-top: 2rem;
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
  .modal-enter-from {
    opacity: 0;
    transform: scale(0.6);
  }
  .modal-enter-to {
    opacity: 1;
    transform: scale(1);
  }
  .modal-leave-from {
    opacity: 1;
    transform: scale(1);
  }
  .modal-leave-to {
    opacity: 0;
    transform: scale(0.6);
  }
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s ease;
  }
  .photo_user {
    margin-top: 2.5rem;
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

  @media screen and (max-width: 768px) {
    .container {
      grid-template-columns: 1fr;
    }
    .info {
      display: none;
    }
    .menu_close_btn {
      display: block;
    }
  }
  .show_more {
    position: relative;
    left: 0;
    right: 0;
    cursor: pointer;
  }
  .show_more p:hover {
    text-decoration: underline;
  }
</style>
