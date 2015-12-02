/**
 * Created by xiaoqiang on 6/29/15.
 */

    /*
var instance = {};
instance.request = function(url, param, callback, jsonp)
{
    var p = "";
    for (var k in param) {
        p += k + '=' + param[k] + '&';
    }
    p = p.replace(/&$/, '');
    p = (url.indexOf('?') > -1)? '&' + p : '?' + p;

    url = url + p;

    $.ajax({
        url: url,
        dataType: 'jsonp',
        jsonp: (jsonp == undefined)? 'jsonpcallback' : jsonp,
        success: callback
    });
};
var config = {
    uid: 26
};
*/

/**
 * 对话框对象
 */
Dialog = function(text,btnText) {
    var callback = null;

    $('#dialog p').html(text);
    $('#dialog button').unbind().click(function() {
        if (btnText == undefined) {
            $('#cover').hide();
            $('#dialog').hide();
        }
        if (callback != null) {
            callback();
        }
    });

    $('#dialog button').text((btnText != undefined)? btnText : "确定");

    this.show = function(onConfirm) {
        callback = onConfirm;
        $('#cover').show();
        $('#dialog').show();
    }

    this.hide = function() {
        $('#cover').hide();
        $('#dialog').hide();
    }
};

Dialog.show = function(text, onConfirm, btnText) {
    var dialog = new Dialog(text, btnText);
    onConfirm = (onConfirm == undefined)? null : onConfirm;
    dialog.show(onConfirm);
    return dialog;
};


var BaseModel = Backbone.Model.extend({
    param: {},
    sync : function(method, model, options) {
        var p = "";
        for (var k in this.param) {
            p += k + '=' + this.param[k] + '&';
        }
        p = p.replace(/&$/, '');
        p = (this.url.indexOf('?') > -1)? '&' + p : '?' + p;

        this. url = this.url + p;
        var params = _.extend({
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'jsonpcallback',
            url: this.url,
            processData: false
        }, options);
        return $.ajax(params);
    },
    doDownload: function(pid, name) {
        var dir = '512', suffix = '.png';
        if (config.licence != null || config.code != null) {
            dir = 'psd';
            suffix = '.psd';
        } else {
            var left = cookie.get('left');
            if (left == null) {
                left = 15;
                dir = 'psd';
                suffix = '.psd';
            } else if (left > 0) {
                dir = 'psd';
                suffix = '.psd';
                left--;
            } else {
                var leftTip = cookie.get('LEFT_TIP');
                if (leftTip == null) {
                    Dialog.show('您的15次免费矢量图下载已经用完，将只能下载位图。<br/>如果需要矢量图，您可以考虑购买，仅50rmb');
                    cookie.set('LEFT_TIP', '1', 3600);
                }
            }
            cookie.set('left', left, 3600);
        }

        var url = "http://7xk1pj.com1.z0.glb.clouddn.com/"+ dir + '/' + pid + suffix;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.addEventListener("load", function(){
            if (xhr.status === 200) {
                var c = new Uint8Array(xhr.response);
                for (var d = c.length, e = Array(d); d--;) e[d] = String.fromCharCode(c[d]);
                c = e.join("");
                c = window.btoa(c);

                var file = instance.getLocalDir() + '/' + pid + suffix;
                var r = instance.writeFile(file, c, instance.cep.encoding.Base64);

                if (r.err == 0) {
                    console.log(name);
                    instance.evalScript('$._ext_PHXS.open("'+ file +'", "'+ name + '")', function() {
                        instance.deleteFile(file);
                    });
                } else {
                    instance.showToast("图片下载失败了，请联系Cut君");
                }
            }
        }, false);
        xhr.send();
    }
});


var baseUrl = 'http://www.cutterman.cn/getic';

var IconListModel = BaseModel.extend({
    defaults: function() {
        return {pid: 0, name: ''}
    },
    download: function() {
        var pid = this.get('pid'), name = this.get('name');
        this.doDownload(pid, name);
    }
});

