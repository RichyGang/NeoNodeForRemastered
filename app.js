var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');

var app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'admin'));
var session = driver.session();

app.get('/', function (req, res){
    session
        // .run('MATCH p=(a:user)-[*]->(a:user) WHERE a.name="Mael" RETURN EXTRACT (n in nodes(p)|n.name)')
        // .run('MATCH(n:ressource) RETURN n.name')
        .run('MATCH(n:proposal) RETURN n')
        .then(function (result){
            // var matchArr = [];
            var proposalArr = [];
            result.records.forEach(function (record){
                // matchArr.push(record._fields[0]);
                proposalArr.push(record._fields[0]);
            })
            res.render('index', {
                // matchs: matchArr
                proposals: proposalArr
            });
            // session.close()
        })
        .catch(function (err){
            console.log(err);
        });

});

// app.post('/proposition/add', function(req, res){
//     var user = req.body.user_name;
//     var ressource = req.body.ressource;
//
//     session
//         .run('CREATE(n:ressource{name:{nameParam}}) RETURN n.name', {nameParam:ressource})
//         .then(function (result)
//         {
//             res.redirect('/')
//             session.close();
//
//         })
//         .catch(function (err){
//             console.log(err);
//         });
//     console.log(ressource);
//
//     res.redirect('/')
//
// })

app.get('/secret', function (req, res, next) {
    res.render('secret');
    console.log('Accessing the secret section ...');
    next(); // pass control to the next handler
});

app.get('/ressources', function (req, res){
    session
        // .run('MATCH p=(a:user)-[*]->(a:user) WHERE a.name="Mael" RETURN EXTRACT (n in nodes(p)|n.name)')
        .run('MATCH(n:ressource) RETURN n.name')
        .then(function (result){
            let ressArr = [];
            result.records.forEach(function (record){
                matchArr.push(record._fields[0]);
            })
            res.json(ressArr)
            session.close()

        })
        .catch(function (err){
            console.log(err);
        });
});


app.get('/matchs', function (req, res){

    let userId = req.body.userId;
    let Id = userId.toString();

    session
        .run('MATCH p=(a:user)-[*]->(a:user) WHERE a.id={userId} RETURN EXTRACT (n in nodes(p)|n.id)', {userId:Id})
        // .run('MATCH m=(a:user)-[:OFFER]->(p1:proposal)-[:OFFER]->(r:ressource)-[:NEED]-(p2:proposal)-[:NEED]->(b:user)-[*]->(a) \n' +
        //     'WHERE a.id={userId} RETURN EXTRACT (n in nodes(m)|n.id)', {userId:Id})
        .then(function (result){
            let matchArr = [];
            result.records.forEach(function (record){
                matchArr.push(record._fields[0]);
            })

            // res.json(result.records)
            res.send(matchArr);
            console.log(matchArr);

        })
        .catch(function (err){
            console.log(err);
        });

});

app.post('/matchs', function (req, res){

    let ans = req.body.ans;
    let propId1 = req.body.propId1;
    let propId2 = req.body.propId2;
    let userId = req.body.userId.toString();
    // let Id = userId.toString();

    console.log(ans)
    console.log(propId1)
    console.log(propId2)
    console.log(userId)

    session
        .run('MATCH (a:proposal {id:{propId1}})' +
            'MATCH (b:proposal {id:{propId2}})' +
            'SET a.ans = {ans}' +
            'SET b.ans = {ans}',
        {propId1:propId1, propId2:propId2, ans:ans})
        .then(function (result){
            var matchArr = [];
            result.records.forEach(function (record){
                matchArr.push(record._fields[0]);
            })
            // res.json(result.records)
            res.send(matchArr);

        })
        .catch(function (err){
            console.log(err);
        });

});

// app.get('/matchs/confirmed', function (req, res){
//
//     let userId = req.body.userId;
//     let Id = userId.toString();
//
//     session
//         .run('MATCH p=(a:user)-[*]->(a:user) WHERE a.id={userId} RETURN *', {userId:Id})
//         .then(function (result){
//             var matchArr = [];
//             result.records.forEach(function (record){
//                 matchArr.push(record._fields[0]);
//             })
//
//             console.log(matchArr);
//             res.send(matchArr);
//
//         })
//         .catch(function (err){
//             console.log(err);
//         });
//
// });

// app.post('/ressource/add', function (req, res){

    // var ressourceId = req.body.ressourceId;
    // var ressourceAttr_1 = req.body.ressourceAttr_1;
    // var ressourceAttr_2 = req.body.ressourceAttr_2;

    // let ressourceName = ressourceAttr_1.concat(" ", ressourceAttr_2);
    //
    // console.log(ressourceName)

    // session
    //     .run('CREATE(n:ressource {ressourceId:{idParam}}) RETURN n.name',{idParam:ressourceId})
    //     .then(function (result){
    //         res.redirect('/');
    //     })
    //     .catch(function(err){
    //         console.log(err)
    //     });
    // res.redirect('/')
