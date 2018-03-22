+function($){
    var panel=$('.page-panel'),
        row=1,
        view = $('.view-content .body'),
        PAGE = {
            rowID:1,
            rows:[]
        }
    $(document).on('click','[data-action]',function(e){
        var key = $(this).data('action');
        Method[key]&& Method[key].call(this,e);
    });
    var Method ={
        addRow:function(e){
            var id = PAGE.rowID;
            PAGE.rowID+=1;
            var tpl =   '<div class="component-row" data-type="row" data-row='+id+'>' +
                            '<div class="row-head">' +
                                ButtonHtml('trash','trash') +
                                ButtonHtml('clipboard') +
                                ButtonHtml('plus','addColumn') +
                                '<h4>Row</h4>' +
                            '</div>' +
                            '<div class="row-body">'+
                            '</div></div>';
            panel.append(tpl);
            ComponentBuild.base.row(id);
            PAGE.rows.push({
                colID:1,
                columns:[]
            });
        },
        addColumn:function(e){
            var row = $(this).closest('.component-row'),
                t = row.find('.row-body'),
                id = row.data('row'),
                viewRow = view.find('[data-row='+id+']')[0],
                colID = PAGE.rows[id-1].colID;
                PAGE.rows[id-1].colID+=1;

            var tpl=    '<div class="component-col" data-type="column" data-col='+colID+'>' +
                            '<div class="col-head">' +
                                ButtonHtml('trash','trash') +
                                ButtonHtml('clipboard') +
                                ButtonHtml('puzzle-piece','addComponent') +
                                '<h5>Column</h5>' +
                            '</div>' +
                            '<div class="col-body">'+
                            '</div></div>';
            t.append(tpl);
            ComponentBuild.base.column.call(viewRow,colID);
        },
        addComponent:function(e){
            initModal();
            var body=$(this).closest('[data-type]').find('.col-body')[0];
            $('[data-type="modal"]').one('addComponent',$.proxy(function(e){
                var comp =Array.prototype.slice.call(arguments,1),
                    fragment = document.createDocumentFragment();
                if($('#subrow').prop('checked')&&comp.length > 1){
                    fragment = $('<div class="col-subrow" data-type="subrow"></div>');
                }
                for(var i = 0; i<comp.length ; ++i){
                    buildComponent(comp[i],fragment);
                }
                $(this).append(fragment);
                $('[data-type="modal"]').hide();
            },body)).show();
        },
        trash:function(e){
            var isSubRow = $(this).closest('[data-type="subrow"]').length == 1,
                comp = $(this).closest('[data-type]'),
                type = comp.data('type'),
                id = null,
                row = null;
            switch(type){
                case 'row':
                    id = comp.data(type);
                    view.find('[data-row='+id+']').remove();
                    break;
                case 'column':
                    id = comp.closest('[data-type=row]').data('row');
                    row = view.find('[data-row='+id+']');
                    id = comp.data('col');
                    row.find('[data-col='+id+']').remove();
                    break;
            }
            if(isSubRow&&comp.siblings().length==1){
                comp.unwrap();
            }
            comp.remove();
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

    var ComponentBuild = {
        base:{
            row:function(id){
                view.append('<div class="row" data-row='+id+'>');
            },
            column:function(id){
                $(this).append('<div class="col" data-col='+id+'>');
            },
            subrow:function(){
                
            }
        },
        components:{
            Heading:function(){
            },
            List:function(){
    
            },
            Grid:function(){
    
            },
            Banner:function(){
    
            },
            Image:function(){
    
            }
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
        var tpl = '<div class="component-com" data-type="component">' +
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