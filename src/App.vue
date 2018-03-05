<template>
  <div id="app">
    <tree-menu :props="Object.keys(tree)" :jobject="tree" :depth="0" :label="'Root'"></tree-menu>
  </div>
</template>

<script>
import TreeView from './components/TreeView'

export default {
  name: 'App',
  components: {
    TreeMenu: TreeView // Component does not use the internal 'name', but the one defined here, traslated from camelCase or PascalCase to kebab-case
  },
  data () {
    return {
      tree: {
        'test': {
          'nestedObject': [
            'this',
            'is',
            1,
            'array'
          ]
        }
      }
    }
  }
}
</script>

<style>
.tree-menu.selected { background-color: yellow; color: black }
</style>
