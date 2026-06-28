<template>
  <div class="data-table">
    <div v-if="showSearch" class="search-container">
      <div class="search-row">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            class="search-input"
          />
          <button 
            v-if="searchKeyword"
            class="search-clear"
            @click="clearSearch"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <slot name="search-extra"></slot>
      </div>
      <slot name="search-bottom"></slot>
    </div>

    <div class="table-header" :style="{ backgroundColor: headerBgColor, gridTemplateColumns: gridTemplateColumns }">
      <div 
        v-for="(col, index) in columns" 
        :key="index"
        class="header-item"
      >{{ col.label }}</div>
    </div>

    <div 
      v-for="(row, rowIndex) in paginatedData" 
      :key="rowIndex" 
      class="table-row"
      :style="{ gridTemplateColumns: gridTemplateColumns }"
      @click="handleRowClick(row)"
    >
      <div 
        v-for="(col, colIndex) in columns" 
        :key="colIndex"
        class="table-item"
        :class="col.class"
      >
        <slot :name="`cell-${col.key}`" :row="row" :column="col">
          <template v-if="col.render">
            <component :is="col.render" :row="row" :column="col" />
          </template>
          <template v-else>
            {{ getCellValue(row, col.key) }}
          </template>
        </slot>
      </div>
    </div>

    <div v-if="data.length === 0" class="empty-state">
      <slot name="empty">暂无数据</slot>
    </div>

    <div v-if="showPagination" class="pagination-container">
      <button 
        class="pagination-btn prev"
        :disabled="currentPageValue === 1"
        @click="goToPrevPage"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <div class="pagination-numbers">
        <span 
          v-for="page in totalPages" 
          :key="page"
          class="pagination-number"
          :class="{ active: page === currentPageValue }"
          @click="goToPage(page)"
        >{{ page }}</span>
      </div>
      
      <button 
        class="pagination-btn next"
        :disabled="currentPageValue === totalPages"
        @click="goToNextPage"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue';
import { useTheme } from '@/composables/useTheme';

const { themeColors } = useTheme();

interface Column {
  key: string;
  label: string;
  width?: string;
  class?: string;
  render?: (props: { row: any; column: Column }) => JSX.Element | null;
}

const props = defineProps<{
  columns: Column[];
  data: any[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  showPagination?: boolean;
  pageSize?: number;
  total?: number;
  currentPage?: number;
}>();

const emit = defineEmits<{
  (e: 'search', keyword: string): void;
  (e: 'pageChange', page: number): void;
  (e: 'rowClick', row: any): void;
}>();

const searchKeyword = ref('');
const internalCurrentPage = ref(1);
const PAGE_SIZE = props.pageSize || 12;

const isExternalPagination = computed(() => {
  return props.total !== undefined;
});

const currentPageValue = computed(() => {
  if (isExternalPagination.value) {
    return props.currentPage ?? 1;
  }
  return internalCurrentPage.value;
});

const handlePageClick = (page: number) => {
  if (isExternalPagination.value) {
    emit('pageChange', page);
  } else {
    internalCurrentPage.value = page;
  }
};

const headerBgColor = computed(() => {
  const color = themeColors.value.primary;
  return hexToRgba(color, 0.2);
});

const gridTemplateColumns = computed(() => {
  return props.columns.map(col => col.width || '1fr').join(' ');
});

const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
  }
  return `rgba(100, 200, 255, ${alpha})`;
};

const filteredData = computed(() => {
  if (!searchKeyword.value.trim()) {
    return props.data;
  }
  const keyword = searchKeyword.value.trim().toLowerCase();
  return props.data.filter(row => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(keyword)
    );
  });
});

const totalPages = computed(() => {
  const total = props.total ?? filteredData.value.length;
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
});

const paginatedData = computed(() => {
  if (isExternalPagination.value) {
    return filteredData.value;
  }
  const start = (currentPageValue.value - 1) * PAGE_SIZE;
  return filteredData.value.slice(start, start + PAGE_SIZE);
});

const getCellValue = (row: any, key: string) => {
  return row[key] !== undefined ? row[key] : '-';
};

const clearSearch = () => {
  searchKeyword.value = '';
};

const goToPrevPage = () => {
  if (currentPageValue.value > 1) {
    handlePageClick(currentPageValue.value - 1);
  }
};

const goToNextPage = () => {
  if (currentPageValue.value < totalPages.value) {
    handlePageClick(currentPageValue.value + 1);
  }
};

const goToPage = (page: number) => {
  handlePageClick(page);
};

const handleRowClick = (row: any) => {
  emit('rowClick', row);
};

watch(searchKeyword, () => {
  internalCurrentPage.value = 1;
  emit('search', searchKeyword.value);
});

watch(() => props.data, () => {
  if (!isExternalPagination.value) {
    internalCurrentPage.value = 1;
  }
}, { deep: true });

defineExpose({
  searchKeyword,
  currentPage: currentPageValue,
  clearSearch,
  goToPage
});
</script>

<style scoped>
.data-table {
  width: 100%;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.search-row {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid v-bind('themeColors.primary');
  border-radius: 0;
  padding: 8px 16px;
  width: 300px;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.1);
  border-color: v-bind('themeColors.primary');
}

.search-icon {
  width: 18px;
  height: 18px;
  color: v-bind('themeColors.secondary');
  margin-right: 10px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: v-bind('themeColors.primary');
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
}

.search-input::placeholder {
  color: v-bind('themeColors.secondary');
  opacity: 0.6;
}

.search-clear {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: v-bind('themeColors.secondary');
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 8px;
  transition: color 0.2s ease;
}

.search-clear:hover {
  color: v-bind('themeColors.primary');
}

.search-clear svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888888;
  font-size: 16px;
  font-family: 'Rajdhani', sans-serif;
}

.table-header {
  display: grid;
  padding: 15px 20px;
  font-weight: 600;
  color: v-bind('themeColors.primary');
  text-align: left;
  position: relative;
}

.table-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: v-bind('themeColors.primary');
  transform: scaleY(0.5);
}

.header-item {
  font-family: 'Rajdhani', sans-serif;
}

.table-row {
  display: grid;
  padding: 10px 20px;
  position: relative;
  align-items: center;
  transition: background-color 0.3s ease;
}

.table-row::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: v-bind('themeColors.primary');
  transform: scaleY(0.5);
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.table-row:hover .table-item {
  color: #0cda85;
}

.table-row:hover :deep(.account-item),
.table-row:hover :deep(.nav-item),
.table-row:hover :deep(.application-item) {
  color: #0cda85;
}

.table-item {
  font-family: 'Rajdhani', sans-serif;
  color: v-bind('themeColors.secondary');
  text-align: left;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
}

.table-item.status-center :deep(.status-dot) {
  margin-left: 5px;
  margin-top: 5px;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.pagination-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: v-bind('themeColors.secondary');
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.pagination-btn svg {
  width: 20px;
  height: 20px;
}

.pagination-btn:hover:not(:disabled) {
  color: v-bind('themeColors.primary');
  transform: scale(1.2);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: scale(1);
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.pagination-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: v-bind('themeColors.secondary');
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-number:hover {
  color: v-bind('themeColors.primary');
}

.pagination-number.active {
  color: v-bind('themeColors.primary');
  text-decoration: underline;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .table-item.actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>