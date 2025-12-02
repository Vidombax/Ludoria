<script setup>
  import {onMounted, ref, watch} from 'vue'
  import { useRoute } from 'vue-router'

  import { ElNotification } from 'element-plus'
  import api from '@/api/api.js'
  import { openLoading } from '../../services/helpers.js'

  const route = useRoute();
  const id = ref(route.params.id);
  const { getPost, getGameInfo } = api;

  const post = ref({});
  const game = ref({});
  const isLoading = ref(true);

  const getPostData = async () => {
    try {
      const data = {
        id: id.value,
        id_user: Number(localStorage.getItem('idUser')) || 0,
        token: localStorage.getItem('token') || null
      }
      await openLoading(isLoading.value);

      const response = await getPost(data);
      post.value = response.post;

      await getGame(post.value.post.id_game);

      isLoading.value = false;
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const getGame = async (id) => {
    try {
      const response = await getGameInfo(id);
      game.value = response.game;
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
    await Promise.all([
      getPostData(),
    ]);
  });
</script>

<template>
  <div class="post based" v-if="isLoading === false">
    <div class="post_navigation">

    </div>
    <div class="post_information">

    </div>
    <div class="post_header">

    </div>
    <div class="post_author">

    </div>
    <div class="post_text">

    </div>
    <div class="game_about_post">
      <div class="game">
        <div class="game_logo">

        </div>
        <div class="game_info">
          <div class="game_name">

          </div>
          <div class="information_of_game">

          </div>
        </div>
      </div>
      <div class="game_rate">
        <div class="rate">

        </div>
        <div class="user_rate">

        </div>
      </div>
    </div>
    <div class="comments">
      <div class="header">

      </div>
      <div class="items">

      </div>
    </div>
    <div class="another_posts">
      <div class="header">

      </div>
      <div class="items">

      </div>
    </div>
  </div>
</template>

<style scoped>
  .post {

  }
</style>
