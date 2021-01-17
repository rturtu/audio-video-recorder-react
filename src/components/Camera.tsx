import React, {useRef, useEffect, useState} from 'react';
import styled from 'styled-components';
import { CameraState } from '../types/enums';

interface Props {
    setCallbacks: (callbacks:{ 
        startRecording: () => void;
        pauseRecording: () => void;
        resumeRecording: () => void;
        stopRecording: () => void;
        downloadRecordedVideo: () => void;
        getRecorderState: () => CameraState;
    }) => void;
};

const Video = styled.video`
    max-width: 1280px;
    width: 90%;
`;

const Camera: React.FC<Props> = (props: Props) => {

    const [videoInputRef, setVideoInputRef] = useState<HTMLVideoElement | null>(null);
    const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);
    const [downloadLink, setDownloadLink] = useState<string>('');
    const [recorderState, setRecorderState] = useState<CameraState>(CameraState.Inactive)

console.log(recorderState, videoRecorder?.state);

    const mediaOptions = { 
        audio: true, 
        video: { 
            facingMode: 'user', 
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            frameRate: { max: 30 },
            aspectRatio: { ideal: 1.777777777 }
        } 
    }; 

    const getUserMedia = (options: any):Promise<MediaStream> => {
        return new Promise( (resolve, reject) => {
            let userMedia = (navigator as any)?.webkitGetUserMedia || (navigator as any)?.mozGetUserMedia;
            if(userMedia) {
                userMedia.call(navigator, options, (mediaStream: MediaStream) => {
                    resolve(mediaStream);
                }, reject);
            } else {
                const err = "User media not supported on this browser";
                console.error(err);
                reject( new Error(err) );
            }
        } )
    }

    useEffect( () => {
        props.setCallbacks( {
            startRecording,
            pauseRecording,
            resumeRecording,
            stopRecording,
            downloadRecordedVideo,
            getRecorderState,
        } )
    }, [videoRecorder, downloadLink, recorderState] );

    useEffect( () => {
        if(videoInputRef === null) return;

        getUserMedia(mediaOptions).then( (mediaStreamObj: MediaStream) => {
            //connect the media stream to the first video element
            let video = videoInputRef;
            if ("srcObject" in video) {
                (video as any).srcObject = mediaStreamObj;
            } else {
                //old version
                (video as any).src = window.URL.createObjectURL(mediaStreamObj);
            }
            
            video.onloadedmetadata = function(ev) {
                //show in the video element what is being captured by the webcam
                video.play();
            };

            let mediaRecorder = new MediaRecorder(mediaStreamObj, {mimeType: 'video/webm'});
            setVideoRecorder(mediaRecorder);

            mediaRecorder.ondataavailable = (event) => {
                console.log('onDataAvailable', event);
                let videoURL = window.URL.createObjectURL(event.data);
                setDownloadLink(videoURL);
                //downloadRecordedVideo();
            }
            mediaRecorder.onstop = (ev) => {
                //let blob = new Blob(recordedVideo, { 'type' : 'video/mp4;' });
                //setDownloadLink(videoURL);
            }
        })
        .catch(function(err) { 
            console.log(err.name, err.message); 
        });
    }, [videoInputRef] );

    const downloadRecordedVideo = () => {
        const link = document.createElement("a");
        link.href = downloadLink;
        link.setAttribute("download", "recording.webm");
        document.body.appendChild(link);
        link.click();
    }

    const startRecording = () => {
        console.log('start', videoRecorder);
        if(videoRecorder && videoRecorder.state === CameraState.Inactive) {
            videoRecorder.start();
            setRecorderState(CameraState.Recording);
        }
    }

    const pauseRecording = () => {
        if(videoRecorder && videoRecorder.state === CameraState.Recording) {
            videoRecorder.pause();
            setRecorderState(CameraState.Paused);
        }
    } 

    const resumeRecording = () => {
        console.log('resume', videoRecorder, recorderState);
        if(videoRecorder && videoRecorder.state === CameraState.Paused) {
            videoRecorder.resume();
            setRecorderState(CameraState.Recording);
        }
    }

    const stopRecording = () => {
        console.log('stop');
        if(videoRecorder && (videoRecorder.state === CameraState.Recording || videoRecorder.state === CameraState.Paused) ) {
            videoRecorder.stop();
            setRecorderState(CameraState.Inactive);
        }
    }

    const getRecorderState = () => {
        return recorderState;
    }

    return (
        <div>
            <Video ref={setVideoInputRef} />
        </div>
    )
}

export default Camera;