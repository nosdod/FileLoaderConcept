import selectFiles from 'select-files'

export default function LoadFileDialog() {
    console.log('File selection processing started');
    selectFiles()
    .then(afile => {
        const data = {
            file : afile[0].name,
        }
 
        // Post to server
        fetch('/loadFile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( data )
        })
    });
  }