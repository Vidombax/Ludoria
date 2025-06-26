<script setup>
  import { ref, onMounted } from 'vue'

  import api from '@/api/api.js'
  import { ElNotification } from 'element-plus'

  import Card from '@/components/Card.vue'
  import CardSkeleton from '@/components/skeletons/CardSkeleton.vue'

  const { getPopularGame } = api;

  const typeSort = ref(0);
  const games = ref([]);

  const getGames = async () => {
    try {
      const response = ref();

      switch (typeSort.value) {
        case 0:
          response.value = await getPopularGame();
          if (response.value) {
            games.value = response.value.data
          }
          break;
        case 1:
          break;
        case 2:
          break;
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
    await getGames();
  });

</script>

<template>
  <div class="container">
    <div class="games based">
      <div class="info">
        <h2>Игры</h2>
        <p>На данной странице отображены игры, отсортированные по рейтингу</p>
        <div class="pagination">

        </div>
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
    </div>
    <div class="filters">

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
