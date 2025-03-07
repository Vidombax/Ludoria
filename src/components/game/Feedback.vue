<script setup>
  const props = defineProps({
    name: String,
    photo: String,
    id: Number,
    score: Number,
    feedback: String
  });
</script>

<template>
  <div class="item">
    <div class="header">
      <div>
        <img :src="photo" alt="author logo">
        <a href="/account"><p class="h">{{ name }}</p></a>
      </div>
      <div>
        <div class="positive" v-if="score > 0">{{ score }}</div>
        <div style="margin-right: 2rem; font-weight: 800;" v-else-if="score === 0">{{ score }}</div>
        <div class="negative" v-else>{{ score }}</div>
        <div>
          <el-button>+</el-button>
          <el-button>-</el-button>
        </div>
      </div>
    </div>
    <div class="text">
      <p>{{ feedback }}</p>
    </div>
  </div>
</template>

<style scoped>
  .item {
    margin-bottom: 40px;
    border-bottom: 2px solid #484747;
    padding: 4px;
    border-radius: 2px;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  .header img {
    width: 60px;
    height: 60px;
    object-fit: cover;
  }
  .header div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .positive {
    margin-right: 2rem;
    background-color: #55c51c;
    padding: 0.5rem;
    color: #f2f2f2;
    font-weight: 800;
    border-radius: 4px;
  }
  .negative {
    margin-right: 2rem;
    background-color: #d3132a;
    padding: 0.5rem;
    color: #f2f2f2;
    font-weight: 800;
    border-radius: 4px;
  }
  .h {
    font-weight: 700;
    font-size: larger;
  }
</style>
