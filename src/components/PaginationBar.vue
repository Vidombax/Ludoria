<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    pagination: Object,
    pageNumber: Number,
    getData: Function
  });

  const number = ref(props.pageNumber);
</script>

<template>
  <div class="pagination" v-if="pagination">
    <h4>Страницы</h4>
    <el-pagination
        layout="prev, pager, next"
        :total="pagination.totalPages"
        v-model:current-page="number"
        @click="getData(number)"
        :current-page="number"
    />
  </div>
</template>

<style scoped>
  .pagination {
    padding: 12px;
  }
</style>
