<script setup>
  import GameCard from '@/components/games/GameCard.vue'

  const testData = {
    id: 5,
    name: 'persona',
    date: '2018-10-26',
    photo: 'https://media.rawg.io/media/games/b2c/b2c9c6115114c8f7d461b5430e8a7d4a.jpg',
    developer: 'Atlus'
  }
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
        <GameCard v-for="item in 8" :photo="testData.photo" :name="testData.name" :id="testData.id" :date="testData.date" :developer="testData.developer"/>
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
    padding: 24px;
  }

  @media screen and (max-width: 1400px) {
    .items {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media screen and (max-width: 1050px) {
    .items {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media screen and (max-width: 768px) {
    .items {
      grid-template-columns: repeat(1, 1fr);
    }
  }
</style>
