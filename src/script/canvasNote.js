function CanvasNote(opts) {
    this.width = opts.width||null;
    this.height = opts.height||null;
    this.imgUrl = opts.imgUrl||null;
    this.lineWidth = opts.lineWidth || 2;
    this.lineColor = opts.lineColor || 'rgba(168,0,20,.1)';
    this.canvas = document.getElementById(opts.id);
    this.ctx = this.canvas.getContext('2d');
    this.cache = opts.data || [];
    this.img = new Image();
}
CanvasNote.prototype = {
    constructor: CanvasNote,
    init: function () {
        var me=this,
            canvas = me.canvas,
            ctx = me.ctx,
            canvasInit = me.canvasInit,
            reduceframe = me.reduceframe,
            cache = me.cache, 
            temp = [];
        me.imagesInit(me.imgUrl,true);
        canvas.onmousedown = function (e) {
            e.preventDefault();
            var x = e.clientX - canvas.offsetLeft + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
            var y = e.clientY - canvas.offsetTop + Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            temp.push(x, y);
            ctx.lineWidth = me.lineWidth;
            ctx.strokeStyle = me.lineColor;
            ctx.moveTo(x, y);
            ctx.beginPath();
            canvas.onmousemove = function (e) {
                e.preventDefault();
                var x = e.clientX - canvas.offsetLeft + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
                var y = e.clientY - canvas.offsetTop + Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                me.reduceframe(temp, x, y)
                ctx.lineTo(x, y);
                ctx.stroke();
            };
        }
        canvas.onmouseup = function (e) {
            cache.push(temp.slice(0))
            temp.length = 0;
            canvas.onmousemove = null;
        }
    },
    canvasInit: function () {
        var me=this,
            opts=me.cache,
            ctx=this.ctx;
        for (var i = 0; i < opts.length; i++) {
            var opt = opts[i];
            ctx.moveTo(opt[0], opt[1]);
            ctx.lineWidth = me.lineWidth;
            ctx.strokeStyle = me.lineColor;
            ctx.beginPath();
            for (var x = 2; x < opt.length; x += 2) {
                ctx.lineTo(opt[x], opt[x + 1]);
                ctx.stroke();
            }
        }
    },
    imagesInit: function (url,state) {
        var me = this;
        me.img.src =url||me.imgUrl;
        me.img.onload = function () {
            me.canvas.width = me.width||this.width;
            me.canvas.height = me.height||this.height;
            me.ctx.drawImage(img, 0, 0);
            if(state){
                me.canvasInit();
            }
        }
    },
    reduceframe: function (points, x, y) {
        if (points.length < 4) {
            points.push(x, y);
            return;
        }
        /*  
         * x1:前前次的x坐标索引
         * y1:前前次的y坐标索引
         * x2:前次的x坐标索引
         * y2;前次的y坐标索引
         */
        var x1 = points.length - 4,
            y1 = x1 + 1,
            x2 = y1 + 1,
            y2 = x2 + 1,
            b = x / y,
            revise = 1;//修正像素数
        /*以下为帧优化操作 */
        if (points[x1] === x && Math.abs(points[x2] - x) < (revise + 1)) {
            points[x2] = x;
        }
        if (points[y1] === y && Math.abs(points[y2] - y) < (revise + 1)) {
            points[y2] = y;
        }
        if (points[x1] / points[y1] === b) {
            if ((points[x2] + revise) / b == points[y2]) {
                points[x2] += revise;
            } else if ((points[x2] - revise) / b == points[y2]) {
                points[x2] -= revise;
            } else if ((points[y2] + revise) * b == points[x2]) {
                points[y2] += revise;
            } else if ((points[y2] - revise) * b == points[x2]) {
                points[y2] -= revise;
            }
        }
        /*以下为减帧操作 */
        //x坐标相同
        if (points[x1] === x && points[x2] === x && points[y2] < y) {
            points[x2] = x;
            points[y2] = y;
            //y坐标相同
        } else if (points[y1] === y && points[y2] === y && points[x2] < x) {
            points[x2] = x;
            points[y2] = y;
            //角度相同
        } else if (points[x1] / points[y2] === points[y1] - points[y2] && points[x1] / points[y2] === b) {
            points[x2] = x;
            points[y2] = y;
        } else {
            points.push(x, y);
        }
    },
    clearNote: function () {
       this.ctx.restore();
    },
    toggleNote:function(state){
        if(state){
            this.canvasInit(true);
        }else{
            this.clearNote();
        }
    },
    revoke:function(){
        this.cache.pop();
        this.imagesInit(this.imgUrl,true);
    }

}