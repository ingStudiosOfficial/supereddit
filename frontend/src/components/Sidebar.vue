<template>
  <aside class="sidebar">
    <div class="sidebar-card">
      <h3 class="sidebar-title">Popular Communities</h3>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <ul v-else class="subreddit-list">
        <li 
          v-for="subreddit in subreddits" 
          :key="subreddit._id"
          class="subreddit-item"
          @click="$router.push(`/r/${subreddit.name}`)"
        >
          <span>r/{{ subreddit.name }}</span>
        </li>
      </ul>
      
      <button 
        v-if="authState.isAuthenticated" 
        class="btn btn-primary mt-md"
        style="width: 100%;"
        @click="showCreateModal = true"
      >
        Create Community
      </button>
    </div>
    
    <!-- Reddit Import -->
    <div v-if="authState.isAuthenticated" class="sidebar-card">
      <h3 class="sidebar-title">Import from Reddit</h3>
      <RedditImport />
    </div>
    
    <!-- Create Subreddit Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <h3>Create a Community</h3>
        <form @submit.prevent="createSubreddit">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input 
              v-model="newSubreddit.name" 
              class="form-input" 
              placeholder="community_name"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea 
              v-model="newSubreddit.description" 
              class="form-textarea"
              placeholder="What is this community about?"
              required
            ></textarea>
          </div>
          <div style="display: flex; gap: var(--space-md);">
            <button type="submit" class="btn btn-primary">Create</button>
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '../api/client';
import { useAuth } from '../stores/auth';
import RedditImport from './RedditImport.vue';

interface Subreddit {
  _id: string;
  name: string;
  description: string;
}

const { state: authState } = useAuth();
const subreddits = ref<Subreddit[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newSubreddit = ref({
  name: '',
  description: '',
});

const fetchSubreddits = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get('/subreddits');
    subreddits.value = response.data.subreddits;
  } catch (error) {
    console.error('Failed to fetch subreddits:', error);
  } finally {
    loading.value = false;
  }
};

const createSubreddit = async () => {
  try {
    await apiClient.post('/subreddits', newSubreddit.value);
    showCreateModal.value = false;
    newSubreddit.value = { name: '', description: '' };
    fetchSubreddits();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to create subreddit');
  }
};

onMounted(() => {
  fetchSubreddits();
});
</script>

<style src="../styles/sidebar.css"></style>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 500px;
  width: 90%;
}
</style>