var IconListCollection = Backbone.Collection.extend({
    model: IconListModel,
    url: baseUrl + '/random_v2',
    type: 'random',
    query: '',
    extraId: 0,
    sync: function(method, model, options) {
        var params = _.extend({
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'jsonpcallback',
            url: this.url,
            processData: false
        }, options);
        return $.ajax(params);
    },
    random: function(pn) {
        this.type = 'random';
        this.url = baseUrl + '/random_v2?pn=' + pn;
        this.fetch();
    },
    search: function(query, pn, some_id) {
        some_id = (some_id == undefined)? 0 : some_id;
        this.type = 'search';
        this.query = query;
        this.extraId = some_id;
        this.url = baseUrl + '/search_v2?pn=' + pn + '&query=' + query + '&extra_id=' + some_id;
        this.fetch({remove: false});
    },
    getPackageIcons: function(package_id) {
        this.type = 'package';
        this.url = baseUrl + '/package?pn=0&package_id='+package_id;
        this.fetch();
    },
    getFavoriteIcons: function(pn) {
        this.type = 'favorite';
        this.url = baseUrl + '/get_favorite?pn='+pn+'&uid='+config.uid+'&type=0';
        this.fetch();
    }
});

var IconListView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#search-item-template').html()),
    events: {
        "click a.download" : "download",
        "click a.detail" : "detail",
        "click .more"  : "more"
    },
    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.find('.thumb').unbind().mouseover(function() {
            $(this).find('a').show();
        }).mouseout(function() {
            $(this).find('a').hide();
        });
        return this;
    },
    download: function(evt) {
        evt.preventDefault();
        this.model.download();
    },
    detail: function(evt) {
        evt.preventDefault();
        $('html, body').animate({scrollTop:0}, 'fast');
        router.navigate('detail/' + this.model.get('pid'), {trigger: true, replace: true});
    },
    more: function(evt) {
        evt.preventDefault();
        if (router.current == 'search') {
            var last = searchView.iconList.pop();
            last.destroy();
            if (searchView.iconList.type == 'random') {
                last = searchView.iconList.at(searchView.iconList.length - 1);
                searchView.iconList.random(last.get('pid'));
            }
            if (searchView.iconList.type == 'search') {
                searchView.iconList.search(searchView.iconList.query, searchView.iconList.length, searchView.iconList.extraId);
            }
        } else if (router.current == 'favorite') {
            var last = favoriteView.iconList.pop();
            last.destroy();
            if (favoriteView.iconList.type == 'favorite') {
                favoriteView.iconList.getFavoriteIcons(favoriteView.iconList.length);
            }
        }
    }
});

var IconDetailModel = BaseModel.extend({
    defaults: function() {
        return {
            pid: 0,
            icon_favorite: 0,
            package_favorite: 0,
            category_name: "",
            category: 0,
            package_name: "",
            package: 0,
            description: ''
        }
    },
    url: baseUrl + '/info',
    getInfo: function(pid) {
        this.param['pid'] = pid;
        this.param['uid'] = config.uid;
        this.fetch();
    },
    download: function() {
        var pid = this.get('pid');
        var name = this.get('description');
        this.doDownload(pid, name);
    }
});

var IconFavoriteModel = BaseModel.extend({
    defaults: function() {
        return {
            action: 0,  // 1:add 0:delete
            uid: 0,
            fid: 0,
            type: 0
        }
    },
    url: baseUrl + '/add_favorite'
});

