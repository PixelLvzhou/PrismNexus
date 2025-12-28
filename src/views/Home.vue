<template>
  <div class="home min-h-screen bg-white" id="pullRefreshContainer">
    <!-- 下拉加载提示区域 -->
    <div id="pullRefreshIndicator" style="height: 0; overflow: hidden; transition: height 0.3s ease;">
      <div class="pull-refresh-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 0;">
        <div id="refreshSpinner" class="spinner" style="width: 24px; height: 24px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 8px;"></div>
        <div id="refreshText" style="font-size: 14px; color: #666;">下拉刷新</div>
      </div>
    </div>
    
    <!-- 轮播图组件 -->
    <Carousel />

    <!-- 地图组件 -->
    <Map />

    <!-- 装备区域组件 -->
    <EquipmentArea />
    
    <!-- 支付按钮 -->
    <div class="pay-button-container">
      <button class="pay-button" @click="handlePay">微信支付</button>
    </div>

    

    <!-- 功能按钮组件 -->
    <FunctionButtons v-if="false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Carousel from '../components/Carousel.vue';
import Map from '../components/Map.vue';
import EquipmentArea from '../components/EquipmentArea.vue';

// 下拉刷新相关状态
const isRefreshing = ref(false);
const touchStartY = ref(0);
const currentY = ref(0);
const pullDistance = ref(0);
const maxPullDistance = 80; // 最大下拉距离
const pullRefreshThreshold = 60; // 触发刷新的阈值

// 下拉刷新事件处理函数
const handleTouchStart = (e: TouchEvent) => {
  // 检查触摸事件是否来自地图区域
  const target = e.target as HTMLElement;
  const isMapArea = target.closest('.map-container') !== null;
  
  // 只有在页面顶部、不在刷新中且不是地图区域才能触发下拉刷新
  if (window.scrollY === 0 && !isRefreshing.value && e.touches && e.touches.length > 0 && !isMapArea) {
    touchStartY.value = e.touches[0]?.clientY || 0;
    currentY.value = touchStartY.value;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  // 检查触摸事件是否来自地图区域
  const target = e.target as HTMLElement;
  const isMapArea = target.closest('.map-container') !== null;
  
  if (touchStartY.value > 0 && !isRefreshing.value && e.touches && e.touches.length > 0 && !isMapArea) {
    currentY.value = e.touches[0]?.clientY || 0;
    pullDistance.value = currentY.value - touchStartY.value;
    
    // 只允许向下拉
    if (pullDistance.value > 0) {
      // 限制最大下拉距离
      const displayDistance = Math.min(pullDistance.value * 0.5, maxPullDistance);
      
      const indicator = document.getElementById('pullRefreshIndicator');
      const refreshText = document.getElementById('refreshText');
      
      if (indicator) {
        indicator.style.height = `${displayDistance}px`;
      }
      
      if (refreshText) {
        // 根据下拉距离改变提示文本
        if (displayDistance >= pullRefreshThreshold) {
          refreshText.textContent = '释放刷新';
        } else {
          refreshText.textContent = '下拉刷新';
        }
      }
      
      // 阻止默认滚动行为
      e.preventDefault();
    }
  }
};

const handleTouchEnd = () => {
  if (touchStartY.value > 0 && !isRefreshing.value) {
    const displayDistance = Math.min(pullDistance.value * 0.5, maxPullDistance);
    const indicator = document.getElementById('pullRefreshIndicator');
    const refreshText = document.getElementById('refreshText');
    
    if (displayDistance >= pullRefreshThreshold) {
      // 触发刷新
      isRefreshing.value = true;
      if (indicator) {
        indicator.style.height = '60px';
      }
      if (refreshText) {
        refreshText.textContent = '刷新中...';
      }
      
      // 模拟加载过程
      setTimeout(() => {
        isRefreshing.value = false;
        if (indicator) {
          indicator.style.height = '0';
        }
        if (refreshText) {
          refreshText.textContent = '下拉刷新';
        }
      }, 1500);
    } else {
      // 恢复原位
      if (indicator) {
        indicator.style.height = '0';
      }
    }
    
    // 重置状态
    touchStartY.value = 0;
    currentY.value = 0;
    pullDistance.value = 0;
  }
};

// 组件挂载时
onMounted(() => {
  // 添加触摸事件监听
  const container = document.getElementById('pullRefreshContainer');
  if (container) {
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
  }
});

// 支付按钮点击事件
const handlePay = async () => {
  try {
    console.log('点击了微信支付按钮，开始调用支付接口');
    
    // 调用后端支付接口获取支付参数
    const response = await fetch('/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 1, // 支付金额，单位：分
        description: '测试支付', // 订单描述
        out_trade_no: `test_${Date.now()}` // 订单号
      })
    });
    
    const result = await response.json();
    
    if (result.code === 200) {
      const payParams = result.data;
      console.log('获取支付参数成功:', payParams);
      
      // 检查支付参数是否完整
      const requiredParams = ['appid', 'timestamp', 'nonceStr', 'package', 'signType', 'paySign'];
      const missingParams = requiredParams.filter(param => !payParams[param]);
      
      if (missingParams.length > 0) {
        console.error('支付参数不完整，缺少:', missingParams);
        alert(`支付参数不完整，缺少: ${missingParams.join(', ')}`);
        return;
      }
      
      // 调用微信支付
      if (typeof window !== 'undefined' && (window as any).wx) {
        console.log('调用wx.chooseWXPay，参数:', {
          appId: payParams.appid,
          timestamp: payParams.timestamp,
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType,
          paySign: payParams.paySign
        });
        
        (window as any).wx.chooseWXPay({
          appId: payParams.appid,
          timestamp: payParams.timestamp, // 使用小写s的timestamp
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType,
          paySign: payParams.paySign,
          success: function(res: any) {
            console.log('支付成功:', res);
            alert('支付成功');
            // 支付成功后的处理逻辑
          },
          cancel: function(res: any) {
            console.log('用户取消支付:', res);
            alert('用户取消支付');
          },
          fail: function(res: any) {
            console.error('支付失败:', res);
            alert('支付失败，请重试');
          }
        });
      } else {
        console.error('微信JSAPI未加载');
        alert('微信环境检测失败，请在微信中打开');
      }
    } else {
      console.error('获取支付参数失败:', result.message);
      alert('获取支付参数失败，请重试');
    }
  } catch (error) {
    console.error('支付接口调用失败:', error);
    alert('支付接口调用失败，请重试');
  }
};

// 组件卸载时
onUnmounted(() => {
  // 移除事件监听
  const container = document.getElementById('pullRefreshContainer');
  if (container) {
    container.removeEventListener('touchstart', handleTouchStart);
    container.removeEventListener('touchmove', handleTouchMove);
    container.removeEventListener('touchend', handleTouchEnd);
  }
});
</script>

<style scoped>
.pay-button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pay-button {
  padding: 12px 30px;
  background-color: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.pay-button:hover {
  background-color: #06b347;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pay-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 旋转动画定义 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 下拉加载指示器样式 */
#pullRefreshIndicator {
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.pull-refresh-content {
  transform-origin: center;
  transition: transform 0.3s ease;
}

/* 移动端优化 */
@media (max-width: 768px) {
  #pullRefreshIndicator {
    background-color: #f5f5f5;
  }
  
  .pull-refresh-content {
    padding: 15px 0;
  }
  
  #refreshSpinner {
    width: 20px !important;
    height: 20px !important;
    margin-bottom: 6px !important;
  }
  
  #refreshText {
    font-size: 13px !important;
  }
}


</style>