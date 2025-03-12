<script setup>
  import Info from '@/components/Info.vue'
  import Card from '@/components/Card.vue'

  const props = defineProps({
    cards: Array,
  })

  const info_obj = {
    href: '',
    name_info: '',
    color_scheme: '',
    color_name: ''
  }

</script>

<template>
  <div>
    <div class="info_div" v-memo>
      <Info
          href="/popularity"
          name-info="Самое обсуждаемое"
          color-scheme="rgba(232,22,22,0.27)"
          color-name="rgb(232,22,22)"
      />
      <div class="cards">
        <Card
            v-for="item in cards"
            :key="item.id_game"
            :name="item.name"
            :date="item.release_date"
            :developers="item.developers"
            :picture="item.main_picture"
            :id="item.id_game"
            :genres="item.genres"
            :score="Number(item.score).toFixed(2)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .info_div {
    width: 100%;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    margin: 1.5rem;
  }
  @media screen and (max-width: 1400px) {
    .cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media screen and (max-width: 1050px) {
    .cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media screen and (max-width: 768px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }
</style>
