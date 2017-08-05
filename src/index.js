import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const params = queryString.parse(window.location.search);
ReactDOM.render(<App params={params} />, document.getElementById('root'));
registerServiceWorker();
