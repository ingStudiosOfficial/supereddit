import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Subreddit from '../views/Subreddit.vue';
import PostDetail from '../views/PostDetail.vue';
import CreatePost from '../views/CreatePost.vue';
import Search from '../views/Search.vue';
import UserProfile from '../views/UserProfile.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/r/:name',
        name: 'Subreddit',
        component: Subreddit,
    },
    {
        path: '/post/:id',
        name: 'PostDetail',
        component: PostDetail,
    },
    {
        path: '/submit',
        name: 'CreatePost',
        component: CreatePost,
    },
    {
        path: '/search',
        name: 'Search',
        component: Search,
    },
    {
        path: '/u/:username',
        name: 'UserProfile',
        component: UserProfile,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
