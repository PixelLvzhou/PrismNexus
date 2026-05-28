<template>
  <div class="grid-background" :style="{ backgroundColor: themeColors.background, backgroundImage: `linear-gradient(${themeColors.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${themeColors.gridColor} 1px, transparent 1px)` }">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="logo-triangle">
          <div class="inner-triangle"></div>
        </div>
        <span class="brand-text">Prism Nexus</span>
      </div>
      <div class="navbar-menu">
        <span class="nav-item active">仪表盘</span>
        <span class="nav-item">数据中心</span>
        <span class="nav-item">系统设置</span>
      </div>
      <div class="navbar-user">
        <span class="user-name">管理员</span>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </nav>

    <!-- 欢迎标题 -->
    <div class="welcome-container">
      <h1 class="welcome-title">欢迎来到棱镜系统</h1>
      <p class="welcome-subtitle">Prism Nexus - 安全访问控制系统</p>
    </div>

    <!-- 功能卡片区域 -->
    <div class="cards-container">
      <div class="card" v-for="(card, index) in cards" :key="index">
        <div class="card-icon" :style="{ backgroundColor: themeColors.primary + '20', color: themeColors.primary }">
          <i :class="card.icon"></i>
        </div>
        <h3 class="card-title">{{ card.title }}</h3>
        <p class="card-desc">{{ card.desc }}</p>
      </div>
    </div>

    <!-- 底部版权 -->
    <footer class="footer">
      <span>&copy; 2024 Prism Nexus. All rights reserved.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useRouter } from 'vue-router';

const { themeColors } = useTheme();
const router = useRouter();

const cards = ref([
  { icon: 'fas fa-shield-alt', title: '安全防护', desc: '全方位安全监控与防护' },
  { icon: 'fas fa-chart-line', title: '数据分析', desc: '实时数据统计与分析' },
  { icon: 'fas fa-users', title: '用户管理', desc: '用户权限与角色管理' },
  { icon: 'fas fa-cog', title: '系统配置', desc: '灵活的系统设置选项' },
]);

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<style scoped>
.grid-background {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  background-size: 40px 40px;
  transition: background-color 0.3s ease, background-image 0.3s ease;
}

/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-triangle {
  width: 30px;
  height: 30px;
  position: relative;
  filter: v-bind('`drop-shadow(0 0 5px ${themeColors.primary}A0)`');
}

.logo-triangle::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 26px solid v-bind('themeColors.primary');
}

.logo-triangle .inner-triangle {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 12px solid v-bind('themeColors.background');
}

.brand-text {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: v-bind('themeColors.primary');
}

.navbar-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  font-family: 'Rajdhani', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: v-bind('themeColors.secondary');
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  color: v-bind('themeColors.primary');
  background: rgba(15, 247, 150, 0.1);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  color: v-bind('themeColors.text');
}

.logout-btn {
  padding: 8px 20px;
  background: transparent;
  border: 1px solid v-bind('themeColors.primary');
  color: v-bind('themeColors.primary');
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: v-bind('themeColors.primary');
  color: #000;
  box-shadow: v-bind('`0 0 15px ${themeColors.primary}80`');
}

/* 欢迎区域 */
.welcome-container {
  text-align: center;
  padding: 60px 20px 40px;
}

.welcome-title {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 36px;
  font-weight: 900;
  color: v-bind('themeColors.primary');
  margin-bottom: 10px;
  text-shadow: v-bind('`0 0 20px ${themeColors.primary}60`');
}

.welcome-subtitle {
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  color: v-bind('themeColors.secondary');
  letter-spacing: 2px;
}

/* 卡片区域 */
.cards-container {
  display: flex;
  justify-content: center;
  gap: 25px;
  padding: 20px 40px;
  flex-wrap: wrap;
}

.card {
  width: 250px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  border-color: v-bind('themeColors.primary');
  box-shadow: v-bind('`0 10px 30px rgba(${themeColors.primary.replace("#", "").match(/.{2}/g)?.join(", ")}, 0.2)`');
}

.card-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.card-title {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: v-bind('themeColors.text');
  margin-bottom: 10px;
}

.card-desc {
  font-family: 'Rajdhani', sans-serif;
  font-size: 13px;
  color: v-bind('themeColors.secondary');
  line-height: 1.6;
}

/* 底部 */
.footer {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Rajdhani', sans-serif;
  font-size: 12px;
  color: v-bind('themeColors.secondary');
  opacity: 0.6;
}

/* 响应式 */
@media (max-width: 768px) {
  .navbar {
    padding: 10px 15px;
  }
  
  .navbar-menu {
    display: none;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .cards-container {
    gap: 15px;
    padding: 10px 20px;
  }
  
  .card {
    width: calc(50% - 8px);
    padding: 20px;
  }
}
</style>