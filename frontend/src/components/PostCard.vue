<template>
  <article class="post-card" @click="navigateToPost">
    <div class="vote-section">
      <button 
        class="vote-btn" 
        :class="{ upvoted: userVote === 1 }"
        @click.stop="vote(1)"
      >
        ▲
      </button>
      <span class="vote-count">{{ votes }}</span>
      <button 
        class="vote-btn" 
        :class="{ downvoted: userVote === -1 }"
        @click.stop="vote(-1)"
      >
        ▼
      </button>
    </div>
    
    <div class="post-content">
      <div class="post-meta">
        <router-link 
          :to="`/r/${post.subreddit.name}`" 
          class="subreddit-link"
          @click.stop
        >
          r/{{ post.subreddit.name }}
        </router-link>
        <span>•</span>
        <span>Posted by </span>
        <router-link 
          :to="`/u/${post.author.username}`" 
          class="username-link"
          @click.stop
        >
          u/{{ post.author.username }}
        </router-link>
        <span>•</span>
        <span>{{ formatTime(post.createdAt) }}</span>
      </div>
      
      <h2 class="post-title">{{ post.title }}</h2>
      
      <img v-if="post.imageUrl" :src="post.imageUrl" :alt="post.title" class="post-image" />
      
      <p class="post-text">{{ post.content }}</p>
      
      <div class="post-actions">
        <div class="post-action">
          💬 Comments
        </div>
        <div class="post-action">
          🔗 Share
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/client';
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

const props = defineProps<{
  post: Post;
}>();

const router = useRouter();
const { state: authState } = useAuth();
const votes = ref(props.post.votes);
const userVote = ref<number | null>(null);

// Check if user has voted
if (authState.isAuthenticated && props.post.voters) {
  const existingVote = props.post.voters.find(
    (v) => v.user === authState.user?._id
  );
  if (existingVote) {
    userVote.value = existingVote.vote;
  }
}

const vote = async (voteValue: number) => {
  if (!authState.isAuthenticated) {
    alert('Please login to vote');
    return;
  }
  
  try {
    const response = await apiClient.post(`/posts/${props.post._id}/vote`, {
      vote: voteValue,
    });
    votes.value = response.data.votes;
    
    // Update user vote state
    if (userVote.value === voteValue) {
      userVote.value = null;
    } else {
      userVote.value = voteValue;
    }
  } catch (error) {
    console.error('Failed to vote:', error);
  }
};

const navigateToPost = () => {
  router.push(`/post/${props.post._id}`);
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
