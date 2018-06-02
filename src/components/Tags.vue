<template>
  <div class="vue-tags-container">
    <div class="used-tags-wapper">
      <div v-for="tagId in usedTagIds"
        :key="tagId"
        :class="{active:hlTagId==tagId}"
        class="used-tag">
        <span>{{getTagNameById(tagId)}}</span>
        <span @click="delTag(tagId)"
          class="used-tag-remove">✕</span>
      </div>
      <span class="new-tag-wapper">
        <span class="new-tag-item new-tag-propose">{{proposal}}</span>
        <input v-model="inputVal"
          :placeholder="Placeholder"
          :class="{'no-select':proposedTagId!==null,warning:showInputWarning}"
          @dblclick.prevent="onKeydownTab"
          @keypress.enter="onKeypressEnter"
          @keydown.delete="onKeydownDelete"
          @keyup.delete="onKeyupDelete"
          @compositionstart="onCompositionStart"
          @compositionend="onCompositionEnd"
          @paste.prevent="onPaste"
          @keydown.9.prevent="onKeydownTab"
          type="text"
          class="new-tag-item new-tag-input">
      </span>
    </div>
    <div calss="unused-tags-wapper"></div>
  </div>
</template>

<script>
export default {
  name: "Vue-Tags",
  props: {
    /* Datas */
    // 正在使用的标签所对应的 id 数组，如: [2, 3, 6]
    UsedTagIds: {
      type: Array,
      default() {
        return [];
      }
    },
    // 所有的标签项目数组，如: {1: {name: "Github", color: "#213123"}}
    AllTags: {
      type: Object,
      default() {
        return {};
      }
    },
    // 全局 id 指示器，新增的标签 id 就会使用这个值并且将其自增 1
    NextTagId: {
      type: Number,
      default: null
    },
    // 输入框的占位提示文字
    Placeholder: {
      type: String,
      default: '请输入标签名'
    },
    // 在输入框中自动补全，会多消耗一丢丢性能
    AutoComplite: {
      type: Boolean | String,
      default: false
    },
    // 允许通过粘贴直接添加标签
    AllowPasteToAdd: {
      type: Boolean | String,
      default: true
    },

    /* Styles */
    // 标签输入框中输入超过设定值数量的字符，输入字体颜色将改变
    WarningLength: {
      type: Number,
      default: 18
    }
  },
  mounted() {
    // 初始化全局 id
    this.globalNextId = this.initGlobalId();
  },
  data() {
    return {
      /* Data */
      allTags: this.AllTags, // 所有的标签
      usedTagIds: this.UsedTagIds, // 使用中的标签的 id
      globalNextId: 10, // 全局 id 指示器
      inputVal: '', // 新标签输入框的值
      proposedTagId: null, // 输入框中自动补全所对应标签的 id
      /* State */
      showInputWarning: false,
      isComposing: false, // 用于处理：使用中文输入法时点击删除会删除标签
      hlTagId: null, // 高亮闪烁的标签 id，一般用于提醒该标签已在使用中
      hlCount: 0, // 用以高亮计数，避免连续的高亮不独立计时
      delKeySwitch: true, // 防止按住 delete 键后连续删除标签
    };
  },
  computed: {
    // 输入框中的建议值（已处理了大小写问题）
    proposal() {
      // 匹配到的已有标签的完整名称
      let name = this.proposedTagName,
        val = this.inputVal;

      // 没有匹配到的情况
      if (name === '') return '';

      // 下面一顿操作是为了让不同大小写的文字能对应（比如）
      // TODO: 详细解释代码作用
      name = name.substr(val.length);
      name = val + name;
      return name;
    },
    // 当前输入框匹配标签的完整名字，未经过大小写转换的
    proposedTagName() {
      // 匹配成功
      if (this.proposedTagId !== null) {
        return this.getTagNameById(this.proposedTagId);
      }
      return '';
    },
    // 标准数据
    cbParam() {
      return {
        allTags: this.allTags,
        usedTagIds: this.usedTagIds,
        globalNextId: this.globalNextId
      }
    }
  },
  methods: {
    /*
     * 初始化函数 
     * */
    // 初始化全局 id 计数器
    initGlobalId() {
      let maxId = 0;
      // 如果 allTags 不为空，则计算出其中最大的 id 值
      let ids = Object.keys(this.allTags);
      if (ids.length !== 0) {
        maxId = Math.max(...ids) + 1;
      }
      // 如果用户提供了指定的 id 值，则进行处理
      if (this.NextTagId !== null) {
        maxId = maxId > this.NextTagId ? maxId : this.NextTagId;
      }
      // 用户未提供
      return Number(maxId);
    },

    /*
     * 事件处理 
     * */
    onKeypressEnter(event) {
      let newTagName = this.inputVal,
        isSuccess = false;
      // 值为空，不予处理
      if (newTagName === '') return;

      // 强制替换模式
      if (event.shiftKey) {
        isSuccess = this.addTag(this.inputVal, true);
      } else {
        // 普通增加模式
        isSuccess = this.addTag(this.inputVal);
      }

      // 添加成功，将输入框置空
      if (isSuccess) {
        this.hlTagId = null;
        this.inputVal = '';
      }
    },
    onKeydownDelete() {
      // 正在使用弹出式输入框输入（如中文输入法），则跳过处理 delete 事件
      if (this.isComposing) {
        this.delKeySwitch = false;
        return;
      }

      // 输入框值不为空，则不能删除前面的标签
      if (this.inputVal.length !== 0) {
        this.delKeySwitch = false;
        return;
      }

      // 没有删除机会，无法删除标签
      // 只要有 delete 操作，就不允许直接删除，必须先抬起 delete 键一次才能获得一次删除机会
      if (this.delKeySwitch) {
        this.delLastTag();
        this.delKeySwitch = false;
      }
    },
    onKeyupDelete() {
      this.delKeySwitch = true;
    },
    onCompositionStart() {
      this.isComposing = true;
    },
    onCompositionEnd() {
      this.isComposing = false;
    },
    // 屏蔽浏览器默认操作
    onPaste(e) {
      // 获取剪贴板数据
      let text = (e.clipboardData || window.clipboardData).getData('text');
      // 判断是否开启粘贴添加的功能并且数据不能为空
      if (this.AllowPasteToAdd && text.length > 0) {
        if (this.addTag(text)) {
          // 添加成功后将输入框置空
          this.inputVal = '';
        } else {
          // 添加失败后，将数据填写在输入框，供修改
          this.inputVal = text;
        }
      }
    },
    onKeydownTab() {
      if (this.AutoComplite) {
        // 避免在没有匹配项的情况下替换当前输入
        if (this.proposedTagId === null) return;

        this.inputVal = this.proposedTagName;
      }
    },

    /* 
     * 功能函数 
     * */
    // 添加
    addTag(name, force) {
      // 去除前后空格，其实只需要去除后面的空格，但为了完全覆盖，这一点性能损耗不算什么
      name = name.trim();
      // 值为空不予以处理
      if (name.length === 0) return false;
      // 检查是否已存在此标签
      let existedTagId = this.getTagIdByName(name, false);
      if (existedTagId === null) {
        // 并没有添加过这个名称的标签
        // 构建新标签
        let newTag = new Object({
          name: name
        }),
          newTagId = this.getNextId();
        this.$emit('before-add-tag', this.cbParam, newTagId, name);
        // 添加到标签列表中
        this.allTags[newTagId] = newTag;
        this.useTag(newTagId);
        this.$emit('after-add-tag', this.cbParam, newTagId, name);
      } else if (this.usedTagIds.indexOf(existedTagId) === -1) {
        // 已经存在此名字的标签，但是当前并没有使用
        // 使用该标签
        this.useTag(existedTagId);
      } else {
        // 强制添加
        if (force) {
          // 则先将已有标签的名字改掉
          this.setTagNameById(existedTagId, name);
          return true;
        } else {
          // 该名称对应标签正在被使用
          this.hlTagById(existedTagId);
          // 添加失败，返回 false
          return false;
        }
      }

      return true;
    },
    useTag(id) {
      this.$emit('before-use-tag', this.cbParam, id);
      // 直接添加到当前使用列表中
      this.usedTagIds.push(id);
      this.$emit('after-use-tag', this.cbParam, id);
    },
    // 移除指定标签
    delTag(id) {
      this.$emit('before-delete-tag', this.cbParam, id);
      this.usedTagIds = this.rmMatch(this.usedTagIds, _id => _id !== id);
      this.$emit('after-delete-tag', this.cbParam, id);
    },
    // 从使用中的标签里移除最后一个
    delLastTag() {
      let usedTagIds = this.usedTagIds,
        tobeRemovedTagId = usedTagIds[usedTagIds.length - 1];
      this.$emit('before-delete-tag', this.cbParam, tobeRemovedTagId);
      this.usedTagIds = this.rmLast(this.usedTagIds);
      this.$emit('after-delete-tag', this.cbParam, tobeRemovedTagId);
    },
    inputWarning() {
      // 输入超过指定长度给予提醒
      if (this.inputVal.length > this.WarningLength) {
        this.showInputWarning = true;
      } else {
        this.showInputWarning = false;
      }
    },
    inputPropose() {
      if (this.AutoComplite) {
        let val = this.inputVal,
          matchedTagId = null; // 模糊匹配到的已有标签 id
        // 无任何输入的情况下不进行建议
        if (val.length !== 0) {
          // 查询数据并给出首次匹配的标签 id
          matchedTagId = this.getTagIdByName(val, false, true, true);
        }
        this.proposedTagId = matchedTagId;
      }
    },
    getNextId() {
      return this.globalNextId++;
    },
    getTagNameById(id) {
      return this.allTags[id].name;
    },
    // isAbsLike 表示绝对模糊匹配，匹配的只能相似，不能相同
    // 成功返回 id Number，失败返回 null
    getTagIdByName(name, isCase, isLike, isAbsLike) {
      let allTags = this.allTags,
        id = null;
      // 初始化默认值
      isCase = isCase ? true : false;
      isLike = isLike || false;
      isAbsLike = isAbsLike || false;

      if (!name) return;
      // 大小写不敏感则全转化为小写来比较
      if (!isCase) name = name.toLowerCase();

      Object.keys(allTags).find(key => {
        let curName = allTags[key].name;
        if (!isCase) curName = curName.toLowerCase();
        // 简单模糊匹配
        if (isLike) {
          if (curName.startsWith(name)) {
            // 绝对模糊匹配
            if (isAbsLike) {
              if (curName.length === name.length) {
                // 两者完全相同，不符合绝对模糊匹配要求
                return false;
              } else {
                // 符合绝对匹配要求，匹配成功
                id = key;
                return true;
              }
            }
            // 非绝对模糊匹配则直接返回即可
            id = key;
            return true;
          }
        } else {
          if (curName === name) {
            id = key;
            return true;
          }
        }
      });
      return id === null ? null : Number(id);
    },
    // 通过 id 来直接修改对应标签的显示名字,用于更新大小写
    setTagNameById(id, name) {
      if (this.allTags[id] && name.length > 0) {
        // 更新钩子
        this.$emit('before-update-tag-name', this.cbParam, id, name);
        this.allTags[id].name = name;
        this.$emit('after-update-tag-name', this.cbParam, id, name);
        return true;
      }
      return false;
    },
    // highlight 标签
    hlTagById(id) {
      this.hlTagId = id;
      this.hlCount++;

      setTimeout(() => {
        this.hlCount--;
        if (this.hlCount === 0) {
          this.hlTagId = null;
        }
      }, 1600);
    },

    /* 
     * 辅助函数 
     * */
    rmLast(arr) {
      if (arr.length === 0) {
        return arr;
      }
      if (arr.length === 1) {
        return [];
      }
      arr.splice(-1);
      return arr;
    },
    rmMatch(arr, func) {
      return arr.filter(func);
    },
    // 去除左侧所有空格、换行、制表符
    triml(str) {
      return str.replace(/^[\s\n\t]+/g, "");
    },
    // FIXME: 暂未使用的函数
    trimr(str) {
      return str.replace(/[\s\n\t]+$/g, "");
    },
    getStrRealLength(str) {
      return str.replace(/[\u0391-\uFFE5]/g, "aa").length;  //先把中文替换成两个字节的英文，在计算长度
    },
    // FIXME: 暂未使用的函数
    // 获得随机数，n 为长度
    getRndNum(n) {
      let rnd = '';
      for (var i = 0; i < n; i++)
        rnd += Math.floor(Math.random() * 10);
      return rnd;
    },
  },
  watch: {
    inputVal(val) {
      // 文字过长警告
      this.inputWarning();
      // 自动补全
      this.inputPropose();
      // 禁止全为空格的数据
      if (val[0] === ' ') {
        this.inputVal = this.triml(this.inputVal);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$c-light: #fff;
$c-info: #a2ceff;
$c-orange: #e36209;
$c-warning: #d73a49;
$c-secondary: #787878;
$c-dark: #24292e;

$fs-sm: 0.6rem;
$fs-s: 0.8rem;
$fs-m: 1rem;

$input-width: 7rem;

.vue-tags-container {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  padding: 2px;
  font-size: $fs-m;
}
.used-tags-wapper {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.used-tag {
  margin: 2px;
  padding: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #24292e;
  border-radius: 3px;
  color: $c-light;
  font-size: $fs-m;
  flex: 1;
  &.active {
    animation: blink 0.4s linear infinite alternate;
  }
}
.new-tag-wapper {
  position: relative;
  flex-grow: 20;
  margin: 0;
  padding: 0;
  width: $input-width;
}
.new-tag-item {
  box-sizing: border-box;
  margin: 4px 2px 4px 4px;
  border: none;
  padding: 2px 0;
  width: calc(100% - 6px);
  font-size: $fs-m;
}
.new-tag-propose {
  position: absolute;
  color: $c-info;
}
.new-tag-input {
  position: inherit;
  background: none;
  outline: none;
  border-radius: 2px;
  font: inherit;
  transition: 300ms color;
  &.warning {
    color: $c-orange;
  }
  &.no-select::-moz-selection {
    background: transparent;
  }
  &.no-select::selection {
    background: transparent;
  }
}
.used-tag-remove {
  margin-left: 4px;
  cursor: pointer;
  font-size: $fs-s;
  &:hover {
    color: $c-warning;
  }
}
@keyframes blink {
  to {
    color: #24292e;
    background: #c3c3c3;
  }
}
</style>
