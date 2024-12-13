<template>
  <g
    :class="[ hidden ? 'visibility-hidden' : '' ]"
    :transform="`rotate(${resizeBox.r},${resizeBox.x + resizeBox.w / 2},${resizeBox.y + resizeBox.h / 2})`"  
    v-if="isResize" 
    class="top"
    @mousedown.stop="tirggerOperate"
  >
    <rect dir="move" :x="resizeBox.x" :y="resizeBox.y" :width="resizeBox.w" :height="resizeBox.h" fill="rgba(0,0,0,0)" stroke="rgb(20, 123, 227)"></rect>
    <rect  dir="lt" :x="resizeBox.x - (10/2)" :y="resizeBox.y - (10/2)" width="10" height="10" fill="white" stroke="rgb(20, 123, 227)" class="left-top"></rect>
    <rect dir="rt" :x="resizeBox.x + resizeBox.w - (10/2)" :y="resizeBox.y - (10/2)" width="10" height="10" fill="white" stroke="rgb(20, 123, 227)" class="right-top"></rect>
    <rect dir="rb" :x="resizeBox.x + resizeBox.w - (10/2)" :y="resizeBox.y + resizeBox.h - (10/2)" width="10" height="10" fill="white" stroke="rgb(20, 123, 227)" class="right-bottom"></rect>
    <rect dir="lb" :x="resizeBox.x - (10/2)" :y="resizeBox.y + resizeBox.h - (10/2)" width="10" height="10" fill="white" stroke="rgb(20, 123, 227)" class="left-bottom"></rect>
    <image dir="rotate" :x="resizeBox.x - 30" :y="resizeBox.y - 25" :transform="`rotate(35,${(resizeBox.x - 30) + 15},${(resizeBox.y - 25) + 15})`" width="30" height="30" href="../../../assets/旋转.png" ></image>
  </g>
</template>

<script setup>
import { ref,reactive,onMounted,computed } from "vue"
let hidden = ref(false)
const props = defineProps({
  resizeBox: Object
})

const tirggerOperate = () => {

}

const onResizeStartMove = () => {

}
</script>

<style lang="less" scoped>

</style>
