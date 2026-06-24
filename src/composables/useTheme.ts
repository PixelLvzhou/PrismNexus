import { ref, computed } from "vue";

// 主题配置
export const themes = {
  安全辉光: {
    primary: "#5fcd98",
    darkerPrimary: "#1a5c3a",
    secondary: "#c0c5ce",
    background: "#121212",
    text: "#fff",
    buttonText: "#000",
  },
  联结矩阵: {
    primary: "#00ccff",
    darkerPrimary: "#004d66",
    secondary: "#c0c5ce",
    background: "#121212",
    text: "#e0f7ff",
    buttonText: "#000",
  },
  顶点协议: {
    primary: "#ff3333",
    darkerPrimary: "#660000",
    secondary: "#c0c0c0",
    background: "#121212",
    text: "#f0f0f0",
    buttonText: "#000",
  },
  动力科技: {
    primary: "#ff7d00",
    darkerPrimary: "#663300",
    secondary: "#c0c5ce",
    background: "#121212",
    text: "#e8eaed",
    buttonText: "#000",
  },
};

export type ThemeName = keyof typeof themes;
export type ThemeColors = (typeof themes)[ThemeName];

// 全局共享的主题状态
const savedTheme = localStorage.getItem("prism-nexus-theme");
const currentTheme = ref<ThemeName>((savedTheme as ThemeName) || "安全辉光");
const showThemeMenu = ref(false);
let menuTimer: number | null = null;

export function useTheme() {
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
    }, 300);
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
    if (currentTheme.value === theme) return;
    currentTheme.value = theme;
    localStorage.setItem("prism-nexus-theme", theme);
  };

  return {
    currentTheme,
    showThemeMenu,
    showMenu,
    hideMenu,
    toggleThemeMenu,
    closeThemeMenu,
    themeColors,
    switchTheme,
    themes,
  };
}
