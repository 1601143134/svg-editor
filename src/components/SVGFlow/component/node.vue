<template>
  <g 
    :transform="`rotate(${rect.rotate},${rect.x + rect.width / 2},${rect.y + rect.height / 2}) ${translate}`">
    <rect 
      v-if="type == 'RoundedRect'" 
      :width="rect.width" 
      :height="rect.height" 
      :rx="rect.rx" 
      :ry="rect.rx" 
      :fill="rect.fill"
      :stroke="rect.stroke"
      :stroke-width="rect.strokeWidth"
      >
    </rect>
    <rect 
      v-if="type == 'Rect'" 
      :width="rect.width" 
      :height="rect.height" 
      :fill="rect.fill"
      :stroke="rect.stroke"
      :stroke-width="rect.strokeWidth"
      >
    </rect>
    <!-- 椭圆 -->
    <ellipse
     v-if="type == 'Ellipse'" 
      :cx="rect.cx" 
      :cy="rect.cy" 
      :rx="rect.rx" 
      :ry="rect.ry" 
      :fill="rect.fill"
      :stroke="rect.stroke"
      :stroke-width="rect.strokeWidth"></ellipse>
    <!-- 菱形 -->
    <polygon
      v-if="type == 'Polygon'" 
      :points="rect.points" 
      :fill="rect.fill"
      :stroke="rect.stroke"
      :stroke-width="rect.strokeWidth"/>

      <text v-if="type == 1 || type == 3" class="select-none" :transform="matrixTransform" font-size="12" text-anchor="middle">
        Hello, SVG 
      </text>
      <text v-else class="select-none" :transform="matrixTransform" font-size="12" text-anchor="middle">
        Hello, SVG 
      </text>
    
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
  type: string;
  rotate: number;
  transform: string;
  points?: string;
  origin?: Object;
  translate?: {x: number, y: number};
}

interface Graphic {
  rect: Rect;
  type: string;
  id: string;
  outterLines: Array<string | null>,
  innerLines: Array<string | null>,
}

const props = defineProps<Graphic>()

let rotate = ref('')
let translate = computed(() => {
  if(props.type == 'RoundedRect' || props.type == 'Rect') {
    // 矩形
    return `translate(${props.rect.x},${props.rect.y})`
  }else{
    return `translate(${props.rect.translate.x},${props.rect.translate.y})`
  }
})

let textTranslate = computed(() => {

  return `translate(${props.rect.x},${props.rect.y})`
})

let matrixTransform = computed(() => {
  if(props.type == 'RoundedRect' || props.type == 'Rect') {
    // 矩形
    return `matrix(1,0,0,1,${props.rect.width / 2},${props.rect.height / 2})`
  }else{
    return `matrix(1,0,0,1,${props.rect.cx},${props.rect.cy})`
  }
  
})


</script>

<style lang="less" scoped>
.textbox{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  div{
    text-align: center;
    user-select: none;
  }
}
.select-none{
  user-select: none;
}
</style>
