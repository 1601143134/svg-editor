<template>
  <g>
    <circle :cx="circle?.cx" :cy="circle?.cy" :r="circle?.r" :fill="circle?.fill"></circle>
  </g>
</template>

<script setup lang="ts">
import { ref,reactive,onMounted,computed } from "vue"
interface Circle {
  cx: number;
  cy: number;
  r: number;
  fill?: string;
  text?: string;
}

const props = defineProps<Circle>()

</script>

<style lang="less" scoped>

</style>
