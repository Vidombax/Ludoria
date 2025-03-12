<script setup>
  import ArrowRight from "@/assets/svg/ArrowRight.vue";

  defineProps({
    nameInfo: String,
    colorScheme: String,
    href: String,
    colorName: String
  })
</script>

<template>
  <div class="info" :style="{ backgroundColor: colorScheme }">
    <router-link v-if="href" :to="href" :style="{ color: colorName }"><p>{{ nameInfo }}</p></router-link>
    <p v-else :style="{ color: colorName }">{{ nameInfo }}</p>
    <router-link :to="href"><p><ArrowRight :color="colorName"/></p></router-link>
  </div>
</template>

<style scoped>
  .info {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    align-items: center;
    border-left: 4px solid #236473;
    margin: 12px;
  }
  p {
    transition: .3s linear;
  }
  p:hover {
    color: #57a5b5;
  }
  .info a,
  .info p {
    font-size: 24px;
    font-weight: 700;
    transition: color 0.3s ease;
  }
</style>
