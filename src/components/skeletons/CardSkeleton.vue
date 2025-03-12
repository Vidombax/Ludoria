<template>
  <el-skeleton style="width: 340px; margin-left: 25px;" animated>
    <template #template>
      <el-skeleton-item variant="p" style="width: 50%" />
      <el-skeleton-item variant="image" style="width: 340px; height: 240px" />
      <div style="padding: 14px; display: flex; flex-direction: column; gap: 24px;">
        <div
            style="
            display: flex;
            align-items: center;
            justify-content: space-evenly;
          "
        >
          <el-skeleton-item variant="text" style="width: 30%" />
          <el-skeleton-item variant="text" style="width: 30%" />
        </div>
        <div
            style="
            display: flex;
            align-items: center;
            justify-content: space-evenly;
          "
        >
          <el-skeleton-item variant="text" style="width: 30%" />
          <el-skeleton-item variant="text" style="width: 30%" />
        </div>
      </div>
    </template>
  </el-skeleton>
</template>