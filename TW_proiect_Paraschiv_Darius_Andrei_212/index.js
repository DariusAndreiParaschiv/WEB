const express = require('express');
const path = require('path');
const app = express();
const sharp = require('sharp');
const fs = require('fs');
const { Client } = require("pg");
const url = require("url");
const { exec } = require("child_process");
app.set("view engine", "ejs");
app.use("/resurse", express.static(path.join(__dirname, "resurse")));
app.use("/materiale", express.static(path.join(__dirname, "materiale")));

const client = new Client({
    host: "localhost",
    user: "darius",
    password: "darius",
    database: "postgres",
    port: 5432
});
client.connect();

function verificaImg() {
    var file = fs.readFileSync("resurse/galerie.json");
    var json = JSON.parse(file);
    var cale = json.cale;
    let vectorCai = [];
    var d = new Date();
    var h = [d.getHours(), d.getMinutes()];
    // var h = [21, 30];
    console.log(h[0]);
    console.log(h[1]);
    for (let im of json.img) {
        var imgVeche = path.join(cale, im.file);
        var ext = path.extname(im.file);
        var nume = path.basename(im.file, ext)
        let img = path.join(cale, nume + "-mic.webp");
        let temp = im.ora.split("-");
        // console.log(temp[0]);
        // console.log(temp[1]);
        var timp = [];
        for(let t of temp)
        {
            var time = t.split(":");
            // timp.push({ora: time[0], min: time[1]});
            timp.push([time[0], time[1]]);
            // console.log(time[0]);
            // console.log(time[1]);
        }
        var hi = parseInt(timp[0][0]);
        var hf = parseInt(timp[1][0]);
        var mi = parseInt(timp[0][1]); 
        var mf = parseInt(timp[1][1]);
        var o1 = parseInt(h[0]);
        var o2 = parseInt(h[1]);
        if((hf < hi && o1 >= 20) || (hf < hi && o1 < 5))
        {
            vectorCai.push({ mare: "/" + imgVeche, mic: "/" + img, nume: im.desc });
            // console.log("push");
        }
        else if(hi <= o1 && hf > o1)
        {
            vectorCai.push({ mare: "/" + imgVeche, mic: "/" + img, nume: im.desc });
            // console.log("push");
        }
        else if(hi == hf && mi <= o2 && mf > o2)
        {
            vectorCai.push({ mare: "/" + imgVeche, mic: "/" + img, nume: im.desc });
            // console.log("push");
        }
        // vectorCai.push({ mare: "/" + imgVeche, mic: "/" + img, nume: im.desc });
        if (!fs.existsSync(img))
            sharp(imgVeche).resize(150).toFile(img, function (err) {
                if (err)
                    console.log("eroare img: ", imgVeche, "-> ", img, err);
            })
    }
    let vectorCaif = [];
    var c = 0;
    for(let im of vectorCai)
    {
        c++;
    }
    c = c - c%3;
    var C = 0;
    for(let im of vectorCai) 
    {
        vectorCaif.push({ mare: im.mare, mic: im.mic, nume: im.nume })
        C++;
        if(C == c)
            break;
    }
    console.log("static");
    console.log(vectorCaif);
    return vectorCaif;
    // return vectorCai;
}

function verificaImgA()
{
    var file = fs.readFileSync("resurse/galerie.json");
    var json = JSON.parse(file);
    var cale = json.cale;
    let vectorCai = [];
    for(let im of json.img)
    {
        var imgVeche = path.join(cale, im.file);
        var ext = path.extname(im.file);
        var nume = path.basename(im.file, ext)
        let img = path.join(cale, nume + "-mic.webp");
        vectorCai.push({ mare: "/" + imgVeche, mic: "/" + img, nume: im.desc});
        if(!fs.existsSync(img))
            sharp(imgVeche).resize(150).toFile(img, function(err)
            {
                if(err)
                    console.log("eroare img: ", imgVeche, "-> ", img, err);
            })
    }
    console.log("animat");
    console.log(vectorCai);
    return vectorCai;
}

