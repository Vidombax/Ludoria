<script setup>
  const props = defineProps({

  });
</script>

<template>
  <div class="item">
    <img src="https://media.rawg.io/media/games/b2c/b2c9c6115114c8f7d461b5430e8a7d4a.jpg" alt="friend logo">
    <a href="/user">friend</a>
  </div>
</template>

<style scoped>
  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 8px;
  }
  img {
    width: 30px;
    height: 30px;
  }
</style>