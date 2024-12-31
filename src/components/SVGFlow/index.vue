<template>
  <!-- @mousemove="throttleMove" -->
<div 
  ref="svgWrapperRef" 
  class="wrapper"
  @mousedown="onStageMousedown"
  @mouseup="onMouseup">
  <button style="position: fixed;" @click="btnClick">计算</button>
  <div @click="findFixPoint" ref="ball" class="ball"></div>
  <div class="attrs-box">
    <div>X: {{ resizeBox.x.toFixed(2) }}</div>
    <div>Y: {{ resizeBox.y.toFixed(2) }}</div>
    <div>宽：{{ resizeBox.w.toFixed(2) }}</div>
    <div>高：{{ resizeBox.h.toFixed(2) }}</div>
    <div>角度：{{ resizeBox.r.toFixed(2) }}</div>
    <div>缩放倍数：{{ scale }}</div>
  </div>
  <svg
    id="svgElement"
    ref="svgRef"
    class="svg-element"
    :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
    @wheel="handleWheel"
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 定义箭头标记 -->
    <defs>
      <!-- <marker v-for="line in lineArry" :key="line.id" :id="line.id" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 12 3.5, 0 7" fill="rgb(177, 177, 183)" />
      </marker> -->
      <marker v-for="line in lineArry" :key="line.id" :id="line.id" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto">
        <polygon points="0 0, 6 1.75, 0 3.5" fill="rgb(177, 177, 183)" />
      </marker>
    </defs>
    <customLine
      v-for="(l) in lineArry"
      :key="l.id"
      :line="l" 
      @mousedown.stop="onPathSelected($event,l)"
    ></customLine>
    <node 
      v-for="(n) in nodeArry" 
      :key="n.id" 
      :rect="n.rect" 
      :type="n.type" 
      :id="n.id"
      :outter-lines="n.outterLines"
      :inner-lines="n.innerLines"
      @mousedown.stop="onClickNode($event,n)"
      @mouseover="onHoverNode(n)"
      @mouseleave="onMouseleaveNode(n)" 
    />

    <!-- <path d="M 100,100 C 200,100 200 200 200 200" fill="transparent" stroke="black" stroke-width="2"/> -->
    <!-- <path d="M 50 50 Q 150 150, 250 150" fill="transparent" stroke="black" stroke-width="2"/> -->
    <!-- resize -->
    <g 
      v-show="isResize" 
      :transform="`rotate(${resizeBox.r},${resizeBox.x + resizeBox.w / 2},${resizeBox.y + resizeBox.h / 2})`"  
      class="top"
      @mousedown.stop="tirggerOperate"
      :class="{ 'visibility-hidden': hidden }"
    >
      <image dir="rotate" :x="resizeBox.x - 25" :y="resizeBox.y - 25" :transform="`rotate(35,${(resizeBox.x - 30) + 10},${(resizeBox.y - 25) + 10})`" width="23" height="23" href="../../assets/旋转.png" ></image>
      <rect dir="move" :x="resizeBox.x" :y="resizeBox.y" :width="resizeBox.w" :height="resizeBox.h" fill="none" stroke="rgb(20, 123, 227)"></rect>
      <!-- 操作点 -->
      <rect 
        v-for="(point) in operatePoint" :key="point.name"
        :style="{ cursor: point.cursor }"
        :x="point.x" 
        :y="point.y" 
        :dir="point.name"
        width="10"
        height="10" 
        fill="white" 
        stroke="rgb(20, 123, 227)"
      ></rect>
    </g>

    <g
      @mouseover="isNodeHover = true"
      v-show="isNodeHover" 
      :transform="`rotate(${hoverNode.r},${hoverNode.x + hoverNode.w / 2},${hoverNode.y + hoverNode.h / 2})`"  
    >
      <ellipse
        @mousedown.stop="onConnectPtDown($event, p,'connect')"
        @mouseover="onAcitveHoverP(p)"
        @mouseleave="onMouseleaveNode"
        v-for="(p) in connectPoint" 
        :key="p.name" 
        :cx="p.x" 
        :cy="p.y" 
        :rx="5" 
        :ry="5" 
        :fill="activeHoverPName == p.name ? 'rgb(20, 123, 227)' : 'white'" 
        stroke="rgb(20, 123, 227)"
      ></ellipse>
    </g>

    <!-- 线条操作点 -->
     <g
      v-show="lineSelected"
      :class="{ 'visibility-hidden': isMoveLine }"
     >
        <ellipse
          @mousedown.stop="onLineOptDown($event, line)"
          v-for="(line) in lineOperate" 
          :key="line.name" 
          :cx="line.pt.x" 
          :cy="line.pt.y" 
          :rx="5" 
          :ry="5" 
          :fill="'rgb(20, 123, 227)'" 
          stroke="rgb(20, 123, 227)"
          style="cursor: pointer;"
        ></ellipse>
     </g>

  </svg>
  <!-- 工具栏 -->
  <div 
    ref="toolBar" 
    class="tool-bar" 
    :style="{ 
      left: '0px',top: '0px',transform: `translate3d(${toolBarRect.x}px,${toolBarRect.y}px,0) scale(${1})`
    }">
    <div @mousedown="onToolMove" class="block">
      <div class="handle" />
    </div>
    <div 
      class="block" 
      v-for="(item, index) in rectInfo" 
      :key="index" 
      :class="[ createType.type == item.type ? 'active' : '']"
      @mousedown.stop="onToolBar(item)">
      <div class="add-block">
        <img v-if="item.imgUrl" :src="requireImg(item.imgUrl)" />
        <!-- <svg v-else>
          <path :d="item.d" fill="none" stroke="rgb(108,109,110)" stroke-width="2"></path>
        </svg> -->
      </div>
    </div>
  </div>

  <!-- 连线框：鼠标移入时出现 -->
  <div class="connect-box">
    <div class="top-c"></div>
    <div class="right-c"></div>
    <div class="bottom-c"></div>
    <div class="left-c"></div>
  </div>

  <div class="rotate"></div>

  <!-- <div class="attrs-wrapper">

  </div> -->
</div>
</template>

