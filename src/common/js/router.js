/**
 * Created by hey on 2016/10/10.
 *
 */
    
    // var routes = {
    //     '/author': author,
    //     '/books': [books, function() { console.log("An inline route handler."); }],
    //     '/books/view/:bookId': viewBook
    // };
    // 
    var pages = ['page1','page2','page3'];
    var local = '';
    var app = document.querySelectorAll('.app')[0];
    function arrIndexOf(arr,v){
        for(var i=0; i<arr.length;i++){
            if(arr[i]==v){
                return i;
            }
        }
        return -1;
    }
    function hasClass(obj,className){
        if (obj.classList)
            return obj.classList.contains(className);
        else
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(obj.className);
    }
    function removeClass(obj,className){
        //如果有class
        if(obj.className !=''){
            var arrClassName=obj.className.split(' ');
            var _index=arrIndexOf(arrClassName,className);
            //如果有我们要删除的Class
            if(_index != -1){
                arrClassName.splice(_index,1);
                obj.className=arrClassName.join(' ');
            }
        }
        //如果原来没有class
    }

    function addClass(obj, className){
        if(obj.className==''){
            //如果原来没有class
            obj.className=className;
        }else{
            //如果原来有class
            var arrClassName=obj.className.split(" ");
            var _index=arrIndexOf(arrClassName,className);
            if(_index==-1){
                //如果要添加的class在原来的class里面不存在
                obj.className+=' '+className;
            }
            //如果要添加的class在原来的calss存在
        }
    }

    function sliderIn(){
        console.log(this);
        local = this.getRoute()[0];
        var page = document.createElement('div');
        var iframe = document.createElement("iframe");
        iframe.src = local + '.html';
        page.className = 'page active';
        page.id= local;
        page.appendChild(iframe);
        app.appendChild(page);
        console.log(local);
    }

    function sliderOut(){
        console.log(local);
        removeClass(document.querySelector('#'+local),'active');
    }

    var routes = {
          "/page1": {
                before: function () { },
                on: function(){},
                after: function () { },
                once: function () { },
            },
            "/page2": {
                before: function () { },
                on: function () { }
            },
            "/page3": {
                before: function () {  },
                on: function () {  }
            }
    };

    var router = Router(routes);
    router.init();
    local = router.getRoute()[0];
    console.log(local);
    addClass(document.querySelector('#'+local),'active');

    router.configure({
        on: sliderIn,
        after: sliderOut
    });
