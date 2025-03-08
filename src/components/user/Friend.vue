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
    object-fit: cover;
    width: 35px;
    height: 35px;
    border-radius: 12%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
</style>