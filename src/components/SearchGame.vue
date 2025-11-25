<script setup>
  import {ref} from "vue";

  const props = defineProps({
    name: String,
    picture: String,
    score: Number,
    developers: String,
    id: Number,
  });

  const urlToGame = ref(`/game/${props.id}`);
  const score = ref(props.score);

</script>

<template>
  <a :href="urlToGame">
    <div class="game">
        <div class="info_game">
          <img :src="picture" alt="game">
          <p class="game-name">{{ name }}</p>
        </div>
    </div>
  </a>
</template>

<style scoped>
  .game {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(246, 241, 241, 0.9);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .game:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }
  img {
   width: 100px;
   height: 100px;
   border-radius: 12px;
   object-fit: cover;
  }
  .game-name {
    color: #0f2027;
    transition: .2s linear;
  }
  .game-name:hover {
    color: #57a5b5;
  }
  .info_game {
    display: flex;
    gap: 12px;
    align-items: center;
  }
</style>
