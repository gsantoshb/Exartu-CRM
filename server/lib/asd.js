

WorkerManager = {
  handleJob: function () {
    console.log('using cpu..');
    var start = new Date().getTime();
    var delay = 2000;
    var i=0;
    while(new Date().getTime() < start + delay){
      ++i;
    }
    console.log('done in ' + (new Date().getTime() - start) + ' milisecs');
  }
};