<script setup>
// 思考：坐标系放大，scale = 1.5 坐标原本1px的距离是不是也会跟着放大？
import originOperate from './utils/operate-point'
import { ref,reactive,onMounted,computed,watch,onUnmounted } from "vue"
import { useElementBounding,useMagicKeys,onKeyDown, set } from '@vueuse/core'
import node from './component/node.vue'
import customLine from './component/line.vue'
import { v4 as uuidv4 } from 'uuid'
import { 
lineAngle,
radianToAngle,
lineRadian,
rotate,
distance,
angleToRadian,
midpoint,
verticalLinePoint,
startEndPointToLine,
pointOnLine,
getRotateAngle,
getRectangleVertices,
isOutsideRoundedCircle,
circleVerticalIntersect,
circleHorizontalIntersect,
isInsideEllipse,
getIncreaseSize } from "./utils/helper"
import { 
isPointOnLine,
getFootOfPerpendicular,
drawLine,
getEdge,
verticalIntersection, 
createCubicBezierPath,
horizontalIntersection } from "./utils/createpath"
import { eventBus as bus } from './utils/eventBus'
defineOptions({
name: 'SvgComponent',
})
const eventBus = new bus()
const setEventBus = () => {
eventBus.$on('resize-node', updateLineOfResize)
// eventBus.$on('rotate-node',)
eventBus.$on('move-node',updateLineOfXY)
// eventBus.$on('delete-node',)


// eventBus.$on('move-line',)
// eventBus.$on('delete-line',)
}
const svgWrapperRef = ref(null);
const svgRef = ref(null)
const viewBox = ref({
x: 0,
y: 0,
width: 0,
height: 0,
});
let targetNode = null
let tempNode = null
let tempLine = null
let nodeArry = ref([])
const btnClick = () => {

}
let lineArry = ref([])
let isMoveLine = ref(false)
// 设置大小
let isResize = ref(false)
let resizeDirection = ''
let resizePoint = { x: 0,y: 0 }
let resizeBox = ref({
x: 0,
y: 0,
w: 0,
h: 0,
r: 0
})

// 连线
let lineSelected = ref(false)
let lineOperate = ref([])
let cnStartNode = null
let cnTargetNode = null
let isNodeHover = ref(false)
let isReadyConnect = ref(false)
let hoverNode = ref({
x: 0,
y: 0,
w: 0,
h: 0,
r: 0,
id: ''
})
let activeHoverPName = ref('')
const onAcitveHoverP = (p) => {
activeHoverPName.value = p.name
}

let resizeActivePtName = ref('')
const onResizeActPt = (p) => {
resizeActivePtName.value = p.name
}

let startPoint = ref({x: 0, y: 0})
let lastPoint = ref({x: 0, y: 0})
let toolBarRect = ref({x: 600, y: 35, ox: 0,oy: 0})
let toolHandleMove = ref(false)
let toolBar = ref(null)
let createType = ref({
name: '',
type: null,
imgUrl: ''
})
let isOnConnect = ref(false)
let isOnCreate = ref(false)  // 选择创建类型
let isAddNew = ref(false)    // 已添加了图形，未开始绘制
let isDraw = ref(false)

const setViewPort = () => {
if (!svgWrapperRef.value) return;
viewBox.value.width = svgWrapperRef.value.offsetWidth;
viewBox.value.height = svgWrapperRef.value.offsetHeight;
};
onMounted(() => {
setViewPort();
setEventBus();
svgRef.value.addEventListener('mousemove', throttleMove)
});

onUnmounted(() => {
svgRef.value.removeEventListener('mousemove', throttleMove)
})
// 鼠标滚轮
const { ctrl, shift, Delete } = useMagicKeys()
watch(Delete, (n) => {
if(n && tempNode && tempNode.id) {
  for(let i=0;i<nodeArry.value.length;i++) {
    const node = nodeArry.value[i]
    if(node.id == tempNode.id) {
      nodeArry.value.splice(i,1)
      isResize.value = false
      break
    }
  }
}
})
let scale = ref(1), min = 0.2, max = 5, step = 30
function handleWheel(e) {
e.preventDefault();
if(shift.value) {
  if(e.deltaY > 0) {
    viewBox.value.x += (step * scale.value)
  }else{
    viewBox.value.x -= (step * scale.value)
  }
}else if(!ctrl.value) {
  if(e.deltaY > 0) {
    viewBox.value.y += (step * scale.value)
  }else{
    viewBox.value.y -= (step * scale.value)
  }
}else{
  zoomViewPort(e);
}

}

function zoomViewPort(e) {
let startClient = {
  x: e.clientX,
  y: e.clientY
}
// // 将屏幕坐标转换为 SVG 坐标
let newSVGPoint = svgRef.value.createSVGPoint()
newSVGPoint.x = startClient.x
newSVGPoint.y = startClient.y

let CTM = svgRef.value.getScreenCTM()
let startSVGPoint = screen2svg(e.clientX, e.clientY)
// let r = 1.1
let r = 1.05
if (e.deltaY < 0) {
  r = 1/1.05
}
const _scale = scale.value * r;
if (_scale > max) {
  r = max / scale.value;  
  scale.value = max;
} else if (_scale < min) {
  r = min / scale.value;  
  scale.value = min;
} else {
  scale.value = _scale;
}
svgRef.value.setAttribute('viewBox', `${viewBox.value.x} ${viewBox.value.y} ${viewBox.value.width * r} ${viewBox.value.height * r}`)

CTM = svgRef.value.getScreenCTM()
let moveToSVGPoint = newSVGPoint.matrixTransform(CTM.inverse())

let delta = {
  dx: startSVGPoint.x - moveToSVGPoint.x,
  dy: startSVGPoint.y - moveToSVGPoint.y
}

let middleViewBox = svgRef.value.getAttribute('viewBox').split(' ').map( n => parseFloat(n))
updateViewPort(middleViewBox[0] + delta.dx, middleViewBox[1] + delta.dy, middleViewBox[2], middleViewBox[3]);
}

function updateViewPort(x,y,w,h) {
viewBox.value.x = x 
viewBox.value.y = y 
viewBox.value.width = w 
viewBox.value.height = h 
}


