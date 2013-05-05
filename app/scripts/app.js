/*global Ember */

(function (window) {

    var user = 'mads';
    var pass = 'swimmer';
    var loggedIn = false;

    var App = window.App = Ember.Application.create();

    App.Store = DS.Store.extend({
        revision: 12,
        adapter: 'App.mongolabAdapter'
    });

    App.mongolabAdapter = DS.RESTAdapter.extend({
        buildURL: function (record, suffix) {
            var url = [this.url];

            Ember.assert("Namespace URL (" + this.namespace + ") must not start with slash", !this.namespace || this.namespace.toString().charAt(0) !== "/");
            Ember.assert("Record URL (" + record + ") must not start with slash", !record || record.toString().charAt(0) !== "/");
            Ember.assert("URL suffix (" + suffix + ") must not start with slash", !suffix || suffix.toString().charAt(0) !== "/");

            if (!Ember.isNone(this.namespace)) {
              url.push(this.namespace);
            }

            url.push(this.pluralize(record));
            if (suffix !== undefined) {
              url.push(suffix);
            }

            return url.join("/") + '?apiKey=n_Dyj2qOmOcCaATI9zUlWDZpXFY8eaZO';
        },
        serializer: DS.RESTSerializer.extend({
            extractMany: function(loader, json, type, records) {
                
                var root = this.rootForType(type);
                var roots = this.pluralize(root);

                //custom transform returned api data
                var data = [];
                var i;
                for (i in json) {
                    if (json.hasOwnProperty(i)) {
                        json[i][root].id = json[i]._id.$oid;
                        data.push(json[i][root]);
                    }
                }
                json = {};
                json[root] = data;
                console.log(json);
                //////////////////////////////

                formattedJson = {};
                formattedJson[roots] = json.entries;
                delete formattedJson.pagination;
                this._super(loader, formattedJson, type, records);
            },
            extract: function (loader, json, type, record) {

                var root = this.rootForType(type);
                
                //custom transform returned api data
                json[root].id = json._id.$oid;
                var jsonFixed = {};
                jsonFixed[root] = json[root];
                json = jsonFixed;
                //////////////////////////////

                this.sideload(loader, type, json, root);
                this.extractMeta(loader, type, json);

                if (json[root]) {
                    if (record) { loader.updateId(record, json[root]); }
                    this.extractRecordRepresentation(loader, type, json[root]);
                }
            }
        })
    });

    App.mongolabAdapter.reopen({
        'url': 'https://api.mongolab.com',
        'namespace': 'api/1/databases/sadhuswimlane/collections'
    });


    App.LoginController = Ember.Controller.extend({
        
        //bound properties
        'username': '',
        'password': '',
        'errorMessage': '',

        //triggered when the user clicks the login button
        'login': function () {
            if (this.get('username') === user && this.get('password') === pass) {
                loggedIn = true;
                this.transitionToRoute('index');
            } else {
                this.set('errorMessage', 'Incorrect username or password');
            }
        }

    });

    App.Router.map(function () {
        this.route('login');
    });

    App.IndexRoute = Ember.Route.extend({
        redirect: function() {
            if (loggedIn === false) {
               //this.transitionTo('login');
            }
        }
    });

    App.Swim = DS.Model.extend({
        'length': DS.attr('string'),
        'time': DS.attr('string'),
        'date': DS.attr('date')
    });

    App.IndexController = Ember.Controller.extend({
        
        //bound properties
        'lengthSwum': '',
        'timeTaken': '',
        'swimDate': '',
        'message': '',
        'messageClass': 'text-error',

        //triggered when the user clicks the login button
        logSwim: function () {
            //perform validation here
            if (false) {
                this.set('message', 'please try again');
            } else {

                //create swim to persist to server
                var swim = App.Swim.createRecord({
                    length: this.get('lengthSwum'),
                    time: this.get('timeTaken'),
                    date: moment(this.get('swimDate'), "YYYY-MM-DD").toDate()
                });

                //persist
                swim.get('transaction').commit();

                //clear the form fields
                this.set('lengthSwum', '');
                this.set('timeTaken', '');
                this.set('swimDate', '');

                //provide a message to say that the record was saved
                this.set('messageClass', 'text-success');
                this.set('message', 'saved...');

                var self = this;
                setTimeout(function(){
                    self.set('message', '');
                }, 5000);


            }
        },

        day: function() {
            if (this.get('swimDate') !== '') {
                return moment(this.get('swimDate')).format('Do');
            }
        }
        .property('swimDate'),

        month: function() {
            if (this.get('swimDate') !== '') {
                return moment(this.get('swimDate')).format('MMMM');
            }
        }
        .property('swimDate'),

        year: function() {
            if (this.get('swimDate') !== '') {
                return moment(this.get('swimDate')).format('YYYY');
            }
        }
        .property('swimDate')


    });

})(this);
