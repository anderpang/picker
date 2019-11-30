# 多级选择器

源码21K，优化后11k，精简易用

[演示demo](picker.html)

### 使用

```html
  <link  rel="stylesheet" href="css/picker.css" />
  <script src="js/picker.js"></script>
```

支持 es6导入
```js
import Picker from "js/picker.js";
```

### 参数配置


| 选项                  | 描述                                                                                                                                                                                                                                                                                                                         |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| data | {Array} 必选。 数据源 |
| defaults | {Array} 可选。默认值 |
| title | {String} 可选。选择器标题 |
| headerHeight  | {String &brvbar; Nubmer} 可选。头部高度，支持数字(px)、em、rem、css单位  |
| itemHeight | {String  &brvbar; Number} 可选。选项高度，支持单位同headerHeight |
| itemKeys          | {Object} 可选。指定数据key值,默认为:{id:"id",value:"value",parentId:"parentId"}，其中parentId为可选 |
| cancelButtonText | {String} 可选。取消按钮所要显示的文字 |
| sureButtonText | {String} 可选。 确定按钮所要显示的文字 |
| change  |  {Function} 可选。每一项选项改变时触发。两响应参数，1.index值;2.选中的项。返回值：如是Array，将替换下一列的data值；如是false，则一下列不更新；否则按正常处理 |
| callback       | {Function} 可选。返回选择最终结果(Array) |


### 示例（部分代码）

省市区选择

```js
 new Picker({
        headerHeight:"3em",
        //itemHeight:35,
        itemHeight:"10vw",
        itemKeys:{
            id:"id",
            value:"value",
            parentId:"parentId"
        },
        data:areaData,
        defaults:defaults,
        //cancelButtonText:"Cancel",
        //sureButtonText:"Ok",
        // change:function(columnIndex,record){
        //     console.log(columnIndex,record);
        // },
        callback:function(result){
            var ids=result.map(function(item){
                return item.id;
            }),
            values=result.map(function(item){
                return item.value;
            });

            span.setAttribute("data-ids",ids.join(","));
            span.textContent=values.join("");
        }
    });
```

日期选择

```js
new Picker({
    title:"日期选择",
    data:[
        getYears(),
        getMonths(),
        getDays(defaults[0],defaults[1])
    ],
    defaults:defaults,
    change:function(index,record){
        //第一列，年份处理，return false不更新月份
        if(index===0){
            return false;
        }

        //月份变化时，处理日期
        if(index===1){
            var year=this.getResult(0);
            return getDays(year,record);
        }
    },
    callback:function(result){
        span.textContent=result.map(function(v){
            return v<10?'0'+v:v;
        }).join("-");
    }
});

```





