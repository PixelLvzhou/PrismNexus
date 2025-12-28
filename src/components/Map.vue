<template>
  <div class="map-container">
    <div id="map" ref="mapRef"></div>
    <!-- 备用地图显示 -->
    <div v-if="showBackupMap" class="backup-map">
      <h3>中国地图</h3>
      <p>当前网络环境无法加载地图瓦片</p>
      <p>地图中心点：北京 (39.9042°N, 116.4074°E)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';

const mapRef = ref<HTMLElement | null>(null);
const showBackupMap = ref(false);
let map: L.Map | null = null;
let tileLoadTimeout: number | null = null;

onMounted(() => {
  if (mapRef.value) {
    // 初始化地图，中心点设置为中国北京（116.4074°E, 39.9042°N）
    map = L.map(mapRef.value).setView([39.9042, 116.4074], 4);
    
    // 使用高德地图瓦片服务（国内可访问）
    const tileLayer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}', {
      subdomains: ['1', '2', '3', '4'],
      attribution: '© <a href="https://ditu.amap.com/">高德地图</a>',
      maxZoom: 18,
      minZoom: 3
    }).addTo(map);
    
    // 设置瓦片加载超时检测
    tileLoadTimeout = window.setTimeout(() => {
      console.error('地图瓦片加载超时');
      showBackupMap.value = true;
    }, 5000);
    
    // 添加瓦片加载错误处理
    tileLayer.on('tileerror', function(event) {
      console.error('瓦片加载失败:', event);
    });
    
    // 添加瓦片加载成功事件
    tileLayer.on('tileload', function() {
      if (tileLoadTimeout) {
        clearTimeout(tileLoadTimeout);
        tileLoadTimeout = null;
      }
      showBackupMap.value = false;
    });
    
    // 添加地图加载完成事件
    map.on('load', function() {
      console.log('地图加载完成');
      if (tileLoadTimeout) {
        clearTimeout(tileLoadTimeout);
        tileLoadTimeout = null;
      }
    });
    
    // 添加比例尺控件
    L.control.scale().addTo(map);
  }
});

