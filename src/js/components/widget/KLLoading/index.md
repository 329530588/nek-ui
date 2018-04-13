---
title: 加载
---

<!-- demo_start -->
### 基本形式

<div class="m-example"></div>

```xml
<kl-button on-click="{this.showLoading()}" title="显示加载，2秒后隐藏" />
<kl-loading visible={visible} />
```

```javascript
var component = new NEKUI.Component({
    template: template,
    config: function(data) {
        data.visible = false;
    },
    showLoading: function() {
        this.data.visible = true;
        setTimeout(function() {
          this.$update('visible', false);
        }.bind(this), 2000);
    }
});
```
<!-- demo_end -->

<!-- demo_start -->
### 嵌入文档流

<div class="m-example"></div>

```xml
<kl-button on-click="{visible = !visible}" title="{visible ? '隐藏加载' : '显示加载'}" />
<p>
    <kl-loading visible={visible} static />
</p>
```

```javascript
var component = new NEKUI.Component({
    template: template,
    config: function(data) {
        data.visible = false;
    }
});
```
<!-- demo_end -->

<!-- demo_start -->
### 指定嵌入的父级元素

<div class="m-example"></div>

```xml
<kl-button on-click="{this.show()}" title="显示加载，2秒后隐藏" />
```

```javascript
var component = new NEKUI.Component({
    template: template,
    config: function(data) {
    },
    show: function() {
        var loading = new NEKUI.KLLoading({
            data: {
                visible: true,
                el: '#main'
            }
        });
        setTimeout(function() {
            loading.destroy();
        }, 2000);
    }
});
```
<!-- demo_end -->
