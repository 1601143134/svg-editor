import { createRouter, createWebHistory } from 'vue-router';
import RouterLayout from '../layout/routerLayout.vue';
const routes = [
    {
        path: '/',
        component: RouterLayout,
        children: [
            {
                path: '/',
                redirect: '/svg'
            },
            {
                path: '/svg',
                meta: { footer: false, menuId: 'login' },
                component: () => import('@/components/SVGFlow/index.vue')
            }
        ]
    }
];
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});
router.beforeEach((to, from, next) => {
    next();
});
export default router;
