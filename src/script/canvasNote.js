+function (win) {
    var tempCache = [];
    function CanvasNote(opts) {
        try {
            this.canvas = document.getElementById(opts.id);
            if (!this.canvas || !this.canvas instanceof HTMLElement || this.canvas.tagName !== 'CANVAS') {
                throw new TypeError('id目标元素必须是canvas元素');
            }
            this.width = opts.width || null;
            this.height = opts.height || null;
            this.lineWidth = opts.lineWidth || 2;
            this.lineColor = opts.lineColor || 'rgba(168,0,20,.1)';
            this.ctx = this.canvas.getContext('2d');
            this.cache = opts.data || [];
            this.image = opts.image || null;
            initCanvasEvent.apply(this);
            initImages.apply(this);
        } catch (e) {
            throw e;
        }
    }
    //私有方法
    /** 初始化canvas事件 */
    function initCanvasEvent() {
        var me = this,
            canvas = this.canvas,
            ctx = this.ctx,
            temp = [],
            html = document.documentElement,
            body = document.body;
        ctx.lineWidth = me.lineWidth;
        ctx.strokeStyle = me.lineColor;
        ctx.save();
        canvas.onmousedown = function (e) {
            e.preventDefault();
            var x = e.clientX - canvas.offsetLeft + Math.max(html.scrollLeft, body.scrollLeft);
            var y = e.clientY - canvas.offsetTop + Math.max(html.scrollTop, body.scrollTop);
            temp.push(x, y);
            ctx.moveTo(x, y);
            ctx.beginPath();
            canvas.onmousemove = function (e) {
                e.preventDefault();
                var x = e.clientX - canvas.offsetLeft + Math.max(html.scrollLeft, body.scrollLeft);
                var y = e.clientY - canvas.offsetTop + Math.max(html.scrollTop, body.scrollTop);
                reduceframe(temp, x, y)
                ctx.lineTo(x, y);
                ctx.stroke();
            };
        }
        canvas.onmouseup = function (e) {
            me.cache.push(temp.slice(0))
            temp.length = 0;
            canvas.onmousemove = null;
        }
    }
    /** 初始化当前页 */
    function initImages() {
        var me = this,
            url = this.image;
        if (typeof url === 'string') {
            var img = new Image();
            img.onload = function () {
                me.canvas.width = this.width;
                me.canvas.height = this.height;
                me.ctx.drawImage(this, 0, 0);
                me.drawNote();
                me.ctx.save();
            }
            this.image = img;
            img.src = url;
        } else {
            throw new TypeError('请输入正确的图片地址');
        }
    }
    /** 优化笔记轨迹 */
    function reduceframe(points, x, y) {
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
    }
    //对外接口
    CanvasNote.prototype = {
        constructor: CanvasNote,
        drawNote: function () {
            var me = this,
                ctx = this.ctx;
            for (var i = 0; i < me.cache.length; i++) {
                var opt = me.cache[i];
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
        clearNote: function () {
            tempCache = this.cache.slice(0);
            this.cache = [];
            this.ctx.drawImage(this.image, 0, 0);
        },
        toggleNote: function (state) {
            if (state) {
                this.drawNote();
            } else {
                this.ctx.drawImage(this.image, 0, 0);
            }
        },
        revoke: function () {
            if (this.cache.length == 0) {
                this.cache = tempCache.slice(0);
            } else {
                this.cache.pop();
            }
            tempCache = [];
            this.ctx.drawImage(this.image, 0, 0);
            this.drawNote();
        }
    }
    Object.defineProperty(CanvasNote.prototype, "constructor", {
        enumerable: false,
        value: CanvasNote
    });
    win.CanvasNote = CanvasNote;
}(window);