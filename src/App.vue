<template>
  <div id="app">
    <div class="container title">
      <a href="">Vue-Tags</a>
    </div>
    <div class="container vue-tags">
      <Tags :AllTags="allTags"
        :UsedTagIds="usedTagIds"
        AutoComplite='true'></Tags>
    </div>
    <div class="container info">
      <h3>食用指导</h3>
      <small>通过一个简单的 5 步教学，让你了解本控件所有功能！</small>
      <h4>1. 添加</h4>
      <p>尝试着在输入框中输入
        <mark>Google</mark>，然后按
        <strong>Enter</strong> 键，即可添加该标签！</p>
      <h4>2. 删除标签</h4>
      <p>那个名为
        <mark>Mini</mark> 的标签我也不知道是干嘛的，通过点击该标签右侧的
        <span style="color:red;">✕</span> 来将其移除。 </p>
      <p>当前我们的输入框什么都没有，请在输入框中点击一下，让它获得焦点。然后我觉得这个
        <mark>Google</mark> 也没什么用，按下
        <strong>Backspace</strong> 来删除最后一个元素。</p>
      <h4>3. 自动补全</h4>
      <p>嗯，我觉得应该加上
        <mark>Kubernetes</mark> 这个标签，让我们先输入
        <mark>Ku</mark> 这两个字符，这个单词太长了，我不想挨个儿输完(其实是忘了怎么拼写😂)。<br/> 那可以偷个懒，看到了输入框中那个浅蓝色的文字吗？插件已经知道我们要输入什么了，你只需要按下
        <strong>Tab</strong> 键即可瞬间自动补全（也可以鼠标双击输入框），补全后再按
        <mark>Enter</mark> 将其添加进去！
      </p>
      <h4>4. 重复提示</h4>
      <p>好像不对，刚才添加进去的
        <mark>kubernetes</mark> 怎么是小写的！我想要这种效果的：
        <mark>Kubernetes</mark>，那试着再在输入框中输入
        <mark>Ku</mark> 然后自动补全。完了，怎么自动补全直接就把我刚才的大写
        <mark>K</mark> 换成小写了。。。好吧，手动修改第一个字母为大写！完美！然后按
        <strong>Enter</strong>。</p>
      <p>Naive！控件检测到这两个标签除了大小写不同其他都一样，所以拒绝了添加这个控件，并且通过闪动已有标签的方式提醒你：这个标签加过啦！</p>
      <h4>5. 修改大小写</h4>
      <p>如果只是大小写不同，控件是会拒绝添加的（因为本来就是一个东西），如果想要修改已有标签的大小写，有一个非常简单的办法：同时按下
        <strong>Shift</strong> 和
        <strong>Enter</strong>，完事儿！</p>
      <p></p>
      <p>这些便是基础用法，更多功能只有你自己去发现了😼</p>
    </div>
  </div>
</template>

<script>
import Tags from "./components/Tags";

export default {
  name: 'app',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      allTags: {
        1: { name: 'Github', color: '#213123' },
        2: { name: 'JavaScript', color: '#213123' },
        3: { name: 'Golang', color: '#213123' },
        4: { name: 'Blog', color: '#213123' },
        5: { name: 'Mini', color: '#213123' },
        6: { name: 'MacOS', color: '#213123' },
        7: { name: 'Node.js', color: '#213123' },
        8: { name: 'kubernetes', color: '#213123' }
      },
      usedTagIds: [3, 5, 7],
    }
  },
  components: {
    Tags
  }
}
</script>

<style lang="scss">
#app {
  padding: 60px 0 0;
  width: 100%;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.container {
  box-sizing: border-box;
  margin: auto;
  width: 400px;
  &.title {
    margin-bottom: 50px;
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    a,
    a:hover,
    a:link,
    a:active,
    a:visited {
      cursor: pointer;
      text-decoration: none;
      color: #24292e;
    }
  }
  &.vue-tags {
    background: #eee;
  }
  &.info {
    margin-top: 10px;
    padding: 5px;
    background: #eee;
    p {
      font-size: 0.8rem;
    }
    red {
      color: red;
    }
  }
}
</style>
