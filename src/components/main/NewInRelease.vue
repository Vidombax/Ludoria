<script setup>
  import {ref, onMounted} from 'vue'
  import api from '@/api/api.js'

  import Info from "@/components/Info.vue";
  import Card from "@/components/Card.vue";

  const { getNewReleaseGames } = api;

  const info_obj = {
    href: '/new-games',
    name_info: 'Новинки',
    color_scheme: 'rgba(232,22,22,0.27)',
    color_name: 'rgb(232,22,22)'
  }

  const cards = ref([]);
  const getGames = async () => {
    const response = await getNewReleaseGames(1);
    if (response) {
      cards.value = response.data;
      cards.value.length = 4;
    }
  }

  const card_info = {
    name: 'Persona 4 Golden',
    date: '2012-11-20',
    developers: [
        'Atlus',
        'SEGA'
    ],
    picture: 'https://media.rawg.io/media/games/b2c/b2c9c6115114c8f7d461b5430e8a7d4a.jpg',
    id: 5,
    genres: [
        'RPG',
        'Action'
    ],
    score: 4.7
  }

  onMounted(async () => {
    await getGames();
  });
</script>

<template>
  <div class="info_div">
    <Info
        :href="info_obj.href"
        :name-info="info_obj.name_info"
        :color-scheme="info_obj.color_scheme"
        :color-name="info_obj.color_name"
    />
    <div class="cards">
      <Card
          v-for="item in cards"
          :key="item.id_game"
          :name="item.name"
          :date="item.release_date"
          :developers="item.developers"
          :picture="item.main_picture"
          :id="item.id_game"
          :genres="item.genres"
          :score="Number(item.score).toFixed(2)"
      />
    </div>
  </div>
</template>

<style scoped>
  .info_div {
    width: 100%;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    margin: 1.5rem;
  }
  @media screen and (max-width: 1400px) {
    .cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media screen and (max-width: 1050px) {
    .cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media screen and (max-width: 768px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }
</style>