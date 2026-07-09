<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <input v-model="newTodo" class="new-todo" autocomplete="off" placeholder="Todo List" @keyup.enter="addTodo">
    </header>
    <!-- main section -->
    <section v-show="todos.length" class="main">
      <input id="toggle-all" :checked="allChecked" class="toggle-all" type="checkbox" @change="toggleAll({ done: !allChecked })">
      <label for="toggle-all" />
      <ul class="todo-list">
        <todo
          v-for="(todo, index) in filteredTodos"
          :key="index"
          :todo="todo"
          @toggleTodo="toggleTodo"
          @editTodo="editTodo"
          @deleteTodo="deleteTodo"
        />
      </ul>
    </section>
    <!-- footer -->
    <footer v-show="todos.length" class="footer">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        {{ pluralize(remaining, 'item') }} left
      </span>
      <ul class="filters">
        <li v-for="(val, key) in filters" :key="key">
          <a :class="{ selected: visibility === key }" @click.prevent="visibility = key as string">{{ capitalize(key) }}</a>
        </li>
      </ul>
      <!-- <button class="clear-completed" v-show="todos.length > remaining" @click="clearCompleted">
        Clear completed
      </button> -->
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Todo from './Todo.vue'

defineOptions({ name: 'TodoList' })

interface TodoItem {
  text: string
  done: boolean
}

const STORAGE_KEY = 'todos'
const filters: Record<string, (todos: TodoItem[]) => TodoItem[]> = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
}
const defalutList: TodoItem[] = [
  { text: 'star this repository', done: false },
  { text: 'fork this repository', done: false },
  { text: 'follow author', done: false },
  { text: 'vue-element-admin', done: true },
  { text: 'vue', done: true },
  { text: 'element-ui', done: true },
  { text: 'axios', done: true },
  { text: 'webpack', done: true }
]

const visibility = ref<keyof typeof filters>('all')
const todos = ref<TodoItem[]>(defalutList)
const newTodo = ref('')

const allChecked = computed(() => todos.value.every(todo => todo.done))
const filteredTodos = computed(() => filters[visibility.value](todos.value))
const remaining = computed(() => todos.value.filter(todo => !todo.done).length)

function pluralize(n: number, w: string): string {
  return n === 1 ? w : w + 's'
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function setLocalStorage() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value))
}

function addTodo() {
  const text = newTodo.value
  if (text.trim()) {
    todos.value.push({
      text,
      done: false
    })
    setLocalStorage()
  }
  newTodo.value = ''
}

function toggleTodo(val: TodoItem) {
  val.done = !val.done
  setLocalStorage()
}

function deleteTodo(todo: TodoItem) {
  todos.value.splice(todos.value.indexOf(todo), 1)
  setLocalStorage()
}

function editTodo({ todo, value }: { todo: TodoItem; value: string }) {
  todo.text = value
  setLocalStorage()
}

function clearCompleted() {
  todos.value = todos.value.filter(todo => !todo.done)
  setLocalStorage()
}

function toggleAll({ done }: { done: boolean }) {
  todos.value.forEach(todo => {
    todo.done = done
    setLocalStorage()
  })
}
</script>

<style lang="scss">
  @import './index.scss';
</style>
