---
title: 面包屑
---

## 代码演示

<!-- demo_start -->
*基本形式*
<div class="m-example"></div>

```xml
<kl-crumb separator="/">
    <kl-crumb-item><kl-icon type="home2" color="#E31436" /></kl-crumb-item>
    <kl-crumb-item>第一级目录</kl-crumb-item>
    <kl-crumb-item>第二级目录</kl-crumb-item>
    <kl-crumb-item>第三级目录</kl-crumb-item>
    <kl-crumb-item href="http://www.kaola.com">第四级目录</kl-crumb-item>
    <kl-crumb-item>第五级目录</kl-crumb-item>
</kl-crumb>
```
<!-- demo_end -->

<!-- demo_start -->
*基本形式（简版）*
<div class="m-example"></div>

```xml
<kl-crumb separator="/">
    <kl-crumb-item><kl-icon type="home2" color="#E31436" /></kl-crumb-item>
    <kl-crumb-item content="第一级目录" />
    <kl-crumb-item content="第二级目录" />
    <kl-crumb-item content="第三级目录" />
    <kl-crumb-item content="第四级目录" href="http://www.kaola.com" />
    <kl-crumb-item content="第五级目录" />
</kl-crumb>
```
<!-- demo_end -->