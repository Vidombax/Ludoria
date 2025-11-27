<script setup>
  import { ref, watch } from 'vue'
  import { debounce } from 'lodash'

  import api from '@/api/api.js'
  import { ElNotification } from 'element-plus'

  const { createPost, getGameByName, getGameInfo } = api;

  const userRole = localStorage.getItem('userRole');
  const idUser = Number(localStorage.getItem('idUser'));
  const isArticle = ref(true);
  const post = ref({
    id: 0,
    header: '',
    description: '',
    game_name: '',
    isRAWG: false
  });

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
</script>

<template>
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
              maxlength="80"
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
              maxlength="80"
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
              fit-input-width="true"
              maxlength="50"
              show-word-limit
              word-limit-position="outside"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;
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
    gap: 12px;
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
</style>
