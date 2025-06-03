<script setup>
  import {inject} from 'vue'

  import Feedback from '@/components/user/FeedbackCard.vue'

  const props = defineProps({
    feedbacks: Array,
    name: String,
  });

  const { handlerFeedbackModal } = inject('user');
</script>

<template>
  <div class="feedbacks">
    <div class="header">
      <p class="h">Отзывы пользователя {{ name }}</p>
      <el-button @click="handlerFeedbackModal">Закрыть</el-button>
    </div>
    <div class="legend">
      <p>Игра</p>
      <p class="descipt_legend">Отзыв</p>
      <div>
        <p>Оценка</p>
        <p>Оценка отзыва</p>
      </div>
    </div>
    <div class="items">
      <Feedback v-for="item in props.feedbacks"
                :key="item.id"
                :id="item.id_game"
                :name="item.name"
                :photo="item.main_picture"
                :score="item.score"
                :score_feedback="item.feedback_score"
                :description="item.description"
      />
    </div>
  </div>
</template>

<style scoped>
  .feedbacks {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 1001;
    height: auto;
    top: 0;
    left: 0;
    right: 0;
    padding: 24px;
    gap: 24px;
    background: rgba(217, 211, 211);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .header {
    border: 0;
  }
  .h {
    font-size: 24px;
    font-weight: 700;
    color: #2c3e50;
    transition: color 0.3s ease;
  }
  .h:hover {
    color: #57a5b5;
  }
  .legend {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    gap: 16px;
    padding: 0 0.4rem;
    border-bottom: 2px solid #e0e0e0;
  }
  .legend p {
    font-size: 16px;
    font-weight: 700;
    color: #2c3e50;
    transition: color 0.3s ease;
  }
  .legend div {
    display: flex;
    gap: 24px;
    align-items: flex-end;
  }
  .legend div p {
    width: 100px;
  }
  .descipt_legend {
    display: block;
  }

  @media screen and (max-width: 768px) {
    .legend {
      display: none;
    }
  }
</style>
