<template>
  <div id="app">
    <tree-menu :props="Object.keys(tree)" :jobject="tree" :depth="0" :label="'Root'"></tree-menu>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: 'TreeView'
}
</script>

<style>
.tree-menu.selected { background-color: yellow; color: black }
</style>
