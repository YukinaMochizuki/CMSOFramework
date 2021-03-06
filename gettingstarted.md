---
description: 這個章節將會演示如何快速開始使用CMSOFramework。
---

# 快速開始

{% hint style="info" %}
此章節以快速簡易為主，零件中的主函式和一些其他的進階功能將不會於此進行演示。
{% endhint %}

### 零、準備好網頁模板

您可以在自己的網頁模板中定義其他零件的接入點，以及定義一些變數供框架填入內容時使用。

它可能長得像底下這樣：

```markup
<div class="ui top fixed menu" cms-comb="top-menu"> 
    <!--cms-comb屬性表示模板宣告的接口位子及其名稱-->
    <img src="img/logo.png" style="height: 55px"> 
</div>
```

若希望在模板中定義變數，只需要在網頁模板中要添加的地方打上 {{變數名稱}} 就能夠讓框架辨識到了。詳細要如何往變數中填入資料請參考第三點，定義一個新的零件的部分。  

{% hint style="warning" %}
理論上 "{{變數名稱}}" 可以放置於網頁模板中的任何地方，但由於 cms-comb 的屬性會於渲染階段前解析和暫存，對 cms-comb 進行更改將無法反映回框架的接口功能中。
{% endhint %}

```markup
<div class="ui dropdown item" style="min-width: 150px; white-space: nowrap;">
    <img class="ui avatar image" src="{{imageSrc}}">
    <i class="icon"></i>{{username}}
    <!--這裡宣告了username這個變數名稱-->
    <div class="menu" cms-comb="userSettingMenu">
        <div class="item">塗鴉牆</div>
        <div class="item">小屋</div>
        <div class="divider"></div>
    </div>
</div>
```

### 一、從GitHub導入框架檔案

因目前框架尚處於測試階段，所以沒有導入CDN讓使用者下載檔案。除了手動下載以外，您也可以透過GitHub本身開放的下載點導入框架。

{% hint style="warning" %}
撰文當下框架的發布版本號為v0.1.0a，隨著更新可能會有所變動，最新的版本請至 [Releases](https://github.com/YukinaMochizuki/CMSOFramework/releases) 中查詢。
{% endhint %}

```markup
<script src="https://cdn.rawgit.com/YukinaMochizuki/CMSOFramework/v0.1.0a/js/src/CmspaJS.main.js"></script>
```

### 二、新增一個 cms-app 屬性

接著，我們需要讓框架知道自己的 html 根目錄在哪裡，如果讓框架從 body 標籤中直接添加資料會喪失很大程度上的彈性。CMSOFramework 將會尋找整個 DOM 樹看看網頁文件中是否有標籤帶有 cms-app，並且將那個標籤定義為根目錄，新載入的模板都會連接於此。

```markup
<!DOCTYPE html>
<html lang="en">
<head>
    <!--網頁的head-->
</head>
<body>

<div cms-app>
</div>

</body>
</html>
```

### 三、定義一個新的零件

零件 \(component\) 是 CMSOFramework 中最基礎的構成，控制了從定義網頁模板、渲染到主要函式等的設定。這邊我們先從最基礎的模板載入與基礎渲染的相關設定開始，請記得務必讓程式碼執行於 DOM 載入完成之後。

{% hint style="info" %}
這裡的渲染指的是將網頁模板上的變數名稱代換成實際內容的過程。
{% endhint %}

```javascript
let ComponentDemo1 = cmspa.component({
    name : "ComponentDemo1", //零件的名稱
    template : "testTemplate.html",  //模板的載入位置
    renderingFunction : function () { 
        //渲染函式，模板載入時將調用此函式，預期回傳一組陣列，讓框架能為模板中的變數填入內容
        return [{key : "username" ,value : "使用者名稱"}] 
            //陣列中的每個物件都代表變數(key)與變數值(value)
    }
});
```

{% hint style="info" %}
通常建議使用 `window.addEventListener('DOMContentLoaded',function)`來註冊DOM載入完成的監聽器
{% endhint %}

### 四、使用一個容器包裝零件

容器 \(container\) 的主要用途是宣告零件中有哪些接口供其他容器連接，同時也會指名自己將會接到什麼地方。宣告與指名連接位子都並非必要選項，可以直接留空。前者留空代表此容器沒有開放任何接口給其他容器連接，後者留空框架將會預設將其放置於框架載入標籤的根中。

```javascript
let ContainerDemo1 = cmspa.container(ComponentDemo1,[],topMenu,"top-menu");
        //四個參數分別為：零件(object)、宣告的接口(array or string)、欲接上的父容器及其接口
```



