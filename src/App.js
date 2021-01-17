import logo from './logo.svg';
import './App.css';
import Camera from './components/Camera.tsx';
import React, {useState, useEffect} from 'react';
import {CameraState} from './types/enums';
import styled from 'styled-components';

const Button = styled.button`
    margin: .2em;
    padding: .5em;
`

const App = () => {

  const [callbacks, setCallbacks] = useState(null);
  const recorderState = callbacks?.getRecorderState && callbacks.getRecorderState() || CameraState.Inactive;
  console.log( recorderState );

  return (
    <div className="App">
      <div>


      <Button onClick={()=>{ 
                if(recorderState === CameraState.Inactive)
                    callbacks.startRecording();
                else if(recorderState === CameraState.Recording)
                    callbacks.pauseRecording(); 
                else
                    callbacks.resumeRecording();
            }}> {recorderState === CameraState.Inactive ? 'Start' : ( recorderState === CameraState.Recording ? 'Pause' : 'Resume' )} </Button>
            <Button onClick={()=>{ callbacks.stopRecording() }}>Stop</Button>
            <Button onClick={()=>{ callbacks.downloadRecordedVideo() }}>Download</Button>

        </div>
      <Camera setCallbacks={setCallbacks} />
      
    </div>
  );
}

export default App;
