<template>
  <li :class="{ completed: todo.done, editing: editing }" class="todo">
    <div class="view">
      <input
        :checked="todo.done"
        class="toggle"
        type="checkbox"
        @change="toggleTodo(todo)"
      >
      <label @dblclick="editing = true" v-text="todo.text" />
      <button class="destroy" @click="deleteTodo(todo)" />
    </div>
    <input
      v-show="editing"
      ref="editInput"
      :value="todo.text"
      class="edit"
      @keyup.enter="doneEdit"
      @keyup.esc="cancelEdit"
      @blur="doneEdit"
    >
  </li>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

defineOptions({ name: 'Todo' })

const props = withDefaults(defineProps<{
  todo?: { text: string; done: boolean }
}>(), {
  todo: () => ({ text: '', done: false })
})

const emit = defineEmits<{
  (e: 'toggleTodo', todo: { text: string; done: boolean }): void
  (e: 'editTodo', payload: { todo: { text: string; done: boolean }; value: string }): void
  (e: 'deleteTodo', todo: { text: string; done: boolean }): void
}>()

const editing = ref(false)
const editInput = ref<HTMLInputElement>()

watch(editing, (val) => {
  if (val) {
    nextTick(() => {
      editInput.value?.focus()
    })
  }
})

function deleteTodo(todo: { text: string; done: boolean }) {
  emit('deleteTodo', todo)
}

function toggleTodo(todo: { text: string; done: boolean }) {
  emit('toggleTodo', todo)
}

function doneEdit(e: Event) {
  const value = (e.target as HTMLInputElement).value.trim()
  const { todo } = props
  if (!value) {
    deleteTodo(todo)
  } else if (editing.value) {
    emit('editTodo', { todo, value })
    editing.value = false
  }
}

function cancelEdit(e: Event) {
  ;(e.target as HTMLInputElement).value = props.todo.text
  editing.value = false
}
</script>
