<script setup>
  import { ref } from 'vue'
  import {format, parseISO} from 'date-fns'

  const props = defineProps({
    image: String,
    header: String,
    name: String,
    id_post: Number,
    date: Date,
    isMyPostsPage: Boolean
  });

  const urlToPost = ref(`/post/${props.id_post}`);
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <router-link :to="urlToPost" class="text-xl game-name">{{ header }}</router-link>
      </div>
    </template>
    <router-link :to="urlToPost">
      <el-image :src="image" fit="cover"></el-image>
    </router-link>
    <template #footer>
      <div class="info_game">
        <div>
          <p class="h">Игра:</p>
          <p>{{ name }}</p>
        </div>
        <div>
          <p class="h">Дата статьи:</p>
          <p>{{ format(parseISO(date), 'dd-MM-yyyy') }}</p>
        </div>
      </div>
      <div v-if="isMyPostsPage" style="display: flex; align-items: center; justify-content: center; padding: 8px">
        <el-button>Редактировать запись</el-button>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
  .game-name {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    transition: color 0.3s ease;
  }
  .game-name:hover {
    color: #57a5b5;
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
  .el-image {
    width: 100%;
    height: 250px;
    border-radius: 8px;
    border: 2px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .el-image:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  .h {
    font-weight: 800;
  }

  @media screen and (max-width: 768px) {
    .el-image {
      height: 170px;
    }
  }
</style>