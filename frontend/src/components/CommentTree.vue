<template>
  <div class="comment">
    <div class="comment-header">
      <span class="comment-author">{{ comment.author.username }}</span>
      <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
    </div>
    
    <div class="comment-content">{{ comment.content }}</div>
    
    <div class="comment-actions">
      <button 
        class="vote-btn" 
        :class="{ upvoted: userVote === 1 }"
        @click="vote(1)"
      >
        ▲ {{ votes }}
      </button>
      <button 
        class="vote-btn" 
        :class="{ downvoted: userVote === -1 }"
        @click="vote(-1)"
      >
        ▼
      </button>
      <button 
        v-if="authState.isAuthenticated" 
        class="btn btn-ghost"
        @click="showReply = !showReply"
      >
        Reply
      </button>
    </div>
    
    <!-- Reply Form -->
    <div v-if="showReply" class="mt-md">
      <textarea 
        v-model="replyContent" 
        class="form-textarea"
        placeholder="What are your thoughts?"
      ></textarea>
      <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-sm);">
        <button class="btn btn-primary" @click="submitReply">Reply</button>
        <button class="btn btn-secondary" @click="showReply = false">Cancel</button>
      </div>
    </div>
    
    <!-- Nested Replies -->
    <div v-if="replies.length > 0" class="comment-replies">
      <CommentTree 
        v-for="reply in replies" 
        :key="reply._id"
        :comment="reply"
        :postId="postId"
        :allComments="allComments"
        @reply-added="$emit('reply-added')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import apiClient from '../api/client';
import { useAuth } from '../stores/auth';

interface Comment {
  _id: string;
  content: string;
  author: {
    username: string;
  };
  votes: number;
  createdAt: string;
  parentComment?: string;
  voters?: Array<{ user: string; vote: number }>;
}

const props = defineProps<{
  comment: Comment;
  postId: string;
  allComments: Comment[];
}>();

const emit = defineEmits(['reply-added']);

const { state: authState } = useAuth();
const votes = ref(props.comment.votes);
const userVote = ref<number | null>(null);
const showReply = ref(false);
const replyContent = ref('');

// Get replies to this comment
const replies = computed(() => {
  return props.allComments.filter(
    (c) => c.parentComment === props.comment._id
  );
});

// Check if user has voted
if (authState.isAuthenticated && props.comment.voters) {
  const existingVote = props.comment.voters.find(
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
    const response = await apiClient.post(`/comments/${props.comment._id}/vote`, {
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

const submitReply = async () => {
  if (!replyContent.value.trim()) return;
  
  try {
    await apiClient.post(`/posts/${props.postId}/comments`, {
      content: replyContent.value,
      parentComment: props.comment._id,
    });
    replyContent.value = '';
    showReply.value = false;
    emit('reply-added');
  } catch (error) {
    console.error('Failed to post reply:', error);
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
</script>
