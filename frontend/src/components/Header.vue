<template>
  <header class="header">
    <div class="header-content">
      <div class="logo" @click="$router.push('/')">
        Supereddit
      </div>
      
      <div class="search-bar">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search Supereddit..."
          v-model="searchQuery"
          @keypress="handleKeyPress"
        />
      </div>
      
      <div class="user-menu" v-if="!authState.loading">
        <button 
          v-if="!authState.isAuthenticated" 
          class="btn btn-primary"
          @click="login"
        >
          Login with Discord
        </button>
        
        <template v-else>
          <router-link to="/submit" class="btn btn-primary">
            Create Post
          </router-link>
          
          <div class="user-info">
            <img 
              :src="`https://cdn.discordapp.com/avatars/${authState.user?.discordId}/${authState.user?.avatar}.png`" 
              :alt="authState.user?.username"
              class="user-avatar"
            />
            <span class="username">{{ authState.user?.username }}</span>
          </div>
          
          <button class="btn btn-ghost" @click="logout">
            Logout
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';

const router = useRouter();
const searchQuery = ref('');
const { state: authState, login, logout } = useAuth();

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`);
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
};
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
</style>
