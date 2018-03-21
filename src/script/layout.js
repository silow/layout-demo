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
                                '<h4>行</h4>' +
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
                                '<h5>列 1</h5>' +
                            '</div>' +
                            '<div class="col-body">'+
                            '</div></div>';
            t.append(tpl);
        },
        addComponent:function(e){
            $('[data-type="modal"]').one('addComponent',$.proxy(function(e){
                console.log(this);
            },this)).show();
            },
        addSubRow:function(e){

        },
        trash:function(e){
            $(this).closest('[data-type]').remove();
        },
        closeModel:function(){
            var model=$(this).closest('[data-type]').hide();
        },
        selectComponent:function(e){
            var subrow = $('#subrow').prop('checked');
            if(subrow){
                $('<span>',{text:$(this).text()}).appendTo('.subrow-com-list');
            }else{
                $(this).addClass('active').siblings().removeClass('active');
            }
        },
        createSubRow:function(){
            $(this).closest('fieldset').toggleClass('createRow').find('.subrow-com-list').toggle();
        }
    }
    function ButtonHtml(icon,action){
        action = action||'';
        return  '<button class="prop-list-btn" data-action="'+action+'">' +
                    '<span class="oi" data-glyph="'+icon+'"></span>' +
                '</button>';
    }
}(jQuery)