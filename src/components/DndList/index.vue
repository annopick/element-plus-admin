<template>
  <div class="dndList">
    <div :style="{ width: width1 }" class="dndList-list">
      <h3>{{ list1Title }}</h3>
      <draggable :set-data="setData" :list="list1" group="article" item-key="id" class="dragArea">
        <template #item="{ element }">
          <div class="list-complete-item">
            <div class="list-complete-item-handle">
              {{ element.id }}[{{ element.author }}] {{ element.title }}
            </div>
            <div style="position:absolute;right:0px;">
              <span style="float: right ;margin-top: -20px;margin-right:5px;" @click="deleteEle(element)">
                <el-icon style="color:#ff4949"><Delete /></el-icon>
              </span>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <div :style="{ width: width2 }" class="dndList-list">
      <h3>{{ list2Title }}</h3>
      <draggable :list="list2" group="article" item-key="id" class="dragArea">
        <template #item="{ element }">
          <div class="list-complete-item">
            <div class="list-complete-item-handle2" @click="pushEle(element)">
              {{ element.id }} [{{ element.author }}] {{ element.title }}
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { Delete } from '@element-plus/icons-vue'

defineOptions({ name: 'DndList' })

interface ListItem {
  id: number
  author?: string
  title?: string
  name?: string
  [key: string]: any
}

const props = withDefaults(defineProps<{
  list1?: ListItem[]
  list2?: ListItem[]
  list1Title?: string
  list2Title?: string
  width1?: string
  width2?: string
}>(), {
  list1: () => [],
  list2: () => [],
  list1Title: 'list1',
  list2Title: 'list2',
  width1: '48%',
  width2: '48%'
})

function isNotInList1(v: ListItem) {
  return props.list1.every(k => v.id !== k.id)
}

function isNotInList2(v: ListItem) {
  return props.list2.every(k => v.id !== k.id)
}

function deleteEle(ele: ListItem) {
  for (const item of props.list1) {
    if (item.id === ele.id) {
      const index = props.list1.indexOf(item)
      props.list1.splice(index, 1)
      break
    }
  }
  if (isNotInList2(ele)) {
    props.list2.unshift(ele)
  }
}

function pushEle(ele: ListItem) {
  for (const item of props.list2) {
    if (item.id === ele.id) {
      const index = props.list2.indexOf(item)
      props.list2.splice(index, 1)
      break
    }
  }
  if (isNotInList1(ele)) {
    props.list1.push(ele)
  }
}

function setData(dataTransfer: DataTransfer) {
  // to avoid Firefox bug
  // Detail see : https://github.com/RubaXa/Sortable/issues/1012
  dataTransfer.setData('Text', '')
}
</script>

<style lang="scss" scoped>
.dndList {
  background: #fff;
  padding-bottom: 40px;
  &:after {
    content: "";
    display: table;
    clear: both;
  }
  .dndList-list {
    float: left;
    padding-bottom: 30px;
    &:first-of-type {
      margin-right: 2%;
    }
    .dragArea {
      margin-top: 15px;
      min-height: 50px;
      padding-bottom: 30px;
    }
  }
}

.list-complete-item {
  cursor: pointer;
  position: relative;
  font-size: 14px;
  padding: 5px 12px;
  margin-top: 4px;
  border: 1px solid #bfcbd9;
  transition: all 1s;
}

.list-complete-item-handle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 50px;
}

.list-complete-item-handle2 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 20px;
}

.list-complete-item.sortable-chosen {
  background: #4AB7BD;
}

.list-complete-item.sortable-ghost {
  background: #30B08F;
}

.list-complete-enter,
.list-complete-leave-active {
  opacity: 0;
}
</style>
