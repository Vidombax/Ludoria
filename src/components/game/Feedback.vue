<script setup>
  import {inject, ref} from 'vue'
  import { format, parseISO } from 'date-fns'

  import api from '@/api/api.js'
  import { ElNotification } from 'element-plus'

  const { rateFeedback } = api;

  const props = defineProps({
    name: String,
    photo: String,
    idUser: Number,
    id: Number,
    score: Number,
    header: String,
    feedback: String,
    gameScore: Number,
    dateFeedback: String
  });

  const { reportModalHandler } = inject('game');

  const refScore = ref(props.score)
  const urlUser = ref(`/user/${props.idUser}`);

  const rateClick = async (score) => {
    try {
      if (localStorage.getItem('idUser')) {
        const data = {
          token: localStorage.getItem('token'),
          idFeedback: props.id,
          score: score,
          idUser: Number(localStorage.getItem('idUser'))
        }
        const response = await rateFeedback(data);
        if (response.message !== 'Не обновляем') {
          if (score === true) {
            refScore.value += 1;
          }
          else {
            refScore.value -= 1;
          }
        }
      }
      else {
        ElNotification({
          message: '<span style="color: #55c51c; font-weight: bold;">Авторизуйтесь</span> чтобы поставить оценку!',
          type: 'warning',
          dangerouslyUseHTMLString: true,
        });
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
</script>

<template>
  <div class="item">
    <div class="header">
      <div class="info_client">
        <img :src="photo" alt="author logo">
        <router-link :to="urlUser"><p class="h name">{{ name }}</p></router-link>
      </div>
      <div>
        <div class="positive" v-if="refScore > 0">{{ refScore }}</div>
        <div style="margin-right: 2rem; font-weight: 800;" v-else-if="refScore === 0">{{ refScore }}</div>
        <div class="negative" v-else>{{ refScore }}</div>
        <div>
          <el-button @click="rateClick(true)">+</el-button>
          <el-button @click="rateClick(false)">-</el-button>
        </div>
      </div>
    </div>
    <div class="headerFeedback" v-if="header">
      <p>{{ header }}</p>
    </div>
    <div class="text">
      <p>{{ feedback }}</p>
    </div>
    <div class="footer">
      <div class="date_feedback">
        <p>{{ format(parseISO(dateFeedback), 'dd.MM.yyyy') }}</p>
      </div>
      <el-tooltip content="Пожаловаться" placement="top" effect="light">
        <div class="report_feedback">
          <el-icon
              :size="25"
              color="#ff0000"
              style="cursor: pointer;"
              @click="reportModalHandler(props.id, props.idUser)"
          >
            <Warning />
          </el-icon>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
  .item {
    margin-bottom: 40px;
    border-bottom: 2px solid #e0e0e0;
    padding: 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  .header img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid #0f2027;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .header div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .text p {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }
  .positive {
    margin-right: 2rem;
    background-color: #55c51c;
    padding: 0.5rem;
    color: #f2f2f2;
    font-weight: 800;
    border-radius: 4px;
  }
  .negative {
    margin-right: 2rem;
    background-color: #d3132a;
    padding: 0.5rem;
    color: #f2f2f2;
    font-weight: 800;
    border-radius: 4px;
  }
  .h {
    font-weight: 700;
    font-size: larger;
  }
  .info_client {
    gap: 12px !important;
  }
  .headerFeedback {
    font-size: x-large;
    font-weight: bolder;
    margin-bottom: 10px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .date_feedback p {
    color: #5e5e5e;
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

  @media screen and (max-width: 768px) {
    .header div {
      gap: 0;
    }
    .name {
      margin-left: 12px;
    }
    .header img {
      width: 50px;
      height: 50px;
    }
  }
</style>