// 点击舞台
const onStageMousedown = (e) => {
console.log('stage----onMousedown')
startPoint.value.x = e.clientX;
startPoint.value.y = e.clientY;
const start = screen2svg(e.clientX, e.clientY)
if(isOnCreate.value) {
  if(createType.value.type !== 'vertical' && createType.value.type !== 'Cubic') {
    isAddNew.value = true
    nodeArry.value.push(createNode())
    tempNode = nodeArry.value[nodeArry.value.length - 1]
    svgWrapperRef.value.addEventListener('mousemove', moveCreateNode)
  }else{
    // isReadyConnect.value = true
    // connectType = 2
    // lineArry.value.push(createLine(createType.value.type, start))
    // tempLine = lineArry.value[lineArry.value.length - 1]
    // svgWrapperRef.value.addEventListener('mousemove', moveConnect)
  }
}else if(isOnConnect.value) {
  isReadyConnect.value = true
  connectType = 2
  lineArry.value.push(createLine(createType.value.type, start))
  tempLine = lineArry.value[lineArry.value.length - 1]
  svgWrapperRef.value.addEventListener('mousemove', moveConnect)
}
lineSelected.value = false
isResize.value = false
if(tempNode && !isOnCreate.value) tempNode = null
if(tempLine && !isOnConnect.value) tempLine = null
}



const onPathSelected = (e, line) => {
console.log(line,' selected line ---------')
tempLine = line
lineSelected.value = true
lineOperate.value = [
  {
    name: 'start' + line.id,
    pt: line.attrs.start,
    type: 1,
  }, 
  {
    name: 'end' + line.id,
    pt: line.attrs.end,
    type: 2,
  },
]
}

const onClickNode = (e,node) => {
console.log(node,'onClickNode---')
if(!isResize.value) {
  isResize.value = true
}
if(lineSelected.value) {
  lineSelected.value = false
}
tempNode = node
// 设置操作框的大小
setResizeBox(
  tempNode.rect.x,
  tempNode.rect.y,
  tempNode.rect.width,
  tempNode.rect.height,
  tempNode.rect.rotate
)
setOperatePoint(originOperate, tempNode)
if(!controlMove.value) {
  controlMove.value = true
  const start = screen2svg(e.clientX, e.clientY)
  startPoint.value = start
  svgWrapperRef.value.addEventListener('mousemove', moveNode)
}



if(isNodeHover.value){
  isNodeHover.value = false
  hoverNode.value.id = ''
  targetNode = null
  connectPts = null
}
e.preventDefault()
}

const onMouseup = (e) => {
if(toolHandleMove.value) toolHandleMove.value = false

// 线条
if(isReadyConnect.value) {
  // 创建了没移动鼠标
  if(!isMoveLine.value) {
    lineArry.value.splice(lineArry.value.length - 1, 1)
  }else{
    // 将line放进targetNode和outterNode
    if(cnStartNode) {
      tempLine.node.parentNodeId = cnStartNode.id
      cnStartNode.outterLines.push(tempLine.id)
      cnStartNode = null
    }else{
      console.log('没有cnStartNode')
    }
    if(targetNode && connectType == 2) {
      tempLine.node.targetNodeId = targetNode.id
      targetNode.innerLines.push(tempLine.id)
      targetNode = null
    }else{
      console.log('没有targetNode')
    }
  }
  // connectType = -1
  isReadyConnect.value = false
  isMoveLine.value = false
  // isOnConnect.value = false
}

if(isOnCreate.value && isAddNew.value) {
  // 检验是否创建模式 按下 并没有移动鼠标设置大小
  if(!isDraw.value) {
    nodeArry.value.splice(nodeArry.value.length - 1, 1)
  }else{
    isDraw.value = false
    isOnCreate.value = false
    createType.value = {name: '', type: '', imgUrl: ''}
    setResizeBox(
      tempNode.rect.x,
      tempNode.rect.y,
      tempNode.rect.width,
      tempNode.rect.height,
      tempNode.rect.rotate
    )
    // setOperatePoint(originOperate, tempNode)
    isResize.value = true
  }
  isAddNew.value = false
  svgWrapperRef.value.removeEventListener('mousemove', moveCreateNode)
}

if(isResize.value && resizeDirection) {
  resizeDirection = ''
  
}

if(controlMove.value) {
  controlMove.value = false
  
}

if(hidden.value) {
  hidden.value = false
}

if(isRotate) {
  isRotate = false
  
}
connectType = -1
svgWrapperRef.value.removeEventListener('mousemove', moveResize)
svgWrapperRef.value.removeEventListener('mousemove', moveRotate)
svgWrapperRef.value.removeEventListener('mousemove', moveNode)
svgWrapperRef.value.removeEventListener('mousemove', moveTool)
svgWrapperRef.value.removeEventListener('mousemove', moveConnect)

// console.log(tempNode,'mouseUp---tempNode')
}
const rotateDiff = {
'left': 270,
'bottom': 180,
'right': 90,
'top': 0
}
function isInside(p, c, w, h, angle) {
const { x: px, y: py } = p
const { x: cx, y: cy } = c
// 将角度转换为弧度
const radian = angle * Math.PI / 180;

// 1. 将点相对于矩形中心平移
const dx = px - cx;
const dy = py - cy;

// 2. 逆旋转点，顺时针旋转角度 -angle
const rotatedX = dx * Math.cos(radian) + dy * Math.sin(radian);
const rotatedY = -dx * Math.sin(radian) + dy * Math.cos(radian);

// 3. 判断点是否在未旋转矩形内
return Math.abs(rotatedX) <= w / 2 && Math.abs(rotatedY) <= h / 2;
}
let isIns = false
let connectPts = null, curMouse = null
// 屏幕移动
const move = (e) => {
e.preventDefault();
lastPoint.value.x = e.clientX
lastPoint.value.y = e.clientY
let cornors = null, rect = null, center = null
curMouse = screen2svg(e.clientX, e.clientY)

if(controlMove.value || isResize.value) return
if(isOnCreate.value) return
for (let i = nodeArry.value.length - 1; i >= 0; i--) {
  const node = nodeArry.value[i]
  if(tempLine && (node.outterLines.includes(tempLine.id) || node.innerLines.includes(tempLine.id))) {
    isNodeHover.value = false
    hoverNode.value.id = ''
    targetNode = null
    connectPts = null
    continue
  }
  rect = node.rect
  center = getCenter(rect)

  cornors = getRotatedRect(rect)
  isIns = isInside(curMouse, center, rect.width + 25, rect.height + 25, rect.rotate)
  // console.log(isIns,'ins')
  if(isIns) {
    if(hoverNode.value.id == node.id) {
      break
    }
    // 显示连接点
    connectPts = getConnectPoint(originOperate, node)
    setHoverBox(rect.x, rect.y, rect.width, rect.height, rect.rotate, node.id)
    connectPoint.value = connectPts
    isNodeHover.value = true
    targetNode = node
    break
  }else{
    if(isNodeHover.value) {
      isNodeHover.value = false
      hoverNode.value.id = ''
      targetNode = null
      connectPts = null
    }
  }
}
}



