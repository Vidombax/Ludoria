<script setup>

</script>

<template>
  <a href="">
    <div class="item">
      <img src="https://m.media-amazon.com/images/M/MV5BZTk2NDlhOTItZTZjOC00YzIwLTgyYWUtZDQzNTgzNTQ3ZmQ3XkEyXkFqcGc@._V1_.jpg" alt="logo game">
      <a href=""><p class="h">Persona 4</p></a>
      <el-rate />
    </div>
  </a>
</template>

<style scoped>
  .h {
    font-weight: 600;
    font-size: larger;
  }
  .item {
    display: flex;
    justify-items: center;
    align-items: center;
    flex-direction: column;
  }
  .item img {
    width: 250px;
    height: 250px;
    object-fit: cover;
    margin-bottom: 10px;
  }
</style>