onUnmounted(() => {
  if (map) {
    // 销毁地图实例，释放资源
    map.remove();
    map = null;
  }
  if (tileLoadTimeout) {
    clearTimeout(tileLoadTimeout);
    tileLoadTimeout = null;
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
  box-shadow: none;
  border: none;
  margin: 0;
  padding: 0;
}

/* 确保地图组件紧贴页面两边 */
:deep(.leaflet-container) {
  margin: 0;
  padding: 0;
}

#map {
  width: 100%;
  height: 100%;
}

/* Leaflet核心CSS样式 */
:deep(.leaflet-container) {
  position: relative;
  width: 100%;
  height: 100%;
  outline: 0;
}

:deep(.leaflet-pane) {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

:deep(.leaflet-tile-pane) {
  z-index: 2;
}

:deep(.leaflet-overlay-pane) {
  z-index: 4;
}

:deep(.leaflet-shadow-pane) {
  z-index: 5;
}

:deep(.leaflet-marker-pane) {
  z-index: 6;
}

:deep(.leaflet-tooltip-pane) {
  z-index: 6;
}

:deep(.leaflet-popup-pane) {
  z-index: 7;
}

:deep(.leaflet-map-pane canvas) {
  z-index: 1;
}

:deep(.leaflet-tile) {
  filter: inherit;
  display: block;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

:deep(.leaflet-tile-loaded) {
  opacity: 1;
}

:deep(.leaflet-tile-container) {
  z-index: 1;
}

:deep(.leaflet-tile-container img) {
  max-width: none !important;
  max-height: none !important;
}

:deep(.leaflet-control) {
  position: relative;
  z-index: 8;
  pointer-events: auto;
}

:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
}

:deep(.leaflet-top) {
  top: 0;
}

:deep(.leaflet-right) {
  right: 0;
}

:deep(.leaflet-bottom) {
  bottom: 0;
}

:deep(.leaflet-left) {
  left: 0;
}

:deep(.leaflet-control) {
  float: left;
  clear: both;
}

:deep(.leaflet-right .leaflet-control) {
  float: right;
}

:deep(.leaflet-top .leaflet-control) {
  margin-top: 10px;
}

:deep(.leaflet-bottom .leaflet-control) {
  margin-bottom: 10px;
}

:deep(.leaflet-left .leaflet-control) {
  margin-left: 10px;
}

:deep(.leaflet-right .leaflet-control) {
  margin-right: 10px;
}

:deep(.leaflet-control-zoom) {
  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
  border-radius: 4px;
}

:deep(.leaflet-control-zoom-in),
:deep(.leaflet-control-zoom-out) {
  width: 28px;
  height: 28px;
  text-align: center;
  line-height: 28px;
  background-color: #fff;
  cursor: pointer;
  font: bold 18px 'Lucida Console', Monaco, monospace;
}

:deep(.leaflet-control-zoom-in) {
  border-bottom: 1px solid #ccc;
  border-radius: 4px 4px 0 0;
}

:deep(.leaflet-control-zoom-out) {
  border-radius: 0 0 4px 4px;
}

:deep(.leaflet-control-scale) {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 5px #bbb;
  padding: 0 5px;
  font: 11px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif;
  color: #333;
  border-radius: 3px;
}

:deep(.leaflet-control-scale-line) {
  border: 2px solid #777;
  border-top: none;
  line-height: 1.1;
  padding: 2px 5px 1px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}

:deep(.leaflet-control-scale-line:not(:first-child)) {
  border-top: 2px solid #777;
  border-bottom: none;
  margin-top: -2px;
  padding-top: 1px;
  padding-bottom: 2px;
}

:deep(.leaflet-container) {
  background: #ddd;
  outline: 0;
}

:deep(.leaflet-container a) {
  color: #0078A8;
}

:deep(.leaflet-container a.leaflet-active) {
  outline: 2px solid orange;
}

:deep(.leaflet-zoom-box) {
  border: 2px dotted #38f;
  background: rgba(255, 255, 255, 0.5);
}

:deep(.leaflet-vml-shape) {
  width: 1px;
  height: 1px;
}

:deep(.leaflet-zoom-box) {
  cursor: crosshair;
}

:deep(.leaflet-dragging .leaflet-grab) {
  cursor: grabbing;
}

:deep(.leaflet-dragging .leaflet-grab, .leaflet-dragging .leaflet-marker-draggable) {
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
  cursor: grabbing;
}

:deep(.leaflet-container .leaflet-marker-icon),
:deep(.leaflet-container .leaflet-marker-shadow),
:deep(.leaflet-container .leaflet-image-layer),
:deep(.leaflet-container .leaflet-pane > svg),
:deep(.leaflet-container .leaflet-pane > canvas),
:deep(.leaflet-container .leaflet-tile),
:deep(.leaflet-container img.leaflet-image-layer),
:deep(.leaflet-container .leaflet-tile-container img),
:deep(.leaflet-container .leaflet-vml-shape),
:deep(.leaflet-container .leaflet-zoom-box),
:deep(.leaflet-container .leaflet-control) {
  position: absolute;
  left: 0;
  top: 0;
}

:deep(.leaflet-container .leaflet-marker-icon),
:deep(.leaflet-container .leaflet-marker-shadow) {
  display: block;
}

:deep(.leaflet-container .leaflet-marker-icon) {
  z-index: 10;
}

:deep(.leaflet-container .leaflet-shadow-pane .leaflet-marker-shadow) {
  z-index: 9;
}

:deep(.leaflet-container .leaflet-image-layer) {
  z-index: 2;
}

:deep(.leaflet-container .leaflet-tile) {
  filter: inherit;
  visibility: hidden;
}

:deep(.leaflet-container .leaflet-tile-loaded) {
  visibility: inherit;
}

:deep(.leaflet-container .leaflet-zoom-box) {
  z-index: 800;
}

:deep(.leaflet-container .leaflet-overlay-pane svg),
:deep(.leaflet-container .leaflet-marker-pane img),
:deep(.leaflet-container .leaflet-shadow-pane img),
:deep(.leaflet-container .leaflet-tile-pane img),
:deep(.leaflet-container img.leaflet-image-layer),
:deep(.leaflet-container .leaflet-tile-container img) {
  max-width: none !important;
  max-height: none !important;
  width: auto;
  height: auto;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
}

:deep(.leaflet-container .leaflet-marker-icon) {
  cursor: pointer;
}

:deep(.leaflet-container .leaflet-popup-pane),
:deep(.leaflet-container .leaflet-control) {
  pointer-events: auto;
}

:deep(.leaflet-container.leaflet-touch-zoom),
:deep(.leaflet-container.leaflet-touch-drag) {
  -ms-touch-action: pan-x pan-y;
  touch-action: pan-x pan-y;
}

:deep(.leaflet-container.leaflet-touch-drag) {
  -ms-touch-action: pinch-zoom;
  touch-action: pinch-zoom;
}

:deep(.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom) {
  -ms-touch-action: none;
  touch-action: none;
}

:deep(.leaflet-fade-anim .leaflet-tile),
:deep(.leaflet-fade-anim .leaflet-popup) {
  opacity: 0;
  -webkit-transition: opacity 0.2s linear;
  -moz-transition: opacity 0.2s linear;
  -o-transition: opacity 0.2s linear;
  transition: opacity 0.2s linear;
}

:deep(.leaflet-fade-anim .leaflet-tile-loaded),
:deep(.leaflet-fade-anim .leaflet-map-pane .leaflet-popup) {
  opacity: 1;
}

:deep(.leaflet-zoom-animated) {
  -webkit-transform-origin: 0 0;
  -ms-transform-origin: 0 0;
  transform-origin: 0 0;
}

:deep(.leaflet-zoom-anim .leaflet-zoom-animated) {
  -webkit-transition: -webkit-transform 0.25s cubic-bezier(0,0,0.25,1);
  -moz-transition: -moz-transform 0.25s cubic-bezier(0,0,0.25,1);
  -o-transition: -o-transform 0.25s cubic-bezier(0,0,0.25,1);
  transition: transform 0.25s cubic-bezier(0,0,0.25,1);
}

:deep(.leaflet-zoom-anim .leaflet-tile),
:deep(.leaflet-pan-anim .leaflet-tile),
:deep(.leaflet-touching .leaflet-zoom-animated),
:deep(.leaflet-touching .leaflet-pan-animated) {
  -webkit-transition: none;
  -moz-transition: none;
  -o-transition: none;
  transition: none;
}

:deep(.leaflet-zoom-anim .leaflet-zoom-hide) {
  visibility: hidden;
}

:deep(.leaflet-container) {
  font: 12px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif;
  line-height: 1.5;
}

:deep(.leaflet-bar) {
  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
  border-radius: 4px;
}

:deep(.leaflet-bar a),
:deep(.leaflet-bar a:hover) {
  background-color: #fff;
  border-bottom: 1px solid #ccc;
  width: 26px;
  height: 26px;
  line-height: 26px;
  display: block;
  text-align: center;
  text-decoration: none;
  color: black;
}

:deep(.leaflet-bar a) {
  background-position: 50% 50%;
  background-repeat: no-repeat;
  overflow: hidden;
  display: block;
}

:deep(.leaflet-bar a:hover) {
  background-color: #f4f4f4;
}

:deep(.leaflet-bar a:first-child) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.leaflet-bar a:last-child) {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-bottom: none;
}

:deep(.leaflet-bar a.leaflet-disabled) {
  cursor: default;
  background-color: #f4f4f4;
  color: #bbb;
}

:deep(.leaflet-touch .leaflet-bar a) {
  width: 30px;
  height: 30px;
  line-height: 30px;
}

:deep(.leaflet-touch .leaflet-bar a:first-child) {
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}

:deep(.leaflet-touch .leaflet-bar a:last-child) {
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
}

/* 备用地图样式 */
.backup-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.backup-map h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.backup-map p {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }
  
  .backup-map h3 {
    font-size: 16px;
  }
  
  .backup-map p {
    font-size: 12px;
  }
}
</style>