// 求圆角矩形的四个圆心
function getArcCenters(x1, y1, w, h, r) {
return [
  { x: x1 + r, y: y1 + r },
  { x: x1 + w - r, y: y1 + r },
  { x: x1 + w - r, y: y1 + h - r },
  { x: x1 + r, y: y1 + h - r }
]
}

// 拖动更新line位置
const updateLineOfXY = (info) => {
const[ node, diff ] = info
node.outterLines.forEach(id => {
  for(let i = 0; i < lineArry.value.length; i++) {
    let line = lineArry.value[i]
    const { attrs } = line
    if(line.id == id) {
      line.attrs.start.x += diff.x
      line.attrs.start.y += diff.y
      if(!line.node.targetNodeId) {
        line.attrs.endDirection = oppsite[getLineDir(getRotateAngle(line.attrs.start, line.attrs.end))]
        line.attrs.ORI_END = line.attrs.endDirection
      }
      const lineInfo = drawPath(line.type,attrs.start, attrs.end, attrs.startDirection, attrs.endDirection)
      line.attrs.d = lineInfo.d
    }
  }
})
node.innerLines.forEach(id => {
  for(let i = 0; i < lineArry.value.length; i++) {
    let line = lineArry.value[i]
    const { attrs } = line
    if(line.id == id) {
      line.attrs.end.x += diff.x
      line.attrs.end.y += diff.y
      if(!line.node.parentNodeId) {
        line.attrs.startDirection = oppsite[getLineDir(getRotateAngle(line.attrs.end, line.attrs.start))]
        line.attrs.ORI_START = line.attrs.startDirection
      }
      const lineInfo = drawPath(line.type,attrs.start, attrs.end, attrs.startDirection, attrs.endDirection)
      line.attrs.d = lineInfo.d
    }
  }
})
}

const dirIndex = {
'top':'0',
'right': '1',
'bottom': '2',
'left': '3'
}

// resize更新line位置
const updateLineOfResize = (info) => {
const [ node ] = info
const center = getCenter(node.rect)
node.outterLines.forEach(id => {
  for(let i = 0; i < lineArry.value.length; i++) {
    let line = lineArry.value[i]
    if(line.id == id) {
      const { attrs } = line
      let connectPts = getConnectPoint(originOperate, node)
      let p = connectPts[dirIndex[line.attrs.ORI_START]]
      let newPt = rotate(p, node.rect.rotate, center)
      let lineInfo = drawPath(line.type,newPt, attrs.end, attrs.startDirection, attrs.endDirection)
      line.attrs.start = newPt
      line.attrs.d = lineInfo.d
    }
  }
})
node.innerLines.forEach(id => {
  for(let i = 0; i < lineArry.value.length; i++) {
    let line = lineArry.value[i]
    if(line.id == id) {
      const { attrs } = line
      let connectPts = getConnectPoint(originOperate, node)
      let p = connectPts[dirIndex[line.attrs.ORI_END]]
      let newPt = rotate(p, node.rect.rotate, center)
      let lineInfo = drawPath(line.type,attrs.start, newPt, attrs.startDirection, attrs.endDirection)
      line.attrs.end = newPt
      line.attrs.d = lineInfo.d
    }
  }
})
}

const getNewEdge = (angle) => {
const direction = ['top','right','bottom','left']
if (angle > 315 || angle <= 45) return direction[1]; // right
if (angle > 45 && angle <= 135) return direction[2]; // bottom
if (angle > 135 && angle <= 225) return direction[3]; // left
if (angle > 225 && angle <= 315) return direction[0]; // top
}


const onHoverNode = (node) => {

}

const onMouseleaveNode = (node) => {
// isNodeHover.value = false
activeHoverPName.value = ''
}

const getCenter = (rect) => {
return {
  x: rect.x + (rect.width / 2),
  y: rect.y + (rect.height / 2)
}
}

const getLineDir = (angle) => {
const direction = ['top','right','bottom','left']
if (angle > 315 || angle <= 45) return direction[3]; // right
if (angle > 45 && angle <= 135) return direction[0]; // bottom
if (angle > 135 && angle <= 225) return direction[1]; // left
if (angle > 225 && angle <= 315) return direction[2]; // top
}
const oppsite = {
'right': 'left',
'left': 'right',
'bottom': 'top',
'top': 'bottom',
}

const onLineOptDown = (e, line) => {
e.preventDefault();
connectType = line.type
svgWrapperRef.value.addEventListener('mousemove', moveConnect)
console.log(line,'onLineOptDown')
isReadyConnect.value = true
isMoveLine.value = true
}



const onConnectPtDown = (e, pt, type) => {
e.preventDefault()
if(!isReadyConnect.value) {
  hidden.value = true
  isReadyConnect.value = true
  // 考虑旋转，判断是在哪个方向的边上
  cnStartNode = nodeArry.value.find(n => n.id === pt.id)
  const { rect } = cnStartNode
  const center = getCenter(rect)
  // 获取开始连线的node，确定起始位置，需要考虑旋转，这里先不考虑旋转下的矩形
  let start = rotate({ x: pt.x, y: pt.y}, rect.rotate, center)
  let oriDir = (rect.rotate + rotateDiff[pt.name]) % 360
  let dir = getEdge(oriDir)
  lineArry.value.push(createLine(createType.value.type,start, dir, pt.name, pt.id))
  tempLine = lineArry.value[lineArry.value.length - 1]
  svgWrapperRef.value.addEventListener('mousemove', moveConnect)
  connectType = 2
  // console.log(tempLine,'tempLine----------')
}
}


let ball = ref(null)
let isRotate = false
let initPoint = { x:0, y:0 }
let oppositePoint = { x:0, y:0 }
let lineCenter = { x:0, y:0 }
let operatePoint = ref([])
let connectPoint = ref([])
// resizeBox的连接点，单独出来一个
let resizeConnectPt = ref([])



const setOperatePoint = (pArry = [], node) => {
const { rect } = node
operatePoint.value = pArry.map(p => {
  return {
    name: p.name,
    x: rect.x + (rect.width / 100) * p.position.x - 5,
    y: rect.y + (rect.height / 100) * p.position.y - 5,
    angle: p.angle,
    cursor: getCursor(rect.rotate + p.angle)
  }
})
}

