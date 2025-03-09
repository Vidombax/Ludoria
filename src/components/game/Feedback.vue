<script setup>
  import { ref } from 'vue'

  import api from '@/api/api.js'
  import {ElNotification} from "element-plus";

  const { rateFeedback } = api;

  const props = defineProps({
    name: String,
    photo: String,
    idUser: Number,
    id: Number,
    score: Number,
    feedback: String
  });

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
          message: 'Авторизуйтесь чтобы поставить оценку!',
          type: 'error',
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
      <div>
        <img :src="photo" alt="author logo">
        <a :href="urlUser"><p class="h name">{{ name }}</p></a>
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
    <div class="text">
      <p>{{ feedback }}</p>
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
    width: 70px;
    height: 70px;
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
