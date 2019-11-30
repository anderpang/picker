/*! <anderpang@foxmail.com> */
"use strict";
(function(ctx,factory){
    if(typeof exports==="object"){
        exports.__esModule=true;
        exports.default=factory();
    }
    else{
        ctx.Picker=factory();
    }
})(this,function(){
    var raf=window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){
        return setTimeout(f,16.6667);
    },
    caf=window.cancelAnimationFrame||window.webkitCancelAnimationFrame||function(t){
        clearTimeout(t);
    };
    function Picker(options){
        var itemKeys={"id":"id","value":"value"},//,"parentId"
            newKeys=options.itemKeys;

        this.options=options;
        if(!options.itemHeight){
           this.options.itemHeight="2.6em";
        }
        if(isNaN(options.headerHeight)){
           this.options.headerHeight="3em";
        }
        else{
           this.options.headerHeight=options.headerHeight+"px";
        }
        
        if(newKeys){
            for(var i in itemKeys){
                if(!newKeys.hasOwnProperty(i)){
                    newKeys[i]=itemKeys[i];
                }
            }
        }
        else{
            this.options.itemKeys=itemKeys;
        }

        if(!Array.isArray(options.defaults)){
            this.options.defaults=[];
        }

        if(typeof this.options.cancelButtonText==="undefined"){
            this.options.cancelButtonText="取消";
        }

        if(typeof this.options.sureButtonText==="undefined"){
            this.options.sureButtonText="确定";
        }

        if(!options.friction){
            this.options.friction=0.95;
        }
        this._isObject=typeof this.options.data[0][0]==="object";
        this._hasParentId=this._isObject&&("parentId" in this.options.itemKeys);

        this._min_v=2;
        this._columnCount=options.data.length;    
        this._selectedIndexes=[];    
        this._replaceData=[];      

        this._parseUnit(this.options.itemHeight);
        this._boxHeight=this._calc.itemHeight*5;

        this._cancel=this._up;

        this.init();

    }

    Picker.prototype={
        constructor:Picker,
        init:function(){
           var d=document,
               data=this.options.data,
               defaults=this.options.defaults,
               layer=d.createElement("div"),
               wrap=layer.cloneNode(false),
               header=wrap.cloneNode(false),
               box=wrap.cloneNode(false),
               columnDom,
               headerHeight=this.options.headerHeight,
               itemHeight=this._calc.itemHeight,
               unit=this._calc.unit,
               ii=this._columnCount,
               i=ii,
               position=[],
               headerHtml='<a class="j-cle" href="javascript:;">',
               ct="width:";

               headerHtml+=this.options.cancelButtonText;
               headerHtml+='</a><span class="picker-tit">';

               this._position=position;
               this._moveIndex=-1;

               ct+=100/i;
               ct+="%;margin-top:";
               ct+=itemHeight*2;
               ct+=unit;

            while(i--){
                position[i]=0;

                columnDom=layer.cloneNode(false);
                columnDom.className="picker-column";
                columnDom.style.cssText=ct;
                box.appendChild(columnDom);
            }

            //默认索引 
            for(i=0;i<ii;i++){
                this._selectedIndexes[i]=this.findIndexById(defaults[i],i?this._getChild(i):data[i]);  
            }

            headerHtml+=this.options.title||"";
            headerHtml+='</span><a class="j-ok" href="javascript:;">';
            headerHtml+=this.options.sureButtonText;
            headerHtml+='</a>';
            header.innerHTML=headerHtml;

            ct="height:";
            ct+=headerHeight;
            ct+=";line-height:";
            ct+=headerHeight;
            header.style.cssText=ct;

            ct="height:";
            ct+=this._boxHeight;
            ct+=unit;
            ct+=";line-height:";
            ct+=itemHeight;
            ct+=unit;

            box.style.cssText=ct;

            header.className="picker-header";
            box.className="picker-box";
            wrap.className="picker-wrap";
            layer.className="picker-layer";


            this.layer=layer;
            this.header=header;
            this.box=box;  
            
            
            this.createColumn(0,null,true)
                .initEvents();

            wrap.appendChild(header);
            wrap.appendChild(box);
            layer.appendChild(wrap);

            d.body.appendChild(layer); 
            
            
            this._itemHeight=box.clientHeight/5; //用于计算粘合
            this._setDefaults();
            layer.classList.add("picker-layer-on");

        },
        _unitReg:/(\d+\.?\d*)([a-zA-z]+)/,
        _parseUnit:function(value){
            var num,unit,m;
            if(isNaN(value)){
                m=this._unitReg.exec(value);
                if(m){
                    num=m[1]*1;      
                    unit=m[2];  
                }
                else{
                    m=2.6;
                    unit="em";
                }                
            }
            else{
                num=value*1;
                unit="px";
            }

            this._calc={itemHeight:num,unit:unit};
            return this;
        },
        createColumn:function(index,replaceData,isInit){
            var columnDom=this.box.children[index],
                data,
                pid,
                count=this._columnCount,
                i=0,
                ii,
                itemHeight=this._calc.itemHeight,
                valueKey=this.options.itemKeys.value,
                st=' style="height:',
                html="",
                selectedIndex;

                if(index){
                    data=Array.isArray(replaceData)?replaceData:this._getChild(index);
                }
                else{
                    data=this.options.data[index];
                }

                st+=itemHeight;
                st+=this._calc.unit;
                st+='"';

            ii=data.length;  
            if(this._isObject){             
                for(;i<ii;i++){
                    html+='<div class="picker-item"'
                    html+=st;
                    html+='">';
                    html+=data[i][valueKey];
                    html+='</div>';
                }
            }
            else{
                for(;i<ii;i++){
                    html+='<div class="picker-item"'
                    html+=st;
                    html+='">';
                    html+=data[i];
                    html+='</div>';
                }
            }
            
            if(!isInit){
                this.setPosition(columnDom,0,index);
                this._selectedIndexes[index]=0;
            }
            
            columnDom.innerHTML=html;
            //columnDom.children[selectedIndex].classList.add("picker-picked");

            if(isInit){
                ++index<count && this.createColumn(index,null,isInit);
            }
            return this;                    
        },
        _setDefaults:function(){
            var itemHeight=this._itemHeight,
                i=0,
                ii=this._columnCount,
                columns=this.box.children,
                selectedIndex;

            for(;i<ii;i++){
                selectedIndex=this._selectedIndexes[i];
                this.setPosition(columns[i],-itemHeight*selectedIndex,i);
            }                    
        },
        _getChild:function(index){
            if(!this._hasParentId || !this._isObject){
                return this.options.data[index];
            }
            var data=this.options.data,
                curData=data[index],
                pData,
                pIndex=index-1,     
                idKey=this.options.itemKeys.id,
                pidKey=this.options.itemKeys.parentId,                   
                pid,
                i,
                ii,
                child;

            if(pidKey){
               pData=this._replaceData[pIndex];
               if(!Array.isArray(pData)){
                   pData=data[pIndex];
               }
               pid=pData[this._selectedIndexes[pIndex]][idKey];
               i=0;
               ii=curData.length;
               child=[];

               for(;i<ii;i++){
                   if(curData[i][pidKey]===pid){
                       child.push(curData[i]);
                   }
               }

               this._replaceData[index]=child;
            }
            else
            {
                child=curData;
            }
            return child;
        },

        findIndexById:function(id,data){
             if(!id){
                 return 0;
             }
             var i=data.length,
                 idKey=this.options.itemKeys.id;
             if(this._isObject){
                while(i--){
                    if(data[i][idKey]===id){
                        return i;
                    }
                }
             }
             else{
                while(i--){
                    if(data[i]===id){
                        return i;
                    }
                }
             }
             return 0;
        },
        setPosition:function(columnDom,y,columnIndex){
            var ts="translateY(";
            ts+=y;
            ts+="px)";
            this._position[columnIndex]=y;
            columnDom.style.webkitTransform=columnDom.style.transform=ts;

            return this;
        },
        initEvents:function(){
            var columns=this.box.children,
                i=columns.length,
                _eventType={"resize":"resize"};

                this._eventType=_eventType;
            
            if(window.PointerEvent){
                _eventType.down="pointerdown";
                _eventType.move="pointermove";
                _eventType.up="pointerup";
                _eventType.cancel="pointerleave";
            }
            else if(typeof this.layer.ontouchstart!=="undefined"){
                _eventType.down="touchstart";
                _eventType.move="touchmove";
                _eventType.up="touchend";
                _eventType.cancel="touchcancel";
            }
            else{
                _eventType.down="mousedown";
                _eventType.move="mousemove";
                _eventType.up="mouseup";
                _eventType.cancel="mouseleave";
            }

            this.box.addEventListener(_eventType.down,this,false);
            this.layer.addEventListener(_eventType.move,this,false);
            this.layer.addEventListener(_eventType.up,this,false);
            this.layer.addEventListener(_eventType.cancel,this,false);
            this.layer.addEventListener("click",this,false);
            this.layer.addEventListener("webkitTransitionEnd",this,false);
            this.layer.addEventListener("transitionend",this,false);
            window.addEventListener(_eventType.resize,this,false);
        },
        handleEvent:function(e){
            var _eventType=this._eventType;

            switch(e.type){
                case "click":
                    this._click(e);
                break;
                case _eventType.up:
                    this._up(e);
                break;
                case _eventType.move:
                    this._move(e);
                break;
                case _eventType.down:
                    this._down(e);
                break;
                case _eventType.cancel:
                    this._cancel(e);
                break;
                case _eventType.resize:
                    this._resize(e);
                break;
                case "transitionend":
                    this._tend(e);
                break;
                case "webkitTransitionEnd":
                    this._tend(e);
                break;
            }
        },
        _click:function(e){
            var t=e.target;
            e.preventDefault();

            if(t===this.layer){
                this.close();
                return;
            }            
           if(t.tagName==="A"){
               if(t.className==="j-ok"){
                   if(typeof this.options.callback==="function"){
                      //获取最终结果
                       this.options.callback(this.getResult());
                   }
               }

              this.close();
               
           }
        },
        _down:function(e){  
           var aw=this.box.clientWidth,
               itemWidth=aw/this._columnCount,
               cx,
               cy;

           e.preventDefault();
           caf(this._timer);
           
           if(e.type==="touchstart"){
               cx=e.touches[0].clientX;
               cy=e.touches[0].clientY;
           }
           else{
               cx=e.clientX;
               cy=e.clientY;
           }
                           

           this._moveIndex=cx/itemWidth|0;
           this._moveDom=this.box.children[this._moveIndex];

           this._oy=cy;
           this._dy=cy-this._position[this._moveIndex];
           this._startTime=e.timeStamp;
           this._isOver=false;

        },
        _move:function(e){
           e.preventDefault();
           if(this._moveIndex!==-1){
                var cy=e.type==="touchmove"?e.touches[0].clientY:e.clientY;
                this.setPosition(this._moveDom,cy-this._dy,this._moveIndex);
           }
        },
        _up:function(e){
           if(this._moveIndex!==-1){
               //防止up和cancel操用两次
               if(this._isOver){
                   return this;
               }
              var cy=e.type==="touchend" || e.type==="touchcancel"?e.changedTouches[0].clientY:e.clientY,
                  dy=cy-this._oy,
                  diffTime=e.timeStamp-this._startTime,
                  startPos=this._position[this._moveIndex],
                  speed,
                  dir=dy>0?1:-1,
                  lastY,
                  itemHeight=this._itemHeight;

              e.preventDefault();

              this._isOver=true;

              if(Math.abs(dy)>5){
                if(diffTime<300){
                    speed=dy/diffTime*14;
                    
                    //让速度保持正数，以方便后面的计算判断
                    if(dir===-1){
                        speed*=dir;
                    }
                    speed=Math.max(this._min_v,speed);
                    
                    lastY=-itemHeight*(this._moveDom.childElementCount-1);
                    this._ease(startPos,speed,dir,lastY,this._moveDom,this._moveIndex)
                }
                else{
                    if(startPos>0){
                        this.setPosition(this._moveDom,0,this._moveIndex);
                    }
                    else{
                        lastY=-itemHeight*(this._moveDom.childElementCount-1);
                        if(startPos<lastY){                                    
                            this.setPosition(this._moveDom,lastY,this._moveIndex);
                        }
                        else{
                            speed=this._min_v*dir;
                            lastY=(startPos/itemHeight+dir|0)*itemHeight;                       
                            this._glue(startPos,speed,lastY,this._moveDom,this._moveIndex);
                        }
                    }
                }
              }

              this._moveIndex=-1;
              this._moveDom=null;
           }
        },
        _tend:function(e){
           var t=e.target;
           if(t===this.layer && !t.classList.contains("picker-layer-on")){
              this.distory();
           }
        },
        _resize:function(){
            var i=this._columnCount,
                selectedIndexes=this._selectedIndexes,
                columns=this.box.children,
                itemHeight=this.box.clientHeight/5;

            this._itemHeight=itemHeight;

            while(i--){
                this.setPosition(columns[i],-itemHeight*selectedIndexes[i],i);
            }
        },
        _ease:function(b,v,dir,lastY,moveDom,moveIndex){
            var friction=this.options.friction;
                                
            this._timer=raf(function(){
                 b+=v*dir;
                 if(b>0){                             
                     b=0;
                     v=0;
                 }
                 else if(b<lastY){
                     b=lastY;
                     v=0;
                 }                         
                 else{
                    v=Math.max(this._min_v,v*friction);
                 }

                 if(v===0){
                    this.setPosition(moveDom,b,moveIndex)
                        ._checkChange(moveIndex,b);
                 }
                 //保持一个最小速度，以免最后等得有点久
                 else if(v===this._min_v){
                     lastY=this._itemHeight*(b/this._itemHeight+(dir-1)/2|0);
                     caf(this._timer);
                     this._glue(b,v*dir,lastY,moveDom,moveIndex);
                 }                        
                 else{
                     this.setPosition(moveDom,b,moveIndex)
                        ._ease(b,v,dir,lastY,moveDom,moveIndex);
                 }
            }.bind(this));
            
        },
        _glue:function(b,v,lastY,moveDom,moveIndex){
            if(v===0){
                
                this._checkChange(moveIndex,lastY);
                return this;
            }               
            this._timer=raf(function(){
                  b+=v;
                  if(Math.abs(b-lastY)<this._min_v){
                      b=lastY;
                      v=0;
                  }

                  this.setPosition(moveDom,b,moveIndex)
                      ._glue(b,v,lastY,moveDom,moveIndex);
            }.bind(this));                    
        },
        _checkChange:function(moveIndex,lastY){
            var selectedIndex=(lastY*-1)/this._itemHeight+0.5|0; //0.5浮点运算修正值
            caf(this._timer);
            //如果选择改变，则处理后面的；否则不处理
            if(this._selectedIndexes[moveIndex]!==selectedIndex)
            {
                this._selectedIndexes[moveIndex]=selectedIndex;
                this._change(moveIndex,selectedIndex);
            }
        },
        _change:function(index,selectedIndex){
            var replaceData,curData;

            if(typeof this.options.change==="function"){
                replaceData=this._replaceData[index];
                curData=Array.isArray(replaceData)?replaceData:this.options.data[index];

                replaceData=this.options.change.call(this,index,curData[selectedIndex]);

                if(++index<this._columnCount){
                    if(replaceData===false){
                        this._change(index,this._selectedIndexes[index]);
                    }
                    else{
                        this._replaceData[index]=replaceData;
                        this.createColumn(index,replaceData,false);
                        this._change(index,0);
                    }
                }
            }
            else{
                while(++index<this._columnCount){
                    this.createColumn(index,null,false); 
                }
            }                   
            return this;
        },
        getResult:function(index){
            var data=this.options.data,
                replaceData=this._replaceData,
                i=0,
                ii=this._columnCount,
                result;

            if(typeof index==="number"){
                return this._getOneResult(index,replaceData,data);
            }
                
            result=[];
            for(;i<ii;i++){
                result[i]=this._getOneResult(i,replaceData,data);
            }
            return result;
        },
        _getOneResult:function(index,replaceData,data){
            var item=replaceData[index],
                selectedIndex=this._selectedIndexes[index],
                result=Array.isArray[item]?item[selectedIndex]:index>0?this._getChild(index)[selectedIndex]:data[index][selectedIndex];
                return result;
        },
        close:function(){                  
           this.layer.classList.remove("picker-layer-on");
        },
        distory:function(){
            window.removeEventListener("resize",this,false);
            document.body.removeChild(this.layer);
            this.header=this.box=this.layer=null;
        }
    }

    return Picker;
});