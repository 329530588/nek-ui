### 示例

#### 基本形式

<div class="m-example"></div>

```xml
 <ui.button type="primary" title="primary" />
 <ui.button type="default" title="default" />
 <ui.button type="info" title="info" />
 <ui.button type="success" title="success" />
 <ui.button type="warn" title="warn" />
 <ui.button type="error" title="error" />
```

#### 常用的button类型

<div class="m-example"></div>

```xml
<div class=g-row>
    <ui.button action="view" title="查看" />
    <ui.button action="undo" title="撤销" />
    <ui.button action="cancel" title="取消" />
    <ui.button action="remove" title="删除" />
    <ui.button action="update" title="更新" />
</div>
<div class=g-row>
    <ui.button action="submit" title="提交" />
    <ui.button action="save" title="保存" />
    <ui.button action="copy" title="复制" />
    <ui.button action="pass" title="通过" />
    <ui.button action="reject" title="驳回" />
</div>
<div class=g-row>
    <ui.button action="backward" title="返回" />
    <ui.button action="download" title="下载" />
    <ui.button action="upload" title="上传" />
    <ui.button action="search" title="查询" />
    <ui.button action="edit" title="编辑" />
</div>
<div class=g-row>
    <ui.button action="add" title="添加" />
    <ui.button action="link" title="链接" link="http://www.baidu.com" />
</div>
```

#### 圆角的图标按钮

<div class="m-example"></div>

```xml
<div class=g-row>
    <ui.button action="update" shape="circle" size="xs" />
    <ui.button action="update" shape="circle" size="sm" />
    <ui.button action="update" shape="circle" />
    <ui.button action="update" shape="circle" size="lg" />
    <ui.button action="update" shape="circle" size="xl" />
</div>
```

#### 加载中的按钮

<div class="m-example"></div>

```xml
<div class=g-row>
    <ui.button action="update" loading />
</div>
```