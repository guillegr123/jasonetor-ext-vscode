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
export default {
  name: 'tree-menu',
  props: [ 'props', 'jobject', 'label', 'depth' ],
  data() {
    return {
      id: uuidv4(),
      showChildren: true,
      hasChildren: typeof(this.jobject) == 'object' || typeof(this.jobject) == 'Array',
      selected: false,
      indent: { 'padding-left': `${this.depth}em` }
    }
  },
  computed: {
    iconClasses() {
      return {
        'fa-plus-square-o': !this.showChildren,
        'fa-minus-square-o': this.showChildren
      }
    },
    labelClasses() {
      return { 'has-children': this.hasChildren }
    },
    selectedClasses() {
      return { 'selected': this.selected }
    }
  },
  methods: {
    toggleChildren() {
      this.showChildren = !this.showChildren;
    },
    deselect(selectedId) {
      if (this.id !== selectedId) {
        this.selected = false;
        eventBus.$off(this.deselect);
      }
    },
    toggleSelected() {
      if (!this.selected) {
        this.selected = true;
        eventBus.$emit('node.onSelected', this.id);
        eventBus.$on('node.onSelected', this.deselect);
      } else {
        this.deselect('');
      }
    }
  }
}

var eventBus = new Vue()
</script>

<style>
</style>
