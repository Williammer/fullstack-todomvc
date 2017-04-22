(function(exports) {
  'use strict';

  exports.app = new Vue({
    // root dom element
    el: '.todoapp',

    // app initial state
    data: {
      todos: [],
      newTodo: '',
      isLoading: false
    },

    // onCreated lifecycle hook
    created: function() {
      this.syncTodos();
    },

    // methods that implement data logic.
    methods: {
      // show or hide loading
      showLoader: function(visible) {
        this.isLoading = !!visible;
      },

      // helper function to GET-request json
      getJson: function(url) {
        return exports.fetch(url)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            return data;
          })
          .catch(function(err) {
            console.warn('[getJson - fetch] error: ' + err);
          }.bind(this));
      },

      // GET todo/event list
      fetchAllTodos: function() {
        var url = 'http://localhost:3000/';
        return this.getJson(url);
      },

      // GET and show todo/event list
      syncTodos: function() {
        this.showLoader(true);

        this.fetchAllTodos()
          .then(function(todos) {
            this.todos = todos;
            this.showLoader(false);
          }.bind(this))
          .catch(function(err) {
            console.warn('[syncTodos - fetch] error: ' + err);
            this.showLoader(false);
          }.bind(this));
      },

      // Handle the click action on todo item
      todoClickHandler: function(todo) {
        if (!todo.createdDate) {
          this.getTodoDetailById(todo.id);
        }

        todo.showDetail = !todo.showDetail;
      },

      // GET more info of a todo/event by its id
      getTodoDetailById: function(id) {
        this.showLoader(true);

        var url = 'http://localhost:3000/eventId/' + id;

        return this.getJson(url)
          .then(function(todoDetail) {
            this.todos.map(function(todo) {
              if (todo.id === id) {
                todo.createdDate = todoDetail.created.split('T')[0];
                todo.description = todoDetail.description;
              }
            });

            this.showLoader(false);
          }.bind(this))
          .catch(function(err) {
            console.warn('[getTodoDetailById - fetch] error: ' + err);
            this.showLoader(false);
          }.bind(this));
      },

      // DELETE a todo/event by its id
      deleteTodoById: function(id) {
        this.showLoader(true);

        var url = 'http://localhost:3000/eventId/' + id;

        return exports.fetch(url, {
            method: 'DELETE'
          })
          .then(function(data) {
            this.syncTodos();

            console.log('deleted status: ' + data.status);
            return data;
          }.bind(this))
          .catch(function(err) {
            console.warn('[deleteTodoById - fetch] error: ' + err);
            this.showLoader(false);
          }.bind(this));
      },

      // ADD todo to google calendar
      addTodo: function() {
        var postBody,
          url = 'http://localhost:3000/add',
          title = this.newTodo && this.newTodo.trim();

        if (!title) {
          return;
        }

        this.showLoader(true);

        postBody = {
          title: title
        };

        return exports.fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postBody)
          })
          .then(function(response) {
            if (response.status !== 200) {
              console.warn('[AddTodo] add todo failed.');
              return;
            }

            return response.json();
          })
          .then(function(data) {
            console.log('Added todo: ', data);

            this.todos.unshift(data); // added to front
            this.newTodo = '';

            this.showLoader(false);
          }.bind(this))
          .catch(function(err) {
            console.warn('[addTodo - fetch] error: ' + err);
            this.showLoader(false);
          }.bind(this));
      }
    }
  });

})(window);
