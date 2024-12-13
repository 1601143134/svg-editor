<template>
  <g 
    :transform="`rotate(${rect.rotate},${rect.x + rect.width / 2},${rect.y + rect.height / 2}) ${translate}`">
    <rect 
      v-if="type == 1 || type == 3" 
      :width="rect.width" 
      :height="rect.height" 
      :rx="rect.rx" 
      :ry="rect.rx" 
      :fill="rect.fill"
      :stroke="rect.stroke"
      :stroke-width="rect.strokeWidth"
      >
      <tspan x="150" dy="0">第一行</tspan>
      <tspan x="150" dy="20">第二行</tspan>
      <tspan x="150" dy="20">第三行</tspan>
    </rect>
    <ellipse
     v-if="type == 2" 
     :cx="rect.cx" 
     :cy="rect.cy" 
     :rx="rect.rx" 
     :ry="rect.ry" 
     :fill="rect.fill"
     :stroke="rect.stroke"
      :stroke-width="rect.strokeWidth"></ellipse>
    <polygon
    v-if="type == 4" 
    :points="rect.points" 
    :fill="rect.fill"
    :stroke="rect.stroke"
      :stroke-width="rect.strokeWidth"/>
    
  </g>
</template>

<script setup lang="ts">
import { ref,reactive,onMounted,computed,watch } from "vue"
interface Rect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
  fill?: string;
  cx: number;
  cy: number;
  r: number;
  type: number;
  rotate: number;
  transform: string;
  points?: string;
  origin?: Object;
  translate?: {x: number, y: number};
}

interface Graphic {
  rect: Rect;
  type: number;
  id: string;
}

const props = defineProps<Graphic>()

let rotate = ref('')
let translate = computed(() => {
  if(props.type == 1 || props.type == 3) {
    return `translate(${props.rect.x},${props.rect.y})`
  }else{
    return `translate(${props.rect.translate.x},${props.rect.translate.y})`
  }
})


</script>

<style lang="less" scoped>

</style>
