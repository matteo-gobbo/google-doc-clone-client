import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';

const modules = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
    
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
    
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
    
        ['clean']                                         // remove formatting button
    ]
}

function TextEditor() {
    const { id: documentId } = useParams();
    const [value, setValue] = useState('');
    const [socket, setSocket] = useState();

    useEffect(() => {
        const socket = io("http://localhost:3001");
        setSocket(socket);

        socket.on('receive-changes', (delta) => {
            setValue(delta);
        })

        
        return () => {
            socket.disconnect();
        }
    }, []);
    
    useEffect(() => {
        if(socket == null) return;

        socket.once('load-document', content => {
            setValue(content);
        });

        socket.emit('get-document', documentId);

    }, [socket, documentId]);

    useEffect(() => {
        if(socket == null) return;

        const interval = setInterval(() => {
            console.log(value);
            socket.emit('save-document', value);
        }, 5000);

        return () => {
            clearInterval(interval);
        }
    }, [socket, value]);

    function handleChange(content, delta, source, editor) {
        setValue(content);
        // TODO: handle content change response only with delta
        if(source === 'user') socket.emit('send-changes', content);
        if(source === 'api') console.log('content', editor);
    }

    return (
        <ReactQuill 
            theme="snow" 
            value={value} 
            onChange={handleChange}
            modules={modules}>
        </ReactQuill>
    )
}

export default TextEditor;
