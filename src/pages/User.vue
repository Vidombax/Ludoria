<script setup>
  import { useRoute } from 'vue-router'
  import { onMounted, ref } from 'vue'

  import api from '@/api/api.js'
  import { useUserStore } from '@/stores/user/store.js'
  import { ElNotification } from 'element-plus'
  import { genders } from '../../services/constants.js'
  import Friend from '@/components/user/Friend.vue'

  const { getUserInfo, updateUser, updateUserPhoto } = api;
  const userStore = useUserStore();

  const route = useRoute();

  const id = ref(route.params.id);
  const token = localStorage.getItem('token');

  const userData = ref({
    token: token,
    id: id.value,
  });

  const userDataForSettings = ref({});

  const getUser = async () => {
    try {
      const response = await getUserInfo(userData.value);
      if (response) {
        userData.value.name = response.data.name;

        userData.value.age = response.data.age;
        userData.value.photo = response.data.photo;
        userData.value.email_user = response.data.email_user;
        userData.value.gender = response.data.gender;

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
        location.replace('/');
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
          message: 'Файл не прошел проверку! Размер файла должен быть меньше 5 МБ',
          type: 'error',
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

  onMounted(async () => {
    await getUser();
    settingsDiv = document.getElementsByClassName('settings')[0];
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
      <img :src="userData.photo" alt="user photo" class="img_user">
    </div>
    <div class="user_info">
      <div class="bio">
        <p class="h">{{ userData.name }}</p>
        <div class="bio_text">
          <span v-if="userData.gender !== ''">{{ userData.gender }} *</span>
          <span>{{ userData.age }} лет  *</span>
          <el-button v-if="isModalSettingsClosed" @click="activitySettingsModal">Ред.</el-button>
          <el-button v-else @click="activitySettingsModal">Закрыть</el-button>
        </div>
      </div>
      <div class="games-list">
        <p class="h">Список игр</p>
        <div>
<!--    todo: сделать круговую диаграмму с кол-во игор      -->
        </div>
      </div>
      <div class="comments">
        <p>Комментарии: <a href="/comments">1 комментарий</a></p>
      </div>
    </div>
    <div class="friends">
      <a href=""><p class="h">Друзья</p></a>
      <div class="items">
        <Friend />
        <Friend />
        <Friend />
      </div>
    </div>
    <div class="subscribes">
      <a href=""><p class="h">Подписки</p></a>
      <div class="items">
        <a href="/subscribes">Разработчики</a>
        <a href="/subscribes">Игры</a>
        <a href="/subscribes">Франшизы</a>
      </div>
    </div>
    <div class="users_posts">
      <p class="h">Посты пользователя</p>
      <div class="posts">

      </div>
    </div>
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
    max-width: 100%;
  }
  .bio_text span {
    margin-right: 0.5rem;
  }
  .h {
    font-size: larger;
    font-weight: 600;
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
    padding: 50px;
    background-color: #e6e6e7;
    border-bottom-right-radius: 12px;
    border-top-right-radius: 12px;
  }
  .non_active {
    pointer-events: none;
  }
  .header_close_btn {
    display: none;
  }
  @media screen and (max-width: 768px) {
    .user {
      display: flex !important;
      flex-direction: column;
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