const getConnectPoint = (pArry = [], node) => {
const { rect } = node
// console.log(rect,'rect------')
return pArry.map(p => {
  if(!p.name.includes('-')) {
    return {
      name: p.name,
      x: rect.x + (rect.width / 100) * p.position.x,
      y: rect.y + (rect.height / 100) * p.position.y,
      id: node.id
    }
  }
}).filter(p => p)
}

const getCursor = (angle) => {
let a = Math.abs(angle) % 360;
if (a >= 338 || a < 23 || (a > 157 && a <= 202)) {
  return "ew-resize";
} else if ((a >= 23 && a < 68) || (a > 202 && a <= 247)) {
  return "nwse-resize";
} else if ((a >= 68 && a < 113) || (a > 247 && a <= 292)) {
  return "ns-resize";
} else {
  return "nesw-resize";
}
};

const drawPath = (type,start,end,sdir,edir) => {
if(type == 'vertical') {
  return drawLine(start,end,sdir,edir)
}else if(type == 'Cubic') {
  return createCubicBezierPath(start,end,sdir,edir)
}
}


// 1: 线头 2：线尾
let connectType = -1
const moveConnect = throttle((e) => {
const areaTd = 10, direction = ['top', 'right', 'bottom', 'left']
let position = { x:0, y:0 }, endDir = null, ORI_DIRECTION = null
let LINE = null, isIntersect = false
if(!isMoveLine.value) isMoveLine.value = true
if(isResize.value) isResize.value = false
let curMouse = screen2svg(e.clientX,e.clientY)
/*
  1、线头：按住线头  
  2、线尾：创建、按住线尾
*/

if(connectType == 1) {
  endDir  = getLineDir(getRotateAngle(curMouse, tempLine.attrs.end))
    ORI_DIRECTION = endDir
  if(!tempLine.node.targetNodeId) {
    // 没有起始Node，方向需要判断
    tempLine.attrs.endDirection = oppsite[endDir]
    tempLine.attrs.ORI_END = oppsite[endDir]
  }
  
  cnStartNode = targetNode
  if(targetNode) {
    const { rect } = targetNode
    const center = getCenter(rect)
    if(connectPts && connectPts.length) {
      for(let j=0; j<connectPts.length; j++) {
        let p = rotate(connectPts[j], rect.rotate, center)
        if(distance(p, curMouse) <= 10) {
          ORI_DIRECTION = direction[j]
          endDir = getEdge((rect.rotate + rotateDiff[ORI_DIRECTION]) % 360)
          position = p
          isIntersect = true
          LINE = drawPath(
            tempLine.type,
            position,
            tempLine.attrs.end, 
            endDir,
            tempLine.attrs.endDirection,
          )
          break
        }
      }
    }
  }
  if(!isIntersect) {
    LINE = drawPath(
      tempLine.type,
      curMouse,
      tempLine.attrs.end, 
      endDir,
      tempLine.attrs.endDirection,
    )
    if(tempLine.node.parentNodeId) {
      // 删除Node,outterLines关联的id
      deleteLineIdOfNode(tempLine.node.parentNodeId,tempLine.id,'outterLines')
      tempLine.node.parentNodeId = ''
    }
  } 
  tempLine.attrs.d = LINE.d
  tempLine.attrs.start = LINE.begin
  tempLine.attrs.startDirection = endDir
  tempLine.attrs.ORI_START = ORI_DIRECTION
}else if(connectType == 2){
  endDir  = getLineDir(getRotateAngle(curMouse, tempLine.attrs.start))
  ORI_DIRECTION = endDir
  if(!tempLine.node.parentNodeId) {
    // 没有起始Node，方向需要判断
    tempLine.attrs.startDirection = oppsite[endDir]
    tempLine.attrs.ORI_START = oppsite[endDir]
  }
  if(targetNode) {
    const { rect } = targetNode
    const center = getCenter(rect)
    if(connectPts && connectPts.length) {
      for(let j=0; j<connectPts.length; j++) {
        let p = rotate(connectPts[j], rect.rotate, center)
        if(distance(p, curMouse) <= 10) {
          ORI_DIRECTION = direction[j]
          endDir = getEdge((rect.rotate + rotateDiff[ORI_DIRECTION]) % 360)
          position = p
          isIntersect = true
          LINE = drawPath(
            tempLine.type,
            tempLine.attrs.start, 
            position,
            tempLine.attrs.startDirection,
            endDir,
          )
          break
        }
      }
    }
  }
  if(!isIntersect) {
    LINE = drawPath(
      tempLine.type,
      tempLine.attrs.start, 
      curMouse,
      tempLine.attrs.startDirection,
      endDir,
    )
    if(tempLine.node.targetNodeId) {
      deleteLineIdOfNode(tempLine.node.targetNodeId,tempLine.id,'innerLines')
      tempLine.node.targetNodeId = ''
    }   
  } 
  tempLine.attrs.d = LINE.d
  tempLine.attrs.end = LINE.end
  tempLine.attrs.endDirection = endDir
  tempLine.attrs.ORI_END = ORI_DIRECTION
}

if(lineSelected.value && connectType !== -1) {
  lineOperate.value[0].pt = tempLine.attrs.start
  lineOperate.value[1].pt = tempLine.attrs.end
}
}, 20)

