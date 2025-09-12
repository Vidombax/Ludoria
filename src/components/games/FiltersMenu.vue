<script setup>
  import { ref } from 'vue'
  import { ElNotification } from 'element-plus'

  import api from '../../api/api.js'
  import { statusGame, paramsForFilters } from '../../../services/constants.js'

  const { getAllGenres, getGamesByQueries, getDeveloperByName } = api;

  const emit = defineEmits(['filters']);

  const gamesByQuery = (data) => {
    emit('filters', data);
  }

  const isVisibleGenres = ref(false);
  const genres = ref([]);
  const developers = ref([]);
  const developerNameSearch = ref('');
  const params = ref({
    genres: [],
    userList: [],
    scores: [],
    developers: []
  });

  const getGenres = async () => {
    const response = await getAllGenres();
    genres.value = response.data;
  }

  const genresListHandler = async () => {
    try {
      await getGenres();
      isVisibleGenres.value = !isVisibleGenres.value;
    }
    catch (e) {
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const selectGenre = async (id) => {
    try {
      const genreIndex = params.value.genres.indexOf(id);

      if (genreIndex === -1) {
        params.value.genres.push(id);
      }
      else {
        params.value.genres.splice(genreIndex, 1);
      }

      const response = await getGamesByQueries(params.value);

      //gamesByQuery(response);
    }
    catch (e) {
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const selectUserList = async (id) => {
    try {
      const listIndex = params.value.userList.indexOf(id);

      if (listIndex === -1) {
        params.value.userList.push(id);
      }
      else {
        params.value.userList.splice(listIndex, 1);
      }

      const response = await getGamesByQueries(params.value);

      //gamesByQuery(response);
    }
    catch (e) {
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const selectScore = async (id) => {
    try {
      const listIndex = params.value.scores.indexOf(id);

      if (listIndex === -1) {
        params.value.scores.push(id);
      }
      else {
        params.value.scores.splice(listIndex, 1);
      }

      const response = await getGamesByQueries(params.value);

      //gamesByQuery(response);
    }
    catch (e) {
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const searchDevelopers = async () => {
    try {

    }
    catch (e) {
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const selectDeveloper = async (developer) => {
    try {
      const id = developer.id_developer;

      const listIndex = params.value.developers.indexOf(id);

      if (listIndex === -1) {
        params.value.developers.push(id);
      }
      else {
        params.value.developers.splice(listIndex, 1);
      }

      const response = await getGamesByQueries(params.value);

      gamesByQuery(response);
    }
    catch (e) {
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }
</script>

<template>
  <div class="filters" id="info">
    <div class="genres">
      <div class="header">
        <p class="h">Жанры</p>
      </div>
      <div class="items">
        <p @click="genresListHandler" v-if="isVisibleGenres !== true" class="showList" >Показать список</p>
        <p @click="genresListHandler" v-else class="showList">Скрыть список</p>
        <el-checkbox
            v-if="isVisibleGenres"
            v-for="item in genres"
            :key="item.id_genre"
            :label="item.name"
            @click="selectGenre(item.id_genre)"
        />
      </div>
    </div>
    <div class="user_list">
      <div class="header">
        <p class="h">Добавленные</p>
      </div>
      <div class="items">
        <el-checkbox
            v-for="item in statusGame"
            :key="item.id"
            :label="item.label"
            @click="selectUserList(item.value)"
        />
      </div>
    </div>
    <div class="scores">
      <div class="header">
        <p class="h">Оценки</p>
      </div>
      <div class="items">
        <el-checkbox
            v-for="item in paramsForFilters.scores"
            :key="item + 1"
            :label="item + 1"
            @click="selectScore(item + 1)"
        />
      </div>
    </div>
    <div class="developers">
      <div class="header">
        <p class="h">Разработчики</p>
      </div>
      <div class="items">
        <div class="input">
          <el-autocomplete
              v-model="developerNameSearch"
              :fetch-suggestions="searchDevelopers"
              :trigger-on-focus="false"
              clearable
              class="w-50"
              placeholder="Поиск..."
              @select="selectDeveloper"
          />
        </div>
        <div class="items" v-if="developers.length > 0">
          <el-checkbox />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .filters {
    margin-top: 100px;
  }
  .header {
    border: 0;
    background: rgba(255, 255, 255);
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 0 !important;
  }
  .h {
    font-weight: 800;
    font-size: larger;
  }
  .items {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 12px;
  }
  .showList {
    cursor: pointer;
    font-weight: bold;
    font-size: large;
    padding-bottom: 0.1rem;
  }
</style>
