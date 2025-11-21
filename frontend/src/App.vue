<template>
  <div id="app">
    <Header />
    <div class="layout">
      <main class="main-content">
        <router-view />
      </main>
      <Sidebar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import { useAuth } from './stores/auth';

const { fetchUser } = useAuth();

onMounted(() => {
  fetchUser();
});
</script>
