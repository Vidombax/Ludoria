<script setup>
  import { exitFromAccount } from '../../services/helpers.js'

  const props = defineProps({
    info: String,
  });
</script>

<template>
  <div class="overlay"></div>
  <div class="modal-container">
    <div class="modal based">
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
  </div>
</template>

<style scoped>
  .modal-container {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  .modal {
    z-index: 1000;
    background: rgba(255, 255, 255);
    border-radius: 12px;
    padding: 24px;
    height: 20%;
    width: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  p {
    font-size: larger;
  }
  .header {
    width: 100%;
  }

  @media screen and (max-width: 768px) {
    .modal {
      height: 28%;
    }
  }
</style>
