<script setup>
  import { ref, onMounted } from 'vue'

  import api from '@/api/api.js'
  import { ElNotification } from 'element-plus'
  import NewPost from '@/components/main/NewPost.vue'

  const { getUserPosts } = api;

  const userRole = localStorage.getItem('userRole');
  const idUser = Number(localStorage.getItem('idUser'));
  const userPosts = ref([]);
  const isArticleActive = ref(true);

  const fetchUserPosts = async () => {
    try {
      const response = await getUserPosts(idUser);

      userPosts.value.push(response.articles);
      userPosts.value.push(response.news);
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const handlerTabsPosts = () => {
    if (userRole !== '0') {
      if (isArticleActive.value === true) {
        isArticleActive.value = false;

        document.getElementById('articles').classList.remove('active_panel');
        document.getElementById('news').classList.add('active_panel');
      }
      else {
        isArticleActive.value = true;

        document.getElementById('articles').classList.add('active_panel');
        document.getElementById('news').classList.remove('active_panel');
      }
    }
  }

  onMounted(async () => {
    await fetchUserPosts();
  });
</script>

<template>
  <div class="container based">
    <div class="header">
      <div id="articles" class="articles active_panel" @click="handlerTabsPosts">
        <h2>Статьи</h2>
      </div>
      <div id="news" class="news" v-if="userRole !== '0'" @click="handlerTabsPosts">
        <h2>Новости</h2>
      </div>
      <div v-else>
        <p class="warning_text">Чтобы можно было писать новости свяжитесь с модерацией</p>
      </div>
    </div>
    <transition name="right">
      <div class="articles-div" v-if="isArticleActive === true">
        <el-button size="large">Написать новую статью</el-button>
        <div class="items-articles">
          <NewPost
              v-for="item in userPosts[0]"
              :key="item.id"
              :id_post="item.id_post"
              :header="item.header"
              :name="item.description"
              :date="item.create_data"
              :image="item.photo"
              :is-my-posts-page="true"
          />
        </div>
      </div>
    </transition>
    <transition name="left">
      <div class="news-div" v-if="isArticleActive === false">
        <el-button size="large">Написать новую новость</el-button>
        <div class="items-news">
          <NewPost
              v-for="item in userPosts[1]"
              :key="item.id"
              :id_post="item.id_post"
              :header="item.header"
              :name="item.description"
              :date="item.create_data"
              :image="item.main_picture"
              :is-my-posts-page="true"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
  }
  .header {
    display: grid;
    justify-items: center;
    grid-template-columns: repeat(2, 1fr);
    padding-bottom: 0 !important;
    margin-top: 0.53%;
    width: 100%;
    box-sizing: border-box;
  }
  .header h2 {
    transition: .05s linear;
  }
  .header h2:hover {
    font-weight: bold;
  }
  .articles,
  .news {
    cursor: pointer;
    padding: 1rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .active_panel {
    background-color: #eae9e9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .articles-div,
  .news-div {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    transition: .1s linear;
  }
  .items-articles,
  .items-news {
    display: grid;
    width: 100%;
    padding: 12px;
    gap: 24px;
    grid-template-columns: repeat(5, 1fr);
  }

  .warning_text {
    font-weight: bold;
  }

  .right-enter-from {
    opacity: 0;
    display: none;
  }
  .right-enter-to {
    opacity: 0;
    margin-top: 5%;
  }
  .right-leave-to {
    opacity: 0;
    margin-top: 0;
  }
  .right-enter-active,
  .right-leave-active {
    transition: .15s ease-out;
  }

  .left-enter-from {
    opacity: 0;
    display: none;
  }
  .left-enter-to {
    opacity: 0;
    margin-top: 5%;
  }
  .left-leave-to {
    opacity: 0;
    display: none;
    margin-top: 0;
  }
  .left-enter-active,
  .left-leave-active {
    transition: .15s ease-out;
  }

  @media screen and (max-width: 1300px) {
    .items-articles,
    .items-news {
      width: 100%;
      grid-template-columns: repeat(4, 1fr);
    }
  }
  @media screen and (max-width: 1050px) {
    .items-articles,
    .items-news {
      grid-template-columns: repeat(3, 1fr);
      width: 105%;
      box-sizing: border-box;
    }
  }
  @media screen and (max-width: 768px) {
    .items-articles,
    .items-news {
      padding: 12px;
      width: 140%;
      box-sizing: border-box;
      grid-template-columns: repeat(1, 1fr);
    }
    .warning_text {
      font-size: small;
      padding: 2px;
      margin-left: 5px;
    }
  }
</style>