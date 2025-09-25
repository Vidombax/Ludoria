<script setup>
  import { ref, watch } from 'vue'
  import { useGameStore } from '@/stores/game/store.js'

  const props = defineProps({
    pagination: Object,
    pageNumber: Number,
    getData: Function
  });

  const emit = defineEmits(['pagination']);
  const gameStore = useGameStore();

  const setPageNumber = (number) => {
    emit('pagination', number);
  }

  const number = ref(props.pageNumber);

  const handleClickPagination = () => {
    props.getData(number.value);
    setPageNumber(number.value);
    gameStore.pageNumber = number.value;
  }

  watch(() => props.pageNumber, (newValue) => {
    number.value = newValue;
  });
</script>

<template>
  <div class="pagination" v-if="pagination">
    <h4>Страницы</h4>
    <el-pagination
        layout="prev, pager, next"
        :total="pagination.totalPages"
        v-model:current-page="number"
        @click="handleClickPagination"
        :current-page="number"
    />
  </div>
</template>

<style scoped>
  .pagination {
    padding: 12px;
  }
</style>
