<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { onMounted, ref } from 'vue'
  import { getDate, getMonth, getYear, parseISO } from 'date-fns'

  import api from '@/api/api.js'
  import { months } from '../../services/constants.js'
  import { openLoading } from '../../services/helpers.js'
  import { ElNotification } from 'element-plus'

  import Feedback from '@/components/game/Feedback.vue'
  import Post from '@/components/game/Post.vue'
  import FranchiseGame from '@/components/game/FranchiseGame.vue'

  const route = useRoute();
  const routes = useRouter();
  const id = ref(route.params.id);

  const { getGameInfo, getFeedbacksByGame, rateGame, getGameRateByUser } = api;
  const info = ref({});
  const feedbacks = ref([]);
  const correctDate = ref('');
  const loading = ref(false);

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

  const getFeedbacks = async () => {
    try {
      const response = await getFeedbacksByGame(id.value);
      if (response.message === 'Получили отзывы по игре') {
        feedbacks.value = response.data;
        feedbacks.value.count = response.count;
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

  onMounted(async () => {
    await getGame();
    if (loading.value) {
      await getFeedbacks();
      if (localStorage.getItem('idUser')) {
        await getUserRate();
      }
    }
  });
</script>

<template>
  <div class="game" v-if="loading">
    <div class="left_block">
      <div class="fixed_block based">
        <img :src="info.main_picture" alt="game photo">
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
          <el-rate v-model="rateScore" @click="setRate" />
        </div>
      </div>
    </div>
    <div class="info">
      <p class="game_name h">{{ info.name }}</p>
      <div class="items">
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
          <p v-html="info.description"></p>
        </div>
        <div class="item" v-if="info.score !== null">
          <p class="h-item">Рейтинг игры</p>
          <p class="positive" v-if="info.score > 3">{{ info.score }}</p>
          <p class="neutral" v-else-if="info.score > 2">{{ info.score }}</p>
          <p class="negative" v-else>{{ info.score }}</p>
        </div>
      </div>
    </div>
    <div class="feedbacks">
      <div class="header">
        <p class="h">Отзывы<sup v-if="feedbacks.count">{{ feedbacks.count }}</sup></p>
        <a href="" v-if="feedbacks.count"><p class="show_more">Смотреть все</p></a>
      </div>
      <div class="items">
        <Feedback
            v-if="feedbacks.count"
            v-for="item in feedbacks"
            :key="item.id"
            :id="item.id_user"
            :name="item.user_name"
            :photo="item.user_photo"
            :feedback="item.description"
            :score="item.feedback_score"
        />
        <div v-else class="based" style="gap: 24px">
          <p class="h">Отсутствуют</p>
          <el-button>Оставить отзыв</el-button>
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
    padding: 24px;
  }
  .left_block {
    grid-row: span 4 / span 4;
  }
  .fixed_block {
    position: fixed;
    left: 8rem;
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
    grid-template-columns: 15% auto;
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
