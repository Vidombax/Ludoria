<script setup>
  import { useRoute } from 'vue-router'
  import { onMounted, ref } from 'vue'

  import api from '@/api/api.js'
  import { ElNotification } from 'element-plus'

  import Feedback from '@/components/game/Feedback.vue'
  import Post from '@/components/game/Post.vue'
  import FranchiseGame from '@/components/game/FranchiseGame.vue'

  const route = useRoute();
  const id = ref(route.params.id);

  onMounted(async () => {

  });
</script>

<template>
  <div class="game">
    <div class="left_block">
      <img src="" alt="game photo">
      <div class="statistic">
        <!--  todo: инфографику найти библиотеку      -->
      </div>
      <div class="game_activity">
        <el-button>Добавить игру</el-button>
        <el-button>Написать отзыв</el-button>
        <el-button>Подписаться</el-button>
      </div>
      <div class="game_rate">
        <p>Поставить оценку</p>
        <el-rate />
        <p>Рейтинг игры</p>
        <div class="rate">
          <p>5</p>
        </div>
      </div>
    </div>
    <div class="info">
      <p class="game_name">Название игры</p>
      <div class="items">
        <div class="item">
          <p>Дата выхода</p>
          <p>15-05-2018</p>
        </div>
        <div class="item">
          <p>Разработчики</p>
          <p>Atlus</p>
        </div>
        <div class="item">
          <p>Платформы</p>
          <p>PC PS5 XBOX</p>
        </div>
        <div class="item">
          <p>Описание</p>
          <p>Don the mask and join the Phantom Thieves of Hearts as they stage grand heists, infiltrate the minds of the corrupt, and make them change their ways!</p>
        </div>
      </div>
    </div>
    <div class="feedbacks">
      <div class="header">
        <p>Отзывы^10</p>
        <a href="">Смотреть все</a>
      </div>
      <div class="items">
        <Feedback />
        <Feedback />
        <Feedback />
      </div>
    </div>
    <div class="posts">
      <div class="header">
        <p>Новости^10</p>
        <a href="">Смотреть все</a>
      </div>
      <div class="items">
        <Post />
        <Post />
        <Post />
      </div>
    </div>
    <div class="franchise">
      <div class="header">
        <p>Франшиза^5</p>
      </div>
      <div class="items">
        <FranchiseGame />
        <FranchiseGame />
        <FranchiseGame />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .game {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 8px;
  }

  .left_block {
    grid-row: span 4 / span 4;
  }

  .info {
    grid-column: span 2 / span 2;
  }

  .feedbacks {
    grid-column: span 2 / span 2;
    grid-column-start: 2;
    grid-row-start: 2;
  }

  .posts {
    grid-column: span 2 / span 2;
    grid-column-start: 2;
    grid-row-start: 3;
  }

  .franchise {
    grid-column: span 2 / span 2;
    grid-column-start: 2;
    grid-row-start: 4;
  }

</style>