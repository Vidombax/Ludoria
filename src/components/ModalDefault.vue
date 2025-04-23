<script setup>
  import { exitFromAccount } from '../../services/helpers.js'

  const props = defineProps({
    info: String,
  });
</script>

<template>
  <transition name="overlay">
    <div class="overlay"></div>
  </transition>
  <transition name="modal">
    <div class="default_modal based">
      <div class="header">
        <p>Внимание</p>
      </div>
      <div class="items based">
        <div class="info">
          <p>{{ info }}</p>
        </div>
        <div class="buttons">
          <el-button @click="exitFromAccount('/login')">OK</el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
  .buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  .default_modal {
    position: absolute;
    left: 45%;
    top: 40%;
    z-index: 1000;
    background: rgba(255, 255, 255);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  p {
    font-size: larger;
  }
  .header {
    width: 100%;
  }
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
    transform: scale(0.8);
  }
  .modal-enter-to,
  .modal-leave-from {
    opacity: 1;
    transform: scale(1);
  }
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s ease;
  }
</style>
