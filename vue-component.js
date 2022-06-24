Vue.component('countable-input', {
  inheritAttrs: false,
  props: ['value', 'max-length', 'base-class', 'focused-class', 'count-class', 'clear-class'],
  data: function () {
    return {
      hasFocus: false
    }
  },
  computed: {
    baseClassObject: function () {
      var focusedClass = {};
      focusedClass[this.focusedClass] = this.hasFocus;
      return [this.baseClass, focusedClass]
    },
    inputListeners: function () {
      var vm = this
      // `Object.assign` merges objects together to form a new object
      return Object.assign({},
        // We add all the listeners from the parent
        this.$listeners,
        // Then we can add custom listeners or override the
        // behavior of some listeners.
        {
          // This ensures that the component works with v-model
          input: function (event) {
            var string = event.target.value;
            (function(s,b,i,c) {
              for(b=i=0;c=s.charCodeAt(i);i++) {
                var t = c>>11?3:c>>7?2:1;
                b+=t;
                if (b > vm.maxLength) {
                  b-=t;
                  string = s.substring(0, i);
                  vm.$refs.input.value = string;
                  break;
                }
              }
              return b;
            })(string);
            vm.$emit('input', string);
          }
        }
      )
    },
    count: function() {
      return this.byteLength(this.value);
    }
  },
  methods: {
    clear: function() {
      log('clear button clicked.');
      this.$emit('input', '');
    },
    byteLength: function(s) {
      byteLength = (function(s,b,i,c) {
        for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
        return b;
      })(s);
      return byteLength;
    }
  },
  template: `
    <div v-bind:class="baseClassObject">
      <input
          v-bind="$attrs"
          v-bind:value="value"
          v-on="inputListeners"
          v-on:focus="hasFocus = true"
          v-on:blur="hasFocus = false"
          ref="input"
      />
      <span v-bind:class="countClass">{{ count }}/{{ maxLength }}</span>
      <button v-bind:class="clearClass"
          @mousedown="clear" v-show="hasFocus && value.length > 0">X</button>
    </div>
    `
});

Vue.component('check-input', {
  inheritAttrs: false,
  props: ['value', 'head-label', 'title', 'id'],
  computed: {
    inputListeners: function () {
      var vm = this
      // `Object.assign` merges objects together to form a new object
      return Object.assign({},
        // We add all the listeners from the parent
        this.$listeners,
        // Then we can add custom listeners or override the
        // behavior of some listeners.
        {
          // This ensures that the component works with v-model
          input: function (event) {
            var string = event.target.value;
            var checked = event.target.checked;
            vm.$emit('input', string);
          }
        }
      )
    }
  },
  template: `
    <div class="wrap-section-inner">
    	<span class="wrap-section-head">{{ headLabel }}</span>
    	<div class="wrap-section-cnt">
    		<div class="inp-switch">
    			<input
    			  type="checkbox"
            v-bind="$attrs"
            v-bind:value="value"
    			  v-bind:id="id"
    			  v-bind:title="title"
            v-on="inputListeners"
          />
    			<label v-bind:for="id" class="slider round"></label>
    		</div>
    	</div>
    </div>
  `
});

/*
.input-txt {
  position: relative;
  border: solid;
}
.input-txt input {
  position: relative;
  width: 100%;
  padding-right: 60px;
}
.input-txt .count {
  position: absolute;
  top: 0; right: 0;
  width: 40px; height: 100%;
  text-align: right;
  padding-right: 5px;
}
.input-txt .clear {
  position: absolute;
  top: 0; right: 40px;
  width: 20px; height: 100%;
  border: none;
}
<countable-input base-class="input-txt" clear-class="clear" count-class="count" v-model="text" max-length="10"></countable-input>
 */

/*
 * Bottom 영역의 Slot간에 공백이나 줄바꿈이 들어가면
 * findIndex에서 return 값의 변경이 발생한다.
 */
Vue.component('popup-layout', {
  inheritAttrs: false,
  props: ['popup-class', 'content-class', 'head-class', 'body-class', 'bottom-class'],
  data: function () {
    return {
      visible: false
    }
  },
  beforeUpdate: function () {
    log('');
  },
  updated: function () {
    log('');
  },
  methods: {
    open: function () {
      this.visible = true;
    },
    close: function () {
      this.visible = false;
    },
    popupClick: function (e) {
      var slotName = undefined;
      var targetIndex = this.findIndex(this.$refs.bottomContainer, e.target);
      switch (targetIndex) {
      case 0:
        slotName = 'negative';
        break;
      case 1:
        slotName = 'positive';
        break;
      }
      this.$emit('click', e, slotName);
    },
    findIndex: function (parent, target) {
      if (parent.hasChildNodes()) {
        var children = parent.childNodes;
        for (var i=0; i < children.length; i++) {
          if (children[i].outerHTML === target.outerHTML) {
            return i;
          } else if (children[i].nodeType == 1) {
            var idx = this.findIndex(children[i], target);
            if (idx > -1) return i + idx;
          }
        }
      }
      return -1;
    }
  },
  template: `
    <div v-bind:class="popupClass" v-show="visible">
      <div v-bind:class="contentClass">
        <div v-bind:class="headClass">
          <slot name="title"></slot>
        </div>
        <div v-bind:class="bodyClass">
          <slot name="body"></slot>
        </div>
        <div v-bind:class="bottomClass" v-on:click="popupClick" ref="bottomContainer">
          <slot name="negative"></slot><slot name="positive"></slot>
        </div>
      </div>
    </div>
    `
});
