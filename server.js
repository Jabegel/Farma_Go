
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use('/SRC/uploads', express.static(path.join(__dirname, 'SRC/uploads')));
app.use(express.static(path.join(__dirname)));

// mount usuario API (will be created under SRC/api/usuario)
app.use('/api/usuario', require('./SRC/api/usuario/usuario.routes'));

// serve index
app.get('/index.html', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));
app.get('/', (req,res)=> res.redirect('/index.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on', PORT));
