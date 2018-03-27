+function ($) {
    const PAGE = {
        rowIndex: 1,
        rows: []
    },
        PANEL = $('.page-panel'),
        VIEW = $('.view-content .body');

    $(document).on('click', '[data-action]', function (e) {
        var key = $(this).data('action');
        Method[key] && Method[key].call(this, e);
    });
    var Method = {
        addRow: function (e) {
            var id = PAGE.rowIndex;
            PAGE.rowIndex += 1;
            var tpl = '<div class="component-row" data-type="row" data-row=' + id + '>' +
                '<div class="row-head">' +
                ButtonHtml('trash', 'trash') +
                ButtonHtml('clipboard') +
                ButtonHtml('plus', 'addColumn') +
                '<h4>Row</h4>' +
                '</div>' +
                '<div class="row-body">' +
                '</div></div>';
            PANEL.append(tpl);
            ComponentBuild.base.row(id);
            PAGE.rows.push({
                rowID: id,
                id: 'r' + id,
                colIndex: 1,
                columns: []
            });
        },
        addColumn: function (e) {
            let row = $(this).closest('.component-row'),
                t = row.find('.row-body'),
                rowID = row.data('row'),
                viewRow = VIEW.find('[data-row=' + rowID + ']')[0],
                colID = 1,
                tpl = null;
            PAGE.rows.filter(obj => {
                if (obj.rowID == rowID) {
                    obj.columns.push({
                        colID: obj.colIndex,
                        id: 'r' + rowID + 'c' + obj.colIndex,
                        componentIndex: 1,
                        components: []
                    });
                    colID = obj.colIndex;
                    obj.colIndex += 1;
                }
            })
            tpl = '<div class="component-col" data-type="column" data-col=' + colID + '>' +
                '<div class="col-head">' +
                ButtonHtml('trash', 'trash') +
                ButtonHtml('clipboard') +
                ButtonHtml('puzzle-piece', 'addComponent') +
                '<h5>Column</h5>' +
                '</div>' +
                '<div class="col-body">' +
                '</div></div>';
            t.append(tpl);
            ComponentBuild.base.column.call(viewRow, colID);

        },
        addComponent: function (e) {
            initModal();
            let body = $(this).closest('[data-type]').find('.col-body')[0],
                rowID = $(this).closest('[data-type=row]').data('row'),
                colID = $(this).closest('[data-type=column]').data('col'),
                column = $('#r' + rowID + 'c' + colID),
                id,tpl;
            $('[data-type="modal"]').one('addComponent', $.proxy(function (e) {
                let comp = Array.prototype.slice.call(arguments, 1),
                    fragment = document.createDocumentFragment();
                    tpl=document.createDocumentFragment();
                if ($('#subrow').prop('checked') && comp.length > 1) {
                    fragment = $('<div class="col-subrow" data-type="subrow"></div>');
                    tpl = $('<div class="subrow"></div>')
                }
                for (let i = 0; i < comp.length; ++i) {
                    id = buildComponent(comp[i], fragment, rowID, colID);
                    $(tpl).append(ComponentBuild.components[comp[i]]('r' + rowID + 'c' + colID +'x'+id));
                }
                column.append(tpl);
                $(this).append(fragment);
                $('[data-type="modal"]').hide();
            }, body)).show();
        },
        trash: function (e) {
            let isSubRow = $(this).closest('[data-type="subrow"]').length == 1,
                comp = $(this).closest('[data-type]'),
                type = comp.data('type'),
                rowID = null,
                colID = null,
                row = null,
                col = null;
            switch (type) {
                case 'row':
                    rowID = comp.data('row');
                    VIEW.find('[data-row=' + rowID + ']').remove();
                    for (let i = 0; i < PAGE.rows.length; ++i) {
                        PAGE.rows[i].rowID == rowID && PAGE.rows.splice(i, 1);
                    }
                    break;
                case 'column':
                    rowID = comp.closest('[data-type=row]').data('row');
                    row = VIEW.find('[data-row=' + rowID + ']');
                    colID = comp.data('col');
                    row.find('[data-col=' + colID + ']').remove();
                    for (let x = 0; x < PAGE.rows.length; ++x) {
                        if (PAGE.rows[x].rowID == rowID) {
                            row = PAGE.rows[x];
                            for (let y = 0; y < row.columns.length; ++y) {
                                if (row.columns[y].colID == colID) {
                                    row.columns.splice(y, 1);
                                }
                            }
                        }
                    }
                    break;
                case 'component':
                    rowID = comp.closest('[data-type=row]').data('row');
                    colID = comp.closest('[data-type=column]').data('col');
                    let id = comp.data('component');
                    for (let x = 0; x < PAGE.rows.length; ++x) {
                        row = PAGE.rows[x];
                        if (row.rowID == rowID) {
                            for (let y = 0; y < row.columns.length; ++y) {
                                col = row.columns[y]
                                if (col.colID == colID) {
                                    for (let i = 0; i < col.components.length; ++i) {
                                        if (col.components[i].comID == id) {
                                            col.components.splice(i, 1);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    let com =$('#r'+rowID+'c'+colID+'x'+id);
                    if(com.parent().hasClass('subrow')&&com.siblings().length==1){
                        com.unwrap();
                    }
                    com.remove();
                    break;
            }
            if (isSubRow && comp.siblings().length == 1) {
                comp.unwrap();
            }
            comp.remove();
        },
        closeModel: function () {
            $(this).closest('[data-type]').hide();
        },
        selectComponent: function (e) {
            var subrow = $('#subrow').prop('checked');
            buildSubRowItem(this, '.subrow-com-list')
        },
        createSubRow: function () {

        },
        subrowComponent: function () {
            $(this).remove();
        },
        addCompToPage: function () {
            var modal = $('[data-type="modal"]'),
                comps = [];

            modal.find('.subrow-com-list>span').each(function () {
                comps.push($(this).text());
            })
            if (0 == comps.length) {
                return alert("请选择组件进行添加");
            }
            modal.triggerHandler('addComponent', comps);
        }
    }

    var ComponentBuild = {
        base: {
            row: function (id) {
                VIEW.append('<div class="row" data-row=' + id + ' id="r' + id + '">');
            },
            column: function (id) {
                $(this).append('<div class="col" data-col=' + id + ' id="r' + $(this).data('row') + 'c' + id + '">');
            },
            subrow: function () {
                $(this).append('<div class="col-subrow">');
            }
        },
        components: {
            Heading: function (id) {
                return '<div id="' + id + '" class="heading" data-type="component" data-com="Heading">' +
                    '<h1>Welcome to My Page</h1>' +
                    '<small class="subtitle">enjoy an easy life</small>' +
                    '</div>'
            },
            List: function (id) {
                return '<div id="' + id + '" class="list" data-type="component" data-com="List">' +
                            '<ul class="list-items">'+
                                '<li class="item">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</li>'+
                                '<li class="item">consectetur adipisicing elit. Hic qui, voluptas! </li>'+
                                '<li class="item">Soluta perspiciatis esse veniam!</li>'+
                                '<li class="item">rerum nihil quis ullam incidunt adipisci accusamus natus.</li>'+
                            '</ul>'+
                        '</div>'
            },
            Footer: function (id) {
                return '<div id="' + id + '" class="footer" data-type="component" data-com="Footer">'+
                            '<p class="copyright">Copyright © 2013-2018 GG</p>'
                        '</div>'
            },
            Banner: function (id) {
                return '<div id="' + id + '" class="banner" data-type="component" data-com="Banner"></div>'
            },
            Image: function (id) {
                return '<div id="'+id+'" class="image" data-type="component" data-com="Image">'+
                            '<img src="./images/image.png">'+
                            '<h3>Solgan</h3>'+
                        '</div>';
            },
            Nav: function (id) {
                return '<div id="' + id + '" class="nav" data-type="component" data-com="Nav"><div class="logo">Layout</div></div>'
            }
        }
    }

    function ButtonHtml(icon, action) {
        action = action || '';
        return '<button class="prop-list-btn" data-action="' + action + '">' +
            '<span class="oi" data-glyph="' + icon + '"></span>' +
            '</button>';
    }
    function buildSubRowItem(el, target) {
        $('<span>', {
            text: $(el).text(),
            class: 'subrow-com',
            "data-component": $(el).text(),
            "data-action": 'subrowComponent'
        }).appendTo(target);
    }
    function buildComponent(text, target, rowID, colID) {
        let tpl, id;
        PAGE.rows.filter(obj => {
            if (obj.rowID == rowID) {
                obj.columns.filter(col => {
                    col.components.push({
                        comID: col.componentIndex,
                        name: text
                    });
                    id = col.componentIndex++;
                })
            }
        })
        tpl = '<div class="component-com" data-type="component" data-component =' + id + '>' +
            ButtonHtml('trash', 'trash') +
            ButtonHtml('clipboard') +
            '<h6>' + text + '</h6>' +
            '</div>';
        $(target).append(tpl);
        return id;
    }
    function initModal() {
        var modal = $('[data-type="modal"]');
        modal.find('.active').removeClass('active');
        modal.find(':checkbox').prop('checked', false);
        modal.find('.subrow-com-list').empty();
    }
    window.PAGE = PAGE;
}(jQuery)