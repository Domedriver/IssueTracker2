var url = '/api/issues/'
var form = document.getElementById('project-issue-form')
var updateForm = document.getElementById('update-form')
var deleteForm = document.getElementById('delete-form')
var project = document.querySelector('select[name="project"]')
var nameContainer = document.getElementById('project-name-container')
var jsonContainer = document.getElementById('json-container')

function checkForNewProject(event) {
  if (document.getElementById('new-project-name')) {
    nameContainer.removeChild(document.getElementById('new-project-name'))    
  }    
  if (event.target.value == 'New project') {    
    var newProject = document.createElement('input');
    newProject.id = 'new-project-name'
    newProject.type = 'text'
    newProject.name = 'project_name'
    newProject.placeholder = 'New project name'    
    nameContainer.append(newProject);
  }
}

function formReset() {
  form.reset()
  if (document.getElementById('new-project-name')) {
    nameContainer.removeChild(document.getElementById('new-project-name'))    
  }
}

function sendRequest(method, url, request, callback) {
  var req = new XMLHttpRequest()
  req.open(method, url, true)
  req.setRequestHeader("Content-Type", "application/json")
  req.send(JSON.stringify(request))
  req.onload = function() {
    callback()
  }
}

function handleSubmit(event) {  
  event.preventDefault()  
  var projectName;
  var newList = false;
  if (form.elements.project.value == 'New project') {        
    projectName = form.elements.project_name.value;    
    newList = true;
  } else {
    projectName = form.elements.project.value    
  }   
  var postData = {
    project_name: projectName,
    issue_title: form.elements.issue_title.value,
    issue_text: form.elements.issue_text.value,
    created_by: form.elements.created_by.value,
    assigned_to: form.elements.assigned_to.value,
    status_text: form.elements.status_text.value    
  }
  sendRequest('POST', url + projectName, postData, function() {
    if (newList) {            
      makeProjectsList()
      clearProjectsList()
    }
    formReset()    
    })  
    
  /*var req = new XMLHttpRequest()
  req.open('POST', url + projectName, true)
  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify(postData))  
  req.onload = function() {    
    jsonContainer.textContent = req.responseText
    if (newList) {            
      makeProjectsList()
      clearProjectsList()
    }
    formReset()    
    }  */
}

function handleUpdate(event) {
  event.preventDefault()  
  var putData = {
    _id: updateForm.elements._id.value,
    issue_title: updateForm.elements.issue_title.value,
    issue_text: updateForm.elements.issue_text.value,
    created_by: updateForm.elements.created_by.value,
    assigned_to: updateForm.elements.assigned_to.value,
    status_text: updateForm.elements.status_text.value,    
    open: updateForm.elements.open.value
  }
  sendRequest('PUT', url, putData, function() {
    updateForm.reset()    
  })
  
  /*var req = new XMLHttpRequest();
  req.open('PUT', url, true)
  req.setRequestHeader("Content-Type", "application/json")
  req.send(JSON.stringify(putData))
  req.onload = function() {
    jsonContainer.textContent = req.responseText
    updateForm.reset()    
  }*/
}

function handleDelete(event) {
  event.preventDefault()
  sendRequest('DELETE', url, {_id: deleteForm.elements._id.value}, function() {
    deleteForm.reset()
  })
  /*
  var req = new XMLHttpRequest()
  req.open('DELETE', url, true)
  req.setRequestHeader("Content-Type", "application/json")
  req.send(JSON.stringify({_id: deleteForm.elements._id.value}))
  req.onload = function() {
    jsonContainer.textContent = req.responseText
    deleteForm.reset()
  } */ 
}

function makeProjectsList() {
  // Request unique project names
  var req = new XMLHttpRequest()
  req.open('GET', '/api/projects', true)
  req.send()
  req.onload = function() {
    var projects = JSON.parse(req.response).sort()
    var fragment = document.createDocumentFragment();    
    // Create default item in dropdown list
    var el = document.createElement('option');
    el.defaultSelected = 'true';
    el.disabled = 'disabled'
    el.innerText = 'Select Project';    
    fragment.appendChild(el)    
    // Create list of current projects from database request
    projects.forEach(function(name) {
      el = document.createElement('option');
      el.innerText = name;
      el.type = 'text';
      el.name = 'project_name';
      el.value = name;      
      fragment.appendChild(el)      
    })
    // Create option for New Project
    el = document.createElement('option');    
    el.innerText = 'NEW PROJECT';
    el.type = 'text';
    el.name = 'project_name';
    el.value = 'New project';    
    fragment.appendChild(el)    
    // Append all to DOM
    project.appendChild(fragment)
  }
}

function clearProjectsList() {
  while (project.firstChild) {
    project.removeChild(project.firstChild)
  }  
}


makeProjectsList()
project.addEventListener('change', checkForNewProject)
form.addEventListener('submit', handleSubmit)
updateForm.addEventListener('submit', handleUpdate)
deleteForm.addEventListener('submit', handleDelete)
    