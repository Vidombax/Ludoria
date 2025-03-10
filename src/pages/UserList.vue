<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  import api from '../api/api.js'
  import SubGame from "@/components/user_list/SubGame.vue";

  const { getSubscribesGamesByUser } = api;
  const route = useRoute();

  const id = ref(route.params.id);
  const token = localStorage.getItem('token');
  const data = {
    id: id.value,
    token: token,
  };

  const info = ref({});
  const getUserGames = async () => {
    const response = await getSubscribesGamesByUser(data);
    info.value = response.data;
  }

  onMounted(async () => {
    await getUserGames();
  });
</script>

<template>
  <div class="container">
    <div class="games">
      <div class="playing">
        <div class="header">
          <p class="h">Играю</p>
        </div>
        <div class="legend">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <div class="items">
          <SubGame
              v-for="item in info.playing"
              :key="item.id"
              :name="item.name"
              :id="item.id_game"
              :score="item.score"
          />
        </div>
      </div>
      <div class="planned">
        <div class="header">
          <p class="h">Запланировано</p>
        </div>
        <div class="legend">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <div class="items">
          <SubGame
              v-for="item in info.planned"
              :key="item.id"
              :name="item.name"
              :id="item.id_game"
              :score="item.score"
          />
        </div>
      </div>
      <div class="complete">
        <div class="header">
          <p class="h">Пройдено</p>
        </div>
        <div class="legend">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <div class="items">
          <SubGame
              v-for="item in info.complete"
              :key="item.id"
              :name="item.name"
              :id="item.id_game"
              :score="item.score"
          />
        </div>
      </div>
      <div class="dropped">
        <div class="header">
          <p class="h">Заброшено</p>
        </div>
        <div class="legend">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <div class="items">
          <SubGame
              v-for="item in info.dropped"
              :key="item.id"
              :name="item.name"
              :id="item.id_game"
              :score="item.score"
          />
        </div>
      </div>
    </div>
    <div class="info">

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
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
    gap: 16px;
    padding: 24px;
  }
  .header {
    border: 0;
    background: rgba(255, 255, 255);
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .items {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .h {
    font-weight: 800;
    font-size: larger;
  }
  .legend {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    gap: 16px;
    padding: 0 0.4rem;
    border-bottom: 2px solid #e0e0e0;
  }
</style>