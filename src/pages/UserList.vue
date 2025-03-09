<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  import api from '../api/api.js'

  const {  } = api;
  const route = useRoute();

  const id = ref(route.params.id);
  const token = localStorage.getItem('token');
  const data = {
    id: id.value,
    token: token,
  };

  const info = ref({});
  const getUserGames = async () => {

  }

  onMounted(async () => {
    await getUserInfo();
  });
</script>

<template>
  <div class="playing">

  </div>
  <div class="planned">

  </div>
  <div class="played">

  </div>
  <div class="dropped">

  </div>
</template>

<style scoped>

</style>