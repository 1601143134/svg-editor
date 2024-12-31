<template>
  <g>
    <path class="line" :d="line.attrs.d" fill="none" :marker-end="`url(#${line.id})`"></path>
    <path class="hover-line" :d="line.attrs.d" fill="none"></path>
  </g>
</template>

<script setup>

import { onMounted,watch } from 'vue';
defineOptions({
  name: 'customLine'
})
const props = defineProps({
  line: Object
})
watch(() => props.line,(n) => {
  console.log(n,'pros---------------')
})
</script>

<style lang="less" scoped>
.line {
  stroke: rgb(177, 177, 183);
  // stroke: rgb(20, 123, 227);
  fill: none;
  stroke-width: 2px;
  &:hover{
    // stroke: rgb(26, 226, 160);
    cursor: pointer;
  }
}
.hover-line{
  stroke: transparent;
  fill: none;
  stroke-width: 8px;
  z-index: 9;
  &:hover{
    // stroke: rgb(26, 226, 160);
    cursor: pointer;
  }
}
</style>
