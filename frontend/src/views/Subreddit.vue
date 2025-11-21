<template>
  <div>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="!subreddit" class="text-center">
      <h2>Subreddit not found</h2>
    </div>
    
    <div v-else>
      <div class="card mb-lg">
        <h1>r/{{ subreddit.name }}</h1>
        <p class="text-muted">{{ subreddit.description }}</p>
        <div style="display: flex; gap: var(--space-md); margin-top: var(--space-md);">
          <span>{{ subreddit.members?.length || 0 }} members</span>
          <button 
            v-if="authState.isAuthenticated && !isMember" 
            class="btn btn-primary"
            @click="joinSubreddit"
          >
            Join
          </button>
          <button 
            v-else-if="authState.isAuthenticated && isMember" 
            class="btn btn-secondary"
            @click="leaveSubreddit"
          >
            Leave
          </button>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <h2>Posts</h2>
        <select v-model="sortBy" class="form-input" style="width: auto;">
          <option value="new">New</option>
          <option value="top">Top</option>
        </select>
      </div>
      
      <div v-if="postsLoading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="posts.length === 0" class="text-center text-muted">
        <p>No posts in this subreddit yet.</p>
      </div>
      
      <div v-else>
        <PostCard 
          v-for="post in posts" 
          :key="post._id"
          :post="post"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../api/client';
import PostCard from '../components/PostCard.vue';
import { useAuth } from '../stores/auth';

interface Subreddit {
  _id: string;
  name: string;
  description: string;
  members: string[];
}

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

const route = useRoute();
const { state: authState } = useAuth();
const subreddit = ref<Subreddit | null>(null);
const posts = ref<Post[]>([]);
const loading = ref(true);
const postsLoading = ref(true);
const sortBy = ref('new');

const isMember = computed(() => {
  if (!authState.isAuthenticated || !subreddit.value) return false;
  return subreddit.value.members?.includes(authState.user?._id || '');
});

const fetchSubreddit = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get(`/subreddits/${route.params.name}`);
    subreddit.value = response.data.subreddit;
  } catch (error) {
    console.error('Failed to fetch subreddit:', error);
  } finally {
    loading.value = false;
  }
};

const fetchPosts = async () => {
  try {
    postsLoading.value = true;
    const response = await apiClient.get('/posts', {
      params: { 
        subreddit: route.params.name,
        sort: sortBy.value,
      },
    });
    posts.value = response.data.posts;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    postsLoading.value = false;
  }
};

const joinSubreddit = async () => {
  try {
    await apiClient.post(`/subreddits/${route.params.name}/join`);
    fetchSubreddit();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to join subreddit');
  }
};

const leaveSubreddit = async () => {
  try {
    await apiClient.post(`/subreddits/${route.params.name}/leave`);
    fetchSubreddit();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to leave subreddit');
  }
};

watch(sortBy, () => {
  fetchPosts();
});

// Watch for route changes to refresh content when switching subreddits
watch(() => route.params.name, () => {
  fetchSubreddit();
  fetchPosts();
});

onMounted(() => {
  fetchSubreddit();
  fetchPosts();
});
</script>

