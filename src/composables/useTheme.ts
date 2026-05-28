import { ref, computed } from "vue";

// 主题配置
export const themes = {
  安全辉光: {
    primary: "#0ff796",
    secondary: "#c0c5ce",
    background: "#000",
    text: "#fff",
    buttonText: "#000",
    gridColor: "rgba(128, 128, 128, 0.1)",
  },
  联结矩阵: {
    primary: "#00ccff",
    secondary: "#c0c5ce",
    background: "#0f1419",
    text: "#e0f7ff",
    buttonText: "#000",
    gridColor: "rgba(128, 128, 128, 0.1)",
  },
  顶点协议: {
    primary: "#ff3333",
    secondary: "#c0c0c0",
    background: "#1a1a1a",
    text: "#f0f0f0",
    buttonText: "#000",
    gridColor: "rgba(128, 128, 128, 0.1)",
  },
  动力科技: {
    primary: "#ff7d00",
    secondary: "#c0c5ce",
    background: "#1e1e1e",
    text: "#e8eaed",
    buttonText: "#000",
    gridColor: "rgba(128, 128, 128, 0.1)",
  },
};

export type ThemeName = keyof typeof themes;
export type ThemeColors = (typeof themes)[ThemeName];

export function useTheme() {
  // 主题状态 - 优先从本地存储读取
  const savedTheme = localStorage.getItem("prism-nexus-theme");
  const currentTheme = ref<ThemeName>((savedTheme as ThemeName) || "安全辉光");
  const showThemeMenu = ref(false);
  const showTransition = ref(false);
  let menuTimer: number | null = null;

  // 显示主题菜单
  const showMenu = () => {
    if (menuTimer) {
      clearTimeout(menuTimer);
      menuTimer = null;
    }
    showThemeMenu.value = true;
  };

  // 隐藏主题菜单
  const hideMenu = () => {
    menuTimer = window.setTimeout(() => {
      showThemeMenu.value = false;
    }, 300); // 增加延迟时间
  };

  // 切换主题菜单显示状态
  const toggleThemeMenu = () => {
    showThemeMenu.value = !showThemeMenu.value;
  };

  // 关闭主题菜单
  const closeThemeMenu = () => {
    showThemeMenu.value = false;
  };

  // 当前主题颜色
  const themeColors = computed<ThemeColors>(() => {
    return themes[currentTheme.value];
  });

  // 切换主题
  const switchTheme = (theme: ThemeName) => {
    // 显示过渡效果
    // showTransition.value = true;

    // 短暂延迟后切换主题
    setTimeout(() => {
      currentTheme.value = theme;
      // 保存主题到本地存储
      localStorage.setItem("prism-nexus-theme", theme);
      showTransition.value = false;
    }, 300);
  };

  return {
    currentTheme,
    showThemeMenu,
    showTransition,
    showMenu,
    hideMenu,
    toggleThemeMenu,
    closeThemeMenu,
    themeColors,
    switchTheme,
    themes,
  };
}