var IconDetailView = Backbone.View.extend({
    el: $('#detail-view'),
    model: new IconDetailModel(),
    favorite: null,
    collection: new IconListCollection(),
    initialize: function() {
        this.listenTo(this.model, 'change', function() {
            this.render();
            var package1 = this.model.get('package');
            if (package1 > 0) {
                this.collection.getPackageIcons(package1);
            }
        });
        this.listenTo(this.collection, 'add', this.renderList);
    },
    events: {
        "click .back"   : function() {
            console.log(router.current);
            router.navigate(router.current, {trigger: true, replace: true});
        },
        "click .category a"  : function() {
            this.search('category');
        },
        "click .package a"  : function() {
            this.search('package');
        },
        "click .download": function() {
            this.model.download();
        },
        "click .favorite": "favoriteIcon",
        "click .favorite-package": "favoritePackage"
    },
    render: function() {
        var pid = this.model.get('pid');
        $('#main-img').attr('src', 'http://7xk1pj.com1.z0.glb.clouddn.com/64/'+pid+'.png');
        this.$el.find('.description').text(this.model.get('description'));
        var category = this.model.get('category');
        if (category == 0 || category == null) {
            this.$el.find('.category').hide();
        } else {
            this.$el.find('.category').show().find('a').text(this.model.get('category_name'));
        }
        var package1 = this.model.get('package');
        if (package1 == 0 || package1 == null) {
            this.$el.find('.package').hide();
            $('#package-items').hide();
        } else {
            this.$el.find('.package').show().find('a').text(this.model.get('package_name'));
            $('#package-items').show();
        }
        var iconFavorited = this.model.get('icon_favorite');
        this.$el.find('.favorite').text( (iconFavorited == 0)? '收藏' : '取消收藏');
        var packageFaforited = this.model.get('package_favorite');
        this.$el.find('.favorite-package').text( (packageFaforited == 0)? '收藏此系列' : '取消收藏系列');
    },
    renderList: function(item) {
        var view = new IconListView({model: item});
        this.$("#package-items ul").append(view.render().el);
    },
    search: function(type) {
        $('#search-input').val(type + ":" + this.model.get(type+'_name'));
        searchView.iconList.reset();
        searchView.iconList.search(type+':' + this.model.get(type+'_name'), 0, this.model.get(type));
        router.navigate('search', {trigger: true, replace: true});
    },
    favoriteIcon : function() {
        if (!config.isAuth()) {
            instance.showToast('未授权用户无法添加收藏');
            return;
        }
        var fid = this.model.get('pid');
        var favorited = this.model.get('icon_favorite');
        this.favorite.param = {};
        this.favorite.param['uid'] = config.uid;
        this.favorite.param['type'] = 0;
        this.favorite.param['fid'] = fid;
        if (favorited == 0) {
            this.favorite.ur = baseUrl + '/add_favorite';
        } else {
            this.favorite.url = baseUrl + '/cancel_favorite';
        }
        this.favorite.save();
    },
    favoritePackage: function() {
        if (!config.isAuth()) {
            instance.showToast('未授权用户无法添加收藏');
            return;
        }
        var fid = this.model.get('package');
        var favorited = this.model.get('package_favorite');
        this.favorite.param = {};
        this.favorite.param['uid'] = config.uid;
        this.favorite.param['type'] = 1;
        this.favorite.param['fid'] = fid;
        if (favorited == 0) {
            this.favorite.ur = baseUrl + '/add_favorite';
        } else {
            this.favorite.url = baseUrl + '/cancel_favorite';
        }
        this.favorite.save();
    },
    favoriteCallback: function() {
        var val = this.favorite.get('action');
        console.log('favorite callback: ' + val);
        var fid = this.favorite.get('fid');
        var type = this.favorite.get('type');
        if (fid > 0) {
            if (type == 0) { this.model.set('icon_favorite', val); }
            if (type == 1) { this.model.set('package_favorite', val); }
            this.render();
        }
        instance.showToast((val == 0)? '取消收藏成功' : '收藏成功');
    },
    show: function(pid) {
        if (this.model.get('pid') != pid) {
            this.model.getInfo(pid);
            this.favorite = new IconFavoriteModel();
            this.listenTo(this.favorite, 'change', this.favoriteCallback);
        }
    }
});


var SearchView = Backbone.View.extend({
    el: $('#main-panel'),
    iconList: new IconListCollection(),
    initialize: function() {
        this.listenTo(this.iconList, 'add', this.addOne);
        this.listenTo(this.iconList, 'sync', function() {
            if (this.iconList.length > 0) {
                this.iconList.add({pid: -1});  // 更多
                $('#no-result').hide();
            } else {
                $('#no-result').show();
            }
        });
        this.listenTo(this.iconList, 'reset', this.reset);
        this.toggleLoading(true);
        this.iconList.random(0);

        var thiz = this;
        $('#search-input').bind('keypress', function(evt){
            var input = $(this);
            if (evt.keyCode == '13') {
                thiz.iconList.reset();
                var query = $(this).val().trim();
                if (query != '') {
                    thiz.toggleLoading(true);
                    if(/.*[\u4e00-\u9fa5]+.*$/.test(query)) {   // 翻译中文
                        thiz.translate(query, function(translated){
                            $(input).val(translated);
                            thiz.iconList.search(translated, 0);
                        })
                    } else {
                        thiz.iconList.search(query, 0);
                    }
                } else {
                    thiz.iconList.random(0);
                }
            }
        });
    },
    addOne: function(item) {
        this.toggleLoading(false);
        var view = new IconListView({model: item});
        this.$("#items ul").append(view.render().el);
    },
    toggleLoading: function(show) {
        var ele = $("#loading");
        if (show) {
            ele.show()
        } else {
            ele.hide()
        }
    },
    reset: function() {
        this.$("#items ul").html('');
    },
    translate: function(query, callback) {
        instance.request('http://fanyi.youdao.com/openapi.do', {keyfrom: "Cutterman", key: 198987323, type: "data", doctype: "jsonp", version: 1.1, q: encodeURIComponent(query)}, function(result) {
            console.log(result.translation);
            var translated = query;
            if (result.errorCode == 0 && result.translation.length > 0) {
                translated = result.translation[0];
                translated = translated.replace(/the/i, '').replace(/^A /, '');
            }
            callback(translated);
        }, 'callback');
    }
});


