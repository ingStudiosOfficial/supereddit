<template>
  <div>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="!post" class="text-center">
      <h2>Post not found</h2>
    </div>
    
    <div v-else>
      <!-- Post Content -->
      <div class="card mb-lg">
        <div style="display: flex; gap: var(--space-md);">
          <div class="vote-section">
            <button 
              class="vote-btn" 
              :class="{ upvoted: userVote === 1 }"
              @click="votePost(1)"
            >
              ▲
            </button>
            <span class="vote-count">{{ votes }}</span>
            <button 
              class="vote-btn" 
              :class="{ downvoted: userVote === -1 }"
              @click="votePost(-1)"
            >
              ▼
            </button>
          </div>
          
          <div style="flex: 1;">
            <div class="post-meta">
              <router-link 
                :to="`/r/${post.subreddit.name}`" 
                class="subreddit-link"
              >
                r/{{ post.subreddit.name }}
              </router-link>
              <span>•</span>
              <span>Posted by </span>
              <router-link 
                :to="`/u/${post.author.username}`" 
                class="username-link"
              >
                u/{{ post.author.username }}
              </router-link>
              <span>•</span>
              <span>{{ formatTime(post.createdAt) }}</span>
            </div>
            
            <h1 class="post-title">{{ post.title }}</h1>
            
            <img v-if="post.imageUrl" :src="post.imageUrl" :alt="post.title" class="post-image" />
            
            <p style="color: var(--color-text-secondary); white-space: pre-wrap;">
              {{ post.content }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Add Comment -->
      <div v-if="authState.isAuthenticated" class="card mb-lg">
        <h3>Add a Comment</h3>
        <textarea 
          v-model="newComment" 
          class="form-textarea"
          placeholder="What are your thoughts?"
        ></textarea>
        <button class="btn btn-primary mt-md" @click="submitComment">
          Comment
        </button>
      </div>
      
      <div v-else class="card mb-lg text-center">
        <p class="text-muted">Login to comment</p>
      </div>
      
      <!-- Comments Section -->
      <div class="card">
        <h3>Comments ({{ comments.length }})</h3>
        
        <div v-if="commentsLoading" class="loading">
          <div class="spinner"></div>
        </div>
        
        <div v-else-if="topLevelComments.length === 0" class="text-center text-muted mt-md">
          <p>No comments yet. Be the first to comment!</p>
        </div>
        
        <div v-else class="mt-md">
          <CommentTree 
            v-for="comment in topLevelComments" 
            :key="comment._id"
            :comment="comment"
            :postId="post._id"
            :allComments="comments"
            @reply-added="fetchComments"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../api/client';
import CommentTree from '../components/CommentTree.vue';
import { useAuth } from '../stores/auth';

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
  voters?: Array<{ user: string; vote: number }>;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    username: string;
  };
  votes: number;
  createdAt: string;
  parentComment?: string;
}

const route = useRoute();
const { state: authState } = useAuth();
const post = ref<Post | null>(null);
const comments = ref<Comment[]>([]);
const loading = ref(true);
const commentsLoading = ref(true);
const newComment = ref('');
const votes = ref(0);
const userVote = ref<number | null>(null);

const topLevelComments = computed(() => {
  return comments.value.filter((c) => !c.parentComment);
});

const fetchPost = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get(`/posts/${route.params.id}`);
    post.value = response.data.post;
    votes.value = post.value.votes;
    
    // Check if user has voted
    if (authState.isAuthenticated && post.value.voters) {
      const existingVote = post.value.voters.find(
        (v) => v.user === authState.user?._id
      );
      if (existingVote) {
        userVote.value = existingVote.vote;
      }
    }
  } catch (error) {
    console.error('Failed to fetch post:', error);
  } finally {
    loading.value = false;
  }
};

const fetchComments = async () => {
  try {
    commentsLoading.value = true;
    const response = await apiClient.get(`/posts/${route.params.id}/comments`);
    comments.value = response.data.comments;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
  } finally {
    commentsLoading.value = false;
  }
};

const votePost = async (voteValue: number) => {
  if (!authState.isAuthenticated) {
    alert('Please login to vote');
    return;
  }
  
  try {
    const response = await apiClient.post(`/posts/${route.params.id}/vote`, {
      vote: voteValue,
    });
    votes.value = response.data.votes;
    
    if (userVote.value === voteValue) {
      userVote.value = null;
    } else {
      userVote.value = voteValue;
    }
  } catch (error) {
    console.error('Failed to vote:', error);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  
  try {
    await apiClient.post(`/posts/${route.params.id}/comments`, {
      content: newComment.value,
    });
    newComment.value = '';
    fetchComments();
  } catch (error) {
    console.error('Failed to post comment:', error);
  }
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
  fetchPost();
  fetchComments();
});
</script>

<style scoped>
.post-image {
  max-width: 100%;
  max-height: 33vh;
  height: auto;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  display: block;
  object-fit: contain;
}
</style>

