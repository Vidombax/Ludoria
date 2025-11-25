<script setup>
  const props = defineProps({
    photo: String,
    name: String,
    id: String,
    score: Number,
    score_feedback: Number,
    description: String,
  });

  const url = `/game/${props.id}`;
</script>

<template>
  <div class="item">
    <div class="game_info">
      <router-link :to="url">
        <img :src="props.photo" class="item_photo" alt="Game Logo">
        <p class="h">{{ props.name }}</p>
      </router-link>
    </div>
    <p class="legend_mobile">Отзыв</p>
    <p>{{ props.description }}</p>
    <div class="feedback_info">
      <p class="legend_mobile">Оценка</p>
      <p v-if="props.score !== null">{{ props.score }}</p>
      <p v-else>-</p>
      <p class="legend_mobile">Оценка отзыва</p>
      <p>{{ props.score_feedback }}</p>
    </div>
  </div>
</template>

<style scoped>
  .item {
    display: grid;
    grid-template-columns: 0.4fr 1fr 0.3fr;
    gap: 12px;
    margin-bottom: 40px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 20px;
  }
  .h {
    font-size: 14px;
    font-weight: 700;
    color: #2c3e50;
    transition: color 0.3s ease;
  }
  .item_photo {
    width: 90px;
    height: 90px;
    object-fit: cover;
    border-radius: 12px;
    border: 4px solid #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    margin-bottom: 20px;
  }
  .game_info {
    display: flex;
    justify-content: flex-start;
    gap: 24px;
  }
  .game_info a {
    display: flex;
    flex-direction: column;
  }
  .feedback_info {
    display: flex;
    justify-content: space-around;
  }
  .legend_mobile {
    display: none;
    font-weight: 800;
    font-size: 18px;
  }

  @media screen and (max-width: 1400px) {
    .item {
      grid-template-columns: 0.2fr 0.6fr 0.3fr;
    }
  }
  @media screen and (max-width: 1050px) {
    .item {
      grid-template-columns: 0.15fr 0.55fr 0.3fr;
    }
  }
  @media screen and (max-width: 768px) {
    .feedback_info {
      display: flex;
      align-items: center;
    }
    .item {
      grid-template-columns: 1fr;
    }
    .legend_mobile {
      display: block;
    }
  }
</style>