var FavoriteIconView = Backbone.View.extend({
    el: $('#favorite-view'),
    iconList: new IconListCollection(),
    template: _.template($('#search-item-template').html()),
    initialize: function() {
        this.listenTo(this.iconList, 'add', this.renderList);
        this.listenTo(this.iconList, 'reset', this.reset);
        this.listenTo(this.iconList, 'sync', function() {
            if (this.iconList.length >= 30) {
                this.iconList.add({pid: -1});  // 更多
            }
            if (this.iconList.length == 0){
                this.toggleLoading(false);
                this.$el.find('.empty').show();
            }
        });
        this.$el.find('.packages').hide();
    },
    renderList: function(item) {
        this.toggleLoading(false);
        var view = new IconListView({model: item});
        item.more = this.more;
        this.$el.find(".items ul").append(view.render().el);
    },
    reset: function() {
        this.$el.find(".items ul").html('');
    },
    toggleLoading: function(show) {
        var ele = $("#loading");
        if (show) {
            ele.show()
        } else {
            ele.hide()
        }
        this.$el.find('.empty').hide();
    },
    load: function() {
        if (config.isAuth()) {
            this.iconList.reset();
            this.toggleLoading(true);
            this.iconList.getFavoriteIcons(0);
        } else {
            this.$el.find('.empty').show().text('未授权用户没有提供收藏功能');
        }
    },
    more: function() {
        this.iconList.getFavoriteIcons(this.iconList.length);
    }

});


var FavoritePackageModel = Backbone.Model.extend({
    defaults: function() {
        return {
            pid: 0,
            package_id: 0,
            title: '',
            count: 0
        }
    }
});

var FavoritePackageCollection = Backbone.Collection.extend({
    model: FavoritePackageModel,
    url: '',
    sync: function(method, model, options) {
        var params = _.extend({
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'jsonpcallback',
            url: this.url,
            processData: false
        }, options);
        return $.ajax(params);
    },
    load: function(pn) {
        this.url = baseUrl + '/get_favorite?pn='+pn+'&uid='+config.uid+'&type=1';
        this.fetch();
    }
});

var FavoritePackageItemView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#package-list').html()),
    events: {
        'click .more': 'more',
        'click .package': 'package'
    },
    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    more: function() {
        var v = favoriteView.packageView;
        var last = v.collection.pop();
        last.destroy();
        v.collection.load(this.collection.length);
    },
    package: function() {
        $('html, body').animate({scrollTop:0}, 'fast');
        $('#search-input').val("package:" + this.model.get('title'));
        searchView.iconList.reset();
        searchView.iconList.search('package:' + this.model.get('title'), 0, this.model.get('package_id'));
        router.navigate('search', {trigger: true, replace: true});
    }
});

var FavoritePackageView = Backbone.View.extend({
    el: $('#favorite-view'),
    collection: new FavoritePackageCollection(),
    initialize: function() {
        this.listenTo(this.collection, 'add', this.renderList);
        this.listenTo(this.collection, 'reset', this.reset);
        this.listenTo(this.collection, 'sync', function() {
            if (this.collection.length >= 30) {
                this.collection.add({package_id: -1, title: '', count: 0});  // 更多
            }
            if (this.collection.length == 0) {
                this.toggleLoading(false);
                this.$el.find('.empty').show();
            }
        });
        this.listenTo(this.collection, 'remove', function() {
            this.$el.find('.packages .more').remove();
        });
        this.$el.find('.packages').show();
        this.$el.find('.items').hide();
    },
    renderList: function(item) {
        this.toggleLoading(false);
        var view = new FavoritePackageItemView({model: item});
        item.more = this.more;
        this.$(".packages ul").append(view.render().el);
    },
    reset: function() {
        this.$(".packages ul").html('');
    },
    toggleLoading: function(show) {
        var ele = $("#loading");
        if (show) {
            ele.show()
        } else {
            ele.hide()
        }
        this.$el.find('.empty').hide();
    },

    load: function() {
        if (config.isAuth()) {
            this.collection.reset();
            this.toggleLoading(true);
            this.collection.load(0);
        } else {
            this.$el.find('.empty').show().text('未授权用户没有提供收藏功能');
        }
    }
});


