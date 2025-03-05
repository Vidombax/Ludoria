<script setup>

import Header from "@/components/Header.vue";
</script>

<template>
  <div class="container">
    <Header />
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
  main {
    display: flex;
    justify-content: center;
    margin-top: 100px;
  }
</style>
