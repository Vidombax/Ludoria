<script setup>

</script>

<template>
  <div class="item">
    <div class="header">
      <div>
        <img src="/profilePictures/utkin.jpg" alt="author logo">
        <a href="/account"><p class="h">Дмитрий Уткин</p></a>
      </div>
      <div>
        <div class="positive">18</div>
        <div>
          <el-button>+</el-button>
          <el-button>-</el-button>
        </div>
      </div>
    </div>
    <div class="text">
      <p>Большие яйца, большой член и завтрак со звездой «Мишлен»
        Большие яйца, большой член, большие яйца, большой член
        Большие яйца, большой член и завтрак со звездой «Мишлен»
        Большие яйца, большой член и завтрак со звездой «Мишлен»</p>
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
  .h {
    font-weight: 700;
    font-size: larger;
  }
</style>