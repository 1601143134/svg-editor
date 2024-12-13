<template>
  <div ref="toolBar" class="tool-bar" :style="{ 
    left: '0px',top: '0px',
    transform: `translate3d(${toolBarRect.x}px,${toolBarRect.y}px,0) scale(${1})`
    }">
    <div @mousedown="onToolMove" class="block">
      <div class="handle" />
    </div>
    <div 
      v-for="(item, index) in rectInfo" 
      :key="index" 
      @click.stop="onToolBar(item)" 
      class="block" 
      :class="[ createType.type == item.type ? 'active' : '']">
      <div class="add-block">
        <img :src="requireImg(item.imgUrl)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted,computed } from "vue"

</script>

<style lang="less" scoped>

</style>
