/*global Ember */

(function (window) {

    var App = window.App = Ember.Application.create({
        Router: Ember.Router.extend({
            transitionToIndex: function () {
                this.transitionTo('index')
            }
        })
    });
    //block the app from doing anything until a logged in
    //check has been made
    App.deferReadiness();

    var loggedIn = false;

    function loginCallback(error, user) {
        
        //allow the app to initialize
        App.advanceReadiness();

        if (!error && user) {
            loggedIn = true;

            //annoying hack, refreshes the browser url, now that
            //we have been through auth, loggedIn will be true
            window.location = '/#/';
        }
        
    }

    var dataSource = new Firebase('https://swimlane.firebaseIO.com/swims');

    var authClient = new FirebaseAuthClient(dataSource, loginCallback);

    App.LoginController = Ember.Controller.extend({

        //triggered when the user clicks the login button
        'login': function () {

            authClient.login('facebook');

        }

    });

    App.Router.map(function () {
        this.route('login');
    });

    App.IndexRoute = Ember.Route.extend({
        redirect: function() {
            if (loggedIn === false) { 
                this.transitionTo('login');
            }
        }
    });

    App.Swim = Ember.Object.extend({});

    App.IndexController = Ember.Controller.extend({
        
        //bound properties
        'lengthSwum': '',
        'timeTaken': '',
        'swimDate': '',
        'message': '',
        'messageClass': 'text-error',

        swims: [],

        init: function() {
            // console.log(App.Store.findAll(App.Swim));
            // console.log(App.Swim.find());
            var self = this;

            dataSource.once('value', function(snapshot) {
                var arr = [];
                snapshot.forEach(function (child) {
                    arr.push(App.Swim.create(child.val()));
                });
                // self.set('swims', Ember.A(_.toArray(snapshot.val())));
                self.set('swims', arr);

            });
            
        },

        //triggered when the user clicks the login button
        logSwim: function () {

            //perform validation here
            var validated = true;

            if (this.get('lengthSwum') < 1) {
                validated = false;
            }

            if (this.get('timeTaken') < 1) {
                validated = false;
            }

            if (typeof this.get('timeTaken') === 'number' && n % 1 == 0) {
                validated = false;
            }

            if (typeof this.get('lengthSwum') === 'number' && n % 1 == 0) {
                validated = false;
            }

            var dateCheck = moment(this.get('swimDate'), 'YYYY-MM-DD');
            if (dateCheck === null || !dateCheck.isValid()) {
                validated = false;
            }

            if (!validated) {
                this.set('messageClass', 'text-error');
                this.set('message', 'invalid data, please try again');
            } else {

                var swimData = {
                    length: this.get('lengthSwum'),
                    time: this.get('timeTaken'),
                    date: this.get('swimDate')
                };

                var swim = App.Swim.create(swimData);

                //persist
                dataSource.push(swimData);

                //update the interface
                var swims = this.get('swims');
                swims.pushObject(swim);

                this.set('swims', swims);

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

    Ember.Handlebars.registerBoundHelper('date', function (date) {
        return moment(date, 'YYYY-MM-DD').format('Do MMM YYYY');
    });

})(this);
