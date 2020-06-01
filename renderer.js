const { ipcRenderer, shell, remote } = require('electron');
const path = require('path');

function initOBS() {
  // Replace with await ipcRenderer.invoke when obs-studio-node will be ready to work on recent versions of Electron.
  // See https://github.com/stream-labs/obs-studio-node/issues/605
  const result = ipcRenderer.sendSync('recording-init');
  console.debug("初始化obs result:", result);
  if (result) {
    ipcRenderer.on("performanceStatistics", (_event, data) => onPerformanceStatistics(data));
  }
}

function startRecording() {
  const result = ipcRenderer.sendSync('recording-start');
  console.debug("启动录制 result:", result);
  return result;
}

function stopRecording() {
  const result = ipcRenderer.sendSync('recording-stop');
  console.debug("停止录制 result:", result);
  return result;
}

let recording = false;
let recordingStartedAt = null;
let timer = null;

function getSetting() {
  const cate = document.getElementById('OBSSettingsCategories')
  const result = ipcRenderer.sendSync('getSetting',{name:cate.options[cate.selectedIndex].text});
  console.log(result)
}

function switchRecording() {
  if (recording) {
    recording = stopRecording().recording;
  } else {
    recording = startRecording().recording;
  }
  updateUI();
}

function updateUI() {
  const button = document.getElementById('rec-button');
  button.disabled = false;
  if (recording) {
    button.innerText = '⏹️ 停止录制'
    startTimer();
  } else {
    button.innerText = '⏺️ 启动录制'
    stopTimer();
  }

  const rtmp_server = document.getElementById('rtmp_server');
  const rtmp_key = document.getElementById('rtmp_key');

  const streamSettings = ipcRenderer.sendSync('getSetting',{name:'Stream'});

  streamSettings.forEach(subCate => {
    subCate.parameters.forEach(parameter => {
      switch (parameter.name) {
        case 'service' : {
          break;
        }
        case 'server': {
          rtmp_server.value = parameter.currentValue;
          break;
        }
        case 'key': {
          rtmp_key.value = parameter.currentValue;
          break;
        }
      }
    })
  })

  //result[1].parameters[""0""].currentValue
  console.log(streamSettings)

}

function startTimer() {
  recordingStartedAt = Date.now();
  timer = setInterval(updateTimer, 100);
}

function stopTimer() {
  clearInterval(timer);
}

function updateTimer() {
  const diff = Date.now() - recordingStartedAt;
  const timerElem = document.getElementById('rec-timer');
  const decimals = `${Math.floor(diff % 1000 / 100)}`;
  const seconds  = `${Math.floor(diff % 60000 / 1000)}`.padStart(2, '0');
  const minutes  = `${Math.floor(diff % 3600000 / 60000)}`.padStart(2, '0');
  const hours    = `${Math.floor(diff / 3600000)}`.padStart(2, '0');
  timerElem.innerText = `${hours}:${minutes}:${seconds}.${decimals}`;
}

function openFolder() {
  shell.openItem(path.join(__dirname, 'videos'));
}

function onPerformanceStatistics(data) {
  document.querySelector(".performanceStatistics #cpu").innerText = `${data.CPU} %`;
  document.querySelector(".performanceStatistics #cpuMeter").value = data.CPU;
  document.querySelector(".performanceStatistics #numberDroppedFrames").innerText = data.numberDroppedFrames;
  document.querySelector(".performanceStatistics #percentageDroppedFrames").innerText = `${data.percentageDroppedFrames} %`;
  document.querySelector(".performanceStatistics #bandwidth").innerText = data.bandwidth;
  document.querySelector(".performanceStatistics #frameRate").innerText = `${Math.round(data.frameRate)} fps`;
}

const previewContainer = document.getElementById('preview');

function setupPreview() {
  const { width, height, x, y } = previewContainer.getBoundingClientRect();
  const result = ipcRenderer.sendSync('preview-init', { width, height, x, y });
  previewContainer.style = `height: ${result.height}px`;
}

function resizePreview() {
  const { width, height, x, y } = previewContainer.getBoundingClientRect();
  const result = ipcRenderer.sendSync('preview-bounds', { width, height, x, y });
  previewContainer.style = `height: ${result.height}px`;
}

const currentWindow = remote.getCurrentWindow();
currentWindow.on('resize', resizePreview);
document.addEventListener("scroll",  resizePreview);
var ro = new ResizeObserver(resizePreview);
ro.observe(document.querySelector("#preview"));

try {
  initOBS();
  setupPreview();
  updateUI();
} catch (err) {
  console.log(err)
}
