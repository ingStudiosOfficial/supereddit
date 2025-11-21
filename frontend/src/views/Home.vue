<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
      <h1>Home</h1>
      <select v-model="sortBy" class="form-input" style="width: auto;">
        <option value="new">New</option>
        <option value="top">Top</option>
      </select>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="posts.length === 0" class="text-center text-muted">
      <p>No posts yet. Be the first to create one!</p>
    </div>
    
    <div v-else>
      <PostCard 
        v-for="post in posts" 
        :key="post._id"
        :post="post"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import apiClient from '../api/client';
import PostCard from '../components/PostCard.vue';

interface Post {
  _id: string;
  title: string;
  content: string;
  votes: number;
  author: {
    username: string;
  };
  subreddit: {
    name: string;
  };
  createdAt: string;
}

const posts = ref<Post[]>([]);
const loading = ref(true);
const sortBy = ref('new');

const fetchPosts = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get('/posts', {
      params: { sort: sortBy.value },
    });
    posts.value = response.data.posts;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    loading.value = false;
  }
};

watch(sortBy, () => {
  fetchPosts();
});

onMounted(() => {
  fetchPosts();
});
</script>
