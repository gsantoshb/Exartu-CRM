DashboardController = RouteController.extend({
    template: 'dashboard',
    layoutTemplate: 'mainLayout',
});

Template.dashboard.greetings = "Welcome to Exartu!"

ngMeteor.controller('TodoCtrl', ['$scope', '$collection',
  function ($scope, $collection) {
        $collection("todos", $scope);

        $scope.addTodo = function () {
            $scope.todos.add({
                text: $scope.todoText,
                done: false
            });
            $scope.todoText = '';
        };

        $scope.remaining = function () {
            var count = 0;
            angular.forEach($scope.todos, function (todo) {
                count += todo.done ? 0 : 1;
            });
            return count;
        };
  }
]);