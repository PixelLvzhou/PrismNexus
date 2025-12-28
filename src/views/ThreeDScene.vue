<template>
  <div class="three-d-scene">
    <div class="scene-container" ref="containerRef"></div>
    <div class="controls">
      <h1>3D森林场景</h1>
      <p>拖拽旋转 • 滚轮缩放</p>
      <button class="back-btn" @click="goBack">返回首页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const containerRef = ref<HTMLElement | null>(null);
const router = useRouter();

// 场景相关变量
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationId: number;

// 返回首页
const goBack = () => {
  router.push('/');
};

// 初始化3D场景
const initScene = () => {
  console.log('initScene函数开始执行');
  if (!containerRef.value) {
    console.error('containerRef.value为null');
    return;
  }

  console.log('containerRef.value:', containerRef.value);
  
  // 获取容器尺寸
  const container = containerRef.value;
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  console.log('容器尺寸:', width, height);

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // 天空蓝色背景
  console.log('场景创建完成');

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 5, 15); // 调整相机位置，从高处俯瞰森林
  camera.lookAt(0, 0, 0);
  console.log('相机创建完成');

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  console.log('渲染器创建并添加到DOM');
  console.log('renderer.domElement:', renderer.domElement);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // 添加方向光（模拟太阳光）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(10, 15, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  scene.add(directionalLight);

  // 添加半球光（模拟天空和地面反射）
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x32cd32, 0.5);
  scene.add(hemisphereLight);

  // 创建森林地面
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x228b22,
    side: THREE.DoubleSide
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // 旋转为水平地面
  ground.receiveShadow = true;
  scene.add(ground);

  // 创建树木函数
  const createTree = (x: number, z: number, height: number = 3) => {
    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, height * 0.6, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, height * 0.3, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);

    // 树冠（3层）
    for (let i = 0; i < 3; i++) {
      const树冠Radius = height * 0.4 * (1 - i * 0.2);
      const树冠Height = height * 0.3;
      const树冠Geometry = new THREE.ConeGeometry(树冠Radius, 树冠Height, 8);
      const 树冠Material = new THREE.MeshPhongMaterial({ color: 0x006400 });
      const 树冠 = new THREE.Mesh(树冠Geometry, 树冠Material);
      树冠.position.set(x, height * 0.6 + i * 树冠Height * 0.7, z);
      树冠.castShadow = true;
      树冠.receiveShadow = true;
      scene.add(树冠);
    }
  };

  // 创建森林（随机生成树木）
  for (let i = 0; i < 50; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const height = 2 + Math.random() * 3;
    createTree(x, z, height);
  }

  // 创建轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI / 2 - 0.1; // 限制最大仰角

  // 添加响应式处理
  window.addEventListener('resize', handleResize);

  // 开始动画循环
  animate();
};

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate);

  // 森林场景不需要自动旋转

  // 更新控制器
  controls.update();

  // 渲染场景
  renderer.render(scene, camera);
};

// 响应式处理
const handleResize = () => {
  if (!containerRef.value) return;

  const container = containerRef.value;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // 更新相机
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // 更新渲染器
  renderer.setSize(width, height);
};

// 组件挂载时初始化
onMounted(() => {
  console.log('ThreeDScene组件挂载');
  console.log('containerRef.value:', containerRef.value);
  initScene();
});

// 组件卸载时清理
onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize);

  // 停止动画
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  // 销毁控制器
  if (controls) {
    controls.dispose();
  }

  // 销毁渲染器
  if (renderer) {
    renderer.dispose();
    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement);
    }
  }
});
</script>

<style scoped>
.three-d-scene {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

.scene-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  color: white;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.controls h1 {
  font-size: 24px;
  margin-bottom: 8px;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.controls p {
  font-size: 14px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.back-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #0077ff, #0055cc);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 119, 255, 0.3);
}

.back-btn:hover {
  background: linear-gradient(135deg, #0055cc, #003399);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 119, 255, 0.4);
}

.back-btn:active {
  transform: translateY(0);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .controls {
    top: 10px;
    left: 10px;
    right: 10px;
    padding: 15px;
  }

  .controls h1 {
    font-size: 20px;
  }

  .controls p {
    font-size: 12px;
  }

  .back-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>