function verificaImgRand()
{
    var file = fs.readFileSync("resurse/galerie.json");
    var json = JSON.parse(file);
    var cale = json.cale;
    let vectorCai = [];
    let tempCai = [];
    let nr = [7, 8, 9, 11];
    let n = nr[Math.floor(nr.length * Math.random())];
    console.log(n)
    let len = 0;
    for (let im of json.img)
    {
        len++;
    }
    var a = 0;
    console.log(len);
    for (i = 0; i < n; i++) 
    {
        let c = Math.floor(len * Math.random());
        console.log(c);
        for(j = 0; j < tempCai.length; j++)
        {
            if(j == c)
            {
                a = 1;
                break;
            }
        }
        if(a == 0)
        {
            tempCai.push(c);
            let C = 0;
            for (let im of json.img) {
                if(C == c)
                {
                    var imgVeche = path.join(cale, im.file);
                    var ext = path.extname(im.file);
                    var nume = path.basename(im.file, ext)
                    let img = path.join(cale, nume + "-mic.webp");
                    console.log(img)
                    vectorCai.push({ mare: "/" + imgVeche, mic: "/" + img, nume: im.desc });
                    if (!fs.existsSync(img))
                        sharp(imgVeche).resize(150).toFile(img, function (err) {
                            if (err)
                                console.log("eroare img: ", imgVeche, "-> ", img, err);
                        })
                    break;
                }
                C++;
            }
        }
        a = 0;
        console.log(tempCai);   
    }
    console.log("animatRand");
    console.log(vectorCai);
    return vectorCai;
}

app.get(["/", "/index"], function (req, res) 
{
    let vectorCaiStatic = verificaImg();
    let vectorCaiAnimat = verificaImgA();
    res.render("pagini/index", {img:vectorCaiStatic, imga:vectorCaiAnimat, ip:req.ip});
});

app.get("/about_ygo", function (req, res) {
    let vectorCai = verificaImg();
    res.render("pagini/about_ygo", { img: vectorCai});
});

app.get("/produse", function(req, res) {

    // let conditie = req.query.tip ? " and tip_carte='" + req.query.tip + "'" : "";//daca am parametrul tip in cale (tip=cofetarie, de exemplu) adaug conditia pentru a selecta doar produsele de acel tip
    // console.log("select id_card, nume, pret, categorie from cartonase where 1=1" + conditie);
    // client.query("select id_card, nume, pret, categorie from cartonase where 1=1" + conditie, function (err, rez) {
    //     console.log(err, rez);
    //     //console.log(rez.rows);
    //     client.query("select unnest(enum_range( null::categ_cartonas)) as categ", function (err, rezCateg) {//selectez toate valorile posibile din enum-ul categ_prajitura
    //         console.log(rezCateg);
    //         res.render("pagini/produse", { produse: rez.rows, categorii: rezCateg.rows });//obiectul {a:10,b:20} poarta numele locals in ejs  (locals["a"] sau locals.a)
    //     });
    // });
    client.query("select id_card, nume, pret, categorie, img from cartonase", function (err, rez) {
        res.render("pagini/produse", {produse:rez.rows});//obiectul {a:10,b:20} poarta numele locals in ejs  (locals["a"] sau locals.a)
        });
    });

app.get("/produs/:id", function(req, res)
{
    client.query("select * from cartonase where id = " + req.params.id, function(err, rez)
    {
        res.render("pagini/produs", {prod:rez.rows[0]});
    });
});

app.get("*/galerie.json", function(req, res)
{
    res.status(403).render("pagini/403");
});
app.get("/*", function (req, res) 
{
    res.render("pagini"+req.url, function(err, rez)
    {
        if(err){
            if(err.message.includes("Failed to lookup view"))
            {
                res.status(404).render("pagini/404");
            }
            else 
                throw err;
        }
        else
            res.send(rez);
            
    });
});

app.listen(8080);
console.log("Gata, shefu!");