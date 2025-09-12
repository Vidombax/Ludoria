<script setup>
  import { ref, watch } from 'vue'
  import { debounce } from 'lodash'
  import { ElNotification } from 'element-plus'

  import api from '../../api/api.js'
  import { statusGame, paramsForFilters } from '../../../services/constants.js'

  const { getAllGenres, getGamesByQueries, getDeveloperByName } = api;

  const emit = defineEmits(['filters']);
  let abortController = null;

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

      // const response = await getGamesByQueries(params.value);

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

      // const response = await getGamesByQueries(params.value);

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

      // const response = await getGamesByQueries(params.value);

      //gamesByQuery(response);
    }
    catch (e) {
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const searchDevelopers = debounce(
      async (queryString, callback) => {

          if (abortController) {
            abortController.abort();
          }

          abortController = new AbortController();

          try {
            const response = await getDeveloperByName(queryString, abortController.signal);

            if (developerNameSearch.value === '') {
              callback([]);
              return;
            }

            const formattedDevelopers = response.developers.map(developer => ({
              value: developer.name,
              id_developer: developer.id_developer,
              isRAWG: developer.isRAWG
            }));
            callback(formattedDevelopers);
          }
          catch (e) {
            if (e.name === 'AbortError' || e.code === 'ERR_CANCELED') {
              // Запрос был отменен - игнорируем ошибку
              return;
            }
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

  const selectDeveloper = async (item) => {
    try {
      const exists = params.value.developers.some(d => d.id === item.id_developer);
      if (!exists) {
        params.value.developers.push({
          id: item.id_developer,
          name: item.value,
          isRAWG: item.isRAWG
        });
        developerNameSearch.value = '';
      }
    }
    catch (e) {
      console.error(e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const handleDevelopersList = (item) => {
    if (params.value.developers.length === 1) {
      params.value.developers.length = 0;
    }
    else {
      params.value.developers = params.value.developers.slice(item, 1);
    }
  }

  watch(() => developerNameSearch.value, (newValue, oldValue) => {
    if (newValue === '' && oldValue !== '') {
      // Отменяем текущий запрос
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
    }
  });
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
        <div class="items" v-if="params.developers.length > 0">
          <el-checkbox
              v-for="item in params.developers"
              :key="item.id"
              :checked="true"
              :label="item.name"
              @click="handleDevelopersList(item.id_developer)"
          />
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
