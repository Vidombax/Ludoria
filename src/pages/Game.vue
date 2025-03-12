<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { onMounted, ref, provide } from 'vue'
  import { getDate, getMonth, getYear, parseISO } from 'date-fns'

  import api from '@/api/api.js'
  import { useUserStore } from '@/stores/user/store.js'
  import { useGameStore } from '@/stores/game/store.js'
  import { months, statusGame, chartOptions } from '../../services/constants.js'
  import { openLoading } from '../../services/helpers.js'
  import { ElNotification } from 'element-plus'

  import Feedback from '@/components/game/Feedback.vue'
  import Post from '@/components/game/Post.vue'
  import FranchiseGame from '@/components/game/FranchiseGame.vue'
  import DoughnutChart from '@/components/DoughnutChart.vue'
  import CreateFeedback from '@/components/game/CreateFeedback.vue'

  const route = useRoute();
  const routes = useRouter();
  const id = ref(route.params.id);

  const userStore = useUserStore();
  const gameStore = useGameStore();

  const {
    getGameInfo,
    getFeedbacksByGame,
    rateGame,
    getGameRateByUser,
    getSubToGame,
    subToGame,
    unSubToGame,
    getSubscribes
  } = api;

  const info = ref({});
  const feedbacks = ref([]);
  const correctDate = ref('');
  const loading = ref(false);
  const photoList = ref([]);

  const getGame = async () => {
    try {
      const response = await getGameInfo(id.value);
      if (response.status_rawg === true) {
        await openLoading(loading.value);
        const checkId = async () => {
          const response = await getGameInfo(id.value);
          if (response.game.id_game !== undefined) {
            loading.value = true;
            routes.push(`/game/${response.game.id_game}`).then(() => {
              location.reload();
            });
          }
          else {
            setTimeout(checkId, 100);
          }
        }

        await checkId();
      }
      else {
        loading.value = true;
        info.value = response.game;
        photoList.value.push(info.value.main_picture);

        const date = parseISO(info.value.release_date);
        const month = getMonth(date) + 1;

        for (const item of months) {
          if ('0' + month === item.value) {
            correctDate.value = `${getDate(date)} ${item.label} ${getYear(date)}`;
            break;
          }
          else if (month.toString() === item.value) {
            correctDate.value = `${getDate(date)} ${item.label} ${getYear(date)}`;
            break;
          }
        }
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

  const isFoundUserFeedback = ref(false);
  const userFeedback = ref('');
  const getFeedbacks = async () => {
    try {
      const response = await getFeedbacksByGame(id.value);
      if (response.message === 'Получили отзывы по игре') {
        feedbacks.value = response.data;
        feedbacks.value.count = response.count;

        for (const feedback of feedbacks.value) {
          if (feedback.id_user === Number(localStorage.getItem('idUser'))) {
            isFoundUserFeedback.value = true;
            userFeedback.value = feedback.description;
          }
        }

        if (feedbacks.value.length > 3) {
          feedbacks.value.length = 3;
        }
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

  const emitFeedback = (data) => {
    if (isFoundUserFeedback.value === false) {
      feedbacks.value.push(data);
      feedbacks.value.count = 1;
    }
  }

  const rateScore = ref(0);
  const getUserRate = async () => {
    try {
      const data = {
        id_user: Number(localStorage.getItem('idUser')),
        token: localStorage.getItem('token'),
        id_game: id.value
      };

      const response = await getGameRateByUser(data);
      if (response.message !== 'Оценки нету') {
        rateScore.value = response.message;
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

  const setRate = async () => {
    try {
      if (localStorage.getItem('idUser')) {
        const data = {
          token: localStorage.getItem('token'),
          newScore: rateScore.value,
          idUser: Number(localStorage.getItem('idUser')),
          idGame: id.value
        };

        const response = await rateGame(data);
        if (response.message === 'Оценка поставлена' || response.message === 'Оценка обновлена') {
          ElNotification({
            message: response.message,
            type: 'success',
          });
        }
      }
      else {
        ElNotification({
          message: 'Авторизуйтесь чтобы поставить оценку!',
          type: 'error',
        });
        rateScore.value = 0;
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
  const nowStatusGame = ref('');
  const getFollowingStatus = async () => {
    try {
      const data = {
        token: localStorage.getItem('token'),
        id_user: Number(localStorage.getItem('idUser')),
        id_game: id.value
      };

      const response = await getSubToGame(data);

      nowStatusGame.value = response.message;
      userStore.setStatusGame(nowStatusGame.value);
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const HandlerGameToList = async () => {
    try {
      if (localStorage.getItem('idUser')) {
        const data = {
          token: localStorage.getItem('token'),
          idUser: Number(localStorage.getItem('idUser')),
          followType: nowStatusGame.value,
          idGame: id.value
        }

        if (userStore.previousStatusGame === nowStatusGame.value) {
          const response = await unSubToGame(data);
          if (response) {
            ElNotification({
              message: response.message,
              type: 'success',
            });

            nowStatusGame.value = '';
          }
        }
        else {
          const response = await subToGame(data);
          if (response) {
            ElNotification({
              message: response.message,
              type: 'success',
            });

            userStore.previousStatusGame = nowStatusGame.value;
          }
        }
      }
      else {
        ElNotification({
          message: 'Авторизуйтесь чтобы добавить игру в список!',
          type: 'error',
        });

        nowStatusGame.value = '';
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

  const getSubsByGame = async () => {
    try {
      const response = await getSubscribes(id.value);

      gameStore.chartGameData.datasets[0].data = [];

      const numbers = Object.values(response.data);

      gameStore.chartGameData.datasets[0].data = numbers;
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const isModalFeedbackOpen = ref(false);
  const handleFeedbackModal = () => {
    isModalFeedbackOpen.value = isModalFeedbackOpen.value !== true;
  }

  provide('game', {
    handleFeedbackModal,
    isFoundUserFeedback
  });

  onMounted(async () => {
    await getGame();
    if (loading.value) {
      await getFeedbacks();
      await getSubsByGame();
      if (localStorage.getItem('idUser')) {
        await getUserRate();
        await getFollowingStatus();
      }
    }
  });
</script>

<template>
  <div class="game" v-if="loading">
    <transition name="overlay">
      <div v-if="isModalFeedbackOpen" class="overlay" @click="handleFeedbackModal"></div>
    </transition>
    <transition name="fade">
      <CreateFeedback
          :name="info.name"
          :id-game="id"
          v-if="isModalFeedbackOpen"
          :text="userFeedback"
          @feedback="emitFeedback"
      />
    </transition>
    <div class="left_block">
      <div class="fixed_block based">
        <p class="game_name h phone_active">{{ info.name }}</p>
        <img :src="info.main_picture" alt="game photo">
        <div class="game_activity based">
          <el-select
              style="width: 250px;"
              placeholder="Добавить в список"
              v-model="nowStatusGame"
          >
            <el-option
                v-for="item in statusGame"
                :key="item.id"
                :label="item.label"
                :value="item.value"
                @click="HandlerGameToList"
            />
          </el-select>
          <el-button style="width: 250px;" @click="handleFeedbackModal" v-if="isFoundUserFeedback">Обновить отзыв</el-button>
          <el-button style="width: 250px;" @click="handleFeedbackModal" v-else>Написать отзыв</el-button>
<!--          <el-button style="width: 250px;">Подписаться</el-button>-->
        </div>
        <div class="based">
          <p class="h">Рейтинг игры</p>
          <p class="positive" v-if="info.score > 3">{{ info.score }}</p>
          <p class="neutral" v-else-if="info.score > 2">{{ info.score }}</p>
          <p class="negative" v-else-if="info.score > 0">{{ info.score }}</p>
          <p class="empty" v-else>Отсутствует</p>
        </div>
        <div class="based">
          <p class="h" v-if="rateScore > 0">Ваша оценка</p>
          <p class="h" v-else>Поставить оценку</p>
          <el-rate v-model="rateScore" @click="setRate" />
        </div>
      </div>
    </div>
    <div class="info">
      <p class="game_name h phone_disable">{{ info.name }}</p>
      <div class="items">
        <div class="item">
          <div class="h-item">
            Статистика
          </div>
          <div class="items">
            <DoughnutChart
                :chart-data="gameStore.chartGameData"
                :chart-options="chartOptions"
            />
          </div>
        </div>
        <div class="item">
          <p class="h-item">Дата выхода</p>
          <p v-if="info.release_date !== undefined">{{ correctDate }}</p>
        </div>
        <div class="item">
          <p class="h-item">Разработчики</p>
          <div>
            <span v-for="item in info.developers">{{ item.name + ' ' }}</span>
          </div>
        </div>
        <div class="item" style="display: none">
          <p class="h-item">Платформы</p>
          <p>PC PS5 XBOX</p>
        </div>
        <div class="item">
          <p class="h-item">Описание</p>
          <p class="description" v-html="info.description"></p>
        </div>
      </div>
    </div>
    <div class="feedbacks">
      <div class="header">
        <p class="h">Отзывы<sup v-if="feedbacks.count">{{ feedbacks.count }}</sup></p>
        <router-link to="/" v-if="feedbacks.count"><p class="show_more h">Смотреть все</p></router-link>
      </div>
      <div class="items">
        <Feedback
            v-if="feedbacks.count"
            v-for="item in feedbacks"
            :key="item.id"
            :id="item.id_feedback"
            :id-user="item.id_user"
            :name="item.user_name"
            :photo="item.user_photo"
            :feedback="item.description"
            :score="item.feedback_score"
        />
        <div v-else class="based" style="gap: 24px">
          <p class="h">Отсутствуют</p>
          <el-button @click="handleFeedbackModal" v-if="isFoundUserFeedback">Обновить отзыв</el-button>
          <el-button @click="handleFeedbackModal" v-else>Написать отзыв</el-button>
        </div>
      </div>
    </div>
<!--    <div class="posts">-->
<!--      <div class="header">-->
<!--        <p class="h">Новости</p>-->
<!--        <a href=""><p class="show_more">Смотреть все</p></a>-->
<!--      </div>-->
<!--      <div class="items">-->
<!--        <Post />-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="franchise">-->
<!--      <div class="header">-->
<!--        <p>Франшиза<sup>5</sup></p>-->
<!--      </div>-->
<!--      <div class="items">-->
<!--        <FranchiseGame />-->
<!--        <FranchiseGame />-->
<!--        <FranchiseGame />-->
<!--        <FranchiseGame />-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<style scoped>
  .h {
    font-weight: 800;
    font-size: larger;
  }
  .h-item {
    font-weight: 500;
  }
  .empty {
    padding: 1rem;
    color: #5e5e5e;
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
  .game {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, auto);
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    padding: 24px;
    min-height: 105vh;
    width: 100%;
  }
  .left_block {
    grid-row: span 4 / span 4;
  }
  .fixed_block {
    position: fixed;
    left: 8rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .fixed_block img {
    width: 300px;
    height: 300px;
    object-fit: cover;
    border-radius: 12px;
    border: 4px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 20px;
  }
  .fixed_block img:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    cursor: pointer;
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
    grid-template-columns: 15% auto;
  }
  .feedbacks {
    grid-column: span 2 / span 2;
    grid-column-start: 2;
    grid-row-start: 2;
    background: rgba(255, 255, 255, 0.9); /* Полупрозрачный белый фон */
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  .phone_active {
    display: none;
  }
  .fade-enter-from {
    opacity: 0;
    top: 5%;
  }
  .fade-enter-to, .fade-leave-from {
    opacity: 1;
    top: 15%;
  }
  .fade-leave-to {
    opacity: 0;
    top: 5%;
  }
  .fade-enter-active, .fade-leave-active {
    transition: 0.15s ease;
  }
  @media screen and (max-width: 1400px) {
    .fixed_block {
      left: 0;
    }
    .info .items .item {
      grid-template-columns: 25% auto;
    }
  }
  @media screen and (max-width: 1050px) {
    .game {
      display: flex;
      flex-direction: column;
    }
    .fixed_block {
      left: 0;
      position: relative;
    }
  }
  @media screen and (max-width: 768px) {
    .game {
      padding: 0;
    }
    .description {
      padding: 10px;
    }
    .h-item {
      font-weight: 800;
    }
    .left_block {
      margin-bottom: 20px;
    }
    .phone_disable {
      display: none;
    }
    .phone_active {
      display: block;
    }
    .info .items {
      display: grid;
      grid-template-columns: repeat(2, auto);
      grid-template-rows: repeat(3, auto);
      gap: 8px;
    }
    .info .items .item:nth-child(1) {
      grid-column: span 2 / span 2;
    }
    .info .items .item:nth-child(2) {
      grid-row-start: 2;
    }
    .info .items .item:nth-child(3) {
      grid-row-start: 2;
    }
    .info .items .item:nth-child(4) {
      grid-row-start: 2;
    }
    .info .items .item:nth-child(5) {
      grid-column: span 2 / span 2;
    }
    .info .items .item {
      display: flex;
      gap: 12px;
      flex-direction: column;
      justify-content: center;
      flex-wrap: wrap;
    }
    .feedbacks {
      padding: 15px;
    }
  }
</style>
