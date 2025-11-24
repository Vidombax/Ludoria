<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElNotification } from 'element-plus'

  import api from '@/api/api.js'

  const route = useRoute();
  const id = ref(route.params.id);
  const { getPost } = api;

  const post = ref({});
  const loading = ref(false);

  const getPostData = async () => {
    try {
      const response = await getPost(id.value);
      post.value = response.post;
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
  <div class="post" v-if="post">

  </div>
</template>

<style scoped>

</style>