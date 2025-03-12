<script setup>
  import NewInRelease from '@/components/main/NewInRelease.vue'
  import Posts from '@/components/main/Posts.vue'
</script>

<template>
  <div class="container">
    <NewInRelease />
    <Posts />
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
  }
</style>