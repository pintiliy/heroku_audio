class Sound {
  constructor() {
    this.init();
    this.initCanvas();
    this.initAudioContext();
    this.initEvents();
  }

  init() {
    this.buffer = [];
    this.time = 0;
    this.lastTime = 0;
    this.currentTime = 0;
  }

  initCanvas(){
    this.canvas = document.getElementById('canvas');
    this.canvasContext = this.canvas.getContext('2d');
  }

  initAudioContext(){
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.sourceNode = false;
  }

  initInterval(){
    let self = this;
    setInterval(function(){
      self.drawBuffer();
    }, 100);
  }

  initEvents() {
    let self = this;
    $('#play, #pause').on('click', function() {
      self.togglePlaybackSpinUpDown();
    });

    $('.js-show-message').click(function(){
      $('.js-sound-message').hide();
      $(this).siblings('.js-sound-message').show();
    });

    this.canvas.addEventListener('click', function(evt) {
      let mousePos = self.getMousePos(evt);
      self.togglePlaybackSpinUpDown(mousePos.x);
    }, false);
  }

  loadAudio(url) {
    var self = this;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      self.audioContext.decodeAudioData(request.response, function(buffer) {
        self.buffer = buffer;
        self.drawBuffer();
        self.setPositionMessages();
        self.initInterval();
      });
    }
    request.send();
  }

  drawBuffer() {
    let width = self.canvas.width;
    let height = 50;
    if(!this.buffer) {
      return;
    }
    if (this.isPlay) {
      $('.js-time').text(this.timeFormat(this.time * 1000));
      this.time += 0.1;
      if (this.time >= this.buffer.duration.toFixed(1)) {
        this.stopTrack();
      }
    }

    let data = this.buffer.getChannelData( 0 );
    let step = Math.floor( data.length / width );
    let amp = height / 2;
    let count = width / 4;
    let audioLength = this.buffer.duration.toFixed(1);
    let audioPer = 100 / (audioLength / this.time);
    // canvasContext.clearRect(0,0,width,height);
    for (let i = 0; i < width; i += 3) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        let datum = data[(i*step)+j];
        if (datum < min)
          min = datum;
        if (datum > max)
          max = datum;
      }
      this.canvasContext.fillStyle = '#fff';
      if (i <= ((width / 100) *  audioPer)) {
        this.canvasContext.fillStyle = '#FF530D';
      }

      var heightRow = Math.max(1,(max-min)*amp) + 10;
      this.canvasContext.fillRect(i,(1+min) + (this.canvas.height - heightRow),2,heightRow);
    }
  }

  togglePlaybackSpinUpDown(clickPosition) {
    let self = this;
    if (this.isPlay && !clickPosition) {
      this.sourceNode.stop();
      this.isPlay = false;
      this.currentTime += this.audioContext.currentTime - this.lastTime;
      this.toggleControlButton('pause');
    } else {
      if (clickPosition) {
        let per  = 100 / (canvas.width / clickPosition);
        let audioLength = this.buffer.duration.toFixed(1);
        let audioPer = (audioLength / 100) * per;
        this.time = audioPer;
        if (this.sourceNode) {
          this.sourceNode.stop();
          createSourceNode();
        } else {
          createSourceNode();
        }
        this.sourceNode.start(0, audioPer);
      } else {
        createSourceNode();
        this.sourceNode.start(0, this.currentTime);
      }

      this.isPlay = true;
      this.toggleControlButton('play');
    }

    function createSourceNode() {
      self.sourceNode = self.audioContext.createBufferSource();
      self.sourceNode.buffer = self.buffer;
      self.sourceNode.connect( self.audioContext.destination );
      self.lastTime = self.audioContext.currentTime;
    }
  }

  toggleControlButton(event) {
    let play = $('#play');
    let pause = $('#pause');

    switch(event){
      case "play":
        play.hide();
        pause.show();
      break;
      case "pause":
        play.show();
        pause.hide();
      break;
    }
  }

  stopTrack() {
    this.sourceNode.stop();
    this.isPlay = false;
    this.currentTime = 0;
    this.time = 0;
    this.toggleControlButton('pause');
    return true;
  }

  setPositionMessages() {
    let messages = $('.sound-messages > div');
    let audioLength = this.buffer.duration.toFixed(1);
    let canvasWidth = canvas.width;

    messages.map(function() {
      var percent = 100 / (audioLength / (parseFloat($(this).data('time'))));
      $(this).css('left', percent * (canvasWidth / 100));
      $(this).show();
    });
  }

  timeFormat(ms) {
    function num(val) {
        val = Math.floor(val);
        return val < 10 ? '0' + val : val;
    }

    let sec = ms / 1000
      , hours = sec / 3600  % 24
      , minutes = sec / 60 % 60
      , seconds = sec % 60
    ;
    return num(minutes) + ":" + num(seconds);
  }

  getMousePos(evt) {
    let rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
};
