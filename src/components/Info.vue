<script setup>
  defineProps({
    nameInfo: String,
    colorScheme: String,
    href: String,
    colorName: String
  })
</script>

<template>
  <div class="info" :style="{ backgroundColor: colorScheme }">
    <a v-if="href" :href="href" :style="{ color: colorName }">{{ nameInfo }}</a>
    <p v-else :style="{ color: colorName }">{{ nameInfo }}</p>
  </div>
</template>

<style scoped>
  .info {
    display: flex;
    justify-content: flex-start;
    padding: 4px;
    border-left: 4px solid #236473;
    margin: 12px;
  }
  .info a,
  .info p {
    font-size: x-large;
    padding: 4px;
    font-weight: bold;
    transition: .2s linear;
  }
  .info a:hover {
    color: #57a5b5;
  }
</style>