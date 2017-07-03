---
title: 两级菜单
---

## 代码演示

### 基本形式

<!-- demo_start -->
<div class="m-example"></div>

```xml
<div style="width:180px;">
  <kl-menu>
    <kl-menu-sub title="第一级菜单">
      <kl-menu-item title="二级菜单A"></kl-menu-item>
      <kl-menu-item><a href="/">二级菜单B</a></kl-menu-item>
    </kl-menu-sub>
    <kl-menu-sub title="第一级菜单">
      <kl-menu-item title="二级菜单A"></kl-menu-item>
      <kl-menu-item>二级菜单B</kl-menu-item>
    </kl-menu-sub>
    <kl-menu-sub titleTemplate="<a>第三级菜单</a>"></kl-menu-sub>
  </kl-menu>
</div>
```
<!-- demo_end -->

### 通过配置数据渲染菜单

<!-- demo_start -->
<div class="m-example"></div>

```xml
<div style="width:180px;">
  <kl-menu uniqueOpened="{uniqueOpened}">
    {#list menus as menu}
    {#if menu.children && menu.children.length}
    <kl-menu-sub title="{menu.title}" defaultOpen="{menu.open}">
      {#list menu.children as page}
      <kl-menu-item isCurrent="{page.open}" url="{page.url}">{page.title}</kl-menu-item>
      {/list}
    </kl-menu-sub>
    {#else}
    <kl-menu-sub titleTemplate="<a href='{menu.url}'>{menu.title}</a>"></kl-menu-sub>
    {/if}
    {/list}
  </kl-menu>
</div>
```

```javascript
var component = new NEKUI.Component({
    template: template,
    data: {
        menus: [{
         title: '一级菜单A',
         open: true,
         children: [{
           open: true,
           title: '二级菜单A',
           url: '/'
         },{
           title: '二级菜单B',
           url: '/'
         }]
       }, {
         title: '一级菜单B',
         children: [{
           title: '二级菜单A',
           url: '/'
         },{
           title: '二级菜单B',
           url: '/'
         }]
       }]
    }
});
```
<!-- demo_end -->