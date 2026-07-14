import { shallowMount } from '@vue/test-utils'
import SvgIcon from '@/components/SvgIcon/index.vue'

describe('SvgIcon.vue', () => {
  it('iconClass', () => {
    const wrapper = shallowMount(SvgIcon, {
      props: { iconClass: 'test' }
    })
    expect(wrapper.find('use').attributes('href') ?? wrapper.find('use').attributes('xlink:href')).toBe('#icon-test')
  })
  it('className', async() => {
    const wrapper = shallowMount(SvgIcon, {
      props: { iconClass: 'test' }
    })
    // default class is just 'svg-icon'
    expect(wrapper.classes()).toEqual(['svg-icon'])
    await wrapper.setProps({ className: 'test' })
    expect(wrapper.classes()).toContain('test')
  })
  it('external link', () => {
    const wrapper = shallowMount(SvgIcon, {
      props: { iconClass: 'https://example.com/icon.png' }
    })
    // for external links the svg (with <use>) is not rendered
    expect(wrapper.find('use').exists()).toBe(false)
  })
})
