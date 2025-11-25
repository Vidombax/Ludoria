<script setup>
  import { inject, ref } from 'vue'

  import { reports } from '../../../services/constants.js'

  const { reportModalHandler, sendReportClick } = inject('game');

  const reportReason = ref(0);
</script>

<template>
  <div class="report based">
    <div class="header">
      <p class="h">Пожаловаться</p>
      <el-button @click="reportModalHandler">X</el-button>
    </div>
    <div class="items">
      <div class="category">
        <el-select
            v-model="reportReason"
            placeholder="Причина жалобы"
        >
          <el-option
              v-for="item in reports"
              :key="item.id"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </div>
      <div class="buttons">
        <el-button @click="reportModalHandler">Отмена</el-button>
        <el-button @click="sendReportClick(reportReason)">Пожаловаться</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .report {
    display: flex;
    position: fixed;
    z-index: 1000;
    background: rgba(255, 255, 255);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    left: 45%;
    top: 40%;
  }
  .items {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .header {
    width: 25vh;
    gap: 25px;
  }
  .h {
    font-weight: 800;
    font-size: larger;
  }

  @media screen and (max-width: 1024px) {
    .report {
      left: 32%;
    }
  }

  @media screen and (max-width: 768px) {
    .report {
      left: 15%;
    }
  }
</style>
