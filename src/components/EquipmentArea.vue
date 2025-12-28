<template>
  <div class="equipment-area">
    <!-- 左侧装备网格 -->
    <div class="equipment-grid left-grid">
      <div
        v-for="(equipment, index) in leftEquipments"
        :key="`left-${index}`"
        class="equipment-card"
        :style="{ backgroundColor: equipment.bgColor }"
      >
        <!-- 装备图片 -->
        <div class="equipment-image">
          <img :src="equipment.image" :alt="equipment.name" />
        </div>
        
        <!-- 星级 -->
        <div class="equipment-stars">
          <span v-for="i in equipment.stars" :key="i" class="star">★</span>
        </div>
        
        <!-- 等级 -->
        <div class="equipment-level">{{ equipment.level }}级</div>
        
        <!-- 红色圆点 -->
        <div v-if="equipment.hasRedDot" class="red-dot"></div>
      </div>
    </div>
    
    <!-- 右侧装备网格 -->
    <div class="equipment-grid right-grid">
      <div
        v-for="(equipment, index) in rightEquipments"
        :key="`right-${index}`"
        class="equipment-card"
        :style="{ backgroundColor: equipment.bgColor }"
      >
        <!-- 装备图片 -->
        <div class="equipment-image">
          <img :src="equipment.image" :alt="equipment.name" />
        </div>
        
        <!-- 星级 -->
        <div class="equipment-stars">
          <span v-for="i in equipment.stars" :key="i" class="star">★</span>
        </div>
        
        <!-- 等级 -->
        <div class="equipment-level">{{ equipment.level }}级</div>
        
        <!-- 红色圆点 -->
        <div v-if="equipment.hasRedDot" class="red-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 装备数据类型定义
interface Equipment {
  id: number;
  name: string;
  image: string;
  stars: number;
  level: number;
  hasRedDot: boolean;
  bgColor: string;
}

// 生成随机装备图片URL
const generateEquipmentImage = () => {
  // 使用随机图片服务生成装备图片
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/equip${randomId}/100/100`;
};

// 引入ref创建响应式数据
import { ref } from 'vue';

// 左侧装备数据 - 响应式
const leftEquipments = ref<Equipment[]>([
  { id: 1, name: '神剑', image: generateEquipmentImage(), stars: 2, level: 246, hasRedDot: false, bgColor: '#1a237e' },
  { id: 2, name: '神甲', image: generateEquipmentImage(), stars: 1, level: 244, hasRedDot: false, bgColor: '#311b92' },
  { id: 3, name: '神袍', image: generateEquipmentImage(), stars: 1, level: 244, hasRedDot: false, bgColor: '#4527a0' },
  { id: 4, name: '神靴', image: generateEquipmentImage(), stars: 1, level: 243, hasRedDot: false, bgColor: '#512da8' },
  { id: 5, name: '神冠', image: generateEquipmentImage(), stars: 1, level: 240, hasRedDot: false, bgColor: '#5e35b1' },
  { id: 6, name: '神带', image: generateEquipmentImage(), stars: 2, level: 246, hasRedDot: false, bgColor: '#673ab7' },
  { id: 7, name: '神符', image: generateEquipmentImage(), stars: 1, level: 245, hasRedDot: false, bgColor: '#7e57c2' },
  { id: 8, name: '神印', image: generateEquipmentImage(), stars: 1, level: 245, hasRedDot: false, bgColor: '#8e24aa' },
  { id: 9, name: '神珠', image: generateEquipmentImage(), stars: 1, level: 243, hasRedDot: false, bgColor: '#ad1457' },
  { id: 10, name: '神莲', image: generateEquipmentImage(), stars: 2, level: 244, hasRedDot: false, bgColor: '#c2185b' },
  { id: 11, name: '神灯', image: generateEquipmentImage(), stars: 1, level: 244, hasRedDot: false, bgColor: '#d81b60' },
  { id: 12, name: '神花', image: generateEquipmentImage(), stars: 1, level: 245, hasRedDot: false, bgColor: '#e91e63' },
]);

// 右侧装备数据 - 响应式
const rightEquipments = ref<Equipment[]>([
  { id: 13, name: '龙形装备', image: generateEquipmentImage(), stars: 3, level: 98, hasRedDot: true, bgColor: '#f57c00' },
  { id: 14, name: '兽形装备', image: generateEquipmentImage(), stars: 1, level: 1, hasRedDot: true, bgColor: '#f9a825' },
]);
</script>

<style scoped>
.equipment-area {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #121212;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.equipment-grid {
  display: grid;
  gap: 15px;
}

/* 左侧网格：4列3行 */
.left-grid {
  display: grid;
  grid-template-columns: repeat(4, 80px);
  grid-template-rows: repeat(3, 80px);
  gap: 10px;
}

/* 右侧网格：2列3行 */
.right-grid {
  display: grid;
  grid-template-columns: repeat(2, 80px);
  grid-template-rows: repeat(3, 80px);
  gap: 10px;
}

.equipment-card {
  position: relative;
  width: 80px;
  height: 80px;
  border: 2px solid #ffd700;
  border-radius: 8px;
  padding: 5px;
  box-shadow: 
    0 0 10px rgba(255, 215, 0, 0.5),
    inset 0 0 10px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.equipment-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 5px 15px rgba(255, 215, 0, 0.7),
    inset 0 0 15px rgba(255, 255, 255, 0.3);
}

.equipment-image {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
}

.equipment-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

.equipment-stars {
  position: absolute;
  top: 5px;
  left: 5px;
  display: flex;
  gap: 2px;
}

.star {
  color: #ffd700;
  font-size: 14px;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.8);
}

.equipment-level {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px 0;
  border-radius: 0 0 6px 6px;
}

.red-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background-color: #ff0000;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
  border: 2px solid #ffffff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .equipment-area {
    flex-direction: column;
    align-items: center;
  }
  
  .equipment-card {
    width: 100px;
    height: 100px;
  }
  
  .equipment-image {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 768px) {
  .equipment-area {
    padding: 10px;
    gap: 10px;
  }
  
  .left-grid,
  .right-grid {
    gap: 8px;
  }
  
  .equipment-card {
    width: 80px;
    height: 80px;
    padding: 5px;
  }
  
  .equipment-image {
    width: 50px;
    height: 50px;
  }
  
  .star {
    font-size: 12px;
  }
  
  .equipment-level {
    font-size: 10px;
  }
}
</style>