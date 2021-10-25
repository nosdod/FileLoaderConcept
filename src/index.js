import _ from 'lodash';
import loadFileDialog from './loadFileDialog.js';

 function component() {
   const element = document.createElement('div');
   const btn = document.createElement('button');


   btn.innerHTML = 'Load File Dialog';
   btn.onclick = loadFileDialog;

   element.appendChild(btn);

   return element;
 }

 document.body.appendChild(component());