<script setup>
  const props = defineProps({
    id: Number,
    name: String,
    score: Number
  });

  const url = `/game/${props.id}`;
</script>

<template>
  <div class="item">
    <a :href="url"><p>{{ name }}</p></a>
    <p v-if="score !== null" class="score">{{ score }}</p>
    <p v-else class="score" >-</p>
  </div>
</template>

<style scoped>
  .item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }
  .item p {
    padding: 8px;
    font-size: large;
    transition: .2s linear;
  }
  .item p:first-child:hover {
    color: #57a5b5;
  }
  .score {
    display: flex;
    justify-content: flex-end;
    font-weight: 700;
  }

  @media screen and (max-width: 768px) {
    .item {
      grid-template-columns: 1fr 0.1fr;
    }
    .item p {
      font-size: medium;
    }
  }
</style>