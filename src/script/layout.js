+function($){
    var panel=$('.page-panel'),
        row=1;
    $(document).on('click','[data-action]',function(e){
        var key = $(this).data('action');
        Method[key]&& Method[key].call(this,e);
    });
    var Method ={
        addRow:function(e){
            var tpl =   '<div class="component-row" data-type="row">' +
                            '<div class="row-head">' +
                                ButtonHtml('trash','trash') +
                                ButtonHtml('clipboard') +
                                ButtonHtml('plus','addColumn') +
                                '<h4>Row</h4>' +
                            '</div>' +
                            '<div class="row-body">'+
                            '</div></div>';
            panel.append(tpl);
        },
        addColumn:function(e){
            var t = $(this).closest('.row-head').next();
            var tpl=    '<div class="component-col" data-type="column">' +
                            '<div class="col-head">' +
                                ButtonHtml('trash','trash') +
                                ButtonHtml('clipboard') +
                                ButtonHtml('puzzle-piece','addComponent') +
                                '<h5>Column</h5>' +
                            '</div>' +
                            '<div class="col-body">'+
                            '</div></div>';
            t.append(tpl);
        },
        addComponent:function(e){
            initModal();
            var body=$(this).closest('[data-type]').find('.col-body')[0];
            $('[data-type="modal"]').one('addComponent',$.proxy(function(e){
                var comp =Array.prototype.slice.call(arguments,1),
                    fragment = document.createDocumentFragment();
                if($('#subrow').prop('checked')&&comp.length > 1){
                    fragment = $('<div class="col-subrow"><div class="card-title">SubRow</div></div>');
                }
                for(var i = 0; i<comp.length ; ++i){
                    buildComponent(comp[i],fragment);
                }
                $(this).append(fragment);
                $('[data-type="modal"]').hide();
            },body)).show();
        },
        trash:function(e){
            $(this).closest('[data-type]').remove();
        },
        closeModel:function(){
            var model=$(this).closest('[data-type]').hide();
        },
        selectComponent:function(e){
            var subrow = $('#subrow').prop('checked');
            buildSubRowItem(this,'.subrow-com-list')
        },
        createSubRow:function(){
            
        },
        subrowComponent:function(){
            $(this).remove();
        },
        addCompToPage:function(){
            var modal = $('[data-type="modal"]'),
                comps = [];

            modal.find('.subrow-com-list>span').each(function(){
                comps.push($(this).text());
            })
            if(0 == comps.length){
                return alert("请选择组件进行添加");
            }
            modal.triggerHandler('addComponent',comps);
        }
    }
    function ButtonHtml(icon,action){
        action = action||'';
        return  '<button class="prop-list-btn" data-action="'+action+'">' +
                    '<span class="oi" data-glyph="'+icon+'"></span>' +
                '</button>';
    }
    function buildSubRowItem(el,target){
        $('<span>',{
            text:$(el).text(),
            class:'subrow-com',
            "data-component":$(el).text(),
            "data-action":'subrowComponent'
        }).appendTo(target);
    }
    function buildComponent(text,target){
        var tpl = '<div class="component-com">' +
                        ButtonHtml('trash','trash') +
                        ButtonHtml('clipboard') +
                        '<h6>'+text+'</h6>' +
                    '</div>';
        $(target).append(tpl);
    }
    function initModal(){
        var modal = $('[data-type="modal"]');
        modal.find('.active').removeClass('active');
        modal.find(':checkbox').prop('checked',false);
        modal.find('.subrow-com-list').empty();
    }
}(jQuery)