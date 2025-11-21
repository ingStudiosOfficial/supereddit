<template>
  <div>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="error" class="card text-center">
      <h2>{{ error }}</h2>
    </div>
    
    <div v-else>
      <!-- User Profile Header -->
      <div class="card mb-lg">
        <div class="user-profile-header">
          <img 
            v-if="userProfile?.user.avatar && userProfile.user.avatar !== 'default'"
            :src="`https://cdn.discordapp.com/avatars/${userProfile.user.discordId}/${userProfile.user.avatar}.png`" 
            :alt="userProfile?.user.username"
            class="profile-avatar"
          />
          <div v-else class="profile-avatar-placeholder">
            {{ userProfile?.user.username.charAt(0).toUpperCase() }}
          </div>
          
          <div class="profile-info">
            <h1>u/{{ userProfile?.user.username }}</h1>
            <div class="profile-stats">
              <span>{{ userProfile?.posts.length || 0 }} posts</span>
              <span>•</span>
              <span>{{ userProfile?.comments.length || 0 }} comments</span>
              <span>•</span>
              <span>Joined {{ formatDate(userProfile?.user.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs mb-md">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'posts' }"
          @click="activeTab = 'posts'"
        >
          Posts ({{ userProfile?.posts.length || 0 }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'comments' }"
          @click="activeTab = 'comments'"
        >
          Comments ({{ userProfile?.comments.length || 0 }})
        </button>
      </div>
      
      <!-- Posts Tab -->
      <div v-if="activeTab === 'posts'">
        <div v-if="userProfile?.posts.length === 0" class="card text-center text-muted">
          <p>No posts yet</p>
        </div>
        <PostCard 
          v-for="post in userProfile?.posts" 
          :key="post._id"
          :post="post"
        />
      </div>
      
      <!-- Comments Tab -->
      <div v-if="activeTab === 'comments'">
        <div v-if="userProfile?.comments.length === 0" class="card text-center text-muted">
          <p>No comments yet</p>
        </div>
        <div 
          v-for="comment in userProfile?.comments" 
          :key="comment._id"
          class="card mb-md comment-item"
          @click="navigateToPost(comment.post._id)"
        >
          <div class="comment-context">
            <span class="text-muted">Commented on:</span>
            <router-link 
              :to="`/post/${comment.post._id}`" 
              class="post-link"
              @click.stop
            >
              {{ comment.post.title }}
            </router-link>
          </div>
          <div class="comment-content mt-sm">
            {{ comment.content }}
          </div>
          <div class="comment-meta mt-sm">
            <span>{{ comment.votes }} points</span>
            <span>•</span>
            <span>{{ formatTime(comment.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../api/client';
import PostCard from '../components/PostCard.vue';

interface User {
  _id: string;
  username: string;
  avatar: string;
  discriminator: string;
  discordId?: string;
  createdAt: string;
  loginCount?: number;
  lastLogin?: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  votes: number;
  author: {
    username: string;
  };
  subreddit: {
    name: string;
  };
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  votes: number;
  post: {
    _id: string;
    title: string;
  };
  createdAt: string;
}

interface UserProfile {
  user: User;
  posts: Post[];
  comments: Comment[];
}

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref('');
const userProfile = ref<UserProfile | null>(null);
const activeTab = ref<'posts' | 'comments'>('posts');

const fetchUserProfile = async () => {
  const username = route.params.username as string;
  if (!username) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await apiClient.get(`/users/${username}`);
    userProfile.value = response.data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load user profile';
  } finally {
    loading.value = false;
  }
};

const navigateToPost = (postId: string) => {
  router.push(`/post/${postId}`);
};

const formatDate = (timestamp?: string) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.user-profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  border: 3px solid var(--color-accent);
}

.profile-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--gradient-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: white;
}

.profile-info h1 {
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.tabs {
  display: flex;
  gap: var(--space-sm);
  border-bottom: 2px solid var(--color-border);
}

.tab-btn {
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--color-text-primary);
}

.tab-btn.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.comment-item {
  cursor: pointer;
  transition: all var(--transition-base);
}

.comment-item:hover {
  border-color: var(--color-border-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.comment-context {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
}

.post-link {
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}

.comment-content {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
</style>
