d3.lasso
========

A lasso plugin for d3.js.

The plugin lets you add a lasso tool for selecting items within a dom container.


Usage:

d3.lasso(opts);

The options are:

1) target: The dom element we want to apply the lasso tool
2) callback: The funciton to be invoked when selection is ended. It contains an object with the information about the are that was selected.
    
For example:

    d3.lasso({
      target: '#chart',
      callback: function(event){
          console.log('Start Point: ' + event.start);
          console.log('Cornert Points: ' + event.points);
          console.log('Selected Area Width: ' + event.width);
          console.log('Selected Area Height: ' + event.height);
          console.log('Ctrl Button Pressed?: ' + event.ctrKey);
      }
    });
