<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({}),
  },
});

const chart = ref(null);
let chartInstance = null;

onMounted(() => {
  const ctx = chart.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: props.chartData,
    options: props.chartOptions,
  });
});

watch(
    () => props.chartData,
    (newData) => {
      if (chartInstance) {
        chartInstance.data = newData;
        chartInstance.update();
      }
    },
    { deep: true }
);
</script>

<style scoped>
canvas {
  width: 300px;
  height: auto;
}
</style>