<template>
  <div class="books-page min-h-screen bg-white">
    <!-- 导航栏 -->
    <nav class="nav-bar">
      <div class="nav-left">
        <span class="bookshelf-title">书架</span>
      </div>
      <div class="nav-right">
        <div class="search-icon">🔍</div>
        <button class="manage-btn">管理</button>
      </div>
    </nav>
    
    <div class="content">
      <!-- 图书列表模块 -->
      <div class="books-list-container">
        <!-- 第一本图书 -->
        <div class="book-item" @click="goToBookContent('1')" style="cursor: pointer;">
          <!-- 图书封面 -->
          <div class="book-cover">
            <div class="book-cover-placeholder blue-cover"></div>
          </div>
          <!-- 图书信息 -->
          <div class="book-info">
            <div class="book-title">仙逆</div>
            <div class="book-progress">阅读进度：65%</div>
            <div class="book-update">更新进度：第1200章</div>
          </div>
          <!-- 更多按钮 -->
          <div class="book-action">
            <button class="more-btn">更多</button>
          </div>
        </div>
        
        <!-- 第二本图书 -->
        <div class="book-item" @click="goToBookContent('2')" style="cursor: pointer;">
          <!-- 图书封面 -->
          <div class="book-cover">
            <div class="book-cover-placeholder red-cover"></div>
          </div>
          <!-- 图书信息 -->
          <div class="book-info">
            <div class="book-title">求魔</div>
            <div class="book-progress">阅读进度：42%</div>
            <div class="book-update">更新进度：第950章</div>
          </div>
          <!-- 更多按钮 -->
          <div class="book-action">
            <button class="more-btn">更多</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到图书内容页
const goToBookContent = (bookId: string) => {
  router.push(`/book/${bookId}`)
}
</script>

<style scoped>
.books-page {
  /* 添加padding-top以避免内容被固定导航栏遮挡 */
  padding-top: 50px;
}

/* 导航栏样式 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  height: 50px;
  background-color: #ffffff;
  /* 去掉底部下划线 */
  border-bottom: none;
  /* 添加下边框阴影 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  /* 设置导航栏顶部固定 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-left .bookshelf-title {
  font-size: 18px;
  font-weight: bold;
  /* 蓝绿渐变色文本 */
  background: linear-gradient(135deg, #26c6da, #00acc1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-icon {
  font-size: 18px;
  cursor: pointer;
}

.manage-btn {
  width: 60px;
  height: 30px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.manage-btn:hover {
  background-color: #1976d2;
}

/* 图书列表模块样式 */
.content {
  /* 缩小页面两边的间距（从20px缩小为10px） */
  padding: 20px 10px;
}

.books-list-container {
  display: flex;
  flex-direction: column;
  /* 缩小图书模块之间的上下距离（从20px缩小为10px） */
  gap: 10px;
}

/* 单个图书项目样式 */
.book-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  /* 毛玻璃效果 */
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* 右下阴影 */
  box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1);
  /* 移除边框线 */
  border: none;
}

/* 图书封面样式 */
.book-cover {
  width: 88px; /* 缩小20%（110px → 88px） */
  height: 120px; /* 缩小20%（150px → 120px） */
  flex-shrink: 0;
}

.book-cover-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

/* 蓝色封面 */
.blue-cover {
  background-color: #2196f3;
}

/* 红色封面 */
.red-cover {
  background-color: #f44336;
}

/* 图书信息样式 */
.book-info {
  flex: 1;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.book-progress,
.book-update {
  font-size: 14px;
  color: #666;
}

/* 更多按钮样式 */
.book-action {
  /* 调整为绝对定位，使其位于模块最右侧底部 */
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 15px;
}

.book-item {
  /* 为了让子元素绝对定位有效，父元素需要相对定位 */
  position: relative;
}

.more-btn {
  /* 宽度增加10%（从40px到44px） */
  width: 44px;
  /* 高度缩小30%（从32px到22px） */
  height: 22px;
  /* 蓝绿色渐变背景 */
  background: linear-gradient(135deg, #26c6da, #00acc1);
  color: white;
  border: none;
  border-radius: 4px;
  /* 文字大小缩小30%（从14px到10px） */
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-btn:hover {
  background: linear-gradient(135deg, #ee5a6f, #ff6b6b);
}
</style>