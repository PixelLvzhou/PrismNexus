<template>
  <div 
    class="book-content-container"
    @click="handlePageClick"
  >
    <!-- 屏幕点击区域指示器 -->
    <div class="click-areas">
      <div class="click-area left"></div>
      <div class="click-area middle"></div>
      <div class="click-area right"></div>
    </div>
    
    <div class="book-content">
      <div 
        class="pages-container"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
        @mousewheel="handleMouseWheel"
      >
        <!-- 只渲染当前页内容，使用v-if确保数据存在时才渲染 -->
        <div class="page active" v-if="currentPage && currentPage.paragraphs">
          <div class="paragraphs">
            <!-- 始终显示当前页所属的章节标题 -->
            <h2 class="chapter-title">{{ currentPage.chapterTitle }}</h2>
            <p v-for="(paragraph, pIndex) in currentPage.paragraphs" :key="pIndex" class="paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>
        <!-- 加载状态提示 -->
        <div v-else class="loading-state">
          正在加载内容...
        </div>
      </div>
    </div>
    
    <!-- 页码指示器和阅读进度 -->
    <div class="page-indicator" v-if="readingProgress.totalPages > 0">
      <div class="page-info">
        {{ readingProgress.currentPageNum }} / {{ readingProgress.totalPages }}
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${readingProgress.progressPercentage}%` }"
        ></div>
      </div>
      <div class="chapter-info" v-if="readingProgress.currentChapter">
        {{ readingProgress.currentChapter }}
      </div>
    </div>
    
    <!-- 翻页按钮 -->
    <div class="page-nav-buttons">
      <button 
        class="page-nav-btn prev-btn"
        @click.stop="goToPage(currentPageIndex - 1)"
        :disabled="currentPageIndex === 0 || isPageTurning"
      >
        &lt;
      </button>
      <button 
        class="page-nav-btn next-btn"
        @click.stop="goToPage(currentPageIndex + 1)"
        :disabled="currentPageIndex >= paginatedContent.length - 1 || isPageTurning"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue'
// 未来可以添加路由参数获取功能，用于加载不同书籍
// import { useRouter } from 'vue-router'
// const router = useRouter()
// import { useRoute } from 'vue-router'
// const route = useRoute()
// const bookId = computed(() => route.params.id as string)

// 模拟小说数据 - 分为三章内容
const fullContent = {
  id: '1',
  title: '山海经 - 第一卷',
  chapters: [
    {
      title: '第一章 南山经',
      paragraphs: [
        '南山经之首曰鹊山。其首曰招摇之山，临于西海之上，多桂，多金玉。有草焉，其状如韭而青华，其名曰祝余，食之不饥。有木焉，其状如榖而黑理，其华四照，其名曰迷榖，佩之不迷。有兽焉，其状如禺而白耳，伏行人走，其名曰狌狌，食之善走。丽麂之水出焉，而西流注于海，其中多育沛，佩之无瘕疾。',
        '又东三百里，曰堂庭之山，多棪木，多白猿，多水玉，多黄金。',
        '又东三百八十里，曰猨翼之山，其中多怪兽，水多怪鱼，多白玉，多蝮虫，多怪蛇，多怪木，不可以上。',
        '又东三百七十里，曰杻阳之山，其阳多赤金，其阴多白金。有兽焉，其状如马而白首，其文如虎而赤尾，其音如谣，其名曰鹿蜀，佩之宜子孙。怪水出焉，而东流注于宪翼之水。其中多玄龟，其状如龟而鸟首虺尾，其名曰旋龟，其音如判木，佩之不聋，可以为底。',
        '又东三百里，曰柢山，多水，无草木。有鱼焉，其状如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥，冬死而复生。食之无肿疾。',
        '又东四百里，曰亶爰之山，多水，无草木，不可以上。有兽焉，其状如狸而有髦，其名曰类，自为牝牡，食者不妒。',
        '又东三百里，曰基山，其阳多玉，其阴多怪木。有兽焉，其状如羊，九尾四耳，其目在背，其名曰猼訑，佩之不畏。有鸟焉，其状如鸡而三首、六目、六足、三翼，其名曰鵸鵌，食之无卧。',
        '又东三百里，曰青丘之山，其阳多玉，其阴多青雘。有兽焉，其状如狐而九尾，其音如婴儿，能食人，食者不蛊。有鸟焉，其状如鸠，其音若呵，名曰灌灌，佩之不惑。英水出焉，南流注于即翼之泽。其中多赤鱬，其状如鱼而人面，其音如鸯鸳，食之不疥。',
        '又东三百五十里，曰箕尾之山，其尾踆于东海，多沙石。汸水出焉，而南流注于淯，其中多白玉。',
        '南山经之首曰鹊山。其首曰招摇之山，临于西海之上，多桂，多金玉。有草焉，其状如韭而青华，其名曰祝余，食之不饥。有木焉，其状如榖而黑理，其华四照，其名曰迷榖，佩之不迷。有兽焉，其状如禺而白耳，伏行人走，其名曰狌狌，食之善走。丽麂之水出焉，而西流注于海，其中多育沛，佩之无瘕疾。',
        '又东三百里，曰堂庭之山，多棪木，多白猿，多水玉，多黄金。',
        '又东三百八十里，曰猨翼之山，其中多怪兽，水多怪鱼，多白玉，多蝮虫，多怪蛇，多怪木，不可以上。',
        '又东三百七十里，曰杻阳之山，其阳多赤金，其阴多白金。有兽焉，其状如马而白首，其文如虎而赤尾，其音如谣，其名曰鹿蜀，佩之宜子孙。怪水出焉，而东流注于宪翼之水。其中多玄龟，其状如龟而鸟首虺尾，其名曰旋龟，其音如判木，佩之不聋，可以为底。',
        '又东三百里，曰柢山，多水，无草木。有鱼焉，其状如牛，陵居，蛇尾有翼，其羽在魼下，其音如留牛，其名曰鯥，冬死而复生。食之无肿疾。',
        '又东四百里，曰亶爰之山，多水，无草木，不可以上。有兽焉，其状如狸而有髦，其名曰类，自为牝牡，食者不妒。',
        '又东三百里，曰基山，其阳多玉，其阴多怪木。有兽焉，其状如羊，九尾四耳，其目在背，其名曰猼訑，佩之不畏。有鸟焉，其状如鸡而三首、六目、六足、三翼，其名曰鵸鵌，食之无卧。',
        '又东三百里，曰青丘之山，其阳多玉，其阴多青雘。有兽焉，其状如狐而九尾，其音如婴儿，能食人，食者不蛊。有鸟焉，其状如鸠，其音若呵，名曰灌灌，佩之不惑。英水出焉，南流注于即翼之泽。其中多赤鱬，其状如鱼而人面，其音如鸯鸳，食之不疥。',
        '又东三百五十里，曰箕尾之山，其尾踆于东海，多沙石。汸水出焉，而南流注于淯，其中多白玉。'
      ]
    },
    {
      title: '第二章 西山经',
      paragraphs: [
        '西山经华山之首，曰钱来之山，其上多松，其下多洗石。有兽焉，其状如羊而马尾，名曰羬羊，其脂可以已腊。',
        '西四十五里，曰松果之山。濩水出焉，北流注于渭，其中多铜。有鸟焉，其名曰渠，其状如山鸡，黑身赤足，可以已蹷。',
        '又西六十里，曰太华之山，削成而四方，其高五千仞，其广十里，鸟兽莫居。有蛇焉，名曰肥遗，六足四翼，见则天下大旱。',
        '又西八十里，曰小华之山，其木多荆杞，其兽多牜乍牛，其阴多磬石，其阳多珷玞之玉。鸟多赤鷩，可以御火。其草有萆荔，状如乌韭，而生于石上，赤缘木而生，食之已心痛。',
        '又西八十里，曰符禺之山，其阳多铜，其阴多铁。其上有木焉，名曰文茎，其实如枣，可以已聋。其草多条，其状如葵，而赤华黄实，如婴儿舌，食之使人不惑。符禺之水出焉，而北流注于渭。其兽多葱聋，其状如羊而赤鬣。其鸟多鴖，其状如翠而赤喙，可以御火。',
        '又西六十里，曰石脆之山，其木多棕枬，其草多条，其状如韭，而白华黑实，食之已疥。其阳多珉，其阴多铜。灌水出焉，而北流注于禺水。其中有流赭，以涂牛马无病。',
        '又西七十里，曰英山，其上多杻橿，其阴多铁，其阳多赤金。禺水出焉，北流注于招水，其中多鳢鱼，其状如鳖，其音如羊。其阳多箭竹，其兽多牜乍牛、羬羊。有鸟焉，其状如鹑，黄身而赤喙，其名曰肥遗，食之已疠，可以杀虫。',
        '又西五十二里，曰竹山，其上多乔木，其阴多铁。有草焉，其名曰黄雚，其状如樗，其叶如麻，白华而赤实，其状如赭，浴之已疥，又可以已跗。竹水出焉，北流注于渭，其阳多竹箭，多苍玉。丹水出焉，东南流注于洛水，其中多水玉，多人鱼。有兽焉，其状如豚而白毛，大如笄而黑端，名曰豪彘。',
        '西山经华山之首，曰钱来之山，其上多松，其下多洗石。有兽焉，其状如羊而马尾，名曰羬羊，其脂可以已腊。',
        '西四十五里，曰松果之山。濩水出焉，北流注于渭，其中多铜。有鸟焉，其名曰渠，其状如山鸡，黑身赤足，可以已蹷。',
        '又西六十里，曰太华之山，削成而四方，其高五千仞，其广十里，鸟兽莫居。有蛇焉，名曰肥遗，六足四翼，见则天下大旱。',
        '又西八十里，曰小华之山，其木多荆杞，其兽多牜乍牛，其阴多磬石，其阳多珷玞之玉。鸟多赤鷩，可以御火。其草有萆荔，状如乌韭，而生于石上，赤缘木而生，食之已心痛。',
        '又西八十里，曰符禺之山，其阳多铜，其阴多铁。其上有木焉，名曰文茎，其实如枣，可以已聋。其草多条，其状如葵，而赤华黄实，如婴儿舌，食之使人不惑。符禺之水出焉，而北流注于渭。其兽多葱聋，其状如羊而赤鬣。其鸟多鴖，其状如翠而赤喙，可以御火。',
        '又西六十里，曰石脆之山，其木多棕枬，其草多条，其状如韭，而白华黑实，食之已疥。其阳多珉，其阴多铜。灌水出焉，而北流注于禺水。其中有流赭，以涂牛马无病。',
        '又西七十里，曰英山，其上多杻橿，其阴多铁，其阳多赤金。禺水出焉，北流注于招水，其中多鳢鱼，其状如鳖，其音如羊。其阳多箭竹，其兽多牜乍牛、羬羊。有鸟焉，其状如鹑，黄身而赤喙，其名曰肥遗，食之已疠，可以杀虫。',
        '又西五十二里，曰竹山，其上多乔木，其阴多铁。有草焉，其名曰黄雚，其状如樗，其叶如麻，白华而赤实，其状如赭，浴之已疥，又可以已跗。竹水出焉，北流注于渭，其阳多竹箭，多苍玉。丹水出焉，东南流注于洛水，其中多水玉，多人鱼。有兽焉，其状如豚而白毛，大如笄而黑端，名曰豪彘。'
      ]
    },
    {
      title: '第三章 北山经',
      paragraphs: [
        '北山经之首，曰单狐之山，多机木，其上多华草。漨水出焉，而西流注于泑水，其中多芘石、文石。',
        '又北二百五十里，曰求如之山，其上多铜，其下多玉，无草木。滑水出焉，而西流注于诸毗之水。其中多滑鱼，其状如鱓，赤背，其音如梧，食之已疣。其中多水马，其状如马，文臂牛尾，其音如呼。',
        '又北三百里，曰带山，其上多玉，其下多青碧。有兽焉，其状如马，一角有错，其名曰駮，可以御兵。有鸟焉，其状如乌，五采而赤文，名曰鵸余，是自为牝牡，食之不疽。彭水出焉，而西流注于芘湖之水，其中多儵鱼，其状如鸡而赤毛，三尾六足四首，其音如鹊，食之可以已忧。',
        '又北四百里，曰谯明之山。谯水出焉，西流注于河。其中多何罗之鱼，一首而十身，其音如吠犬，食之已痈。有兽焉，其状如貆而赤豪，其音如榴榴，名曰孟槐，可以御凶。是山也，无草木，多青雄黄。',
        '又北三百五十里，曰涿光之山。嚣水出焉，而西流注于河。其中多鳛鳛之鱼，其状如鹊而十翼，鳞皆在羽端，其音如鹊，可以御火，食之不瘅。其上多松柏，其下多棕橿，其兽多麢羊，其鸟多蕃。',
        '又北三百八十里，曰虢山，其上多漆，其下多桐椐。其阳多玉，其阴多铁。伊水出焉，西流注于河。其兽多橐驼，其鸟多寓，状如鼠而鸟翼，其音如羊，可以御兵。',
        '又北四百里，至于虢山之尾，其上多玉而无石。鱼水出焉，西流注于河，其中多文贝。',
        '北山经之首，曰单狐之山，多机木，其上多华草。漨水出焉，而西流注于泑水，其中多芘石、文石。',
        '又北二百五十里，曰求如之山，其上多铜，其下多玉，无草木。滑水出焉，而西流注于诸毗之水。其中多滑鱼，其状如鱓，赤背，其音如梧，食之已疣。其中多水马，其状如马，文臂牛尾，其音如呼。',
        '又北三百里，曰带山，其上多玉，其下多青碧。有兽焉，其状如马，一角有错，其名曰駮，可以御兵。有鸟焉，其状如乌，五采而赤文，名曰鵸余，是自为牝牡，食之不疽。彭水出焉，而西流注于芘湖之水，其中多儵鱼，其状如鸡而赤毛，三尾六足四首，其音如鹊，食之可以已忧。',
        '又北四百里，曰谯明之山。谯水出焉，西流注于河。其中多何罗之鱼，一首而十身，其音如吠犬，食之已痈。有兽焉，其状如貆而赤豪，其音如榴榴，名曰孟槐，可以御凶。是山也，无草木，多青雄黄。',
        '又北三百五十里，曰涿光之山。嚣水出焉，而西流注于河。其中多鳛鳛之鱼，其状如鹊而十翼，鳞皆在羽端，其音如鹊，可以御火，食之不瘅。其上多松柏，其下多棕橿，其兽多麢羊，其鸟多蕃。',
        '又北三百八十里，曰虢山，其上多漆，其下多桐椐。其阳多玉，其阴多铁。伊水出焉，西流注于河。其兽多橐驼，其鸟多寓，状如鼠而鸟翼，其音如羊，可以御兵。',
        '又北四百里，至于虢山之尾，其上多玉而无石。鱼水出焉，西流注于河，其中多文贝。'
      ]
    }
  ]
}

// 分页控制
const currentPageIndex = ref(0)
const paginatedContent = ref<Array<{ chapterTitle: string, paragraphs: string[], isChapterStart?: boolean, chapterIndex?: number }>>([])

// 当前页计算属性 - 加强健壮性，确保正确返回当前页数据
const currentPage = computed(() => {
  // 确保paginatedContent数组存在且有效
  if (!Array.isArray(paginatedContent.value) || paginatedContent.value.length === 0) {
    console.warn('分页内容为空');
    return null;
  }
  
  // 确保currentPageIndex有效且在合理范围内
  const index = Math.max(0, Math.min(currentPageIndex.value, paginatedContent.value.length - 1));
  
  const pageData = paginatedContent.value[index];
  
  // 确保页面数据有效且包含必要的paragraphs数组
  if (!pageData || !Array.isArray(pageData.paragraphs)) {
    console.warn('页面数据无效或缺少段落');
    return null;
  }
  
  console.log(`当前页面索引: ${index}, 段落数量: ${pageData.paragraphs.length}`);
  return pageData;
})

// 页面尺寸和触摸滑动相关变量
const pageHeight = ref(0)
const pageWidth = ref(0)

// 阅读进度相关数据
const readingProgress = reactive({
  currentPageNum: 1,
  totalPages: 0,
  progressPercentage: 0,
  currentChapter: '',
  totalChapters: 0
})

// 计算总页数和当前阅读进度
const updateReadingProgress = () => {
  readingProgress.totalPages = paginatedContent.value.length || 1;
  readingProgress.currentPageNum = currentPageIndex.value + 1;
  readingProgress.progressPercentage = Math.round((currentPageIndex.value / Math.max(1, readingProgress.totalPages - 1)) * 100);
  
  // 更新当前章节信息
  if (paginatedContent.value.length > 0 && currentPageIndex.value < paginatedContent.value.length) {
    const currentPageData = paginatedContent.value[currentPageIndex.value];
    if (currentPageData && currentPageData.chapterTitle) {
      readingProgress.currentChapter = currentPageData.chapterTitle;
    }
  }
  readingProgress.totalChapters = fullContent.chapters.length;
  
  console.log('Reading Progress:', readingProgress);
};

// 监听页码变化，更新阅读进度
watch(currentPageIndex, () => {
  updateReadingProgress();
});

// 监听页面数据变化，更新阅读进度
watch(paginatedContent, () => {
  updateReadingProgress();
}, { deep: true });

// 优化的分页逻辑，确保每个页面只包含一个章节的内容，并始终显示正确的章节标题
  const paginateContent = () => {
    console.log('开始重新分页处理...')
    
    // 清空现有页面
    paginatedContent.value = []
    
    try {
      // 为每个章节创建独立的页面，确保章节不会被分割到多个页面
      for (let chapterIndex = 0; chapterIndex < fullContent.chapters.length; chapterIndex++) {
        const chapter = fullContent.chapters[chapterIndex];
        
        // 跳过无效章节
        if (!chapter || !chapter.paragraphs || !Array.isArray(chapter.paragraphs)) {
          continue;
        }
        
        const chapterTitle = chapter.title || `章节 ${chapterIndex + 1}`;
        const paragraphs = chapter.paragraphs.filter(p => p && p.trim().length > 0);
        
        // 如果章节没有有效段落，跳过
        if (paragraphs.length === 0) {
          continue;
        }
        
        // 更精确地根据页面尺寸计算每页段落数量
        // 考虑标题高度、内边距和段落间距
        let paragraphsPerPage = 5; // 默认值
        
        // 根据页面高度精确调整
        if (pageHeight.value > 900) {
          paragraphsPerPage = 8;
        } else if (pageHeight.value > 700) {
          paragraphsPerPage = 7;
        } else if (pageHeight.value > 500) {
          paragraphsPerPage = 5;
        } else if (pageHeight.value > 300) {
          paragraphsPerPage = 3;
        } else {
          paragraphsPerPage = 2;
        }
        
        // 根据页面宽度进一步调整
        if (pageWidth.value < 480) {
          // 移动端每行显示的字数更少，减少每页段落数
          paragraphsPerPage = Math.max(2, Math.floor(paragraphsPerPage * 0.7));
        } else if (pageWidth.value > 1200) {
          // 大屏幕可以显示更多内容
          paragraphsPerPage += 1;
        }
        
        console.log(`当前页面尺寸: ${pageWidth.value}x${pageHeight.value}, 每页显示 ${paragraphsPerPage} 个段落`);
        
        // 计算当前章节需要多少页
        const pagesNeeded = Math.ceil(paragraphs.length / paragraphsPerPage);
        
        // 为每个章节的每页创建页面对象
        for (let pageNum = 0; pageNum < pagesNeeded; pageNum++) {
          const startIndex = pageNum * paragraphsPerPage;
          const endIndex = Math.min(startIndex + paragraphsPerPage, paragraphs.length);
          const pageParagraphs = paragraphs.slice(startIndex, endIndex);
          
          // 创建页面对象
          paginatedContent.value.push({
            chapterTitle: chapterTitle,  // 每个页面都显示所属章节的标题
            paragraphs: pageParagraphs,
            isChapterStart: pageNum === 0,  // 只有章节的第一页才标记为章节开始
            chapterIndex: chapterIndex
          });
        }
      }
      
      console.log(`分页完成，共生成 ${paginatedContent.value.length} 页`);
      
      // 重置当前页码，防止页码越界
      if (currentPageIndex.value >= paginatedContent.value.length && paginatedContent.value.length > 0) {
        currentPageIndex.value = 0;
      }
      
    } catch (error) {
      console.error('分页处理错误:', error);
      
      // 错误处理：创建简单但更实用的备用页面结构
      const fallbackPages: typeof paginatedContent.value = [];
      
      // 使用更简单直接的方式创建备用页面
      const allFallbackParagraphs: string[] = [];
      
      // 收集所有可用段落
      fullContent.chapters.forEach((chapter) => {
        if (chapter && chapter.paragraphs && Array.isArray(chapter.paragraphs)) {
          chapter.paragraphs.forEach((para) => {
            if (para && para.trim().length > 0) {
              allFallbackParagraphs.push(para);
            }
          });
        }
      });
      
      // 简单分页
      const fallbackParagraphsPerPage = 10;
      for (let i = 0; i < allFallbackParagraphs.length; i += fallbackParagraphsPerPage) {
        fallbackPages.push({
          chapterTitle: fullContent.title || '内容',
          paragraphs: allFallbackParagraphs.slice(i, i + fallbackParagraphsPerPage),
          isChapterStart: i === 0,
          chapterIndex: 0
        });
      }
      
      paginatedContent.value = fallbackPages;
      currentPageIndex.value = 0;
      console.log(`创建了备用页面，共 ${fallbackPages.length} 页`);
    }
  }

// 翻页功能 - 支持动画翻页和跨章节检测
const goToPage = (index: number) => {
  // 如果正在翻页动画中，不处理新的翻页请求
  if (isPageTurning.value) return
  
  // 确保paginatedContent有效
  if (!Array.isArray(paginatedContent.value) || paginatedContent.value.length === 0) {
    console.warn('没有可翻页的内容');
    return;
  }
  
  // 边界检查，确保索引在有效范围内
  const validIndex = Math.max(0, Math.min(index, paginatedContent.value.length - 1));
  
  if (validIndex !== currentPageIndex.value) {
    console.log(`切换到页面: ${validIndex + 1}/${paginatedContent.value.length}`);
    
    // 检测是否需要跨章节
    const currentPageData = paginatedContent.value[currentPageIndex.value];
    const targetPageData = paginatedContent.value[validIndex];
    const isCrossChapter = currentPageData?.chapterIndex !== targetPageData?.chapterIndex;
    
    // 使用动画翻页，并传递跨章节标志
    animatePageTurn(validIndex, isCrossChapter)
  }
}

// 触摸事件处理和滑动状态
const touchStartX = ref(0)
const touchStartY = ref(0) // 添加Y轴记录，用于区分水平和垂直滑动
const touchEndX = ref(0)
const touchEndY = ref(0)
const isSliding = ref(false)
const slideOffset = ref(0)
const isPageTurning = ref(false) // 标记是否正在翻页动画中
let animationFrameId = 0 // 用于存储requestAnimationFrame的ID
let lastTouchMoveTime = 0 // 记录最后一次触摸移动的时间戳，用于节流

const touchStart = (e: TouchEvent) => {
  // 如果正在翻页动画中，忽略新的触摸事件
  if (isPageTurning.value) return
  
  if (e.touches && e.touches[0]) {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY // 记录Y轴起始位置
    isSliding.value = true
    slideOffset.value = 0
    
    // 添加滑动时的视觉效果类
    const pagesContainer = document.querySelector('.pages-container')
    if (pagesContainer) {
      pagesContainer.classList.add('sliding')
    }
  }
}

// 节流函数，限制函数调用频率
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean
  return function(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 触摸移动处理函数，使用requestAnimationFrame确保流畅性
const handleTouchMoveAnimation = () => {
  // 更新滑动位置
  updateSlidingPosition(false)
  
  // 如果仍在滑动，继续请求下一帧
  if (isSliding.value) {
    animationFrameId = requestAnimationFrame(handleTouchMoveAnimation)
  }
}

const touchMove = (e: TouchEvent) => {
  if (!isSliding.value || !e.touches || !e.touches[0]) return
  
  // 节流处理，限制处理频率，提高性能
  const currentTime = Date.now()
  if (currentTime - lastTouchMoveTime < 16) { // 大约60fps
    return
  }
  lastTouchMoveTime = currentTime
  
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  
  // 计算X和Y方向的移动距离
  const deltaX = Math.abs(currentX - touchStartX.value)
  const deltaY = Math.abs(currentY - touchStartY.value)
  
  // 如果Y方向移动距离大于X方向，可能是想要滚动页面，不处理翻页
  if (deltaY > deltaX * 0.5) {
    return
  }
  
  // 阻止默认的触摸移动行为，确保滑动流畅
  e.preventDefault()
  
  touchEndX.value = currentX
  touchEndY.value = currentY
  slideOffset.value = currentX - touchStartX.value
  
  // 限制滑动范围，只允许在当前页、上一页和下一页之间滑动
  if ((currentPageIndex.value === 0 && slideOffset.value > 0) || 
      (currentPageIndex.value === paginatedContent.value.length - 1 && slideOffset.value < 0)) {
    // 在边界页时，滑动效果减弱
    slideOffset.value *= 0.3
  }
  
  // 取消之前的动画帧请求
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  // 请求新的动画帧来更新UI
  animationFrameId = requestAnimationFrame(handleTouchMoveAnimation)
}

const touchEnd = () => {
  if (!isSliding.value) return
  
  // 取消任何进行中的动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = 0
  }
  
  // 移除滑动效果类
  const pagesContainer = document.querySelector('.pages-container')
  if (pagesContainer) {
    pagesContainer.classList.remove('sliding')
  }
  
  // 计算滑动距离，判断是否触发翻页
  const diff = touchEndX.value - touchStartX.value
  const screenWidth = window.innerWidth
  
  // 计算滑动阈值，使用屏幕宽度的20%作为翻页阈值
  const flipThreshold = screenWidth * 0.2
  
  // 判断是否触发翻页
  const shouldFlipPage = Math.abs(diff) > flipThreshold
  
  // 使用requestAnimationFrame确保UI更新的即时性
  requestAnimationFrame(() => {
    if (shouldFlipPage) {
      // 标记开始翻页动画
      isPageTurning.value = true
      
      if (diff > 0) {
        // 向右滑动，上一页
        animatePageTurn(currentPageIndex.value - 1)
      } else {
        // 向左滑动，下一页
        animatePageTurn(currentPageIndex.value + 1)
      }
    } else {
      // 回弹到当前页
      const activePage = document.querySelector('.page.active')
      if (activePage) {
        const pageEl = activePage as HTMLElement
        // 添加回弹动画，使用缓动函数确保流畅效果
        pageEl.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease, box-shadow 0.5s ease'
        
        // 应用完整的3D重置样式
        pageEl.style.transform = 'translateX(0) rotateY(0deg) scale(1) perspective(1000px)'
        pageEl.style.opacity = '1'
        pageEl.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)'
      }
      
      // 重置滑动状态
      setTimeout(() => {
        isSliding.value = false
        touchEndX.value = 0
        touchEndY.value = 0
        touchStartY.value = 0
        slideOffset.value = 0
      }, 500) // 与回弹动画持续时间匹配
    }
  })
}

// 动画翻页函数 - 优化版本，使用requestAnimationFrame和跨章节支持
const animatePageTurn = (targetIndex: number, isCrossChapter = false) => {
  // 确保目标索引有效
  const validIndex = Math.max(0, Math.min(targetIndex, paginatedContent.value.length - 1))
  
  if (validIndex === currentPageIndex.value) {
    // 如果目标页就是当前页，重置状态
    requestAnimationFrame(() => {
      updateSlidingPosition(true)
      isPageTurning.value = false
      isSliding.value = false
      touchEndX.value = 0
      touchEndY.value = 0
      touchStartY.value = 0
      slideOffset.value = 0
    })
    return
  }
  
  const activePage = document.querySelector('.page.active')
  const targetPageSelector = `.page[data-index="${validIndex}"]`
  const targetPage = document.querySelector(targetPageSelector)
  
  if (activePage && targetPage) {
    const pageEl = activePage as HTMLElement
    const targetPageEl = targetPage as HTMLElement
    const isNextPage = validIndex > currentPageIndex.value
    const targetPageData = paginatedContent.value[validIndex]
    
    // 预加载目标章节内容（实际应用中可以从API加载）
    if (isCrossChapter) {
      console.log(`检测到跨章节翻页: 从章节 ${paginatedContent.value[currentPageIndex.value]?.chapterIndex} 到章节 ${targetPageData?.chapterIndex}`)
      
      // 添加章节切换视觉提示
      const chaptersIndicator = document.createElement('div')
      chaptersIndicator.className = 'chapter-transition-indicator'
      chaptersIndicator.textContent = isNextPage ? `即将进入${targetPageData?.chapterTitle}` : `返回${targetPageData?.chapterTitle}`
      document.body.appendChild(chaptersIndicator)
      
      // 短暂显示后移除提示
      setTimeout(() => {
        chaptersIndicator.classList.add('fade-out')
        setTimeout(() => {
          if (document.body.contains(chaptersIndicator)) {
            document.body.removeChild(chaptersIndicator)
          }
        }, getCrossChapterDuration())
      }, 1000)
    }
    
    // 先准备目标页面，让它在下层淡入
    requestAnimationFrame(() => {
      // 移除目标页面的所有动画类
      targetPageEl.classList.remove('page-turning', 'page-turning-backward', 'chapter-transition', 'next-page')
      
      // 设置目标页面为next-page状态，让它提前淡入
      if (isNextPage) {
        targetPageEl.classList.add('next-page')
        targetPageEl.style.zIndex = '2'
        targetPageEl.style.opacity = '1'
      }
    })
    
    // 延迟一点再开始当前页面的翻转动画，让目标页面有时间准备
    setTimeout(() => {
      // 使用requestAnimationFrame确保动画的流畅性
      requestAnimationFrame(() => {
        // 移除所有可能的动画类
        pageEl.classList.remove('page-turning', 'page-turning-backward', 'chapter-transition')
        
        // 如果是跨章节翻页，添加特殊动画类
        if (isCrossChapter) {
          pageEl.classList.add('chapter-transition')
        }
        
        // 强制重排，确保动画类的添加能正确触发
        void pageEl.offsetWidth
        
        // 根据翻页方向应用不同的动画类
        if (isNextPage) {
          // 下一页 - 使用正向翻页动画
          pageEl.classList.add('page-turning')
          // 模拟真实翻书效果，添加额外的3D变换
          pageEl.style.transform = 'perspective(1000px)'
          pageEl.style.zIndex = '3' // 确保当前页面在目标页面之上
        } else {
          // 上一页 - 使用反向翻页动画
          pageEl.classList.add('page-turning-backward')
          // 反向翻页也需要3D效果
          pageEl.style.transform = 'perspective(1000px)'
          pageEl.style.zIndex = '3' // 确保当前页面在目标页面之上
          
          // 上一页时，目标页面直接设置为active
          targetPageEl.classList.remove('next-page')
          targetPageEl.classList.add('active')
          targetPageEl.style.zIndex = '2'
        }
      })
      
      // 动画结束后更新页面索引 - 使用设备性能优化的动画时间
      setTimeout(() => {
        // 使用requestAnimationFrame更新UI状态
        requestAnimationFrame(() => {
          // 移除动画类
          pageEl.classList.remove('page-turning', 'page-turning-backward', 'chapter-transition')
          targetPageEl.classList.remove('next-page')
          
          // 重置样式
          pageEl.style.transform = ''
          pageEl.style.zIndex = ''
          targetPageEl.style.transform = ''
          targetPageEl.style.zIndex = ''
          
          // 重置所有页面的active状态
          document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active')
          })
          
          // 设置目标页面为active
          targetPageEl.classList.add('active')
          
          // 切换到目标页面
          currentPageIndex.value = validIndex
          
          // 重置当前页面样式
          updateSlidingPosition(true)
          
          // 重置翻页状态
          isPageTurning.value = false
          isSliding.value = false
          touchEndX.value = 0
          touchEndY.value = 0
          touchStartY.value = 0
          slideOffset.value = 0
          
          // 如果是跨章节翻页，可以添加额外的视觉反馈
          if (isCrossChapter && targetPageData?.isChapterStart) {
            // 添加新章节标记的动画效果
            targetPageEl.classList.add('new-chapter-highlight')
            setTimeout(() => {
              targetPageEl.classList.remove('new-chapter-highlight')
            }, 2000)
          }
        })
      }, isCrossChapter ? getCrossChapterDuration() : getAnimationDuration()) // 根据设备性能和是否跨章节动态调整动画时间
    }, isCrossChapter ? 300 : 100) // 跨章节时给更多准备时间
  }
}

// 根据设备性能优化触摸事件监听
const updateTouchEventListeners = () => {
  const passiveOptions = deviceInfo.supportsPassive ? { passive: true } : false;
  const contentElement = document.querySelector('.book-content-container');
  
  if (contentElement) {
    // 移除现有事件监听器
    contentElement.removeEventListener('touchstart', touchStart);
    contentElement.removeEventListener('touchmove', touchMove);
    contentElement.removeEventListener('touchend', touchEnd);
    
    // 添加优化后的事件监听器
    contentElement.addEventListener('touchstart', touchStart);
    contentElement.addEventListener('touchmove', touchMove, passiveOptions);
    contentElement.addEventListener('touchend', touchEnd);
  }
};

// 优化节流函数，根据设备性能调整节流间隔
const getThrottleInterval = () => {
  if (deviceInfo.isLowPerformance) return 100; // 低端设备降低更新频率
  if (deviceInfo.isMobile) return 66; // 移动设备
  return 33; // 桌面设备
};

// 修改节流函数使用动态间隔
const throttledHandleTouchMove = (callback: Function) => {
  let lastCall = 0;
  return function(...args: any[]) {
    const now = performance.now();
    const interval = getThrottleInterval();
    if (now - lastCall >= interval) {
      lastCall = now;
      callback.apply(this, args);
    }
  };
};

// 更新滑动位置的辅助函数
const updateSlidingPosition = (reset = false) => {
  const activePage = document.querySelector('.page.active')
  if (activePage) {
    const pageEl = activePage as HTMLElement
    
    // 如果是重置，移除过渡效果
    if (reset) {
      pageEl.style.transition = 'none'
      pageEl.style.transform = 'translateX(0) rotateY(0deg) scale(1) perspective(1000px)'
      pageEl.style.opacity = '1'
      pageEl.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)'
    } else {
      // 滑动时实时更新样式，不使用过渡
      pageEl.style.transition = 'none'
      const pageOffset = (slideOffset.value / window.innerWidth) * 100
      const opacity = Math.max(0.7, 1 - Math.abs(slideOffset.value) / window.innerWidth * 0.8)
      const scale = Math.max(0.95, 1 - Math.abs(slideOffset.value) / window.innerWidth * 0.05)
      
      // 计算滑动进度
      const slideProgress = Math.abs(slideOffset.value) / window.innerWidth
      
      // 模拟真实翻书效果：根据滑动方向调整样式
      if (slideOffset.value > 0) {
        // 向右滑动（上一页）
        const rotateY = Math.min(-30, -Math.abs(slideOffset.value) / window.innerWidth * 45)
        pageEl.style.transform = `translateX(${pageOffset}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`
        // 添加动态阴影效果
        pageEl.style.boxShadow = `${Math.abs(slideOffset.value) / 5}px 0 30px rgba(0, 0, 0, 0.2)`
      } else {
        // 向左滑动（下一页）
        // 添加翻页的3D效果
        const rotateY = Math.min(30, Math.abs(slideOffset.value) / window.innerWidth * 45)
        pageEl.style.transform = `translateX(${pageOffset}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`
        // 模拟纸张的阴影效果
        pageEl.style.boxShadow = `-${Math.abs(slideOffset.value) / 5}px 0 30px rgba(0, 0, 0, 0.2)`
      }
      
      pageEl.style.opacity = opacity.toString()
    }
  }
}

// 点击屏幕左右区域翻页
const handlePageClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // 如果点击的是可交互元素或段落文本，不触发翻页
  if (target.closest('.paragraph') || target.closest('.page-indicator')) {
    return
  }
  
  const screenWidth = window.innerWidth
  const clickX = e.clientX
  
  // 左侧1/4区域点击 - 上一页
  if (clickX < screenWidth / 4) {
    goToPage(currentPageIndex.value - 1)
  }
  // 右侧1/4区域点击 - 下一页
  else if (clickX > screenWidth * 3 / 4) {
    goToPage(currentPageIndex.value + 1)
  }
  // 中间区域可以添加更多交互，比如显示设置面板等
}

// 鼠标滚轮控制翻页
const handleMouseWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (e.deltaY > 0) {
    // 向下滚动，下一页
    goToPage(currentPageIndex.value + 1)
  } else {
    // 向上滚动，上一页
    goToPage(currentPageIndex.value - 1)
  }
}

// 检测设备性能和类型
  const deviceInfo = reactive({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLowPerformance: false,
    supportsPassive: false
  });

  // 检测passive事件支持
  const detectPassiveSupport = () => {
    let supportsPassive = false;
    try {
      window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
        get: function() { supportsPassive = true; }
      }));
    } catch (e) {}
    return supportsPassive;
  };

  // 检测设备性能
  const detectDevicePerformance = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    
    deviceInfo.isMobile = isMobile && !isTablet;
    deviceInfo.isTablet = isTablet;
    deviceInfo.isDesktop = !isMobile && !isTablet;
    deviceInfo.supportsPassive = detectPassiveSupport();
    
    // 简单的性能检测
    if ('performance' in window && 'getEntriesByType' in performance) {
      const fps = performance.getEntriesByType('frame');
      if (fps.length > 0) {
        const avgFps = fps.reduce((sum, frame) => sum + (1000 / frame.duration), 0) / fps.length;
        deviceInfo.isLowPerformance = avgFps < 30;
      }
    }
    
    // 后备检测 - 低端设备特征
    if (/Android [4-5]|Mobile Safari [0-9]|iPhone OS [7-9]/.test(navigator.userAgent)) {
      deviceInfo.isLowPerformance = true;
    }
    
    console.log('Device Info:', deviceInfo);
  };

  // 根据设备性能调整参数
  const getAnimationDuration = () => {
    if (deviceInfo.isLowPerformance) return 300;
    return 400;
  };

  const getCrossChapterDuration = () => {
    if (deviceInfo.isLowPerformance) return 400;
    return 600;
  };

  // 初始化
  onMounted(() => {
    console.log('BookContent mounted');
    // 检测设备性能
    if (typeof detectDevicePerformance === 'function') {
      detectDevicePerformance();
    }
    
    // 设置页面尺寸为视口尺寸
    updatePageDimensions()
    
    // 执行自动分页
    paginateContent()
    
    // 初始化阅读进度
    updateReadingProgress();
    
    // 监听窗口大小变化，重新计算分页
    window.addEventListener('resize', handleResize)
    
    // 初始化优化的触摸事件监听器
    if (typeof updateTouchEventListeners === 'function') {
      setTimeout(() => {
        updateTouchEventListeners();
      }, 100);
    }
  })

// 优化的页面尺寸更新函数，使用requestAnimationFrame减少重绘
const updatePageDimensions = () => {
  requestAnimationFrame(() => {
    // 模拟计算页面尺寸，实际应用中可以通过测量DOM元素获取
    const container = document.querySelector('.book-content-container')
    
    if (container) {
      const rect = container.getBoundingClientRect()
      const availableHeight = rect.height - 100 // 减去边距和其他元素高度
      const availableWidth = rect.width - 80 // 减去边距
      
      // 只有当尺寸发生显著变化时才更新和重新分页，避免不必要的计算
      const heightChanged = Math.abs(pageHeight.value - availableHeight) > 5
      const widthChanged = Math.abs(pageWidth.value - availableWidth) > 5
      
      if (heightChanged || widthChanged) {
        // 更新页面尺寸
        pageWidth.value = availableWidth
        pageHeight.value = availableHeight
        
        console.log(`更新页面尺寸: ${pageWidth.value}x${pageHeight.value}`)
        
        // 重新分页
        paginateContent()
      }
    }
  })
}

// 优化响应速度，确保滑动和翻页操作无延迟
// 在组件卸载时清理资源
onBeforeUnmount(() => {
  // 移除事件监听器
  window.removeEventListener('resize', handleResize)
  
  // 取消任何进行中的动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = 0
  }
  
  // 清理其他状态
  isSliding.value = false
  isPageTurning.value = false
})

// 优化的防抖函数，减少不必要的计算
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 处理窗口大小变化的防抖函数
const handleResize = debounce(() => {
  console.log('窗口大小变化，更新页面布局')
  updatePageDimensions()
}, 300) // 300ms的防抖延迟

// 窗口大小变化的定时器
  let windowResizeTimer: ReturnType<typeof setTimeout>
</script>

<style scoped>
.book-content-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8e9c1; /* 老旧泛黄牛皮纸色 */
  font-family: 'SimSun', 'STSong', 'Arial', serif;
  position: relative;
  overflow: hidden;
  touch-action: none;
}

/* 中间容器样式 */
.book-content {
  width: 100%;
  height: 100vh;
  background-color: #f8e9c1; /* 老旧泛黄牛皮纸色 */
  position: relative;
  overflow: hidden;
}

/* 点击区域 - 用于左右点击翻页 */
.click-areas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 10;
  pointer-events: none;
}

.click-area {
  flex: 1;
  pointer-events: auto;
}

.click-area.middle {
  flex: 2;
  pointer-events: none;
}

/* 点击反馈效果 */
.click-area:active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  opacity: 0.7;
}

.pages-container {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  will-change: transform;
  touch-action: pan-y;
  overflow: hidden;
  perspective: 2000px;
  background-color: #f8f3e9; /* 背景色模拟纸张颜色 */
}

/* 滑动时的过渡效果调整 */
.pages-container.sliding {
  transition: none; /* 滑动时不使用过渡，确保实时响应 */
}

.pages-container.sliding .page {
  transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1) !important;
}

/* 页面容器的阴影效果 */
.pages-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.page {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  padding: 0;
  background-color: #f8e9c1; /* 老旧泛黄牛皮纸色 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
  box-sizing: border-box;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), 
              opacity 0.4s ease, 
              box-shadow 0.4s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), 
              0 0 0 1px rgba(0, 0, 0, 0.02);
  border-radius: 3px;
  transform-origin: left center;
}

/* 纸张纹理效果 */
.page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

/* 页面状态样式 */
.page.active {
  z-index: 1;
  opacity: 1;
  transform: translateX(0) rotateY(0deg) scale(1);
  display: flex !important;
}

.page.next-page {
  z-index: 2;
  opacity: 1;
  transform: translateX(0) rotateY(0deg) scale(1);
  display: flex !important;
  animation: pageFadeIn 0.3s ease-out;
}

.page {
  z-index: 0;
  opacity: 0;
}

/* 页面淡入动画 */
@keyframes pageFadeIn {
  0% {
    opacity: 0;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 章节标题样式 */
.chapter-title {
  font-size: 18px; /* 稍微减小字体大小 */
  font-weight: bold;
  margin-bottom: 12px; /* 减少与段落之间的间距 */
  text-align: center;
  color: #8b4513; /* 牛皮纸文本颜色 */
  line-height: 1.3;
  padding-top: 15px; /* 减少顶部内边距 */
  box-sizing: border-box;
}

/* 段落容器样式 */
.paragraphs {
  background-color: #f8e9c1; /* 老旧泛黄牛皮纸色 */
  padding: 15px;
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  box-sizing: border-box;
}

/* 段落样式 */
.paragraph {
  margin-bottom: 12px; /* 进一步减少段落间距，确保内容完全适合首屏 */
  line-height: 1.6; /* 调整行高，使内容更紧凑 */
  text-indent: 2em;
  color: #8b4513; /* 牛皮纸文本颜色 */
  font-size: 16px; /* 稍微减小字体以容纳更多内容 */
  letter-spacing: 0.4px;
  flex-shrink: 0;
  box-sizing: border-box;
}

/* 章节标题样式 - 增加分隔线和优化间距 */
.chapter-title {
  font-size: 18px;
  margin: 0 0 15px 0;
  padding: 15px 0 12px 0;
  color: #8b4513;
  font-weight: bold;
  border-bottom: 2px solid rgba(139, 69, 19, 0.3);
  text-align: center;
  box-sizing: border-box;
}

/* 更精致的页码指示器 */
.page-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 20px;
  z-index: 20;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.page-info {
  background-color: rgba(245, 233, 217, 0.9);
  color: #5a3e2b;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  opacity: 0.9;
  border: 1px solid rgba(128, 100, 70, 0.2);
  white-space: nowrap;
}

/* 章节信息样式 */
.chapter-info {
  background-color: rgba(245, 233, 217, 0.8);
  color: #8b4513;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  backdrop-filter: blur(8px);
  opacity: 0.85;
  border: 1px solid rgba(139, 69, 19, 0.2);
  max-width: 200px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
  transition: all 0.3s ease;
}

.chapter-info:hover {
  opacity: 1;
  max-width: 300px;
  background-color: rgba(245, 233, 217, 0.95);
}

/* 进度条 */
.progress-bar {
  width: 200px;
  height: 3px;
  background-color: rgba(128, 100, 70, 0.2);
  border-radius: 3px;
  overflow: hidden;
  opacity: 0.8;
}

.progress-fill {
  height: 100%;
  background-color: #5a3e2b;
  transition: width 0.3s ease;
  border-radius: 3px;
}

/* 增强的翻页动画 - 模拟真实书籍翻页 */
@keyframes pageTurn {
  0% {
    transform: rotateY(0deg) translateX(0) scale(1);
    opacity: 1;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  25% {
    transform: rotateY(-35deg) translateX(-15%) scale(0.99);
    opacity: 0.95;
    box-shadow: -15px 5px 25px rgba(0, 0, 0, 0.18);
  }
  50% {
    transform: rotateY(-70deg) translateX(-30%) scale(0.97);
    opacity: 0.85;
    box-shadow: -25px 8px 35px rgba(0, 0, 0, 0.25);
  }
  75% {
    transform: rotateY(-85deg) translateX(-60%) scale(0.94);
    opacity: 0.6;
    box-shadow: -35px 10px 45px rgba(0, 0, 0, 0.3);
  }
  100% {
    transform: rotateY(-180deg) translateX(-100%) scale(0.9);
    opacity: 0;
    box-shadow: -40px 15px 55px rgba(0, 0, 0, 0.35);
  }
}

/* 增强的反向翻页动画 */
@keyframes pageTurnBackward {
  0% {
    transform: rotateY(0deg) translateX(0) scale(1);
    opacity: 1;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  25% {
    transform: rotateY(35deg) translateX(15%) scale(0.99);
    opacity: 0.95;
    box-shadow: 15px 5px 25px rgba(0, 0, 0, 0.18);
  }
  50% {
    transform: rotateY(70deg) translateX(30%) scale(0.97);
    opacity: 0.85;
    box-shadow: 25px 8px 35px rgba(0, 0, 0, 0.25);
  }
  75% {
    transform: rotateY(85deg) translateX(60%) scale(0.94);
    opacity: 0.6;
    box-shadow: 35px 10px 45px rgba(0, 0, 0, 0.3);
  }
  100% {
    transform: rotateY(180deg) translateX(100%) scale(0.9);
    opacity: 0;
    box-shadow: 40px 15px 55px rgba(0, 0, 0, 0.35);
  }
}

/* 章节切换提示样式 */
.chapter-transition-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  pointer-events: none;
  z-index: 2000;
  backdrop-filter: blur(5px);
  animation: chapterIndicatorAppear 0.5s ease-out;
}

.chapter-transition-indicator.fade-out {
  animation: chapterIndicatorDisappear 0.6s ease-in;
}

/* 章节切换动画 */
.chapter-transition {
  animation: chapterTransition 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 新章节高亮效果 */
.new-chapter-highlight {
  animation: newChapterHighlight 2s ease-out;
}

/* 章节提示动画关键帧 */
@keyframes chapterIndicatorAppear {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes chapterIndicatorDisappear {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

/* 章节过渡动画 */
@keyframes chapterTransition {
  0% {
    transform: perspective(1000px) rotateY(0deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: perspective(1000px) rotateY(60deg) scale(0.9);
    opacity: 0.6;
  }
  100% {
    transform: perspective(1000px) rotateY(0deg) scale(1);
    opacity: 1;
  }
}

/* 新章节高亮动画 */
@keyframes newChapterHighlight {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 182, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(255, 182, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 182, 0, 0);
  }
}

.page-turning {
  animation: pageTurn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  transform-origin: left center;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.page-turning-backward {
  animation: pageTurnBackward 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  transform-origin: right center;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

/* 移动端设备优化 (小屏幕手机) */
@media (max-width: 480px) {
  .page {
    padding: 12px 10px;
    margin: 0;
    max-width: 100%;
  }
  
  .chapter-title {
    font-size: 18px;
    margin-bottom: 15px;
    padding: 12px 0 10px 0;
  }
  
  .paragraph {
    font-size: 14px;
    line-height: 1.7;
    margin-bottom: 12px;
    text-indent: 1.5em;
    max-width: 100%;
    word-break: break-word;
  }
  
  .paragraphs {
    padding: 10px 10px 30px 10px;
    height: 100%;
  }
  
  /* 优化手机端点击区域 */
  .click-area.left,
  .click-area.right {
    flex: 1;
    min-width: 80px;
  }
  
  .click-area.middle {
    flex: 1;
  }
  
  /* 优化页码指示器在小屏幕上的显示 */
  .page-indicator {
    bottom: 20px;
  }
  
  .page-info {
    font-size: 12px;
    padding: 4px 12px;
  }
  
  .progress-bar {
    width: 150px;
  }
}

/* 手机设备优化 (中等屏幕) */
@media (min-width: 481px) and (max-width: 768px) {
  .page {
    padding: 15px;
    margin: 0;
    max-width: 100%;
  }
  
  .chapter-title {
    font-size: 19px;
    margin-bottom: 18px;
    padding: 14px 0 12px 0;
  }
  
  .paragraph {
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 14px;
    text-indent: 2em;
    max-width: 100%;
    word-break: break-word;
  }
  
  .paragraphs {
    padding: 12px 15px 30px 15px;
  }
  
  /* 优化点击区域 */
  .click-area.left,
  .click-area.right {
    flex: 1;
    min-width: 100px;
  }
  
  .click-area.middle {
    flex: 1;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .page {
    padding: 20px 25px;
    max-width: 700px;
    margin: 0 auto;
  }
  
  .chapter-title {
    font-size: 22px;
    margin-bottom: 20px;
    padding: 15px 0 12px 0;
  }
  
  .paragraph {
    font-size: 16px;
    line-height: 1.65;
    margin-bottom: 15px;
    max-width: 95%;
    margin-left: auto;
    margin-right: auto;
    word-break: break-word;
  }
  
  .paragraphs {
    padding: 15px 10px 30px 10px;
  }
  
  /* 优化点击区域 */
  .click-area.left,
  .click-area.right {
    flex: 1;
    min-width: 120px;
  }
  
  .click-area.middle {
    flex: 1;
  }
}

/* 桌面设备优化 */
@media (min-width: 1025px) {
  .page {
    padding: 25px 30px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .chapter-title {
    font-size: 24px;
    margin-bottom: 22px;
    padding: 18px 0 15px 0;
  }
  
  .paragraph {
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 16px;
    max-width: 85%;
    margin-left: auto;
    margin-right: auto;
    word-break: break-word;
  }
  
  .paragraphs {
    padding: 15px 10px 30px 10px;
  }
  
  /* 桌面端点击区域扩大 */
  .click-area.left,
  .click-area.right {
    flex: 2;
    min-width: 150px;
  }
  
  .click-area.middle {
    flex: 1;
  }
  
  /* 优化桌面端的纸张效果 */
  .page {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 
                0 0 0 1px rgba(0, 0, 0, 0.03);
  }
}

/* 触摸反馈优化 */
.page {
  touch-action: manipulation;
}

/* 防止文字选中影响滑动体验 */
.page {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.paragraph {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* 翻页提示动画 - 仅在桌面端显示 */
@media (min-width: 1025px) {
  .page-indicator::before,
  .page-indicator::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
    border: 2px solid rgba(90, 74, 58, 0.4);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  }
  
  .page-indicator::before {
    left: -100px;
    content: '←';
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: rgba(90, 74, 58, 0.6);
  }
  
  .page-indicator::after {
    right: -100px;
    content: '→';
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: rgba(90, 74, 58, 0.6);
  }
  
  .book-content-container:hover .page-indicator::before,
  .book-content-container:hover .page-indicator::after {
    opacity: 1;
  }
  
  .book-content-container:hover .page-indicator::before {
    left: -80px;
  }
  
  .book-content-container:hover .page-indicator::after {
    right: -80px;
  }
}

/* 翻页按钮样式 */
.page-nav-buttons {
  position: fixed;
  bottom: 100px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
}

.page-nav-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 24px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-nav-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.page-nav-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.page-nav-btn:disabled {
  background-color: rgba(0, 0, 0, 0.2);
  cursor: not-allowed;
  opacity: 0.5;
}

.prev-btn {
  margin-left: 20px;
}

.next-btn {
  margin-right: 20px;
}
</style>
