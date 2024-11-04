// constants
const express = require('express');
const app = express();
const port = 3000;
const Connection=require("./database/db");
app.set('view engine', 'ejs');
Connection();

// render views
app.get('/', (req, res) => {
    console.log(__dirname)
    res.render('index')
});

app.get('/home', (req, res) => {
    res.render('home')
});

app.get('/projects', (req, res) => {
    res.render('projects')
});

app.get('/settings', (req, res) => {
    res.render('settings')
});

app.get('/MOST', (req, res) => {
    res.render('MOST')
});

// middleware
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    res.status(404).render('404')
});

app.listen(port, () => {
    console.log('Server running on port', port);
});