const deleteLineIdOfNode = (nodeId, lineId, arr) => {
for(let i=0; i<nodeArry.value.length; i++) {
  const node = nodeArry.value[i]
  if(node.id == nodeId) {
    for(let z=0; z<node[arr].length; z++) {
      const id = node[arr][z]
      if(id == lineId) {
        console.log('删除关联id')
        node[arr].splice(z, 1)
        return null
      }
    }
  }
}
}
const moveRotate = throttle((e) => {
if(!hidden.value) {
  hidden.value = true
}
const { rect } = tempNode
const center = getCenter(rect)
const cur = screen2svg(e.clientX, e.clientY)
let angle = calculateRotation(center.x, center.y, cur.x, cur.y, rect.width, rect.height)
// 吸附角度
const angleArry = [0, 45, 90, 135, 180, 225, 270, 315]
for(let i = 0; i < angleArry.length; i++) {
  if(Math.abs(angle - angleArry[i]) <= 4) {
    angle = angleArry[i]
    break
  }
}
let diffAngle = angle - tempNode.rect.rotate
tempNode.rect.rotate = angle
resizeBox.value.r = angle
// 更新线条方向
const direction = ['top', 'right', 'bottom', 'left']

// 获取四条边的中点
const centerOfLines = getConnectPoint(originOperate, tempNode)
const dirMap = new Map()
for(let i=0;i<centerOfLines.length;i++) {
  let p = rotate(centerOfLines[i], angle, center)
  // console.log(p,'旋转后中点')
  let dir = getNewEdge(getRotateAngle(p, center))
  dirMap.set(direction[i], dir)
}
tempNode.outterLines.forEach(id => {
  for(let i = 0; i < lineArry.value.length; i++) {
    const line = lineArry.value[i]
    const { attrs } = line 
    if(line.id == id) {
      const newPt = rotate(attrs.start, diffAngle, center)
      // const originPt = rotate(newPt, -angle, center)
      // 方式1：通过ORI_START/END 来判断，需要多个参数
      // const newDir = getNewEdge(getRotateAngle(newPt, center)) 
      const newDir = dirMap.get(attrs.ORI_START)
      const lineInfo = drawPath(line.type,newPt, attrs.end, newDir, attrs.endDirection)
      line.attrs.startDirection = newDir
      line.attrs.start = newPt
      line.attrs.d = lineInfo.d
      // 方式2（实测行不通）：通过斜率来判断点位于哪条边上不行，小数位太多计算的斜率与实际偏差太大，所以用偏转回0度进行计算，取斜率最近的
    }
  }
})

tempNode.innerLines.forEach(id => {
  for(let i = 0; i < lineArry.value.length; i++) {
    const line = lineArry.value[i]
    const { attrs } = line 
    if(line.id == id) {
      // 更新
      const newPt = rotate(attrs.end, diffAngle, center)
      // const newDir = getNewEdge(getRotateAngle(newPt, center)) 
      const newDir = dirMap.get(attrs.ORI_END)
      const lineInfo = drawPath(line.type,attrs.start, newPt, attrs.startDirection, newDir)
      line.attrs.endDirection = newDir
      line.attrs.end = newPt
      line.attrs.d = lineInfo.d
    }
  }
})
}, 20)
const moveNode = throttle((e) => {
if(!hidden.value) {
  hidden.value = true
}
const curMouse = screen2svg(e.clientX,e.clientY)
const diff = {
  x: curMouse.x - startPoint.value.x,
  y: curMouse.y - startPoint.value.y
}
tempNode.rect.x += diff.x
tempNode.rect.y += diff.y
resizeBox.value.x += diff.x
resizeBox.value.y += diff.y
startPoint.value = curMouse
tempNode.rect.translate.x += diff.x
tempNode.rect.translate.y += diff.y
// 圆形和菱形都是基于自身左上角进行偏移
setOperatePoint(originOperate, tempNode)
// updateLineOfXY(tempNode, diff)
eventBus.$emit('move-node', tempNode, diff)
}, 20)
const moveResize = throttle((e) => {
if(!hidden.value) {
  hidden.value = true
}
const { rect } = tempNode
// 鼠标坐标
let curMouse = screen2svg(e.clientX,e.clientY)
let size = null,
    line = null,
    vertical = null,
    opposite = null,
    newCenter = null,
    originResize = null,
    oriOppositePoint = null
// 四条边的中点
if(!resizeDirection.includes('-')) {
  const center = getCenter(rect)
  if(resizeDirection == 'top' || resizeDirection == 'bottom') {
    // 取右边的两个顶点，做垂直边
    const rightTop = {
      x: rect.x + rect.width,
      y: rect.y
    }
    const rotateRightTop = rotate(rightTop, resizeBox.value.r, center)
    const rightBottom = {
      x: rect.x + rect.width,
      y: rect.y + rect.height
    }
    const rotateRightBottom = rotate(rightBottom, resizeBox.value.r, center)
    line = startEndPointToLine(rotateRightTop, rotateRightBottom)
    if(resizeDirection == 'top') {
      opposite = rotate({ x: rect.x, y: rect.y + rect.height }, resizeBox.value.r, center)
    }else{
      opposite = rotate({ x: rect.x, y: rect.y }, resizeBox.value.r, center)
    }
    // 鼠标与垂边的垂点
    vertical = verticalLinePoint(line, curMouse)    
  }else{
    // 取下边的两个顶点，做垂直边 
    const rightBottom = {
      x: rect.x + rect.width,
      y: rect.y + rect.height
    }
    const rotateRightBottom = rotate(rightBottom, resizeBox.value.r, center)
    const LeftBottom = {
      x: rect.x,
      y: rect.y + rect.height
    }
    const rotateLeftBottom = rotate(LeftBottom, resizeBox.value.r, center)
    line = startEndPointToLine(rotateRightBottom, rotateLeftBottom)
    if(resizeDirection == 'right') {
      opposite = rotate({ x: rect.x, y: rect.y }, resizeBox.value.r, center)
    }else{
      opposite = rotate({ x: rect.x + rect.width, y: rect.y }, resizeBox.value.r, center)
    }
    // 鼠标与垂边的垂点
    vertical = verticalLinePoint(line, curMouse)
  }
  newCenter = midpoint(vertical, opposite)
  // 偏移回正角度
  originResize = rotate(vertical, -resizeBox.value.r, newCenter)
  oriOppositePoint = rotate(opposite, -resizeBox.value.r, newCenter)
  resizeDirection = dirReverse(originResize, oriOppositePoint, resizeDirection)
  size = generateSize(oriOppositePoint, originResize)
}
// 对角点
else{
  // 注意：锚点位置确定了，但是鼠标开始的落点不一定是锚点的位置，会有偏差，这里暂时假设就是锚点位置，直接求新中点
  // 鼠标位置 与 对角固定点求 中点
  const newCenter = midpoint(oppositePoint, curMouse)
  // 将鼠标点偏移回正角度
  const originMouse = rotate(curMouse, -resizeBox.value.r, newCenter)
  const oriOppositePoint = rotate(oppositePoint, -resizeBox.value.r, newCenter)
  size = generateSize(oriOppositePoint, originMouse)
}
setResizeBox(size.x, size.y, size.w, size.h, rect.rotate)
setNodeSize(tempNode, size.x, size.y,size.w, size.h)
setOperatePoint(originOperate,tempNode)

// 更新线条的位置
eventBus.$emit('resize-node', tempNode)

}, 20)
// 操作框
const tirggerOperate = (e) => {
const type = e.target.getAttribute('dir')
const { rect } = tempNode
if(type == 'rotate') {
  isRotate = true
  svgWrapperRef.value.addEventListener('mousemove', moveRotate)
}
else if(type == 'move') {
  if(!controlMove.value) {
    controlMove.value = true
    const start = screen2svg(e.clientX, e.clientY)
    startPoint.value = start
    svgWrapperRef.value.addEventListener('mousemove', moveNode)
  }
  // onResizeStartMove(e)
}
else{
  // 无论落点在哪里，找到锚点的具体位置，根据锚点进行计算
  // 如果是中点，取任意对角线
  // 1、确定对角点
  switch(type) {
    case 'right-bottom': 
      resizePoint.x = rect.x + rect.width
      resizePoint.y = rect.y + rect.height
      break;
    case 'bottom-left':
      resizePoint.x = rect.x
      resizePoint.y = rect.y + rect.height
      break;
    case 'top-right': 
      resizePoint.x = rect.x + rect.width
      resizePoint.y = rect.y
      break;
    case 'left-top': 
      resizePoint.x = rect.x
      resizePoint.y = rect.y
      break;
  }

  resizeDirection = type
  console.log(resizeDirection,'resizeDirection')

  const center = {
    x: rect.x + (rect.width / 2),
    y: rect.y + (rect.height / 2)
  }
  // resizePoint：旋转度数后的锚点位置
  const p = rotate(resizePoint, resizeBox.value.r, center)
  // 对角点：resize时候对角点位置保持不变，锚点位置不断改变
  oppositePoint = calculateOtherEndpoint(center, p)
  svgWrapperRef.value.addEventListener('mousemove', moveResize)

}
}

