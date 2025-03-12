<script setup>
  import {ref, onMounted, defineAsyncComponent} from 'vue'

  import api from '@/api/api.js'
  import CardSkeleton from "@/components/skeletons/CardSkeleton.vue";
  import InfoSkeleton from "@/components/skeletons/InfoSkeleton.vue";

  const NewInRelease = defineAsyncComponent(() =>
      import('@/components/main/NewInRelease.vue')
  );

  const Posts = defineAsyncComponent(() =>
      import('@/components/main/Posts.vue')
  );

  const { getPopularGame } = api;

  const cards = ref([]);
  const getGames = async () => {
    const response = await getPopularGame();
    if (response) {
      cards.value = response.data;
      cards.value.length = 4;
    }
  }

  onMounted(async () => {
    await getGames();
  });
</script>

<template>
  <div class="container">
    <NewInRelease :cards="cards" v-if="cards.length" />
    <div class="skeleton_container" v-else>
      <InfoSkeleton class="info_skeleton"/>
      <CardSkeleton class="card_skeleton" v-for="item in 4" :key="item.id" />
    </div>
    <Posts />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.skeleton_container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.info_skeleton {
  grid-column: span 4 / span 4;
}

.card_skeleton {
  grid-row-start: 2;
}

@media screen and (max-width: 1400px) {
  .skeleton_container {
    grid-template-columns: repeat(3, 1fr);
  }
  .info_skeleton {
    grid-column: span 3 / span 3;
  }
  .card_skeleton {
    grid-row-start: unset;
  }
}

@media screen and (max-width: 1050px) {
  .skeleton_container {
    grid-template-columns: repeat(2, 1fr);
  }
  .info_skeleton {
    width: 95% !important;
    grid-column: span 2 / span 2;
  }
}

@media screen and (max-width: 768px) {
  .skeleton_container {
    grid-template-columns: 1fr;
  }
  .info_skeleton {
    width: 90% !important;
    grid-column: span 1 / span 1;
  }
}
</style>