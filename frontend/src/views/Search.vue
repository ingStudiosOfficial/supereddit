<template>
  <div>
    <div class="card mb-lg">
      <h1>Search Results</h1>
      <p class="text-muted">Results for: "{{ searchQuery }}"</p>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    
    <div v-else>
      <!-- Subreddits Results -->
      <div v-if="results.subreddits && results.subreddits.length > 0" class="mb-lg">
        <h2>Communities</h2>
        <div class="card">
          <div 
            v-for="subreddit in results.subreddits" 
            :key="subreddit._id"
            class="subreddit-result"
            @click="$router.push(`/r/${subreddit.name}`)"
          >
            <h3>r/{{ subreddit.name }}</h3>
            <p class="text-muted">{{ subreddit.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- Posts Results -->
      <div v-if="results.posts && results.posts.length > 0">
        <h2>Posts</h2>
        <PostCard 
          v-for="post in results.posts" 
          :key="post._id"
          :post="post"
        />
      </div>
      
      <!-- No Results -->
      <div v-if="!loading && (!results.posts || results.posts.length === 0) && (!results.subreddits || results.subreddits.length === 0)" class="text-center text-muted">
        <p>No results found for "{{ searchQuery }}"</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
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

interface Subreddit {
  _id: string;
  name: string;
  description: string;
}

interface SearchResults {
  posts?: Post[];
  subreddits?: Subreddit[];
}

const route = useRoute();
const searchQuery = ref('');
const results = ref<SearchResults>({});
const loading = ref(true);

const performSearch = async () => {
  const query = route.query.q as string;
  if (!query) return;
  
  searchQuery.value = query;
  loading.value = true;
  
  try {
    const response = await apiClient.get('/search', {
      params: { q: query },
    });
    results.value = response.data;
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => route.query.q, () => {
  performSearch();
});

onMounted(() => {
  performSearch();
});
</script>

<style scoped>
.subreddit-result {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.subreddit-result:last-child {
  border-bottom: none;
}

.subreddit-result:hover {
  background: var(--color-bg-hover);
}

.subreddit-result h3 {
  margin-bottom: var(--space-xs);
  color: var(--color-accent);
}
</style>
