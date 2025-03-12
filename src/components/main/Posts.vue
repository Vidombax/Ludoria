<script setup>
  import Info from '@/components/Info.vue'

  const info_obj = {
    href: '/posts',
    name_info: 'Новости',
    color_scheme: 'rgba(92,232,22,0.27)',
    color_name: 'rgb(56,145,12)'
  }
</script>

<template>
  <Info
      v-memo
      :href="info_obj.href"
      :name-info="info_obj.name_info"
      :color-scheme="info_obj.color_scheme"
      :color-name="info_obj.color_name"
  />
</template>

<style scoped>

</style>