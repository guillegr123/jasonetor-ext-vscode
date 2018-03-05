<template>
  <div class="tree-menu" :class="selectedClasses">
    <div class="label-wrapper">
      <div :style="indent" :class="labelClasses">
        <i v-if="hasChildren" class="fa" :class="iconClasses" @click="toggleChildren"></i>
        <b @click="toggleSelected">{{ label }}:</b>
          <span v-if="!hasChildren" >{{ jobject }}</span>
      </div>
    </div>

    <tree-menu v-if="hasChildren && showChildren" v-for="prop in props" :props="Object.keys(jobject[prop])" :jobject="jobject[prop]" :label="prop" :depth="depth + 2" v-bind:key="prop">
    </tree-menu>
  </div>
</template>

<script>
import { EventBus, Utils } from '../utils.js'

export default {
  name: 'TreeMenu',
  props: [ 'props', 'jobject', 'label', 'depth', 'EventBus' ],
  data () {
    return {
      id: Utils.uuidv4(),
      showChildren: true,
      hasChildren: typeof (this.jobject) === 'object',
      selected: false,
      indent: { 'padding-left': `${this.depth}em` }
    }
  },
  computed: {
    iconClasses () {
      return {
        'fa-plus-square-o': !this.showChildren,
        'fa-minus-square-o': this.showChildren
      }
    },
    labelClasse () {
      return { 'has-children': this.hasChildren }
    },
    selectedClasses () {
      return { 'selected': this.selected }
    }
  },
  methods: {
    toggleChildren () {
      this.showChildren = !this.showChildren
    },
    deselect (selectedId) {
      if (this.id !== selectedId) {
        this.selected = false
        EventBus.$off(this.deselect)
      }
    },
    toggleSelected () {
      if (!this.selected) {
        this.selected = true
        EventBus.$emit('node.onSelected', this.id)
        EventBus.$on('node.onSelected', this.deselect)
      } else {
        this.deselect('')
      }
    }
  }
}
</script>

<style>
</style>
