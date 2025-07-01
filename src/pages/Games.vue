<script setup>
  import { ref, onMounted } from 'vue'

  import api from '@/api/api.js'
  import { ElNotification } from 'element-plus'
  import { paramsForFilters } from '../../services/constants.js'

  import Card from '@/components/Card.vue'
  import CardSkeleton from '@/components/skeletons/CardSkeleton.vue'
  import MenuButton from '@/components/MenuButton.vue'
  import PaginationBar from '@/components/PaginationBar.vue'

  const { getPopularGame, getAllGames } = api;

  const games = ref([]);
  const pageNumber = ref(1);
  const pagination = ref();

  const getGames = async (number) => {
    try {
      games.value = [];
      const response = await getPopularGame(number);
      if (response) {
        games.value = response.data;
        pagination.value = response.pagination;
        console.log('test', pageNumber.value)
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

  onMounted(async () => {
    await getGames(1);
  });

</script>

<template>
  <div class="container">
    <div class="games based">
      <div class="info">
        <h2>Игры</h2>
        <p>На данной странице отображены игры, отсортированные по рейтингу</p>
        <PaginationBar
            :pagination="pagination"
            :page-number="pageNumber"
            :get-data="getGames"
        />
      </div>
      <div class="items">
        <Card
            v-if="games.length"
            v-for="item in games"
            :key="item.id_game"
            :name="item.name"
            :date="item.release_date"
            :developers="item.developers"
            :picture="item.main_picture"
            :id="item.id_game"
            :genres="item.genres"
            :score="Number(item.score).toFixed(2)"
        />
        <div class="skeleton_container" v-else>
          <CardSkeleton class="card_skeleton" v-for="item in 4" :key="item.id" />
        </div>
      </div>
      <PaginationBar
          :pagination="pagination"
          :page-number="pageNumber"
          :get-data="getGames"
      />
    </div>
    <MenuButton />
    <div class="filters" id="info">
      <div class="genres">
        <div class="header">
          <p class="h">Жанры</p>
        </div>
        <div class="items">

        </div>
      </div>
      <div class="user_list">
        <div class="header">
          <p class="h">Список</p>
        </div>
        <div class="items">

        </div>
      </div>
      <div class="sort">
        <div class="header">
          <p class="h">Сортировка</p>
        </div>
        <div class="items">

        </div>
      </div>
      <div class="scores">
        <div class="header">
          <p class="h">Оценки</p>
        </div>
        <div class="items">

        </div>
      </div>
      <div class="genres">
        <div class="header">
          <p class="h">Жанры</p>
        </div>
        <div class="items">

        </div>
      </div>
      <div class="developers">
        <div class="header">
          <p class="h">Разработчики</p>
        </div>
        <div class="items">
<!--          инпут с запросом на разраба-->
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
  </div>
</template>

<style scoped>
  .container {
    display: grid;
    grid-template-columns: 1fr 0.2fr;
    width: 100%;
  }
  .games {
    align-items: flex-start !important;
    padding: 24px;
  }
  .items {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    gap: 16px;
    padding-top: 12px;
  }
  .skeleton_container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .card_skeleton {
    grid-row-start: 2;
  }
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

  @media screen and (max-width: 1400px) {
    .items {
      grid-template-columns: repeat(3, 1fr);
    }
    .skeleton_container {
      grid-template-columns: repeat(3, 1fr);
    }
    .card_skeleton {
      grid-row-start: unset;
    }
  }
  @media screen and (max-width: 1050px) {
    .items {
      grid-template-columns: repeat(2, 1fr);
    }
    .skeleton_container {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media screen and (max-width: 768px) {
    .items {
      grid-template-columns: repeat(1, 1fr);
    }
    .skeleton_container {
      grid-template-columns: 1fr;
    }
  }
</style>
