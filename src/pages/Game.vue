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
      <div class="fixed_block based">
        <img src="https://media.rawg.io/media/games/a9c/a9c789951de65da545d51f664b4f2ce0.jpg" alt="game photo">
        <div class="statistic">
          <div class="header h">
            Статистика
          </div>
          <div class="items">

          </div>
          <!--  todo: инфографику найти библиотеку      -->
        </div>
        <div class="game_activity based">
          <el-button style="width: 250px;">Добавить игру</el-button>
          <el-button style="width: 250px;">Написать отзыв</el-button>
          <el-button style="width: 250px;">Подписаться</el-button>
        </div>
        <div class="based">
          <p class="h">Поставить оценку</p>
          <el-rate />
        </div>
      </div>
    </div>
    <div class="info">
      <p class="game_name h">Название игры</p>
      <div class="items">
        <div class="item">
          <p class="h-item">Дата выхода</p>
          <p>15-05-2018</p>
        </div>
        <div class="item">
          <p class="h-item">Разработчики</p>
          <p>Atlus</p>
        </div>
        <div class="item">
          <p class="h-item">Платформы</p>
          <p>PC PS5 XBOX</p>
        </div>
        <div class="item">
          <p class="h-item">Описание</p>
          <p>Don the mask and join the Phantom Thieves of Hearts as they stage grand heists, infiltrate the minds of the corrupt, and make them change their ways!</p>
        </div>
        <div class="item">
          <p class="h-item">Рейтинг игры</p>
          <p class="positive">5</p>
        </div>
      </div>
    </div>
    <div class="feedbacks">
      <div class="header">
        <p class="h">Отзывы<sup>10</sup></p>
        <a href=""><p class="show_more">Смотреть все</p></a>
      </div>
      <div class="items">
        <Feedback />
        <Feedback />
        <Feedback />
      </div>
    </div>
    <div class="posts">
      <div class="header">
        <p class="h">Новости</p>
        <a href=""><p class="show_more">Смотреть все</p></a>
      </div>
      <div class="items">
        <Post />
        <Post />
        <Post />
      </div>
    </div>
    <div class="franchise">
      <div class="header">
        <p>Франшиза<sup>5</sup></p>
      </div>
      <div class="items">
        <FranchiseGame />
        <FranchiseGame />
        <FranchiseGame />
        <FranchiseGame />
      </div>
    </div>
  </div>
</template>

<style scoped>
  sup {
    font-size: small;
  }
  .based {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .h {
    font-weight: 800;
    font-size: larger;
  }
  .h-item {
    font-weight: 500;
  }
  .positive {
    background-color: #55c51c;
    padding: 1rem;
    color: #f2f2f2;
    font-size: large;
    font-weight: 800;
    border-radius: 4px;
  }
  .neutral {
    background-color: #eec911;
    padding: 1rem;
    color: #f2f2f2;
    font-size: large;
    font-weight: 800;
    border-radius: 4px;
  }
  .negative {
    background-color: #d3132a;
    padding: 1rem;
    color: #f2f2f2;
    font-size: large;
    font-weight: 800;
    border-radius: 4px;
  }
  .show_more {
    transition: .3s linear;
  }
  .show_more:hover {
    color: #6dc6d9;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  .game {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, auto);
    gap: 8px;
    padding: 24px;
  }
  .left_block {
    grid-row: span 4 / span 4;
  }
  .fixed_block {
    position: fixed;
    left: 5rem;
  }
  .fixed_block img {
    width: 300px;
    height: 300px;
    object-fit: cover;
    margin-bottom: 30px;
  }
  .statistic {
    margin-bottom: 2rem;
  }
  .game_activity {
    gap: 8px;
    margin-bottom: 20px;
  }
  .info {
    grid-column: span 2 / span 2;
    margin-bottom: 40px;
  }
  .game_name {
    font-size: x-large;
    margin-bottom: 20px;
  }
  .info .items {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .info .items .item {
    display: grid;
    justify-items: left;
    align-items: center;
    grid-template-columns: 15% 35%;
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
  .franchise .items {
    display: flex;
    gap: 24px;
    align-items: center;
    justify-content: flex-start;
  }
</style>