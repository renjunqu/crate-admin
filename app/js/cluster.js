define(['jquery',
        'underscore',
        'backbone',
        'base',
        'SQL',
        'text!views/cluster.html',
        'text!views/nodelistitem.html',
        'text!views/nodeinfo.html',
        'bootstrap',
    ], function ($, _, Backbone, base, SQL, ClusterTemplate, NodeListItemTemplate, NodeInfoTemplate) {

    var Cluster = {};

    Cluster.Node = Backbone.Model.extend({

        health: function () {
            return _.max([this.get('fs').used_percent, this.get('mem').used_percent]);
        },

        httpLink: function () {
            return 'http://' + this.get('hostname') + ':' + this.get('port').http;
        }

    });

    Cluster.Cluster = Backbone.Collection.extend({

        model: Cluster.Node,

        fetch: function () {
            var self = this,
                sqInfo, sqShardInfo, dInfo, dShardInfo, d;

            d = $.Deferred();
            sqNodes = new SQL.Query('select id, name, hostname, port, load, mem, fs from sys.nodes');
            dNodes = sqNodes.execute();

            dNodes.done(function (res) {
                var nodes = _.map(res.rows, function (row) {
                    return _.object(['id', 'name', 'hostname', 'port', 'load', 'mem', 'fs'], row);
                });
                self.reset(nodes);
            });

            return d.promise();
        }

    });

    Cluster.ClusterView = base.CrateView.extend({

        initialize: function () {
            this.listenTo(this.collection, 'reset', this.render);
        },

        template: _.template(ClusterTemplate),

        render: function () {
            var self = this;

            this.$el.html(this.template());
            _.each(this.collection.models, function (node) {
                var v = new Cluster.NodeListItemView({model: node});
                self.$('ul').append(v.render().$el);
                self.addView(node.get('name'), v);
            });
            return this;
        }
    });

    Cluster.NodeListItemView = base.CrateView.extend({

        tagName: 'li',

        template: _.template(NodeListItemTemplate),

        events: {
            'click ': 'selectNode'
        },

        selectNode: function (ev) {},

        healthLabel: function () {
            var health = this.model.health();
            if (health>98) {
                return 'clusterstatus-critical';
            } else if (health>90) {
                return 'clusterstatus-warning';
            }
            return 'clusterstatus-good';
        },

        render: function () {
            var data = this.model.toJSON();
            data.httpLink = this.model.httpLink();
            data.healthLabel = this.healthLabel();
            this.$el.html(this.template(data));
            return this;
        }
    });

    Cluster.NodeInfoView = base.CrateView.extend({

        template: _.template(NodeInfoTemplate),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }

    });

    return Cluster;
});