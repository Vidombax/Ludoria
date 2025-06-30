<script setup>
  import { ref } from 'vue'
  import { format, parseISO } from 'date-fns'

  const props = defineProps({
    name: String,
    picture: String,
    developers: Array,
    date: String,
    id: Number,
    score: Number,
    genres: Array,
  });

  const urlToGame = ref(`/game/${props.id}`);
  const score = ref(props.score);

  for (const developer of props.developers) {
    if (developer.name.length > 14) {
      developer.name = developer.name.slice(0, 13);
      developer.name += '...';
    }
  }

</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <router-link :to="urlToGame" class="text-xl game-name">{{ name }}</router-link>
      </div>
    </template>
    <router-link :to="urlToGame">
      <el-image :src="picture" fit="cover"></el-image>
    </router-link>
    <template #footer>
      <div class="info_game">
        <div>
          <p class="h">Разработчики:</p>
          <div class="list_developers">
            <span class="developer"
                  v-for="item in developers"
                  :key="item.id"
            >
              {{ item.name }}
            </span>
          </div>
        </div>
        <div>
          <p class="h">Дата выхода:</p>
          <span>{{ format(parseISO(date), 'dd-MM-yyyy') }}</span>
        </div>
        <div>
          <p class="h">Жанры:</p>
          <div class="list_genres">
            <span class="genre" v-for="item in genres" :key="item.id">
              {{ item.name }}
            </span>
          </div>
        </div>
        <el-tooltip placement="bottom">
          <template #content>{{ score }}</template>
          <div class="div_score">
              <p class="h">Оценка:</p>
            <el-rate
                v-model="score"
                disabled
                text-color="#ff9900"
            />
          </div>
        </el-tooltip>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
  .game-name {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    transition: color 0.3s ease;
  }
  .game-name:hover {
    color: #57a5b5;
  }
  .developer {
    margin: 2px;
  }
  .info_game {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .info_game div {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .list_developers {
    display: grid !important;
    grid-template-columns: repeat(2, auto);
    justify-items: center;
    gap: 4px;
  }
  .list_genres {
    display: grid !important;
    justify-items: center;
    grid-template-columns: auto;
    gap: 2px;
  }
  .h {
    font-weight: 800;
  }
  .genre {
    margin: 1px;
  }
  .el-rate {
    all: initial !important;
  }
  .el-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    border: 2px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .el-image:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  span {
    font-size: 14px;
  }
  @media screen and (max-width: 768px) {
    .genre {
      margin: 2px;
    }
  }
</style>