let controlMove = ref(false)
const onResizeStartMove = (e) => {
if(!controlMove.value) {
  controlMove.value = true
  const start = screen2svg(e.clientX, e.clientY)
  startPoint.value = start
}
}


let hidden = ref(false)


const dirReverse = (p1,p2,dir) => {
if(dir == 'top' || dir == 'bottom') {
  return p1.y > p2.y ? 'bottom' : 'top'
}else if(dir == 'left' || dir == 'right'){
  return p1.x > p2.x ? 'right' : 'left'
}
}

// 求矩形旋转后四个顶点坐标
function getRotatedRect(rect) {
// 为了加大移入范围加上10，左右两边就是20
const area = 0
const x = rect.x - area
const y = rect.y - area
const width = rect.width + area
const height = rect.height + area
const angleRad = (rotate * Math.PI) / 180; // 转角度为弧度

// 计算矩形中心点
const cx = x + width / 2;
const cy = y + height / 2;

// 矩形的四个初始顶点（相对于左上角）
const corners = [
  { x: x, y: y },                 // 左上角
  { x: x + width, y: y },         // 右上角
  { x: x + width, y: y + height },// 右下角
  { x: x, y: y + height },        // 左下角
];

// 旋转每个顶点
return corners.map(({ x, y }) => ({
    x: cx + (x - cx) * Math.cos(angleRad) - (y - cy) * Math.sin(angleRad),
    y: cy + (x - cx) * Math.sin(angleRad) + (y - cy) * Math.cos(angleRad),
}));
}

// 计算矩形对角线另一端点坐标的函数
function calculateOtherEndpoint(midpoint, pointA) {
const x2 = 2 * midpoint.x - pointA.x;
const y2 = 2 * midpoint.y - pointA.y;
return { x: x2, y: y2 };
}

// 计算旋转角度
function calculateRotation(cx, cy, x, y, width, height) {
// 默认向量（未旋转时左上角相对中心点的向量）
const defaultAngle = Math.atan2(-height / 2, -width / 2);
// 当前向量（左上角相对中心点的向量）
const currentAngle = Math.atan2(y - cy, x - cx);
// 计算旋转角度
let angle = (currentAngle - defaultAngle) * 180 / Math.PI;
// 标准化角度范围到 [0, 360)
angle = (angle + 360) % 360;
return angle;
}
const throttleMove = throttle(move, 20)

const moveTool = throttle((e) => {
let _h = svgWrapperRef.value.offsetHeight 
let _w = svgWrapperRef.value.offsetWidth
let left = e.clientX - toolBarRect.value.ox
let top = e.clientY - toolBarRect.value.oy
left = Math.min(Math.max(0,left),_w - toolBar.value.offsetWidth) // 左右边界
top = Math.min(Math.max(0,top),_h - toolBar.value.offsetHeight)   // 上下边界
toolBarRect.value.x = left
toolBarRect.value.y = top
}, 20)

// 工具栏
const onToolMove = (e) => {
e.preventDefault()
toolHandleMove.value = true
toolBarRect.value.ox = e.clientX - (toolBarRect.value.x)
toolBarRect.value.oy = e.clientY - (toolBarRect.value.y)
svgWrapperRef.value.addEventListener('mousemove', moveTool)
}

// 选择创建类型
const onToolBar = (type) => {
console.log(type,'创建类型')
if(type.type !== createType.value.type) {
  // isOnCreate.value = true
  if(type.type == 'vertical' || type.type == 'Cubic'){
    isOnConnect.value = true
  }else{
    isOnCreate.value = true
  }
  connectType = -1
  return createType.value = type
}
connectType = -1
isOnConnect.value = false
isOnCreate.value = false
createType.value = {name: '',type: '',imgUrl: ''}
}



const moveCreateNode = throttle((e) => {
if(isOnCreate.value && isAddNew.value) {
  if(!isDraw.value) isDraw.value = true
  const start = screen2svg(startPoint.value.x, startPoint.value.y)
  const end = screen2svg(e.clientX, e.clientY)
  const {x, y, w, h} = generateSize(start, end)
  setNodeSize(tempNode, x, y, w, h)
  setOperatePoint(originOperate,tempNode)
  return
}
}, 20)

// vue3 + vite 动态引入图片方式
const requireImg = (name) => {
return new URL(`/src/assets/${name}`, import.meta.url).href
}
let rectInfo = ref([
{
  name: '圆角矩形',
  type: 'RoundedRect',
  imgUrl: 'juxing.png',
},
{
  name: '直角矩形',
  type: 'Rect',
  imgUrl: '直角矩形.png',  
},
{
  name: '圆形',
  type: 'Ellipse',
  imgUrl: '圆形.png'
},
{
  name: '菱形',
  type: 'Polygon',
  imgUrl: '菱形框.png'
},
{
  name: '折线',
  type: 'vertical',
  imgUrl: '连接线.png'
},
{
  name: '贝塞尔线',
  type: 'Cubic',
  imgUrl: '箭头曲线.png'
},

])

