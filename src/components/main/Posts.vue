<script setup>
  import Info from '@/components/Info.vue'
  import NewPost from '@/components/main/NewPost.vue'

  const props = defineProps({
    new_post: Array,
  });

  let isPostExist = true;
  if (props.new_post[0] === 'out') {
    isPostExist = false;
  }

  const info_obj = {
    href: '/posts',
    name_info: 'Новости & Статьи',
    color_scheme: 'rgba(92,232,22,0.27)',
    color_name: 'rgb(56,145,12)'
  }
</script>

<template>
  <div class="info_div" v-memo>
    <Info
        :href="info_obj.href"
        :name-info="info_obj.name_info"
        :color-scheme="info_obj.color_scheme"
        :color-name="info_obj.color_name"
    />
  </div>
  <div class="posts">
    <NewPost
        v-if="isPostExist"
        v-for="item in new_post"
        :key="item.id_post"
        :id_post="item.id_post"
        :header="item.header"
        :name="item.name"
        :date="item.create_data"
        :image="item.main_picture"
        :is-my-posts-page="false"
    />
    <h3 v-else>
      Не нашли новостей или статей для вас :(
    </h3>
  </div>
</template>

<style scoped>
  .info_div {
    width: 100%;
  }
  .posts {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 12px;
    gap: 24px;
  }
  
  @media screen and (max-width: 1400px) {
    .posts {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media screen and (max-width: 1050px) {
    .posts {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media screen and (max-width: 768px) {
    .posts {
      grid-template-columns: repeat(1, 1fr);
    }
  }
</style>
