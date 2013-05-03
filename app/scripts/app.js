/*global Ember */

(function (window) {

    var user = 'mads';
    var pass = 'swimmer';
    var loggedIn = false;

    var App = window.App = Ember.Application.create();

    App.Store = DS.Store.extend({
        revision: 12
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
        length: DS.attr('string'),
        time: DS.attr('string'),
        date: DS.attr('date')
    });

    App.IndexController = Ember.Controller.extend({
        
        //bound properties
        'lengthSwum': '',
        'timeTaken': '',
        'swimDate': '',
        'message': '',
        'messageClass': 'text-error',

        //triggered when the user clicks the login button
        'logSwim': function () {
            //perform validation here
            if (false) {
                this.set('message', 'please try again');
            } else {

                //persist swim to server
                var swim = App.Swim.createRecord({
                    length: this.get('lengthSwum'),
                    time: this.get('timeTaken'),
                    date: this.get('swimDate')
                });

                swim.on('isSaving', function () {
                    //update gui to show that swim was saved
                    this.set('messageClass', 'text-success');
                    this.set('message', 'saving...');
                });                

                swim.on('isValid', function () {
                    //update gui to show that swim was saved
                    this.set('messageClass', 'text-success');
                    this.set('message', 'swim saved!');
                });

                swim.on('isError', function () {
                    this.set('messageClass', 'text-error');
                    this.set('message', 'oops! something went wrong, please try again.');
                });

                swim.get('transaction').commit();

                // swim.save();
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