// 屏幕坐标转svg坐标
function screen2svg(x, y) {
let newSVGPoint = svgRef.value.createSVGPoint()
newSVGPoint.x = x
newSVGPoint.y = y
let CTM = svgRef.value.getScreenCTM()
let startSVGPoint = newSVGPoint.matrixTransform(CTM.inverse())
return startSVGPoint
}

function setResizeBox(x,y,w,h,r = 0) {
resizeBox.value.x = x
resizeBox.value.y = y
resizeBox.value.w = w
resizeBox.value.h = h
resizeBox.value.r = r
}

function setHoverBox(x,y,w,h,r = 0,id) {
hoverNode.value.x = x
hoverNode.value.y = y
hoverNode.value.w = w
hoverNode.value.h = h
hoverNode.value.r = r
hoverNode.value.id = id
}

function setNodeSize(node,x,y,w,h) {
tempNode.rect.width = w
tempNode.rect.height = h
tempNode.rect.translate.x = 0
tempNode.rect.translate.y = 0
switch(node.type) {
  case 'Rect': 
    // 直角矩形
    tempNode.rect.x = x
    tempNode.rect.y = y
    break
  case 'RoundedRect': 
    // 圆角矩形
    tempNode.rect.x = x
    tempNode.rect.y = y
    tempNode.rect.rx = 10
    tempNode.rect.ry = 10
    break
  case 'Ellipse': 
    // 圆形，设置圆心、半径
    tempNode.rect.x = x
    tempNode.rect.y = y
    tempNode.rect.cx = x + (w/2)
    tempNode.rect.cy = y + (h/2)
    tempNode.rect.rx = w/2
    tempNode.rect.ry = h/2
    break
  case 'Polygon':
    // 菱形
    tempNode.rect.x = x
    tempNode.rect.y = y
    tempNode.rect.cx = x + (w/2)
    tempNode.rect.cy = y + (h/2)
    tempNode.rect.points = `${x+(w/2)},${y} ${x+w},${y+(h/2)} ${x+(w/2)},${y+h} ${x},${y+(h/2)}`
    break
}
}

// 生成图形大小及坐标
function generateSize(start,end) {
let x = Math.min(start.x,end.x) 
let y = Math.min(start.y,end.y) 
let w = Math.abs(end.x - start.x)
let h = Math.abs(end.y - start.y) 
return {x, y, w, h}
}

function throttle(fn, delay = 18) {
let timer = Date.now()
return function () {
  if((+new Date()) - timer >= delay){
    timer = Date.now()
    fn.apply(this,arguments)
  }
}
}

function createNode() {
const { x,y } = screen2svg(startPoint.value.x, startPoint.value.y)
return {
  id: createType.value.name + uuidv4(),
  rect: {
    x,
    y,
    width: 0,
    height: 0,
    rx: 0,
    ry: 0,
    // fill: `hsla(${Math.random() * 90 + 180}, 70%, 60%, ${Math.random().toFixed(1)})`,
    fill: `rgb(250,250,250)`,
    cx: 0,  
    cy: 0,
    r: 0,
    stroke: `hsla(${Math.random() * 90 + 180}, 70%, 60%, ${Math.random().toFixed(1)})`,
    strokeWidth: 2,
    points: '',
    rotate: 0,
    translate: {
      x: 0,
      y: 0
    },
  },
  outterLines: [],
  innerLines: [],
  type: createType.value.type,
}
}

function createLine(type,start = null, dir = null, oriDir = null, parent = null) {

return {
  id: 'line' + uuidv4(),
  node: {
    parentNodeId: parent,
    targetNodeId: '',
  },
  attrs: {
    start,
    end: { x: 0, y: 0 },
    startDirection: dir,
    endDirection: '',
    angle: 0,
    d: '',
    // 初始方向，用于对旋转时调整朝向
    ORI_START: oriDir,
    ORI_END: ''
  },
  type: type || 'vertical',
}
}

</script>

<style lang="less" scoped>
.wrapper{
overflow: hidden;
height: 100%;
position: relative;
background-color: rgb(250,250,250);
background: radial-gradient(circle at 1px 1px,rgb(201, 201, 202) 1.5px,rgb(243,243,245) 0); 
background-size: 39.5px 39.5px; 
.attrs-box{
  position: fixed;
  top: 50px;
  left: 50px;
}
.svg-element{
  width: 100%;
  height: 100%;
  .line {
    stroke: rgb(20, 123, 227);
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
}
.attrs-wrapper{
  position: fixed;
  background-color: #fff;
  box-shadow: 0px 6px 20px rgba(25,25,26,.06), 0px 2px 12px rgba(25,25,26,.04);

  width: 200px;
  height: 500px;
  border-radius: 8px;
  right: 30px;
  top: 100px;
}
.tool-bar{
  position: fixed;
  background-color: #fff;
  box-shadow: 0px 6px 20px rgba(25,25,26,.06), 0px 2px 12px rgba(25,25,26,.04);
  min-width: 200px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center; 
  padding: 2px 15px;   
  .block{
    width: 28px;  
    height: 28px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    &.active{
      background-color: rgb(233, 231, 231);
    }
    .handle{
      width: 25px;
      height: 25px;
      background: url('./img/拖动.png') no-repeat;
      background-size: contain;
      cursor: move;
    }
    .add-block{
      width: 25px;
      height: 25px;
      cursor: pointer;
      img,svg{
        width: 100%;
        height: 100%;
        
      }
    }
  }
}

.resize-box{
  position: fixed;
  width: 200px;
  height: 200px;
  border: 1px solid salmon;
  top: 0;
  .circle{
    position: absolute;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    border: 1px solid rgb(20, 123, 227);
    position: absolute;
    background: #fff;
    z-index: 99;
  }
}
.rotate{

}
}
.top{
z-index: 999;
background-color: aqua;
}
.visibility-hidden{
visibility: hidden;
}
.left-top{
cursor: se-resize;
}
.right-top{
cursor: ne-resize;
}
.left-bottom{
cursor: ne-resize;
}
.right-bottom{
cursor: se-resize;
}
.ball{
position: fixed;
top: 0;
bottom: 0;
width: 5px;
height: 5px;
// transform: translate(-50%,-50%);
z-index: 9999;
background-color: transparent;
border: 1px solid purple;
}
</style>
