//Load modules
const express = require('express');
const session = require('express-session');
const fileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const accountList = JSON.parse(fs.readFileSync(path.join(__dirname, "account.json")));

app.use(session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store: new fileStore({})
}));

app.use(express.static("../"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.set("views", __dirname + '/ejs');
app.set("view engine", "ejs");
app.engine('html', require('ejs').renderFile);

app.post("/api/login", (req, res) => {
    console.log("Logging in process");
    let userID = req.body.id || req.query.id;
    let pw = req.body.password || req.query.password;
    if (req.session.user) {
        console.log("Logged in, redirecting....")
        res.redirect("/api/adminmenu");
        console.log(req.session)
    } else {
        //process login
        console.log("Processing..")
        let sucess = false;
        accountList.forEach(element => {
            if (element.id == userID && element.password == pw) {
                sucess = true;
                req.session.user = {
                    id: userID,
                    pw: pw,
                    authorized: true
                };
            };
        });
        if (!sucess) {
            res.send("<h1 style='color:red;'>인증에 실패했습니다.</h1><a href='/adminmenu/login'>돌아가기</a>");
        }
        res.redirect("/api/adminmenu");
    }
})

app.get("/api/adminmenu", (req, res) => {
    let nickname;
    if (req.session.user) {
        
        accountList.forEach((element) => {
            if (element.id == req.session.user.id) {
                console.log(element.nickname);
                nickname = element.nickname
            }
        })
        res.render('index.ejs', {
            userName: nickname
        })
    } else {
        res.redirect("/adminmenu/login");
    }
})

app.listen(80, () => {
    console.log("SERVER ONLINE!");
})