var FavoriteView = Backbone.View.extend({
    el: $('#favorite-view'),
    iconView: new FavoriteIconView(),
    packageView: new FavoritePackageView(),
    events: {
        'click .f-icon': 'icon',
        'click .f-package' : 'package'
    },
    initialize: function() {
        this.$el.find('.package').hide();
    },
    icon: function() {
        this.$el.find('.tabs li').removeClass('active').eq(0).addClass('active');
        this.$el.find('.items').show();
        this.$el.find('.packages').hide();
        this.iconView.load();
    },
    package: function() {
        this.$el.find('.tabs li').removeClass('active').eq(1).addClass('active');
        this.$el.find('.items').hide();
        this.$el.find('.packages').show();
        this.packageView.load();
    },
    show: function() {
        this.icon();
    }
});


var UserView = Backbone.View.extend({
    el: $('#user-view'),
    initialize: function() {
        $('#account').text(config.email);
        $('#current-version').text('当前版本: ' + config.version);
        if (config.code != null) {
            $('#licence').html('已通过授权码成功授权');
            if (config.email == 'account@demo.com') {
                $('#logout-btn').hide();
                $('#buy').text('绑定帐号').click(function() {
                    instance.openURL('http://www.cutterman.cn/auth/bind?code='+config.code);
                });
            } else {
                $('.buy').hide();
            }
        } else {
            if (config.licence == null) {   // 没有授权
                $('#licence').text('未购买授权');
                $('#buy').click(function() {
                    instance.openURL('http://www.cutterman.cn/v2/buy?app=nicon');
                });
            } else {
                $('#licence').text('已授权，终生使用');
                $('.buy').hide();
            }
        }

        $('#logout-btn').click(function() {
            var settingFile = instance.getLocalDir() + '/setting.json';
            instance.deleteFile(settingFile);
            user.logout();
        });
    }

});


var AppRouter = Backbone.Router.extend({
    current: '',
    routes: {
        'search': 'search',
        'favorite' : 'favorite',
        'detail/:pid' : 'iconDetail',
        'me': 'me'
    },
    search: function() {
        this.current = 'search';
        console.log('search view');
        $('#main-panel .tab a').removeClass('active').eq(0).addClass('active');
        $('#search-view').show();
        $('#detail-view').hide();
        $('#favorite-view').hide();
        $('#user-view').hide();
        if (searchView == null) {
            searchView = new SearchView();
        }
    },
    favorite: function() {
        this.current = 'favorite';
        console.log('favorite view');
        $('#search-view').hide();
        $('#detail-view').hide();
        $('#favorite-view').show();
        $('#user-view').hide();
        $('#main-panel .tab a').removeClass('active').eq(1).addClass('active');
        if (favoriteView == null) {
            favoriteView = new FavoriteView();
        }
        favoriteView.show();
    },
    iconDetail: function(pid) {
        //this.current = 'detail/' + pid;
        console.log('icon detail view: ' + pid);
        $('#search-view').hide();
        $('#detail-view').show();
        $('#favorite-view').hide();
        $('#user-view').hide();
        if (iconDetailView == null) {
            iconDetailView = new IconDetailView();
        }
        iconDetailView.show(pid);
    },
    me: function() {
        $('#main-panel .tab a').removeClass('active').eq(2).addClass('active');
        $('#search-view').hide();
        $('#detail-view').hide();
        $('#favorite-view').hide();
        $('#loading').hide();
        $('#user-view').show();

        if (userView == null) {
            userView = new UserView();
        }
    }
});

var searchView, iconDetailView, favoriteView, userView;

var router = new AppRouter();
Backbone.history.start();
router.navigate('search', {trigger: true, replace: true});



