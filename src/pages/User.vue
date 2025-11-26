<script setup>
  import {useRoute} from 'vue-router'
  import {defineAsyncComponent, onMounted, provide, ref} from 'vue'

  import api from '@/api/api.js'
  import {useUserStore} from '@/stores/user/store.js'
  import {useGameStore} from '@/stores/game/store.js'
  import {ElNotification} from 'element-plus'
  import {chartOptions, genders} from '../../services/constants.js'

  import Friend from '@/components/user/Friend.vue'
  import DoughnutChart from '@/components/DoughnutChart.vue'

  const FeedbacksModal = defineAsyncComponent(
        () => import('@/components/user/Feedbacks.vue')
  );

  const { getUserInfo, updateUser, updateUserPhoto, handlerFriendRequest, getFriend } = api;
  const userStore = useUserStore();
  const gameStore = useGameStore();

  const route = useRoute();

  const id = ref(route.params.id);
  const token = localStorage.getItem('token');
  const url = ref(`/user/${id.value}`);

  const userData = ref({
    token: token,
    id: id.value,
  });

  const userDataForSettings = ref({});
  const isUser = ref(false); //Проверяем зашел ли пользователь на свою страницу
  const feedbacks = ref([]);
  const isUserLoad = ref(false);
  const friendStatus = ref('Отправить запрос в друзья');

  const getUser = async () => {
    try {
      const response = await getUserInfo(userData.value);
      if (response) {
        userData.value.name = response.data.name;

        userData.value.age = response.data.age;
        userData.value.photo = response.data.photo;
        userData.value.email_user = response.data.email_user;
        userData.value.gender = response.data.gender;

        gameStore.chartGameData.datasets[0].data = [];
        gameStore.chartGameData.datasets[0].data = Object.values(response.following);

        userDataForSettings.value = { ...userData.value };

        if (response.data.gender === true) {
          userData.value.gender = 'муж.';
        }
        else if (response.data.gender === false) {
          userData.value.gender = 'жен.';
        }
        else {
          userData.value.gender = '';
        }

        delete userDataForSettings.value.photo;

        feedbacks.value = response.feedbacks;

        if (userStore.id === Number(id.value)) {
          isUser.value = true;
        }

        isUserLoad.value = true;
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

  const fileInput = ref(null);
  const selectedFile = ref(null);

  const triggerFileInput = () => {
    fileInput.value.click();
  }

  const handleFileChange = async () => {
    const files = fileInput.value.files;
    if (files && files.length > 0) {
      if (files[0].size < 5 * 1024 * 1024) {
        selectedFile.value = files[0];

        await uploadPhoto();
      }
      else {
        ElNotification({
          message: 'Размер файла не должен превышать 5 МБ!',
          type: 'warning',
        });
      }
    }
  }

  const updateUserClick = async () => {
    try {
      const response = await updateUser(userDataForSettings.value);
      if (response) {
        ElNotification({
          message: 'Данные успешно обновлены',
          type: 'success',
        });

        userData.value.name = userDataForSettings.value.name;
        userStore.name = userData.value.name;

        userData.value.age = userDataForSettings.value.age;
        userData.value.email_user = userDataForSettings.value.email_user;
        userData.value.gender = userDataForSettings.value.gender;

        if (userData.value.gender === true) {
          userData.value.gender = 'муж.';
        }
        else if (userData.value.gender === false) {
          userData.value.gender = 'жен.';
        }
        else {
          userData.value.gender = '';
        }
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

  const uploadPhoto = async () => {
    if (!selectedFile.value) {
      ElNotification({
        message: 'Файл не выбран',
        type: 'error',
      });

      return;
    }

    try {
      const response = await updateUserPhoto({
        id: id.value,
        file: selectedFile.value,
      });
      if (response) {
        location.reload();
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

  const isModalSettingsClosed = ref(true);
  let settingsDiv;
  const activitySettingsModal = () => {
    if (isModalSettingsClosed.value === true) {
      isModalSettingsClosed.value = false;

      settingsDiv.style.opacity = 1;
      settingsDiv.style.left = '0px';
      settingsDiv.classList.remove('non_active');
    }
    else {
      isModalSettingsClosed.value = true;

      settingsDiv.style.opacity = 0;
      settingsDiv.style.left = '-100px';
      settingsDiv.classList.add('non_active');
    }
  }

  const handlerFriendButton = async () => {
    try {
      if (userStore.id !== 0) {
        const data = {
          token: userData.value.token,
          id_user1: Number(localStorage.getItem('idUser')),
          id_user2: userData.value.id,
          isApproveQuery: false
        }
        const response = await handlerFriendRequest(data);

        if (response.message) {
          ElNotification({
            message: `${response.message}`,
            type: 'success',
          });

          friendStatus.value = response.text;
        }
      }
      else {
        ElNotification({
          message: '<span style="color: #55c51c; font-weight: bold;">Авторизуйтесь</span> чтобы отправить запрос!',
          type: 'warning',
        });
      }
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.message,
        type: 'error',
      });
    }
  }

  const isModalFeedbacksOpen = ref(false);
  const handlerFeedbackModal = () => {
    isModalFeedbacksOpen.value = isModalFeedbacksOpen.value !== true;
  }

  const getFriendStatus = async () => {
    try {
      const data = {
        token: userData.value.token,
        id_user: Number(localStorage.getItem('idUser')),
        id_friend: userData.value.id,
      }

      const response = await getFriend(data);

      if (response.text) {
        friendStatus.value = response.text;
      }
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.message,
        type: 'error',
      });
    }
  }

  provide('user', {
    handlerFeedbackModal,
  });

  onMounted(async () => {
    await getUser();
    await getFriendStatus();
    settingsDiv = document.getElementsByClassName('settings')[0];

    const param = route.query.settingModal;
    if (param === 'true') {
      isModalSettingsClosed.value = true;
      activitySettingsModal();
    }
  });
</script>

<template>
  <div class="settings non_active">
    <div class="header">
      <p class="h">Настройки профиля</p>
      <el-button class="header_close_btn" @click="activitySettingsModal">X</el-button>
    </div>
    <el-form style="max-width: 600px">
      <el-form-item
          label="Электронная почта"
          label-position="top"
      >
        <el-input v-model="userDataForSettings.email_user" />
      </el-form-item>
      <el-form-item
          label="Пароль"
          label-position="top"
      >
        <el-input v-model="userDataForSettings.password_user"
                  type="password"
                  show-password />
      </el-form-item>
      <el-form-item
          label="Имя профиля"
          label-position="top"
      >
        <el-input v-model="userDataForSettings.name" />
      </el-form-item>
      <el-form-item
          label="Фото профиля"
          label-position="top"
      >
        <input
            type="file"
            id="fileInput"
            @change="handleFileChange"
            ref="fileInput"
            accept=".jpg, .png, .jpeg"
            style="opacity: 0; position: absolute; z-index: 1;"
        />
        <el-button @click="triggerFileInput" style="z-index: 1000;">Выбрать файл</el-button>
      </el-form-item>
      <el-form-item
          label="Возраст"
          label-position="top"
      >
        <el-input v-model="userDataForSettings.age" />
      </el-form-item>
      <el-form-item
          label="Пол"
          label-position="top"
      >
        <el-select
            v-model="userDataForSettings.gender"
            placeholder="Не определен"
            style="width: 240px"
        >
          <el-option
              v-for="item in genders"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 230px;" @click="updateUserClick">Сохранить</el-button>
      </el-form-item>
    </el-form>
  </div>
  <div class="user">
    <div class="user_photo">
      <img :src="userData.photo" alt="user photo" class="img_user" v-if="isUserLoad && userData.photo">
      <img src="../assets/images/default_profile_photo.png" class="img_user" alt="user photo" v-else>
    </div>
    <div class="user_info">
      <div class="bio">
        <p class="h">{{ userData.name }}</p>
        <div class="bio_text">
          <span v-if="userData.gender !== ''">{{ userData.gender }} /</span>
          <span v-if="userData.age">{{ userData.age }} лет /</span>
          <div v-if="isUser">
            <el-button v-if="isModalSettingsClosed" @click="activitySettingsModal">Ред.</el-button>
            <el-button v-else @click="activitySettingsModal">Закрыть</el-button>
          </div>
          <div v-else>
            <el-button @click="handlerFriendButton()">{{ friendStatus }}</el-button>
          </div>
        </div>
      </div>
      <div class="games-list">
        <router-link :to="url + '/list'">
          <el-tooltip placement="top">
            <template #content>Открыть</template>
            <p class="h" style="width: 140px;">Список игр</p>
          </el-tooltip>
        </router-link>
        <div>
          <DoughnutChart
              :chart-data="gameStore.chartGameData"
              :chart-options="chartOptions"
          />
        </div>
      </div>
      <div class="feedbacks" v-if="feedbacks.length > 0">
        <el-tooltip placement="top">
          <template #content>Открыть</template>
          <p class="feedback_header" @click="handlerFeedbackModal">Отзывы: {{ feedbacks.length }}</p>
        </el-tooltip>
      </div>
      <transition name="overlay">
        <div v-if="isModalFeedbacksOpen" class="overlay"></div>
      </transition>
      <transition name="fade">
        <feedbacks-modal
            v-if="isModalFeedbacksOpen"
            :feedbacks="feedbacks"
            :name="userData.name"
        />
      </transition>
    </div>
<!--    <div class="friends">-->
<!--      <a href=""><p class="h">Друзья</p></a>-->
<!--      <div class="items">-->
<!--        <Friend />-->
<!--        <Friend />-->
<!--        <Friend />-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="subscribes">-->
<!--      <a href=""><p class="h">Подписки</p></a>-->
<!--      <div class="items">-->
<!--        <a href="/subscribes">Разработчики</a>-->
<!--        <a href="/subscribes">Игры</a>-->
<!--        <a href="/subscribes">Франшизы</a>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="users_posts">-->
<!--      <p class="h">Посты пользователя</p>-->
<!--      <div class="posts">-->

<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<style scoped>
  .user {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    justify-items: center;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    padding: 24px;
    min-height: 100vh;
  }
  .users_posts {
    grid-column: span 2 / span 2;
  }
  .user_info {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: center;
    align-items: flex-start;
  }
  .user_photo {
    line-height: 1.65;
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
  .bio_text {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .bio_text span {
    margin-right: 0.5rem;
    color: #555;
    font-size: 16px;
  }
  .h {
    font-size: 24px;
    font-weight: 700;
    color: #2c3e50;
    width: auto;
    transition: color 0.3s ease;
  }
  .h:hover {
    color: #57a5b5;
  }
  .friends,
  .friends .items {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 8px;
  }
  .subscribes,
  .subscribes .items {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 12px;
  }
  .settings {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 24px;
    transition: .5s linear;
    position: absolute;
    left: -100px;
    opacity: 0;
    background: rgba(255, 255, 255);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  }
  .non_active {
    pointer-events: none;
  }
  .header_close_btn {
    display: none;
  }
  .feedback_header {
    transition: .2s linear;
    cursor: pointer;
    font-weight: 800;
    font-size: larger;
  }
  .feedback_header:hover {
    text-decoration: underline;
  }
  .fade-enter-from {
    opacity: 0;
    top: 0;
    transform: scale(0.6);
  }
  .fade-enter-to, .fade-leave-from {
    opacity: 1;
    transform: scale(1);
  }
  .fade-leave-to {
    opacity: 0;
    transform: scale(0.8);
  }
  .fade-enter-active, .fade-leave-active {
    transition: 0.15s ease;
  }
  @media screen and (max-width: 768px) {
    .user {
      display: flex !important;
      flex-direction: column;
      width: 100%;
    }
    .h {
      font-size: 20px;
    }
    .settings .header {
      display: flex;
      justify-content: space-between;
      gap: 50px;
    }
    .header_close_btn {
      display: block;
    }
    .friends .items {
      display: grid;
      grid-template-columns: repeat(3, auto);
      gap: 12px;
    }
    .subscribes .items {
      display: grid;
      grid-template-columns: repeat(3, auto);
    }
  }
</style>
