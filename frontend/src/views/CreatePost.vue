<template>
  <div>
    <div class="card">
      <h1>Create a Post</h1>
      
      <div v-if="!authState.isAuthenticated" class="text-center text-muted">
        <p>You must be logged in to create a post.</p>
        <button class="btn btn-primary mt-md" @click="login">
          Login with Discord
        </button>
      </div>
      
      <form v-else @submit.prevent="submitPost">
        <div class="form-group">
          <label class="form-label">Choose a community</label>
          <select v-model="formData.subreddit" class="form-input" required>
            <option value="">Select a subreddit</option>
            <option 
              v-for="subreddit in subreddits" 
              :key="subreddit._id"
              :value="subreddit.name"
            >
              r/{{ subreddit.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Title</label>
          <input 
            v-model="formData.title" 
            class="form-input"
            placeholder="An interesting title"
            maxlength="300"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Content</label>
          <textarea 
            v-model="formData.content" 
            class="form-textarea"
            placeholder="What's on your mind?"
            style="min-height: 200px;"
            required
          ></textarea>
        </div>
        
        <div style="display: flex; gap: var(--space-md);">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Posting...' : 'Post' }}
          </button>
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="$router.push('/')"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/client';
import { useAuth } from '../stores/auth';

interface Subreddit {
  _id: string;
  name: string;
}

const router = useRouter();
const { state: authState, login } = useAuth();
const subreddits = ref<Subreddit[]>([]);
const submitting = ref(false);
const formData = ref({
  subreddit: '',
  title: '',
  content: '',
});

const fetchSubreddits = async () => {
  try {
    const response = await apiClient.get('/subreddits');
    subreddits.value = response.data.subreddits;
  } catch (error) {
    console.error('Failed to fetch subreddits:', error);
  }
};

const submitPost = async () => {
  try {
    submitting.value = true;
    const response = await apiClient.post('/posts', formData.value);
    router.push(`/post/${response.data.post._id}`);
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to create post');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchSubreddits();
});
</script>
