import originOperate from './utils/operate-point';
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useElementBounding, useMagicKeys, onKeyDown } from '@vueuse/core';
import node from './component/node.vue';
import circle from './component/circle.vue';
import { v4 as uuidv4 } from 'uuid';
import { lineAngle, radianToAngle, lineRadian, rotate, distance, angleToRadian, midpoint, verticalLinePoint, startEndPointToLine, pointOnLine, getIncreaseSize } from "./utils/helper";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({
    name: 'SvgComponent',
});
const svgWrapperRef = ref(null);
const svgRef = ref(null);
const viewBox = ref({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
});
let tempNode = null;
let nodeArry = ref([]);
// 设置大小
let isResize = ref(false);
let resizeDirection = '';
let resizePoint = { x: 0, y: 0 };
let resizeBox = ref({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    r: 0
});
// 连线
let hoverConnectNode = ref({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
});
let startPoint = ref({ x: 0, y: 0 });
let lastPoint = ref({ x: 0, y: 0 });
let toolBarRect = ref({ x: 1200, y: 135, ox: 0, oy: 0 });
let toolHandleMove = ref(false);
let toolBar = ref(null);
let createType = ref({
    name: '',
    type: null,
    imgUrl: ''
});
let isOnCreate = ref(false); // 选择创建类型
let isAddNew = ref(false); // 已添加了图形，未开始绘制
let isDraw = ref(false);
let attrsNode = ref({
    w: 0,
    h: 0,
    r: 0
});
const setViewPort = () => {
    if (!svgWrapperRef.value)
        return;
    viewBox.value.width = svgWrapperRef.value.offsetWidth;
    viewBox.value.height = svgWrapperRef.value.offsetHeight;
};
onMounted(() => {
    setViewPort();
});
// 鼠标滚轮
const { ctrl, shift, Delete } = useMagicKeys();
watch(Delete, (n) => {
    if (n) {
        for (let i = 0; i < nodeArry.value.length; i++) {
            const node = nodeArry.value[i];
            if (node.id == tempNode.id) {
                nodeArry.value.splice(i, 1);
                isResize.value = false;
                break;
            }
        }
    }
});
let scale = 1, min = 0.2, max = 5, step = 30;
function handleWheel(e) {
    e.preventDefault();
    if (shift.value) {
        if (e.deltaY > 0) {
            viewBox.value.x += (step * scale);
        }
        else {
            viewBox.value.x -= (step * scale);
        }
    }
    else if (!ctrl.value) {
        if (e.deltaY > 0) {
            viewBox.value.y += (step * scale);
        }
        else {
            viewBox.value.y -= (step * scale);
        }
    }
    else {
        zoomViewPort(e);
    }
}
function zoomViewPort(e) {
    let startClient = {
        x: e.clientX,
        y: e.clientY
    };
    // // 将屏幕坐标转换为 SVG 坐标
    let newSVGPoint = svgRef.value.createSVGPoint();
    newSVGPoint.x = startClient.x;
    newSVGPoint.y = startClient.y;
    let CTM = svgRef.value.getScreenCTM();
    let startSVGPoint = screen2svg(e.clientX, e.clientY);
    let r = 1.1;
    if (e.deltaY < 0) {
        r = 1 / 1.1;
    }
    const _scale = scale * r;
    if (_scale > max) {
        r = max / scale;
        scale = max;
    }
    else if (_scale < min) {
        r = min / scale;
        scale = min;
    }
    else {
        scale = _scale;
    }
    svgRef.value.setAttribute('viewBox', `${viewBox.value.x} ${viewBox.value.y} ${viewBox.value.width * r} ${viewBox.value.height * r}`);
    CTM = svgRef.value.getScreenCTM();
    let moveToSVGPoint = newSVGPoint.matrixTransform(CTM.inverse());
    let delta = {
        dx: startSVGPoint.x - moveToSVGPoint.x,
        dy: startSVGPoint.y - moveToSVGPoint.y
    };
    let middleViewBox = svgRef.value.getAttribute('viewBox').split(' ').map(n => parseFloat(n));
    updateViewPort(middleViewBox[0] + delta.dx, middleViewBox[1] + delta.dy, middleViewBox[2], middleViewBox[3]);
}
function updateViewPort(x, y, w, h) {
    viewBox.value.x = x;
    viewBox.value.y = y;
    viewBox.value.width = w;
    viewBox.value.height = h;
}
// 鼠标点击操作
const onMousedown = (e) => {
    console.log('onMousedown');
    startPoint.value.x = e.clientX;
    startPoint.value.y = e.clientY;
    if (isOnCreate.value) {
        isAddNew.value = true;
        nodeArry.value.push(createNode());
        tempNode = nodeArry.value[nodeArry.value.length - 1];
    }
    isResize.value = false;
};
const onMouseup = (e) => {
    if (toolHandleMove.value)
        toolHandleMove.value = false;
    if (isOnCreate.value && isAddNew.value) {
        // 检验是否创建模式 按下 并没有移动鼠标设置大小
        if (!isDraw.value) {
            nodeArry.value.splice(nodeArry.value.length - 1, 1);
        }
        else {
            isDraw.value = false;
            isOnCreate.value = false;
            createType.value = { name: '', type: -1, imgUrl: '' };
            setResizeBox(tempNode.rect.x, tempNode.rect.y, tempNode.rect.width, tempNode.rect.height, tempNode.rect.rotate);
            // setOperatePoint(originOperate, tempNode)
            isResize.value = true;
        }
        isAddNew.value = false;
    }
    if (isResize.value && resizeDirection) {
        resizeDirection = '';
    }
    if (controlMove.value) {
        controlMove.value = false;
    }
    if (hidden.value) {
        hidden.value = false;
    }
    isRotate = false;
    // const { rect } = tempNode
    // tempNode = null
};
const onClickNode = (e, node) => {
    console.log(node, 'onClickNode---');
    if (!isResize.value) {
        isResize.value = true;
    }
    tempNode = node;
    // 设置操作框的大小
    setResizeBox(tempNode.rect.x, tempNode.rect.y, tempNode.rect.width, tempNode.rect.height, tempNode.rect.rotate);
    setOperatePoint(originOperate, tempNode);
    onResizeStartMove(e);
    e.preventDefault();
    attrsNode.value.w = tempNode.rect.width;
    attrsNode.value.h = tempNode.rect.height;
    attrsNode.value.r = tempNode.rect.rotate;
    // 获取resizeBox 鼠标坐标
};
const onHoverNode = (node) => {
    if (isDraw.value || isResize.value)
        return;
    tempNode = node;
};
const onMouseleaveNode = (node) => {
};
let ball = ref(null);
let isRotate = false;
let rotatePoint = null;
let origin = null;
let initPoint = { x: 0, y: 0 };
let oppositePoint = { x: 0, y: 0 };
let lineCenter = { x: 0, y: 0 };
let operatePoint = ref([]);
const setOperatePoint = (pArry = [], node) => {
    const { rect } = node;
    operatePoint.value = pArry.map(p => {
        return {
            name: p.name,
            x: rect.x + (rect.width / 100) * p.position.x - 5,
            y: rect.y + (rect.height / 100) * p.position.y - 5,
            angle: p.angle,
            cursor: getCursor(rect.rotate + p.angle)
        };
    });
};
const getCursor = (angle) => {
    let a = angle;
    if (a < 0) {
        a += 360;
    }
    if (a >= 360) {
        a -= 360;
    }
    if (a >= 338 || a < 23 || (a > 157 && a <= 202)) {
        return "ew-resize";
    }
    else if ((a >= 23 && a < 68) || (a > 202 && a <= 247)) {
        return "nwse-resize";
    }
    else if ((a >= 68 && a < 113) || (a > 247 && a <= 292)) {
        return "ns-resize";
    }
    else {
        return "nesw-resize";
    }
};
// 操作框
const tirggerOperate = (e) => {
    const type = e.target.getAttribute('dir');
    const { rect } = tempNode;
    if (type == 'rotate') {
        isRotate = true;
    }
    else if (type == 'move') {
        onResizeStartMove(e);
    }
    else {
        // 无论落点在哪里，找到锚点的具体位置，根据锚点进行计算
        // 如果是中点，取任意对角线
        // 1、确定对角点
        switch (type) {
            case 'right-bottom':
                resizePoint.x = rect.x + rect.width;
                resizePoint.y = rect.y + rect.height;
                break;
            case 'bottom-left':
                resizePoint.x = rect.x;
                resizePoint.y = rect.y + rect.height;
                break;
            case 'top-right':
                resizePoint.x = rect.x + rect.width;
                resizePoint.y = rect.y;
                break;
            case 'left-top':
                resizePoint.x = rect.x;
                resizePoint.y = rect.y;
                break;
        }
        resizeDirection = type;
        console.log(resizeDirection, 'resizeDirection');
        const center = {
            x: rect.x + (rect.width / 2),
            y: rect.y + (rect.height / 2)
        };
        // resizePoint：旋转度数后的锚点位置
        const p = rotate(resizePoint, resizeBox.value.r, center);
        // 对角点：resize时候对角点位置保持不变，锚点位置不断改变
        oppositePoint = calculateOtherEndpoint(center, p);
    }
};
let controlMove = ref(false);
const onResizeStartMove = (e) => {
    if (!controlMove.value) {
        controlMove.value = true;
        const start = screen2svg(e.clientX, e.clientY);
        startPoint.value = start;
    }
};
let hidden = ref(false);
// 屏幕移动
const move = (e) => {
    e.preventDefault();
    let _h = svgWrapperRef.value.offsetHeight;
    let _w = svgWrapperRef.value.offsetWidth;
    lastPoint.value.x = e.clientX;
    lastPoint.value.y = e.clientY;
    // 创建图形
    if (isOnCreate.value && isAddNew.value) {
        if (!isDraw.value)
            isDraw.value = true;
        const start = screen2svg(startPoint.value.x, startPoint.value.y);
        const end = screen2svg(e.clientX, e.clientY);
        const { x, y, w, h } = generateSize(start, end);
        setNodeSize(tempNode, x, y, w, h);
        setOperatePoint(originOperate, tempNode);
    }
    // 移动工具栏
    else if (toolHandleMove.value) {
        let left = e.clientX - toolBarRect.value.ox;
        let top = e.clientY - toolBarRect.value.oy;
        left = Math.min(Math.max(0, left), _w - toolBar.value.offsetWidth); // 左右边界
        top = Math.min(Math.max(0, top), _h - toolBar.value.offsetHeight); // 上下边界
        toolBarRect.value.x = left;
        toolBarRect.value.y = top;
    }
    // resize Node
    else if (isResize.value && resizeDirection) {
        if (!hidden.value) {
            hidden.value = true;
        }
        const { rect } = tempNode;
        // 鼠标坐标
        let curMouse = screen2svg(e.clientX, e.clientY);
        let size = null, line = null, vertical = null, opposite = null, newCenter = null, originResize = null, oriOppositePoint = null;
        // 四条边的中点
        if (!resizeDirection.includes('-')) {
            const center = {
                x: rect.x + (rect.width / 2),
                y: rect.y + (rect.height / 2)
            };
            if (resizeDirection == 'top' || resizeDirection == 'bottom') {
                // 取右边的两个顶点，做垂直边
                const rightTop = {
                    x: rect.x + rect.width,
                    y: rect.y
                };
                const rotateRightTop = rotate(rightTop, resizeBox.value.r, center);
                const rightBottom = {
                    x: rect.x + rect.width,
                    y: rect.y + rect.height
                };
                const rotateRightBottom = rotate(rightBottom, resizeBox.value.r, center);
                line = startEndPointToLine(rotateRightTop, rotateRightBottom);
                if (resizeDirection == 'top') {
                    opposite = rotate({ x: rect.x, y: rect.y + rect.height }, resizeBox.value.r, center);
                }
                else {
                    opposite = rotate({ x: rect.x, y: rect.y }, resizeBox.value.r, center);
                }
                // 鼠标与垂边的垂点
                vertical = verticalLinePoint(line, curMouse);
            }
            else {
                // 取下边的两个顶点，做垂直边 
                const rightBottom = {
                    x: rect.x + rect.width,
                    y: rect.y + rect.height
                };
                const rotateRightBottom = rotate(rightBottom, resizeBox.value.r, center);
                const LeftBottom = {
                    x: rect.x,
                    y: rect.y + rect.height
                };
                const rotateLeftBottom = rotate(LeftBottom, resizeBox.value.r, center);
                line = startEndPointToLine(rotateRightBottom, rotateLeftBottom);
                if (resizeDirection == 'right') {
                    opposite = rotate({ x: rect.x, y: rect.y }, resizeBox.value.r, center);
                }
                else {
                    opposite = rotate({ x: rect.x + rect.width, y: rect.y }, resizeBox.value.r, center);
                }
                // 鼠标与垂边的垂点
                vertical = verticalLinePoint(line, curMouse);
            }
            newCenter = midpoint(vertical, opposite);
            // 偏移回正角度
            originResize = rotate(vertical, -resizeBox.value.r, newCenter);
            oriOppositePoint = rotate(opposite, -resizeBox.value.r, newCenter);
            resizeDirection = dirReverse(originResize, oriOppositePoint, resizeDirection);
            size = generateSize(oriOppositePoint, originResize);
        }
        // 对角点
        else {
            // 注意：锚点位置确定了，但是鼠标开始的落点不一定是锚点的位置，会有偏差，这里暂时假设就是锚点位置，直接求新中点
            // 鼠标位置 与 对角固定点求 中点
            const newCenter = midpoint(oppositePoint, curMouse);
            // 将鼠标点偏移回正角度
            const originMouse = rotate(curMouse, -resizeBox.value.r, newCenter);
            const oriOppositePoint = rotate(oppositePoint, -resizeBox.value.r, newCenter);
            size = generateSize(oriOppositePoint, originMouse);
        }
        setResizeBox(size.x, size.y, size.w, size.h, rect.rotate);
        setNodeSize(tempNode, size.x, size.y, size.w, size.h);
        setOperatePoint(originOperate, tempNode);
    }
    // 旋转
    else if (isResize.value && isRotate) {
        if (!hidden.value) {
            hidden.value = true;
        }
        const { rect } = tempNode;
        const center = {
            x: rect.x + (rect.width / 2),
            y: rect.y + (rect.height / 2)
        };
        const cur = screen2svg(e.clientX, e.clientY);
        const angle = calculateRotation(center.x, center.y, cur.x, cur.y, rect.width, rect.height);
        // 吸附角度
        tempNode.rect.rotate = angle;
        resizeBox.value.r = angle;
        setOperatePoint(originOperate, tempNode);
    }
    // 拖动
    else if (controlMove.value) {
        if (!hidden.value) {
            hidden.value = true;
        }
        const curMouse = screen2svg(e.clientX, e.clientY);
        const diff = {
            x: curMouse.x - startPoint.value.x,
            y: curMouse.y - startPoint.value.y
        };
        tempNode.rect.x += diff.x;
        tempNode.rect.y += diff.y;
        resizeBox.value.x += diff.x;
        resizeBox.value.y += diff.y;
        startPoint.value = curMouse;
        tempNode.rect.translate.x += diff.x;
        tempNode.rect.translate.y += diff.y;
        // 圆形和菱形都是基于自身左上角进行偏移
        setOperatePoint(originOperate, tempNode);
    }
};
const dirReverse = (p1, p2, dir) => {
    if (dir == 'top' || dir == 'bottom') {
        return p1.y > p2.y ? 'bottom' : 'top';
    }
    else if (dir == 'left' || dir == 'right') {
        return p1.x > p2.x ? 'right' : 'left';
    }
};
// 计算矩形对角线另一端点坐标的函数
function calculateOtherEndpoint(midpoint, pointA) {
    const x2 = 2 * midpoint.x - pointA.x;
    const y2 = 2 * midpoint.y - pointA.y;
    return { x: x2, y: y2 };
}
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
const throttleMove = throttle(move, 10);
// 工具栏
const onToolMove = (e) => {
    e.preventDefault();
    toolHandleMove.value = true;
    toolBarRect.value.ox = e.clientX - (toolBarRect.value.x);
    toolBarRect.value.oy = e.clientY - (toolBarRect.value.y);
};
// 选择创建类型
const onToolBar = (type) => {
    if (type.type !== createType.value.type) {
        isOnCreate.value = true;
        return createType.value = type;
    }
    isOnCreate.value = false;
    createType.value = { name: '', type: null, imgUrl: '' };
};
// vue3 + vite 动态引入图片方式
const requireImg = (name) => {
    return new URL(`/src/assets/${name}`, import.meta.url).href;
};
let rectInfo = ref([
    {
        name: '圆角矩形',
        type: 1,
        imgUrl: 'juxing.png',
    },
    {
        name: '直角矩形',
        type: 3,
        imgUrl: '直角矩形.png',
    },
    {
        name: '圆形',
        type: 2,
        imgUrl: '圆形.png'
    },
    {
        name: '菱形',
        type: 4,
        imgUrl: '菱形框.png'
    },
]);
// 屏幕坐标转svg坐标
function screen2svg(x, y) {
    let newSVGPoint = svgRef.value.createSVGPoint();
    newSVGPoint.x = x;
    newSVGPoint.y = y;
    let CTM = svgRef.value.getScreenCTM();
    let startSVGPoint = newSVGPoint.matrixTransform(CTM.inverse());
    return startSVGPoint;
}
function setResizeBox(x, y, w, h, r = 0) {
    resizeBox.value.x = x;
    resizeBox.value.y = y;
    resizeBox.value.w = w;
    resizeBox.value.h = h;
    resizeBox.value.r = r;
}
function setNodeSize(node, x, y, w, h) {
    tempNode.rect.width = w;
    tempNode.rect.height = h;
    tempNode.rect.translate.x = 0;
    tempNode.rect.translate.y = 0;
    switch (node.type) {
        case 1:
            // 圆角矩形
            tempNode.rect.x = x;
            tempNode.rect.y = y;
            tempNode.rect.rx = 15;
            tempNode.rect.ry = 15;
            break;
        case 2:
            // 圆形，设置圆心、半径
            tempNode.rect.x = x;
            tempNode.rect.y = y;
            tempNode.rect.cx = x + (w / 2);
            tempNode.rect.cy = y + (h / 2);
            tempNode.rect.rx = w / 2;
            tempNode.rect.ry = h / 2;
            break;
        case 3:
            // 直角矩形
            tempNode.rect.x = x;
            tempNode.rect.y = y;
            break;
        case 4:
            // 菱形
            tempNode.rect.x = x;
            tempNode.rect.y = y;
            tempNode.rect.points = `${x + (w / 2)},${y} ${x + w},${y + (h / 2)} ${x + (w / 2)},${y + h} ${x},${y + (h / 2)}`;
            break;
    }
}
// 生成图形大小及坐标
function generateSize(start, end) {
    let x = Math.min(start.x, end.x);
    let y = Math.min(start.y, end.y);
    let w = Math.abs(end.x - start.x);
    let h = Math.abs(end.y - start.y);
    return { x, y, w, h };
}
function throttle(fn, delay = 18) {
    let timer = Date.now();
    return function () {
        if ((+new Date()) - timer >= delay) {
            timer = Date.now();
            fn.apply(this, arguments);
        }
    };
}
function createNode() {
    const { x, y } = screen2svg(startPoint.value.x, startPoint.value.y);
    return {
        id: createType.value.name + uuidv4(),
        rect: {
            x,
            y,
            width: 0,
            height: 0,
            rx: 0,
            ry: 0,
            fill: `hsla(${Math.random() * 90 + 180}, 70%, 60%, ${Math.random().toFixed(1)})`,
            cx: 0,
            cy: 0,
            r: 0,
            stroke: `hsl(${Math.random() * 90 + 180}, 70%, 60%)`,
            strokeWidth: 3,
            points: '',
            rotate: 0,
            translate: {
                x: 0,
                y: 0
            },
        },
        type: createType.value.type,
    };
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({});
;
let __VLS_functionalComponentProps;
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_localComponents = {
        ...{},
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_components;
    const __VLS_localDirectives = {
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_directives;
    let __VLS_styleScopedClasses;
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onMousemove: (__VLS_ctx.throttleMove) }, ...{ onMousedown: (__VLS_ctx.onMousedown) }, ...{ onMouseup: (__VLS_ctx.onMouseup) }, ref: ("svgWrapperRef"), ...{ class: ("wrapper") }, });
    // @ts-ignore navigation for `const svgWrapperRef = ref()`
    __VLS_ctx.svgWrapperRef;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.findFixPoint) }, ref: ("ball"), ...{ class: ("ball") }, });
    // @ts-ignore navigation for `const ball = ref()`
    __VLS_ctx.ball;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("attrs-box") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.resizeBox.x);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.resizeBox.y);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.resizeBox.w);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.resizeBox.h);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.resizeBox.r);
    __VLS_elementAsFunction(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({ ...{ onWheel: (__VLS_ctx.handleWheel) }, id: ("svgElement"), ref: ("svgRef"), ...{ class: ("svg-element") }, viewBox: ((`${__VLS_ctx.viewBox.x} ${__VLS_ctx.viewBox.y} ${__VLS_ctx.viewBox.width} ${__VLS_ctx.viewBox.height}`)), width: ("100%"), height: ("100%"), xmlns: ("http://www.w3.org/2000/svg"), });
    // @ts-ignore navigation for `const svgRef = ref()`
    __VLS_ctx.svgRef;
    __VLS_elementAsFunction(__VLS_intrinsicElements.defs, __VLS_intrinsicElements.defs)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.marker, __VLS_intrinsicElements.marker)({ id: ("line1733983998954"), markerWidth: ("10"), markerHeight: ("7"), refX: ("8"), refY: ("3.5"), orient: ("auto"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.polygon, __VLS_intrinsicElements.polygon)({ points: ("0 0, 10 3.5, 0 7"), fill: ("rgb(20, 123, 227)"), });
    for (const [n] of __VLS_getVForSourceType((__VLS_ctx.nodeArry))) {
        // @ts-ignore
        [node,];
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(node, new node({ ...{ 'onMousedown': {} }, ...{ 'onMouseover': {} }, ...{ 'onMouseleave': {} }, key: ((n.id)), rect: ((n.rect)), type: ((n.type)), id: ((n.id)), }));
        const __VLS_1 = __VLS_0({ ...{ 'onMousedown': {} }, ...{ 'onMouseover': {} }, ...{ 'onMouseleave': {} }, key: ((n.id)), rect: ((n.rect)), type: ((n.type)), id: ((n.id)), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        let __VLS_5;
        const __VLS_6 = {
            onMousedown: (...[$event]) => {
                __VLS_ctx.onClickNode($event, n);
            }
        };
        const __VLS_7 = {
            onMouseover: (...[$event]) => {
                __VLS_ctx.onHoverNode(n);
            }
        };
        const __VLS_8 = {
            onMouseleave: (...[$event]) => {
                __VLS_ctx.onMouseleaveNode(n);
            }
        };
        let __VLS_2;
        let __VLS_3;
        var __VLS_4;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.g, __VLS_intrinsicElements.g)({ ...{ onMousedown: (__VLS_ctx.tirggerOperate) }, transform: ((`rotate(${__VLS_ctx.resizeBox.r},${__VLS_ctx.resizeBox.x + __VLS_ctx.resizeBox.w / 2},${__VLS_ctx.resizeBox.y + __VLS_ctx.resizeBox.h / 2})`)), ...{ class: ("top") }, ...{ class: (({ 'visibility-hidden': __VLS_ctx.hidden })) }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.isResize) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.image, __VLS_intrinsicElements.image)({ dir: ("rotate"), x: ((__VLS_ctx.resizeBox.x - 30)), y: ((__VLS_ctx.resizeBox.y - 25)), transform: ((`rotate(35,${(__VLS_ctx.resizeBox.x - 30) + 15},${(__VLS_ctx.resizeBox.y - 25) + 15})`)), width: ("30"), height: ("30"), href: ("../../assets/旋转.png"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.rect, __VLS_intrinsicElements.rect)({ dir: ("move"), x: ((__VLS_ctx.resizeBox.x)), y: ((__VLS_ctx.resizeBox.y)), width: ((__VLS_ctx.resizeBox.w)), height: ((__VLS_ctx.resizeBox.h)), fill: ("rgba(0,0,0,0)"), stroke: ("rgb(20, 123, 227)"), });
    for (const [point] of __VLS_getVForSourceType((__VLS_ctx.operatePoint))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.rect, __VLS_intrinsicElements.rect)({ key: ((point.name)), ...{ style: (({ cursor: point.cursor })) }, x: ((point.x)), y: ((point.y)), dir: ((point.name)), width: ("10"), height: ("10"), fill: ("white"), stroke: ("rgb(20, 123, 227)"), });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("toolBar"), ...{ class: ("tool-bar") }, ...{ style: (({
                left: '0px', top: '0px', transform: `translate3d(${__VLS_ctx.toolBarRect.x}px,${__VLS_ctx.toolBarRect.y}px,0) scale(${1})`
            })) }, });
    // @ts-ignore navigation for `const toolBar = ref()`
    __VLS_ctx.toolBar;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onMousedown: (__VLS_ctx.onToolMove) }, ...{ class: ("block") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div)({ ...{ class: ("handle") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.rectInfo))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onMousedown: (...[$event]) => {
                    __VLS_ctx.onToolBar(item);
                } }, ...{ class: ("block") }, key: ((index)), ...{ class: (([__VLS_ctx.createType.type == item.type ? 'active' : ''])) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("add-block") }, });
        if (item.imgUrl) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((__VLS_ctx.requireImg(item.imgUrl))), });
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({ d: ((item.d)), fill: ("none"), stroke: ("rgb(108,109,110)"), "stroke-width": ("2"), });
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("connect-box") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("top-c") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right-c") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("bottom-c") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left-c") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("rotate") }, });
    __VLS_styleScopedClasses['wrapper'];
    __VLS_styleScopedClasses['ball'];
    __VLS_styleScopedClasses['attrs-box'];
    __VLS_styleScopedClasses['svg-element'];
    __VLS_styleScopedClasses['top'];
    __VLS_styleScopedClasses['visibility-hidden'];
    __VLS_styleScopedClasses['tool-bar'];
    __VLS_styleScopedClasses['block'];
    __VLS_styleScopedClasses['handle'];
    __VLS_styleScopedClasses['block'];
    __VLS_styleScopedClasses['add-block'];
    __VLS_styleScopedClasses['connect-box'];
    __VLS_styleScopedClasses['top-c'];
    __VLS_styleScopedClasses['right-c'];
    __VLS_styleScopedClasses['bottom-c'];
    __VLS_styleScopedClasses['left-c'];
    __VLS_styleScopedClasses['rotate'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "svgWrapperRef": __VLS_nativeElements['div'],
        "ball": __VLS_nativeElements['div'],
        "svgRef": __VLS_nativeElements['svg'],
        "toolBar": __VLS_nativeElements['div'],
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            node: node,
            svgWrapperRef: svgWrapperRef,
            svgRef: svgRef,
            viewBox: viewBox,
            nodeArry: nodeArry,
            isResize: isResize,
            resizeBox: resizeBox,
            toolBarRect: toolBarRect,
            toolBar: toolBar,
            createType: createType,
            handleWheel: handleWheel,
            onMousedown: onMousedown,
            onMouseup: onMouseup,
            onClickNode: onClickNode,
            onHoverNode: onHoverNode,
            onMouseleaveNode: onMouseleaveNode,
            ball: ball,
            operatePoint: operatePoint,
            tirggerOperate: tirggerOperate,
            hidden: hidden,
            throttleMove: throttleMove,
            onToolMove: onToolMove,
            onToolBar: onToolBar,
            requireImg: requireImg,
            rectInfo: rectInfo,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
