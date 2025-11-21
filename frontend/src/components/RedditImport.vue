<template>
  <div class="card">
    <h2>Import from Reddit</h2>
    <p class="text-muted mb-md">Import the last 30 posts from any Reddit subreddit</p>
    
    <form @submit.prevent="importPosts">
      <div class="form-group">
        <label class="form-label">Reddit Subreddit Name</label>
        <input 
          v-model="formData.redditSubreddit" 
          class="form-input"
          placeholder="e.g., foundcynnahbun"
          required
        />
        <small class="text-muted">Enter the subreddit name without 'r/'</small>
      </div>
      
      <div class="form-group">
        <label class="form-label">Import to Supereddit Community</label>
        <select v-model="formData.targetSubreddit" class="form-input" required>
          <option value="">Select a community</option>
          <option 
            v-for="subreddit in subreddits" 
            :key="subreddit._id"
            :value="subreddit.name"
          >
            r/{{ subreddit.name }}
          </option>
        </select>
      </div>
      
      <div v-if="error" class="error-message mb-md">
        {{ error }}
      </div>
      
      <div v-if="success" class="success-message mb-md">
        {{ success }}
      </div>
      
      <button type="submit" class="btn btn-primary" :disabled="importing">
        {{ importing ? 'Importing...' : 'Import Posts' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '../api/client';

interface Subreddit {
  _id: string;
  name: string;
}

const subreddits = ref<Subreddit[]>([]);
const importing = ref(false);
const error = ref('');
const success = ref('');
const formData = ref({
  redditSubreddit: '',
  targetSubreddit: '',
});

const fetchSubreddits = async () => {
  try {
    const response = await apiClient.get('/subreddits');
    subreddits.value = response.data.subreddits;
  } catch (err) {
    console.error('Failed to fetch subreddits:', err);
  }
};

const importPosts = async () => {
  error.value = '';
  success.value = '';
  importing.value = true;
  
  try {
    const response = await apiClient.post('/reddit/import', formData.value);
    success.value = response.data.message;
    formData.value.redditSubreddit = '';
    
    // Emit event to refresh posts if needed
    setTimeout(() => {
      success.value = '';
    }, 5000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to import posts';
  } finally {
    importing.value = false;
  }
};

onMounted(() => {
  fetchSubreddits();
});
</script>

<style scoped>
.error-message {
  padding: var(--space-md);
  background: rgba(242, 63, 66, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
}

.success-message {
  padding: var(--space-md);
  background: rgba(70, 209, 96, 0.1);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  color: var(--color-success);
}

small {
  display: block;
  margin-top: var(--space-xs);
  font-size: var(--font-size-xs);
}
</style>
