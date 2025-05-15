<script setup>
  import { ref, inject } from 'vue'
  import api from '@/api/api.js'
  import {ElNotification} from "element-plus";

  const props = defineProps({
    name: String,
    idGame: Number,
    text: String,
    headerText: String,
    imageGame: String,
    rateScore: Number,
    setRate: Function
  });

  const emit = defineEmits(['feedback']);

  const { handleFeedbackModal, isFoundUserFeedback } = inject('game');
  const { createFeedback } = api;

  const headerText = ref(props.headerText) || '';
  const text = ref(props.text) || '';
  const score = ref(props.rateScore) || 0;

  const addFeed = (data) => {
    emit('feedback', data);
  }

  const createClick = async () => {
    try {
      if (localStorage.getItem('idUser')) {
        if (text.value !== '') {
          const data = {
            token: localStorage.getItem('token'),
            idUser: Number(localStorage.getItem('idUser')),
            idGame: props.idGame,
            description: text.value,
            header: headerText.value
          }

          const response = await createFeedback(data);
          if (response) {
            ElNotification({
              message: response.message,
              type: 'success',
            });

            addFeed(response.data);

            handleFeedbackModal();
          }
        }
        else {
          ElNotification({
            message: 'Нельзя отправить пустой отзыв',
            type: 'error',
          });
        }
      }
      else {
        ElNotification({
          message: 'Авторизуйтесь чтобы отправить отзыв!',
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
  <div class="create_feedback based">
    <div class="close-button">
      <el-button @click="handleFeedbackModal">X</el-button>
    </div>
    <div class="header">
      <div class="infoGame">
        <img :src="imageGame" alt="Logo game">
        <p class="h">{{ name }}</p>
      </div>
      <div>
        <p>Моя оценка</p>
        <el-rate v-model="score" @click="setRate(score)" />
      </div>
    </div>
    <div class="items">
      <el-input
        v-model="headerText"
        type="text"
        placeholder="Заголовок (опционально)"
        style="font-size: larger;"
      />
      <el-input
          v-model="text"
          :rows="2"
          type="textarea"
          placeholder="Текст отзыва"
      />
      <el-button @click="createClick" v-if="isFoundUserFeedback">Обновить</el-button>
      <el-button @click="createClick" v-else>Создать</el-button>
    </div>
  </div>
</template>

<style scoped>
  .create_feedback {
    background: rgba(255, 255, 255, 1);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    position: fixed;
    z-index: 1001;
    left: 40%;
    top: 15%;
  }
  .header {
    gap: 4rem;
  }
  .items {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .h {
    font-weight: 800;
    font-size: larger;
  }
  .el-textarea {
    width: 450px;
  }
  .infoGame {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    width: 30vh;
  }
  .infoGame img {
    width: 95px;
    height: 95px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 20px;
  }
  .close-button {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  @media screen and (max-width: 1400px) {
    .create_feedback {
      left: 35%;
    }
  }
  @media screen and (max-width: 1050px) {
    .create_feedback {
      left: 27%;
    }
  }
  @media screen and (max-width: 768px) {
    .create_feedback {
      left: 10%;
    }
  }
  @media screen and (max-width: 600px) {
    .create_feedback {
      left: 0;
    }
    .el-textarea {
      width: 300px;
    }
  }
</style>
