<script setup>
  import { ref } from 'vue'

  import api from '../../api/api.js'
  import { statusGame, paramsForFilters } from '../../../services/constants.js'

  const isVisibleGenres = ref(false);
  const genres = ref([]);
  const { getAllGenres } = api;

  const getGenres = async () => {
    const response = await getAllGenres();
    genres.value = response.data;
  }

  const genresListHandler = async () => {
    await getGenres();
    isVisibleGenres.value = !isVisibleGenres.value;
  }
</script>

<template>
  <div class="filters" id="info">
    <div class="genres">
      <div class="header">
        <p class="h">Жанры</p>
      </div>
      <div class="items">
        <p @click="genresListHandler" v-if="isVisibleGenres !== true" style="cursor: pointer;">Показать список</p>
        <el-checkbox
            v-if="isVisibleGenres"
            v-for="item in genres"
            :key="item.id_genre"
            :label="item.name"
        />
      </div>
    </div>
    <div class="user_list">
      <div class="header">
        <p class="h">Ваш список</p>
      </div>
      <div class="items">
        <el-checkbox
            v-for="item in statusGame"
            :key="item.id"
            :label="item.label"
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
        />
      </div>
    </div>
    <div class="platforms">
      <div class="header">
        <p class="h">Платформы</p>
      </div>
      <div class="items">

      </div>
    </div>
    <div class="years">
      <div class="header">
        <p class="h">Годы</p>
      </div>
      <div class="items">

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
</style>
