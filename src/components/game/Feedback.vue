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
        <a href="/account"><p class="h name">{{ name }}</p></a>
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
    border-bottom: 2px solid #e0e0e0;
    padding: 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  .header img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid #0f2027;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .header div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .text p {
    font-size: 16px;
    line-height: 1.6;
    color: #333;
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

  @media screen and (max-width: 768px) {
    .header div {
      gap: 0;
    }
    .name {
      margin-left: 12px;
    }
    .header img {
      width: 50px;
      height: 50px;
    }
  }
</style>
