<script setup>
  import { useUserStore } from '@/stores/user/store.js'

  const userStore = useUserStore();
</script>

<template>
  <div class="menu_btn" @click="userStore.setStatusMenu()">
    <p>Меню</p>
  </div>
</template>

<style scoped>
  .menu_btn {
    display: none;
    position: fixed;
    right: -10px;
    top: 20%;
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    padding: 8px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    transform: rotate(-90deg);
    cursor: pointer;
  }

  @media screen and (max-width: 768px) {
    .menu_btn {
      display: block;
    }
  }
</style>