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

</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <a :href="urlToGame" class="text-xl game-name">{{ name }}</a>
      </div>
    </template>
    <a :href="urlToGame">
      <el-image :src="picture"></el-image>
    </a>
    <template #footer>
      <div class="info_game">
        <div>
          <p>Разработчики:</p>
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
          <p>Дата выхода:</p>
          <p>{{ format(parseISO(date), 'dd-MM-yyyy') }}</p>
        </div>
        <div>
          <p>Жанры:</p>
          <div class="list_developers">
            <span class="genre" v-for="item in genres" :key="item.id">
              {{ item.name }}
            </span>
          </div>
        </div>
        <div class="div_score">
          <p>Оценка:</p>
          <el-rate
              v-model="score"
              disabled
              show-score
              text-color="#ff9900"
          />
        </div>
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
  }
  .genre {
    margin: 4px;
  }
  .el-rate {
    all: initial !important;
  }
  .el-image {
    border-radius: 8px;
    border: 2px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .el-image:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  @media screen and (max-width: 768px) {
    .genre {
      margin: 2px;
    }
  }
</style>