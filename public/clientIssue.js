var form = document.getElementById('project-issue-form')
var cardButton = document.getElementById('card-box')

var issueName = window.location.pathname.replace(/\//g, '');
var resultUrl = '/api/issues/' + issueName
var cardContainer = document.getElementById('card-box')
var projectName = document.getElementById('project-name')
projectName.innerText = 'Project: ' + issueName;

var label = {
  _id: 'ID:',
  project_name: 'Project:',
  issue_title: 'Issue Title:',
  issue_text: 'Description:',
  created_by: 'Created by:',
  assigned_to: 'Assigned to:',
  status_text: 'Status text:',
  created_on: 'Created on:',
  updated_on: 'Updated on:',
  open: 'Open:'
}

var cardOrder = ['project_name', 'issue_title', '_id', 'issue_text', 'created_by',
                 'assigned_to', 'status_text', 'created_on', 'updated_on', 'open']

function getIssues() {
  while (cardContainer.firstChild) {
    cardContainer.removeChild(cardContainer.firstChild)
  }
  var req = new XMLHttpRequest()
  req.open('GET', resultUrl, true)
  req.send()
  req.onload = function() {    
    var issues = JSON.parse(req.response)
    var pageFragment = document.createDocumentFragment()
    issues.forEach(function(issue) {      
      var card = document.createElement('div')
      card.setAttribute('class', 'card-container')
      cardOrder.forEach(function(detail) {        
        var elRow = document.createElement('div')
        elRow.setAttribute('class', 'row')
        var elLeft = document.createElement('div')
        elLeft.setAttribute('class', 'left')         
        elLeft.innerText = label[detail]
        var elRight = document.createElement('div')
        elRight.setAttribute('class', 'right')
        if (detail == 'created_on' || detail == 'updated_on') {
          console.log(typeof issue[detail])
          elRight.innerText = new Date(issue[detail]).toLocaleString()
        } else {
          elRight.innerText = issue[detail]
        }
        elRow.appendChild(elLeft)
        elRow.appendChild(elRight)
        card.appendChild(elRow)        
      })
      var buttons = document.createElement('div')
      buttons.setAttribute('class', 'button-container')
      var closeBtn = document.createElement('button')
      closeBtn.type = 'button'
      closeBtn.name = 'close'
      closeBtn.innerText = 'Close Issue'
      closeBtn.setAttribute('data-state', issue['_id'])
      var delBtn = document.createElement('button')
      delBtn.type = 'button'
      delBtn.name = 'delete'
      delBtn.innerText = 'Delete Issue'
      delBtn.setAttribute('data-state', issue['_id'])
      buttons.appendChild(closeBtn)
      buttons.appendChild(delBtn)
      card.appendChild(buttons)      
      pageFragment.appendChild(card)
    })
    cardContainer.appendChild(pageFragment)
  }  
}

function sendRequest(method, url, request={}, callback) {
  var req = new XMLHttpRequest()
  req.open(method, url, true)
  req.setRequestHeader("Content-Type", "application/json")
  req.send(JSON.stringify(request))
  req.onload = function() {
    callback()
  }  
}

function handleCardEvent(event) {
  if (event.target.name == 'close') {
    sendRequest('PUT', '/api/issues', {_id: event.target.getAttribute('data-state'), open: 'false'}, getIssues)    
  } else if (event.target.name == 'delete') {
    console.log('doing a delete')
    console.log(event.target.parentNode.parentNode.parentNode)
    sendRequest('DELETE', '/api/issues/', {_id: event.target.getAttribute('data-state')}, function() {
      event.target.parentNode.parentNode.parentNode.removeChild(event.target.parentNode.parentNode)
      })
  }  
}

function handleNewIssue(event) {
  event.preventDefault()
  console.log(form.elements)
  var formData = {
    project_name: issueName,
    issue_title: form.elements.issue_title.value,
    created_by: form.elements.created_by.value,
    assigned_to: form.elements.assigned_to.value,
    status_text: form.elements.status_text.value,
    issue_text: form.elements.issue_text.value    
  }
  sendRequest('POST', resultUrl, formData, function() {
    form.reset()
    getIssues()
  })
}


getIssues()
form.addEventListener('submit', handleNewIssue)
cardButton.addEventListener('click', handleCardEvent)