// })

app.post('/proposal', function (req, res){

    var userId = req.body.userId;

    console.log(userId);
    var proposalId = req.body.proposalId;
    // var proposalIdO = req.body.proposalIdO;
    var proposalDirection = req.body.proposalDirection;
    var ressourceId = req.body.ressourceId;

    if (proposalDirection === 'NEED'){
        session
            // .run('MERGE (a:user {id:{userParam}})' +
            //     'MERGE (b:proposal {id:{proposalIdParam}}) ' +
            //     'MERGE (c:ressource {id:{ressourceIdParam}}) ' +
            //     'CREATE m=(c)-[d:NEED]->(b)-[e:NEED]->(a)' +
            //     'RETURN m',
            //     {userParam:userId, proposalIdParam:proposalId, ressourceIdParam:ressourceId})
            .run('MERGE (a:user {id:{userParam}})' +
                'MERGE (b:proposal {id:{proposalIdParam}}) ' +
                'CREATE m=(b)-[e:NEED]->(a)' +
                'RETURN m',
                {userParam:userId, proposalIdParam:proposalId, ressourceIdParam:ressourceId})
            .then(function (result){
                // res.redirect('/');
                res.redirect('/?valid=' + userId);
            })
            .catch(function(err){
                console.log(err)
            });
    }
    else
        session
            // .run('MERGE (c:ressource {id:{ressourceIdParam}}) ' +
            //     'MERGE (b:proposal {id:{proposalIdParam}}) ' +
            //     'MERGE (a:user {id:{userParam}})' +
            //     'CREATE m=(a)-[d:OFFER]->(b)-[e:OFFER]->(c)' +
            //     'RETURN m',
            //     {userParam:userId, proposalIdParam:proposalId, ressourceIdParam:ressourceId})
            .run('MERGE (b:proposal {id:{proposalIdParam}}) ' +
                'MERGE (a:user {id:{userParam}})' +
                'CREATE m=(a)-[d:OFFER]->(b)' +
                'RETURN m',
                {userParam:userId, proposalIdParam:proposalId, ressourceIdParam:ressourceId})
            .then(function (result){
                res.redirect('/');
            })
            .catch(function(err){
                console.log(err)
            });

})

app.post('/proposal/add', function (req, res){
 var userId = req.body.userId;

console.log(userId);
var proposalIdU = req.body.proposalIdU;
var proposalIdO = req.body.proposalIdO;
var proposalDirection = req.body.proposalDirection;
var ressourceId = req.body.ressourceId;

if (proposalDirection === 'NEED'){
    session
        // .run('MERGE (a:user {id:{userParam}})' +
        //     'MERGE (b:proposal {id:{proposalIdParam}}) ' +
        //     'MERGE (c:ressource {id:{ressourceIdParam}}) ' +
        //     'CREATE m=(c)-[d:NEED]->(b)-[e:NEED]->(a)' +
        //     'RETURN m',
        //     {userParam:userId, proposalIdParam:proposalId, ressourceIdParam:ressourceId})
        .run('MERGE (a:user {id:{userParam}})' +
            'MERGE (b:proposal {id:{proposalIdUParam}}) ' +
            'MERGE (c:proposal {id:{proposalIdOParam}}) ' +
            'CREATE m=(c)-[d:NEED]->(b)-[e:NEED]->(a)' +
            'RETURN m',
            {userParam:userId, proposalIdUParam:proposalIdU, proposalIdOParam:proposalIdO, ressourceIdParam:ressourceId})
        .then(function (result){
            // res.redirect('/');
            res.redirect('/?valid=' + userId);
        })
        .catch(function(err){
            console.log(err)
        });
}
else
    session
        // .run('MERGE (c:ressource {id:{ressourceIdParam}}) ' +
        //     'MERGE (b:proposal {id:{proposalIdParam}}) ' +
        //     'MERGE (a:user {id:{userParam}})' +
        //     'CREATE m=(a)-[d:OFFER]->(b)-[e:OFFER]->(c)' +
        //     'RETURN m',
        //     {userParam:userId, proposalIdParam:proposalId, ressourceIdParam:ressourceId})
        .run('MERGE (b:proposal {id:{proposalIdUParam}}) ' +
            'MERGE (c:proposal {id:{proposalIdOParam}}) ' +
            'MERGE (a:user {id:{userParam}})' +
            'CREATE m=(a)-[d:OFFER]->(b)-[e:OFFER]->(c)' +
            'RETURN m',
            {userParam:userId, proposalIdUParam:proposalIdU, proposalIdOParam:proposalIdO, ressourceIdParam:ressourceId})
        .then(function (result){
            res.redirect('/');
        })
        .catch(function(err){
            console.log(err)
        });

})

app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app.js;
