<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    id: Number,
    name: String,
    photo: String
  });

  const url = ref(`/user/${props.id}`);
</script>

<template>
  <div class="item">
    <img v-if="photo" :src="photo" alt="friend logo">
    <img v-else src="../../assets/images/default_profile_photo.png" alt="friend logo">
    <router-link :to="url">{{ name }}</router-link>
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
