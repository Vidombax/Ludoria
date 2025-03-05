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
  <div class="game">
    <a :href="urlToGame">
      <img :src="picture" alt="game">
    </a>
<!--    TODO: взять за основу див поиска с шикимори с имеющимися rawg данными-->
    <a :href="urlToGame" class="text-xl game-name">{{ name }}</a>
  </div>
</template>

<style scoped>
  .game {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    gap: 24px;
  }
  img {
   width: 75px;
   height: 75px;
  }
  .info_game {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .list_developers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }
</style>