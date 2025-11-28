<script setup>
  import { ref } from 'vue'
  import { debounce } from 'lodash'

  import api from '@/api/api.js'
  import { ElNotification } from 'element-plus'
  import TextEditor from '@/components/TextEditor.vue'
  import ArrowLeft from '@/assets/svg/ArrowLeft.vue'

  const { createPost, getGameByName, getGameInfo } = api;

  const userRole = localStorage.getItem('userRole');
  const idUser = Number(localStorage.getItem('idUser'));
  const isArticle = ref(true);
  const fileInput = ref('');
  const selectedFile = ref('');
  const post = ref({
    id: 0,
    header: '',
    description: '',
    game_name: '',
    isRAWG: false
  });
  const url = ref(`/user/${localStorage.getItem('idUser')}/posts`);

  const searchGames = debounce(
      async (queryString, callback) => {
        try {
          const response = await getGameByName(queryString);

          if (post.value.game_name === '') {
            callback([]);
            return;
          }

          const formattedGames = response.data.map(game => ({
            value: game.name,
            id: game.id,
            isRAWG: game.isRAWG
          }));

          callback(formattedGames);
        }
        catch (e) {
          console.error(e)
          ElNotification({
            message: e.response?.data?.message || 'Ошибка при поиске',
            type: 'error',
          });
          callback([]);
        }
      }, 500, {
        leading: true,
        trailing: true,
        maxWait: 12000
      }
  );

  const selectGame = async (item) => {
    try {
      post.value.id = item.id;
      post.value.game_name = item.value;
      post.value.isRAWG = item.isRAWG;
      ElNotification({
        message: `Добавили игру`,
        type: 'success',
      });
    }
    catch (e) {
      console.error(e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const triggerFileInput = () => {
    fileInput.value.click();
  }

  const handleFileChange = async () => {
    const files = fileInput.value.files;
    if (files && files.length > 0) {
      if (files[0].size < 5 * 1024 * 1024) {
        selectedFile.value = files[0];

        if (selectedFile.value !== '') {
          ElNotification({
            message: 'Фото добавлено',
            type: 'success',
          });
        }
      }
      else {
        ElNotification({
          message: 'Размер файла не должен превышать 5 МБ!',
          type: 'warning',
        });
      }
    }
  }

  const emitText = (text) => {
    post.value.description = text;
  }

  const submitPost = async () => {
    if (isArticle === true) {
      if (!selectedFile.value) {
        ElNotification({ message: 'Пожалуйста, выберите фото', type: 'warning' });
        return;
      }
    }
    if (!post.value.header || !post.value.id) {
      ElNotification({ message: 'Заполните заголовок и выберите игру', type: 'warning' });
      return;
    }

    let payload = {
      token: localStorage.getItem('token'),
      file: selectedFile.value,
      header: post.value.header,
      description: post.value.description,
      id_game: post.value.id,
      id_user: idUser,
      is_article: isArticle.value
    };

    try {
      if (post.value.isRAWG === true) {
        const response = await getGameInfo(post.value.id);
        if (response.game) {
          payload.id_game = response.game.id_game;
        }
      }

      await createPost(payload);

      ElNotification({ message: 'Пост успешно создан!', type: 'success' });

      post.value.header = '';
      post.value.description = '';
      selectedFile.value = '';

    } catch (e) {
      console.error(e);
      ElNotification({
        message: e.response?.data?.message || 'Ошибка создания поста',
        type: 'error'
      });
    }
  }
</script>

<template>
  <div>
    <router-link :to="url">
      <div class="back_to_profile">
        <ArrowLeft style="transform: rotate(90deg)"/>
        <p v-if="userRole === '0'"><span class="h">К странице "Мои статьи"</span></p>
        <p v-else><span class="h">К странице "Мои новости и статьи"</span></p>
      </div>
    </router-link>
  </div>
  <div class="container">
    <div class="first_settings">
      <div class="which_type_post">
        <h4>Тип поста</h4>
        <el-radio-group v-model="isArticle">
          <el-radio :value="true">Статья</el-radio>
          <el-radio :value="false" v-if="userRole !== '0'">Новость</el-radio>
        </el-radio-group>
      </div>
      <el-form class="form">
        <el-form-item
            v-if="isArticle"
            label="Название статьи"
            label-position="top"
        >
          <el-input
              v-model="post.header" class="input"
              maxlength="50"
              show-word-limit
              word-limit-position="outside"
          />
        </el-form-item>
        <el-form-item
            v-else
            label="Название новости"
            label-position="top"
        >
          <el-input
              v-model="post.header" class="input"
              maxlength="30"
              show-word-limit
              word-limit-position="outside"
          />
        </el-form-item>
        <el-form-item
            label="Игра"
            label-position="top"
        >
          <el-autocomplete
              v-model="post.game_name"
              :fetch-suggestions="searchGames"
              :trigger-on-focus="false"
              clearable
              class="input"
              placeholder="Поиск..."
              @select="selectGame"
              maxlength="50"
              show-word-limit
              word-limit-position="outside"
          />
        </el-form-item>
        <el-form-item
            v-if="isArticle"
            label="Логотип статьи"
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
          <el-button @click="triggerFileInput" style="z-index: 50;" v-if="selectedFile === ''">Выбрать файл</el-button>
          <el-button @click="triggerFileInput" style="z-index: 50;" v-else>Заменить файл</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="description">
      <TextEditor
          @text-editor="emitText"
      />
    </div>
    <div class="public">
      <el-button v-if="isArticle" @click="submitPost">Отправить статью на рассмотрение</el-button>
      <el-button v-else @click="submitPost">Отправить новость на рассмотрение</el-button>
    </div>
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  }
  .first_settings {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    justify-items: center;
    padding: 2rem;
  }
  .form {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .which_type_post {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    flex-direction: column;
  }
  .input {
    width: 250px;
    height: 35px;
  }
  .public {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
  }
  .back_to_profile {
    padding: 12px;
  }

  @media screen and (max-width: 1400px) {
    .form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media screen and (max-width: 768px) {
    .first_settings {
      grid-template-columns: 0.95fr;
    }
    .form {
      grid-template-columns: 0.7fr;
      justify-items: center;
      gap: 0;
    }
    .input {
      width: 200px;
    }
    .first_settings {
      padding: 15px 0 0;
    }
  }
</style>
