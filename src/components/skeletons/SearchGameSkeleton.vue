<template>
  <el-skeleton animated style="width: 100%; height: 150px;">
    <template #template>
      <div class="game">
        <el-skeleton-item variant="image" style="width: 100px; height: 100px; margin-right: 25px;"></el-skeleton-item>
        <el-skeleton-item variant="p" style="height: 25px;"></el-skeleton-item>
      </div>
    </template>
  </el-skeleton>
</template>
<style scoped>
  .game {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(246, 241, 241, 0.9);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
</style>