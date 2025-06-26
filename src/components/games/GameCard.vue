<script setup>
  import { ref } from 'vue'
  import { format, parseISO } from 'date-fns'

  const props = defineProps({
    id: Number,
    name: String,
    date: Date,
    photo: String,
    developer: String
  });

  const url = ref(`/game/${props.id}`);
</script>

<template>
  <div class="game based">
    <router-link :to="url">
      <img :src="photo" alt="Photo game">
      <p class="name">{{ name }}</p>
      <div class="info">
        <p class="developer">{{ developer }}</p>
        <p class="year">{{ format(parseISO(date), 'dd.MM.yyyy') }}</p>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
  .game img {
    width: 160px;
    height: 226px;
    object-fit: cover;
  }
  .name {
    font-weight: bold;
    font-size: larger;
  }
  .info {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>
