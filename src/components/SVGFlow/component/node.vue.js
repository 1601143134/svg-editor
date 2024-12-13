import { ref, computed } from "vue";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
let rotate = ref('');
let translate = computed(() => {
    if (props.type == 1 || props.type == 3) {
        return `translate(${props.rect.x},${props.rect.y})`;
    }
    else {
        return `translate(${props.rect.translate?.x},${props.rect.translate?.y})`;
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.g, __VLS_intrinsicElements.g)({ transform: ((`rotate(${__VLS_ctx.rect.rotate},${__VLS_ctx.rect.x + __VLS_ctx.rect.width / 2},${__VLS_ctx.rect.y + __VLS_ctx.rect.height / 2}) ${__VLS_ctx.translate}`)), });
    if (__VLS_ctx.type == 1 || __VLS_ctx.type == 3) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.rect, __VLS_intrinsicElements.rect)({ width: ((__VLS_ctx.rect.width)), height: ((__VLS_ctx.rect.height)), rx: ((__VLS_ctx.rect.rx)), ry: ((__VLS_ctx.rect.rx)), fill: ((__VLS_ctx.rect.fill)), stroke: ((__VLS_ctx.rect.stroke)), "stroke-width": ((__VLS_ctx.rect.strokeWidth)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.tspan, __VLS_intrinsicElements.tspan)({ x: ("150"), dy: ("0"), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.tspan, __VLS_intrinsicElements.tspan)({ x: ("150"), dy: ("20"), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.tspan, __VLS_intrinsicElements.tspan)({ x: ("150"), dy: ("20"), });
    }
    if (__VLS_ctx.type == 2) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.ellipse, __VLS_intrinsicElements.ellipse)({ cx: ((__VLS_ctx.rect.cx)), cy: ((__VLS_ctx.rect.cy)), rx: ((__VLS_ctx.rect.rx)), ry: ((__VLS_ctx.rect.ry)), fill: ((__VLS_ctx.rect.fill)), stroke: ((__VLS_ctx.rect.stroke)), "stroke-width": ((__VLS_ctx.rect.strokeWidth)), });
    }
    if (__VLS_ctx.type == 4) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.polygon)({ points: ((__VLS_ctx.rect.points)), fill: ((__VLS_ctx.rect.fill)), stroke: ((__VLS_ctx.rect.stroke)), "stroke-width": ((__VLS_ctx.rect.strokeWidth)), });
    }
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {};
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
            translate: translate,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
