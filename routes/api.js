'use strict';

var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; 

  module.exports = function (app) {
    
    app.route('/api/projects')
      .get(function (req, res) {
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          db.collection('issues').distinct("project_name", function(err, results) {
            if (err) throw err            
            res.send(results)
          })
        })
    })
    
    app.route('/api/issues')
      .put(function (req, res){           
          var id;
          try {
            id = ObjectId(req.body._id)
          } catch(error) {
            res.type('text').send('could not update ' + req.body._id + '...')
            return
          }          
          var updateObj = {};          
          Object.keys(req.body).forEach(function(el) {
            if (el == '_id' || req.body[el] == '') { return }            
            updateObj = {...updateObj, [el]: req.body[el]}
          })          
          if (Object.keys(updateObj).length == 0) {
            res.type('text').send('no updated field sent')
            return
                }          
          MongoClient.connect(CONNECTION_STRING  , function(err, db) {
            console.log('about to connect...')          
            db.collection('issues').findOne({_id: id}, function(err, result) {
              if (err) {
                res.redirect('/')
              }
              if (result == undefined) {
                res.type('text').send('could not update ' + req.body._id + '...')
                return
              }
              updateObj = {...updateObj, updated_on: new Date()}
              db.collection('issues').update({_id: id}, {$set: updateObj}, function(err, result) {
                if (err) console.error(err)
                res.type('text').send('successfully updated')
                })                          
            })
          })
      })
    
      .delete(function (req, res){                
        if (req.body._id == '') {
          res.type('text').send('_id error')
          return          
        }
        var id;
          try {
            id = ObjectId(req.body._id)
          } catch(error) {
            res.type('text').send('could not delete ' + req.body._id + '. Id may be incorrect.')
            return
          }        
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          db.collection('issues').findOne({_id: id}, function(err, result) {
            if (err) {
              res.redirect('/')
            }
            if (result == undefined) {
              res.type('text').send('could not delete ' + req.body._id + '. Id may be incorrect.')
              return
            }            
            db.collection('issues').deleteOne({_id: id}, function(err, doc) {              
              if (err) throw err;
              res.type('text').send('deleted id ' + id)
            })
          })
        })
      });
    

    app.route('/api/issues/:project')

      .get(function (req, res){        
        var project = req.params.project; 
        var query = {...req.query, project_name: project}                
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          db.collection('issues').find(query).toArray(function(err, results) {
            if (err) throw err            
            res.json(results)
          })
      })
    })

      .post(function (req, res){
        var project = req.body.project_name;        
        if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
          res.type('text').send('missing required field')
          return
          }          
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          console.log('about to connect')          
          db.collection('issues').insertOne({
                project_name: project,
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to: req.body.assigned_to || '',
                status_text: req.body.status_text || '',
                created_on: new Date(),
                updated_on: new Date(),
                open: true
              }, function(err, doc) {
                if (err) { res.redirect('/') }                
                res.json(doc.ops[0])
              })
            })
          })
  };

