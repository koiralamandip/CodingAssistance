document.addEventListener('DOMContentLoaded', dl);

function dl(e){
  Globals.init();
  document.getElementById('newCanvasBtn').addEventListener('click', newCanvasLoader);
  // document.getElementById('block-container').style.height = window.innerHeight - 50 + "px";
  var container = BlockContainer.init('block-container');
  BlockContainer.setSampleBlocks(container);
}

function newProject(){
  Globals.newProject();
  newCanvasLoad();
}

function addProject(){
  var jsonData = window.prompt("Paste the JSON of a project here", '');
  try{
    var object = JSON.parse(jsonData);
    Globals.deserialize(object);
  }catch(e){
    Window.alert("Erorr parsing");
  }
}

// function openProject(projectID){
//   var xmlHttp = new XMLHttpRequest();
//   xmlHttp.open('POST', '../ajax/openProject-ajax.php', true);
//   var data = new FormData();
//   data.append('open', true);
//   data.append('load', projectID);
//   xmlHttp.send(data);

//   xmlHttp.onreadystatechange = function(){
//     if (xmlHttp.readyState == 4){
//       if (xmlHttp.responseText != false){
//         var object = JSON.parse(xmlHttp.responseText);
//         Globals.deserialize(object);
//       }else{
//         window.location.href = "dashboard";
//       }
//     }
//   }
// }

// function saveProject(){
//   var object = Globals.serialize();
//   object = JSON.stringify(object);
//   var further = false;
//   var projectName = "";
//   do{
//    projectName = window.prompt('Enter Project Name', '');
//     if (!(projectName.trim() == "")){
//       further = true;
//     }
//   }while(!further);

//   var xmlHttp = new XMLHttpRequest();
//   xmlHttp.open('POST', '../ajax/saveProject-ajax.php', true);
//   var data = new FormData();
//   data.append('save', true);
//   data.append('object', object);
//   data.append('projectName', projectName);
//   xmlHttp.send(data);

//   xmlHttp.onreadystatechange = function(){
//     if (xmlHttp.readyState == 4){
//       alert(xmlHttp.responseText);
//     }
//   }
// }

function compileProject(){
  Globals.compileProject();
  var jscode = Globals.withSyntaxHighlight(Globals.jscode);
  var pycode = Globals.withSyntaxHighlight(Globals.pycode);
  document.getElementById('console').innerHTML = "<pre>" + jscode + "</pre>";
  document.getElementById('console1').innerHTML = "<pre>" + pycode + "</pre>";
}

function compileCurrent(){
  Globals.compileCurrent();
  var jscode = Globals.withSyntaxHighlight(Globals.currentCanvas.jscode);
  var pycode = Globals.withSyntaxHighlight(Globals.currentCanvas.pycode);
  document.getElementById('console').innerHTML = "<pre>" + jscode + "</pre>";
  document.getElementById('console1').innerHTML = "<pre>" + pycode + "</pre>";
}


function runProject(){
  Globals.runProject();
}


function runCurrent(){
  Globals.runCurrent();
}

function newCanvasLoader(e){
  let canvas = new Canvas("#fff");
  if (Globals.currentCanvas) Globals.currentCanvas.detach();
  canvas.addTo('canvas');
  let tab = new CanvasTab(canvas);
  tab.append();
}

function newCanvasLoad(){
  let canvas = new Canvas("#fff");
  canvas.addTo('canvas');
  let tab = new CanvasTab(canvas);
  tab.append();
}

function getData(){
    var object = Globals.serialize();
    object = JSON.stringify(object);
    document.getElementById("console2").innerHTML = object;
    window.prompt('Copy the following JSON. You can use it to add this project to others', object);
}
