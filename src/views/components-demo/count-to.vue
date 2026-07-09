<template>
  <div class="components-container">
    <aside>
      <a href="https://github.com/PanJiaChen/vue-countTo" target="_blank">countTo-component</a>
      (inline reimplementation — vue-count-to is not installed in the Vue3 build)
    </aside>
    <span class="example">{{ formattedCount }}</span>
    <div style="margin-left: 25%;margin-top: 40px;">
      <label class="label" for="startValInput">startVal:
        <input v-model.number="setStartVal" type="number" name="startValInput">
      </label>
      <label class="label" for="endValInput">endVal:
        <input v-model.number="setEndVal" type="number" name="endVaInput">
      </label>
      <label class="label" for="durationInput">duration:
        <input v-model.number="setDuration" type="number" name="durationInput">
      </label>
      <div class="startBtn example-btn" @click="start">
        Start
      </div>
      <div class="pause-resume-btn example-btn" @click="pauseResume">
        pause/resume
      </div>
      <br>
      <label class="label" for="decimalsInput">decimals:
        <input v-model.number="setDecimals" type="number" name="decimalsInput">
      </label>
      <label class="label" for="separatorInput">separator:
        <input v-model="setSeparator" name="separatorInput">
      </label>
      <label class="label" for="prefixInput">prefix:
        <input v-model="setPrefix" name="prefixInput">
      </label>
      <label class="label" for="suffixInput">suffix:
        <input v-model="setSuffix" name="suffixInput">
      </label>
    </div>
    <aside>&lt;count-to :start-val='{{ _startVal }}' :end-val='{{ _endVal }}' :duration='{{ _duration }}'
      :decimals='{{ _decimals }}' :separator='{{ _separator }}' :prefix='{{ _prefix }}' :suffix='{{ _suffix }}'
      :autoplay=false&gt;</aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

defineOptions({ name: 'CountToDemo' })

const setStartVal = ref(0)
const setEndVal = ref(2017)
const setDuration = ref(4000)
const setDecimals = ref(0)
const setSeparator = ref(',')
const setSuffix = ref(' rmb')
const setPrefix = ref('¥ ')

const _startVal = computed(() => setStartVal.value || 0)
const _endVal = computed(() => setEndVal.value || 0)
const _duration = computed(() => setDuration.value || 100)
const _decimals = computed(() => {
  if (setDecimals.value) {
    if (setDecimals.value < 0 || setDecimals.value > 20) {
      window.alert('digits argument must be between 0 and 20')
      return 0
    }
    return setDecimals.value
  }
  return 0
})
const _separator = computed(() => setSeparator.value)
const _suffix = computed(() => setSuffix.value)
const _prefix = computed(() => setPrefix.value)

// ---- inline count animation ----
const displayValue = ref(_startVal.value)
let raf: number | null = null
let localStartVal = 0
let startTime: number | null = null
let paused = false
let remaining: number | null = null

const formattedCount = computed(() => {
  let formatted = displayValue.value.toFixed(_decimals.value)
  if (_separator.value) {
    const [intPart, decPart] = formatted.split('.')
    const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, _separator.value)
    formatted = decPart !== undefined ? `${withSeparator}.${decPart}` : withSeparator
  }
  return `${_prefix.value}${formatted}${_suffix.value}`
})

function step(timestamp: number) {
  if (startTime === null) {
    startTime = timestamp
  }
  const progress = paused ? 0 : timestamp - startTime
  const duration = remaining ?? _duration.value
  const eased = easeInOutExpo(Math.min(progress / duration, 1))
  displayValue.value = localStartVal + (_endVal.value - localStartVal) * eased
  if (progress < duration) {
    raf = window.requestAnimationFrame(step)
  } else {
    displayValue.value = _endVal.value
    raf = null
    remaining = null
  }
}

function easeInOutExpo(t: number): number {
  if (t === 1) return 1
  return 1 - Math.pow(2, -10 * t)
}

function start() {
  cancel()
  localStartVal = _startVal.value
  displayValue.value = localStartVal
  startTime = null
  paused = false
  remaining = null
  raf = window.requestAnimationFrame(step)
}

function pauseResume() {
  if (raf === null) {
    // currently stopped; resume from current displayValue to endVal
    if (displayValue.value === _endVal.value) return
    localStartVal = displayValue.value
    startTime = null
    paused = false
    remaining = null
    raf = window.requestAnimationFrame(step)
    return
  }
  if (paused) {
    // resume: restart the clock, keep remaining duration
    paused = false
    startTime = null
    if (remaining !== null) {
      const r = remaining
      const restartStart = localStartVal
      raf = window.requestAnimationFrame((ts) => {
        startTime = ts
        const endVal = _endVal.value
        const stepResume = (timestamp: number) => {
          if (startTime === null) startTime = timestamp
          const progress = timestamp - startTime
          const eased = easeInOutExpo(Math.min(progress / r, 1))
          displayValue.value = restartStart + (endVal - restartStart) * eased
          if (progress < r) {
            raf = window.requestAnimationFrame(stepResume)
          } else {
            displayValue.value = endVal
            raf = null
            remaining = null
            paused = false
          }
        }
        raf = window.requestAnimationFrame(stepResume)
      })
    }
  } else {
    // pause: capture remaining time
    paused = true
    if (startTime !== null) {
      const elapsed = performance.now() - startTime
      remaining = Math.max((_duration.value) - elapsed, 0)
      localStartVal = displayValue.value
    }
    if (raf !== null) {
      window.cancelAnimationFrame(raf)
      raf = null
    }
  }
}

function cancel() {
  if (raf !== null) {
    window.cancelAnimationFrame(raf)
    raf = null
  }
}

onBeforeUnmount(() => {
  cancel()
})
</script>

<style scoped>
.example-btn {
  display: inline-block;
  margin-bottom: 0;
  font-weight: 500;
  text-align: center;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  background-image: none;
  border: 1px solid transparent;
  white-space: nowrap;
  line-height: 1.5;
  padding: 4px 15px;
  font-size: 12px;
  border-radius: 4px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transition: all .3s cubic-bezier(.645, .045, .355, 1);
  transition: all .3s cubic-bezier(.645, .045, .355, 1);
  position: relative;
  color: rgba(0, 0, 0, .65);
  background-color: #fff;
  border-color: #d9d9d9;
}

.example-btn:hover {
  color: #4AB7BD;
  background-color: #fff;
  border-color: #4AB7BD;
}
.example {
  font-size: 50px;
  color: #F6416C;
  display: block;
  margin: 10px 0;
  text-align: center;
  font-size: 80px;
  font-weight: 500;
}

.label {
  color: #2f4f4f;
  font-size: 16px;
  display: inline-block;
  margin: 15px 30px 15px 0;
}

input {
  position: relative;
  display: inline-block;
  padding: 4px 7px;
  width: 70px;
  height: 28px;
  cursor: text;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(0, 0, 0, .65);
  background-color: #fff;
  background-image: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  -webkit-transition: all .3s;
  transition: all .3s;
}

.startBtn {
  margin-left: 20px;
  font-size: 20px;
  color: #30B08F;
  background-color: #fff;
}

.startBtn:hover {
  background-color: #30B08F;
  color: #fff;
  border-color: #30B08F;
}

.pause-resume-btn {
  font-size: 20px;
  color: #E65D6E;
  background-color: #fff;
}

.pause-resume-btn:hover {
  background-color: #E65D6E;
  color: #fff;
  border-color: #E65D6E;
}
</style>
