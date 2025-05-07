const videoElem = document.getElementById("video");
const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
const playElem = document.getElementById("play");
const downloadArea = document.getElementById("downloadContainer");

const downloadBtn = document.getElementById("downloadBtn");

let stream;
let mediaRecorder;
let recordedBlobs;


// Options for getDisplayMedia()

const displayMediaOptions = {
    video: true,
    audio: true,
};

const recorderOptions = {
    mimetype: 'video/webm, codecs=vp9'
}

// Set event listeners for the start and stop buttons
startElem.addEventListener(
    "click",
    (evt) => {
        startCapture();
    },
    false,
);

stopElem.addEventListener(
    "click",
    (evt) => {
        stopCapture();
    },
    false,
);

playElem.addEventListener(
    "click",
    (evt) => {
        playRecording();
    },
    false,
);

downloadBtn.addEventListener(
    "click",
    (e) => {
        downloadVideo();
    },
    false,
);


console.log = (msg) => (logElem.textContent = `${logElem.textContent}\n${msg}`);
console.error = (msg) =>
    (logElem.textContent = `${logElem.textContent}\nError: ${msg}`);

async function startCapture() {
    logElem.textContent = "";
    recordedBlobs = [];
    try {
        stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        videoElem.srcObject = stream;

        mediaRecorder = new MediaRecorder(stream, recorderOptions);
        mediaRecorder.ondataavailable = e => {
            //ondataavailable will run when the stream ends, or stopped, or we specifically ask for it
            console.log("Data is available for the media recorder!")
            recordedBlobs.push(e.data)
        };
        mediaRecorder.start();
        dumpOptionsInfo();
    } catch (err) {
        console.error(err);
    }
}

function stopCapture() {
    let tracks = videoElem.srcObject.getTracks();

    tracks.forEach((track) => track.stop());
    videoElem.srcObject = null;

    if (!mediaRecorder) {
        alert("Please record before stopping!")
        return
    }
    console.log("stop recording")
    mediaRecorder.stop()


}


function downloadVideo() {

    if(!recordedBlobs){
        alert("Henüz bir kayıt bulunmuyor!");
        return;
    }
    //download link generated right after capturing ended
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    console.log(url);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `recording:${Date.now()}.webm`;
    downloadLink.click();
    // downloadArea.appendChild(downloadLink);


}

function dumpOptionsInfo() {
    const videoTrack = videoElem.srcObject.getVideoTracks()[0];

    console.log("Track settings:");
    console.log(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.log("Track constraints:");
    console.log(JSON.stringify(videoTrack.getConstraints(), null, 2));
}


const playRecording = () => {
    console.log("play recording")
    if (!recordedBlobs) {
        alert("No Recording saved")
        return
    }
    const superBuffer = new Blob(recordedBlobs) // superBuffer is a super buffer of our array of blobs
    const recordedVideoEl = document.querySelector('#other-video');
    recordedVideoEl.src = window.URL.createObjectURL(superBuffer);

    recordedVideoEl.controls = true;
    recordedVideoEl.play();

}