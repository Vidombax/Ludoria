<script setup>
  import { onMounted } from 'vue'
  import Header from '@/components/Header.vue'

  onMounted(() => {
    if (localStorage.getItem('idUser')) {
      document.getElementsByClassName('main')[0].classList.add('auth');
    }
    else {
      document.getElementsByClassName('main')[0].classList.add('non_auth');
    }
  })
</script>

<template>
  <div class="container">
    <Header />
    <main class="main">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
  .non_auth {
    margin-top: 60px;
  }
  .auth {
    margin-top: 90px;
  }
</style>
