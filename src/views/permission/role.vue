<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">New Role</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="Role Key" width="220">
        <template #default="scope">
          {{ scope.row.key }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Role Name" width="220">
        <template #default="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="Description">
        <template #default="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Operations">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">Edit</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogType==='edit'?'Edit Role':'New Role'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="Name">
          <el-input v-model="role.name" placeholder="Role Name" />
        </el-form-item>
        <el-form-item label="Desc">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Role Description"
          />
        </el-form-item>
        <el-form-item label="Menus">
          <el-tree
            ref="treeRef"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="path"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="confirmRole">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import type { TreeInstance } from 'element-plus'
import { ElMessageBox, ElMessage, ElNotification } from 'element-plus'
import path from '@/utils/path'
import { deepClone } from '@/utils'
import { getRoutes, getRoles, addRole, deleteRole, updateRole } from '@/api/role'

defineOptions({ name: 'RolePermission' })

const defaultRole: {
  key: string | number
  name: string
  description: string
  routes: any[]
} = {
  key: '',
  name: '',
  description: '',
  routes: []
}

// non-reactive cache of the raw server routes (used by generateTree on confirm)
let serviceRoutes: any[] = []

const role = reactive(Object.assign({}, defaultRole))
const routes = ref<any[]>([])
const rolesList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogType = ref('new')
const checkStrictly = ref(false)
const defaultProps = reactive({
  children: 'children',
  label: 'title'
})
const treeRef = ref<TreeInstance>()

const routesData = computed(() => routes.value)

// Mock: get all routes and roles list from server
async function getRoutesData() {
  const res = await getRoutes()
  serviceRoutes = res.data
  routes.value = generateRoutes(res.data)
}

async function getRolesData() {
  const res = await getRoles()
  rolesList.value = res.data
}

// Reshape the routes structure so that it looks the same as the sidebar
function generateRoutes(routes: any[], basePath = '/'): any[] {
  const res: any[] = []

  for (let route of routes) {
    // skip some route
    if (route.hidden) { continue }

    const onlyOneShowingChildResult = onlyOneShowingChild(route.children, route)

    if (route.children && onlyOneShowingChildResult && !route.alwaysShow) {
      route = onlyOneShowingChildResult
    }

    const data: any = {
      path: path.resolve(basePath, route.path),
      title: route.meta && route.meta.title
    }

    // recursive child routes
    if (route.children) {
      data.children = generateRoutes(route.children, data.path)
    }
    res.push(data)
  }
  return res
}

function generateArr(routes: any[]): any[] {
  let data: any[] = []
  routes.forEach(route => {
    data.push(route)
    if (route.children) {
      const temp = generateArr(route.children)
      if (temp.length > 0) {
        data = [...data, ...temp]
      }
    }
  })
  return data
}

function handleAddRole() {
  Object.assign(role, defaultRole)
  if (treeRef.value) {
    treeRef.value.setCheckedNodes([])
  }
  dialogType.value = 'new'
  dialogVisible.value = true
}

function handleEdit(scope: any) {
  dialogType.value = 'edit'
  dialogVisible.value = true
  checkStrictly.value = true
  Object.assign(role, deepClone(scope.row))
  nextTick(() => {
    const routesData = generateRoutes(role.routes)
    treeRef.value?.setCheckedNodes(generateArr(routesData))
    // set checked state of a node not affects its father and child nodes
    checkStrictly.value = false
  })
}

function handleDelete({ $index, row }: { $index: number; row: any }) {
  ElMessageBox.confirm('Confirm to remove the role?', 'Warning', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      await deleteRole(row.key)
      rolesList.value.splice($index, 1)
      ElMessage({
        type: 'success',
        message: 'Delete succed!'
      })
    })
    .catch(err => { console.error(err) })
}

function generateTree(routes: any[], basePath = '/', checkedKeys: string[]): any[] {
  const res: any[] = []

  for (const route of routes) {
    const routePath = path.resolve(basePath, route.path)

    // recursive child routes
    if (route.children) {
      route.children = generateTree(route.children, routePath, checkedKeys)
    }

    if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
      res.push(route)
    }
  }
  return res
}

async function confirmRole() {
  const isEdit = dialogType.value === 'edit'

  const checkedKeys = treeRef.value?.getCheckedKeys() as string[]
  role.routes = generateTree(deepClone(serviceRoutes), '/', checkedKeys)

  if (isEdit) {
    await updateRole(role.key as number, role)
    for (let index = 0; index < rolesList.value.length; index++) {
      if (rolesList.value[index].key === role.key) {
        rolesList.value.splice(index, 1, Object.assign({}, role))
        break
      }
    }
  } else {
    const { data } = await addRole(role)
    role.key = data.key
    rolesList.value.push(role)
  }

  const { description, key, name } = role
  dialogVisible.value = false
  ElNotification({
    title: 'Success',
    dangerouslyUseHTMLString: true,
    message: `
        <div>Role Key: ${key}</div>
        <div>Role Name: ${name}</div>
        <div>Description: ${description}</div>
      `,
    type: 'success'
  })
}

// reference: src/view/layout/components/Sidebar/SidebarItem.vue
function onlyOneShowingChild(children: any[] = [], parent: any): any {
  let onlyOneChild: any = null
  const showingChildren = children.filter(item => !item.hidden)

  // When there is only one child route, the child route is displayed by default
  if (showingChildren.length === 1) {
    onlyOneChild = showingChildren[0]
    onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
    return onlyOneChild
  }

  // Show parent if there are no child route to display
  if (showingChildren.length === 0) {
    onlyOneChild = { ...parent, path: '', noShowingChildren: true }
    return onlyOneChild
  }

  return false
}

getRoutesData()
getRolesData()
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
