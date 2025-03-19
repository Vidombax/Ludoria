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

  const isCollapse = ref({
    playing: true,
    planned: true,
    complete: true,
    dropped: true
  });
  const handlerCollapse = (collapse) => {
    switch (collapse) {
      case 0:
        isCollapse.value.playing = isCollapse.value.playing !== true;
        break;
      case 1:
        isCollapse.value.planned = isCollapse.value.planned !== true;
        break;
      case 2:
        isCollapse.value.complete = isCollapse.value.complete !== true;
        break;
      case 3:
        isCollapse.value.dropped = isCollapse.value.dropped !== true;
        break;
    }
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
          <p class="collapse_btn" v-if="isCollapse.playing" @click="handlerCollapse(0)">Свернуть</p>
          <p class="collapse_btn" v-else @click="handlerCollapse(0)">Развернуть</p>
        </div>
        <div class="legend" v-if="isCollapse.playing">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <transition name="collapse">
          <div class="items" v-if="isCollapse.playing">
            <SubGame
                v-for="item in info.playing"
                :key="item.id"
                :name="item.name"
                :id="item.id_game"
                :score="item.score"
            />
          </div>
        </transition>
      </div>
      <div class="planned">
        <div class="header">
          <p class="h">Запланировано</p>
          <p class="collapse_btn" v-if="isCollapse.planned" @click="handlerCollapse(1)">Свернуть</p>
          <p class="collapse_btn" v-else @click="handlerCollapse(1)">Развернуть</p>
        </div>
        <div class="legend" v-if="isCollapse.planned">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <transition name="collapse">
          <div class="items" v-if="isCollapse.planned">
            <SubGame
                v-for="item in info.planned"
                :key="item.id"
                :name="item.name"
                :id="item.id_game"
                :score="item.score"
            />
          </div>
        </transition>
      </div>
      <div class="complete">
        <div class="header">
          <p class="h">Пройдено</p>
          <p class="collapse_btn" v-if="isCollapse.complete" @click="handlerCollapse(2)">Свернуть</p>
          <p class="collapse_btn" v-else @click="handlerCollapse(2)">Развернуть</p>
        </div>
        <div class="legend" v-if="isCollapse.complete">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <transition name="collapse">
          <div class="items" v-if="isCollapse.complete">
            <SubGame
                v-for="item in info.complete"
                :key="item.id"
                :name="item.name"
                :id="item.id_game"
                :score="item.score"
            />
          </div>
        </transition>
      </div>
      <div class="dropped">
        <div class="header">
          <p class="h">Заброшено</p>
          <p class="collapse_btn" v-if="isCollapse.dropped" @click="handlerCollapse(3)">Свернуть</p>
          <p class="collapse_btn" v-else @click="handlerCollapse(3)">Развернуть</p>
        </div>
        <div class="legend" v-if="isCollapse.dropped">
          <p>Название</p>
          <p>Оценка</p>
        </div>
        <transition name="collapse">
          <div class="items" v-if="isCollapse.dropped">
            <SubGame
                v-for="item in info.dropped"
                :key="item.id"
                :name="item.name"
                :id="item.id_game"
                :score="item.score"
            />
          </div>
        </transition>
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
  .collapse_btn {
    cursor: pointer;
  }
  .collapse_btn:hover {
    text-decoration: underline;
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
  .collapse-enter-from {
    opacity: 0;
  }
  .collapse-enter-to {
    opacity: 1;
  }
  .collapse-leave-to {
    opacity: 0;
  }
  .collapse-enter-active {
    transition: 0.15s ease;
  }

  @media screen and (max-width: 768px) {
    .container {
      grid-template-columns: 1fr 0.05fr;
    }
  }
</style>