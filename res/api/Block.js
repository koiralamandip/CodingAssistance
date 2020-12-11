var indent = 4;
var blockHolderPosition = 0;
var spaces = "";
var keywords = ["var ", "for ", "while ", "do ", "if ", "else "];
var keywordTemp = ["$v$ar", "$f$or", "$w$hile", "$d$o", "$i$f", "$e$lse"];
var paranthesis = ["(", ")", "{", "}"];
var paranthesisTemp = ["~~", "~~~", "~?", "~?~"];

class Globals{
  static init(){
    Globals.tabContainerID = 'settings';
    Globals.tabList = [];
    Globals.jscode = "";
    Globals.pycode = "";
    Globals.idCount = 0;
    Globals.canvasCount = 0;
    Globals.currentCanvas = null;
    Globals.offsetHorizontal = 0;
    Globals.offsetVertical = 0;
    Globals.draggedBlock = null;
    Globals.canvasList = [];
    Globals.copyObject = "";
    NullHolder.list = [];
    Globals.classMap = {'CanvasTab' : CanvasTab, 'NullHolder' : NullHolder, 'BlockHolder' : BlockHolder, 'SelectionField' : SelectionField, 'TextField' : TextField, 'Block' : Block, 'StringBlock' : StringBlock,
                        'NumberBlock' : NumberBlock, 'BooleanBlock' : BooleanBlock, 'VariableBlock' : VariableBlock, 'DeclareBlock' : DeclareBlock, 'AssignBlock' : AssignBlock, 'InitializeBlock' : InitializeBlock,
                        'InputBlock' : InputBlock, 'InputWMBlock' : InputWMBlock, 'IntTypeCastBlock' : IntTypeCastBlock, 'StringTypeCastBlock' : StringTypeCastBlock, 'OutputBlock' : OutputBlock, 'ManualBlock' : ManualBlock,
                        'ConcatOperatorBlock' : ConcatOperatorBlock, 'ArithmeticOperatorBlock' : ArithmeticOperatorBlock, 'UnaryOperatorBlock' : UnaryOperatorBlock, 'PreIncDecOperatorBlock' : PreIncDecOperatorBlock,
                        'PostIncDecOperatorBlock' : PostIncDecOperatorBlock, 'LogicalOperatorBlock' : LogicalOperatorBlock, 'RelationalOperatorBlock' : RelationalOperatorBlock, 'ConditionBlock' : ConditionBlock, 'IfBlock' : IfBlock,
                        'IfElseBlock' : IfElseBlock, 'IfElseIfBlock' : IfElseIfBlock, 'ForBlock' : ForBlock, 'WhileBlock' : WhileBlock, 'DoWhileBlock' : DoWhileBlock, 'NewlineBlock' : NewlineBlock, 'BlockContainer' : BlockContainer,
                        'Canvas' : Canvas, 'BreakBlock' : BreakBlock, 'ContinueBlock' : ContinueBlock};
  }

  static setTabContainerID(id = "settings"){
    Globals.tabContainerID = id;
  }

  static newProject(){
    Globals.jscode = "";
    Globals.pycode = "";
    Globals.idCount = 0;
    Globals.canvasCount = 0;

    for (var canvasTab of Globals.tabList){
      for (var object of canvasTab.canvas.list){
        object.getObject().parentNode.removeChild(object.getObject());
      }
      Globals.currentCanvas = canvasTab.canvas;
      Globals.currentCanvas.addTo('canvas');
      Globals.currentCanvas.detach();
      canvasTab.getObject().parentNode.removeChild(canvasTab.getObject());
    }
    Globals.currentCanvas = null;
    Globals.tabList.length = 0;
    Globals.canvasList.length = 0;
    Globals.copyObject = "";
    NullHolder.list.length = 0;
  }

  static serialize(){
    var object = {};
    var count = 0;
    for (var canvas of Globals.canvasList){
      Globals.currentCanvas.detach();
      canvas.addTo(canvas.containerID);
      object['canvas' + (++count)] = canvas.serialize();
    }
    return object;
  }

  static deserialize(object){
    for (var id in object){
      var canvas = new Canvas(object[id].backgroundColor);
      if (Globals.currentCanvas)
      Globals.currentCanvas.detach();
      canvas.addTo(object[id].containerID);
      for (var blockId in object[id].blocks){
        var blockTemp = object[id].blocks[blockId];
        var block = new Globals.classMap[blockTemp.class](blockTemp.isSample, blockTemp.isDraggable, blockTemp.inCanvas);
        block.deserialize(blockTemp);
        Globals.currentCanvas.getObject().appendChild(block.getObject());
      }
      var tab = new CanvasTab(canvas);
      tab.append();
    }
  }

  static compileProject(){
    Globals.jscode = "";
    Globals.pycode = "";
    for (var canvas of Globals.canvasList){
      Globals.currentCanvas.detach();
      canvas.addTo(canvas.containerID);
      compileCurrent();
      Globals.jscode += canvas.jscode;
      Globals.pycode += canvas.pycode;
    }
  }

  static runProject(){
    setTimeout(Globals.jscode, 1);
  }

  static compileCurrent(){
    var compileList = [];
    for (var object of Globals.currentCanvas.list){
      if (object != null){
        if (parseInt(object.getObject().style.left) < 0){
          object.getObject().style.left = 0;
        }
        if (parseInt(object.getObject().style.top) < 0){
          object.getObject().style.top = 0 + "px";
        }
        if (object.getInCanvas()){
          compileList.push(object);
        }
      }
    }

    for (var i = compileList.length - 1; i >= 0; i--){
      for (var j = 1; j <= i; j++){
        if (compileList[j - 1].getObject().offsetTop > compileList[j].getObject().offsetTop){
          var temp = compileList[j-1];
          compileList[j-1] = compileList[j];
          compileList[j] = temp;
        }
      }
    }

    var jscode = "";
    var pycode = "";

    for (object of compileList){
      jscode += object.getValue() + "\n";
      pycode += object.getPythonValue() + "\n";
      var children = object.getObject().children;
      jscode += Globals.getChildrenValue(children, jscode, Globals.currentCanvas) + "\n";
      pycode += Globals.getChildrenPythonValue(children, pycode, Globals.currentCanvas ) + "\n";
    }

    Globals.currentCanvas.jscode = jscode;
    Globals.currentCanvas.pycode = pycode;
  }

  static runCurrent(){
    setTimeout(Globals.currentCanvas.jscode, 1);
  }

  static getChildrenValue(children, code, canvas){
    var codes = "";
    for (var child of children){
      if (child.className == "containerBlock"){
        codes += canvas.getJSObjectOf(child).getValue() + "\n";
        var grandChildren = child.children;
        codes += Globals.getChildrenValue(grandChildren, code, canvas);
      }
    }
    return codes;
  }

  static getChildrenPythonValue(children, code, canvas){
    var codes = "";
    for (var child of children){
      if (child.className == "containerBlock"){
        codes += canvas.getJSObjectOf(child).getPythonValue() + "\n";
        var grandChildren = child.children;
        codes += Globals.getChildrenPythonValue(grandChildren, code, canvas);
      }
    }
    return codes;
  }

  static withSyntaxHighlight(code){
    for (var count = 0; count < paranthesis.length; count++){
      var time = code.split(paranthesis[count]).length - 1;
      for (var i = 0; i < time; i++){
            code = code.replace(paranthesis[count], "<span><font color='maroon'>" + paranthesisTemp[count] + "</font></span>");
      }

      for (var i = 0; i < time; i++){
            code = code.replace(paranthesisTemp[count], paranthesis[count]);
      }
    }

    for (var count = 0; count < keywords.length; count++){
      var time = code.split(keywords[count]).length - 1;
      for (var i = 0; i < time; i++){
            code = code.replace(keywords[count], "<span><font color='blue'>" + keywordTemp[count] + "</font></span>");
      }

      for (var i = 0; i < time; i++){
            code = code.replace(keywordTemp[count], keywords[count]);
      }
    }

    return code;
  }
}

class CanvasTab{
  constructor(canvas){
    this.id = ++Globals.canvasCount;
    this.canvas = canvas;
    this.canvas.containerID = Globals.currentCanvas.containerID;
    this.onClickListener = this.clicked.bind(this);
    this.object = this.createCanvasTab();
    Globals.tabList.push(this);
  }

  setSelectionColor(color){
    this.getObject().style.backgroundColor = color;
  }

  createCanvasTab(){
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', "Canvas" + this.id);
    button.addEventListener('click', this.onClickListener);
    return button;
  }

  append(){
    document.getElementById(Globals.tabContainerID).appendChild(this.getObject());
  }

  getObject(){
    return this.object;
  }

  clicked(e){
    // var containerID = Globals.currentCanvas.containerID;
    Globals.currentCanvas.detach();
    this.canvas.addTo(this.canvas.containerID);
  }
}
//==========================================================================================================================================================

class NullHolder{
  constructor(filter = [], invert = false){
    this.filter = filter;
    this.invert = invert;
    if (filter.length == 0) this.invert = true;
    this.object = this.createObject();
    this.innerObject = null;
    this.onDragOverListener = this.onDragOver.bind(this);
    this.onDragLeaveListener = this.onDragLeave.bind(this);
    this.onDropListener = this.onDrop.bind(this);
    this.setDropzone();
    NullHolder.push(this);
  }

  deserialize(nullHolder){
    this.invert = nullHolder.invert;
    var innerObject = new Globals.classMap[nullHolder.innerObject.class](nullHolder.innerObject.isSample, nullHolder.innerObject.isDraggable, nullHolder.innerObject.inCanvas);
    innerObject.deserialize(nullHolder.innerObject);
    this.setInnerObject(innerObject);
  }

  serialize(){
    let object = {
      class : 'NullHolder',
      filter : this.filter,
      invert : this.invert,
      innerObject : this.innerObject.serialize()
    }
    return object;
  }

  static push(nullHolder){
    NullHolder.list.push(nullHolder);
  }

  static getNullHolder(object){
    for (var holder of NullHolder.list){
      if (holder.getObject() == object){
        return holder;
      }
    }

    return false;
  }

  createObject(){
    var holder = document.createElement('div');
    holder.className = "nullHolder";
    holder.setAttribute('title', 'Drag a block here');
    holder.style="min-height:18px;min-width:15px;padding:0px 5px;margin:5px;border-radius:7px;box-shadow:0px 0px 1px 2px #eee;background-color:rgba(0,0,0,0.3);";
    return holder;
  }

  getInnerObject(){ return this.innerObject; }

  setInnerObject(innerObject){
    var currentObject = this.getInnerObject();
    if (currentObject != null){
      Globals.currentCanvas.getObject().appendChild(currentObject.getObject());
      currentObject.setPosition('absolute');
    }
    this.innerObject = innerObject;
    if (innerObject != null) this.getObject().appendChild(innerObject.getObject());
  }

  getValue(){
    return this.getInnerObject().getValue();
  }

  getPythonValue(){
    return this.getInnerObject().getPythonValue();
  }

  getObject(){ return this.object; }
  setObject(object){ this.object = object; }

  setDropzone(dropzone = true){
    if (dropzone){
      this.getObject().addEventListener('dragover', this.onDragOverListener);
      this.getObject().addEventListener('drop', this.onDropListener);
      this.getObject().addEventListener('dragleave', this.onDragLeaveListener);
    }else{
      this.getObject().removeEventListener('dragover', this.onDragOverListener);
      this.getObject().removeEventListener('drop', this.onDropListener);
      this.getObject().removeEventListener('dragleave', this.onDragLeaveListener);
    }
  }

  onDragOver(e){
    // To-do code goes here
    e.preventDefault();
    e.stopPropagation();
    var dragBlock = Globals.draggedBlock;
    if (dragBlock instanceof DependentBlock){
      var canDrag = this.invert ? true : false;
      console.log(this.filter);
      for (var filter of this.filter){
        if (dragBlock instanceof filter){
          canDrag = !canDrag;
          break;
        }
      }
      if (dragBlock instanceof OperatorBlock) canDrag = true;
      if (canDrag) this.getObject().style.boxShadow = "0px 0px 10px 10px #40FF00";
    }
  }

  onDragLeave(e){
    this.getObject().style.boxShadow = "0px 0px 1px 2px #fff";
  }

  onDrop(e){
    // To-do code goes here
    e.stopPropagation();
    this.getObject().style.boxShadow = "0px 0px 1px 2px #fff";
    var dragBlock = Globals.draggedBlock;
    if (dragBlock instanceof DependentBlock){
      var canDrag = this.invert ? true : false;
      for (var filter of this.filter){
        if (dragBlock instanceof filter){
          canDrag = !canDrag;
          break;
        }
      }
      if (dragBlock instanceof OperatorBlock) canDrag = true;
      if (canDrag) dragBlock.droppedInNullHolder(e, this);
    }
  }
}

//==========================================================================================================================================================

class BlockHolder extends NullHolder{
  constructor(filter = [], invert = false){
    super(filter, invert);
    this.getObject().style.backgroundColor = "white";
    this.getObject().style.padding = " 3px 3px";
    this.getObject().style.borderRadius = "5px 0px 0px 5px";
    this.getObject().style.margin = "5px 0px";
    this.getObject().style.minWidth = "50%";
    this.getObject().style.boxShadow = "-2px 0px 0px 1px #eee";
  }

  deserialize(nullHolder){
    this.invert = nullHolder.invert;
    var innerObject = new Globals.classMap[nullHolder.innerObject.class](nullHolder.innerObject.isSample, nullHolder.innerObject.isDraggable, nullHolder.innerObject.inCanvas);
    innerObject.deserialize(nullHolder.innerObject);
    this.setInnerObject(innerObject);
  }

  serialize(){
    let object = {
      class : 'BlockHolder',
      filter : this.filter,
      invert : this.invert,
      innerObject : this.innerObject.serialize()
    }
    return object;
  }

  onDragOver(e){
    // To-do code goes here
    e.preventDefault();
    e.stopPropagation();
    // var dragBlock = Globals.draggedBlock;
    // var canDrag = this.invert ? true : false;
    // for (var filter of this.filter){
    //     if (dragBlock instanceof filter){
    //       canDrag = !canDrag;
    //       break;
    //     }
    // }
    // if (dragBlock instanceof OperatorBlock) canDrag = true;
    // if (canDrag) this.getObject().style.boxShadow = "0px 0px 10px 10px #40FF00";
  }

  onDragLeave(e){
    this.getObject().style.boxShadow = "none";
  }

  onDrop(e){
    // To-do code goes here
    e.stopPropagation();
    // this.getObject().style.boxShadow = "0px 0px 1px 1px #fff";
    var dragBlock = Globals.draggedBlock;
    var canDrag = this.invert ? true : false;
    for (var filter of this.filter){
        if (dragBlock instanceof filter){
          canDrag = !canDrag;
          break;
        }
    }
    if (dragBlock instanceof OperatorBlock) canDrag = true;
    if (canDrag) dragBlock.droppedInBlockHolder(e, this);
  }

  getValue(){
    blockHolderPosition += 1;
    var spaceCount = indent * blockHolderPosition;
    spaces = "";
    for (var i = 0; i < spaceCount; i++){
      spaces += " ";
    }

    var value = spaces + super.getValue() + "\n";
    var children = this.getInnerObject().getObject().children;
    value += this.getChildrenValue(children, Globals.currentCanvas);
    blockHolderPosition -= 1;
    spaces = spaces.substring(0, spaces.length - 4);
    return value;
  }

  getPythonValue(){
    blockHolderPosition += 1;
    var spaceCount = indent * blockHolderPosition;
    spaces = "";
    for (var i = 0; i < spaceCount; i++){
      spaces += " ";
    }

    var value = spaces + super.getPythonValue() + "\n";
    var children = this.getInnerObject().getObject().children;
    value += this.getChildrenPythonValue(children, Globals.currentCanvas);
    blockHolderPosition -= 1;
    spaces = spaces.substring(0, spaces.length - 4);
    return value;
  }

  getChildrenValue(children, canvas){
    var codes = "";
    for (var child of children){
      if (child.className == "containerBlock"){
        codes += spaces + canvas.getJSObjectOf(child).getValue() + "\n";
        var grandChildren = child.children;
        codes += this.getChildrenValue(grandChildren, canvas);
      }
    }
    return codes;
  }

  getChildrenPythonValue(children, canvas){
    var codes = "";
    for (var child of children){
      if (child.className == "containerBlock"){
        codes += spaces + canvas.getJSObjectOf(child).getPythonValue() + "\n";
        var grandChildren = child.children;
        codes += this.getChildrenPythonValue(grandChildren, canvas);
      }
    }
    return codes;
  }

}
//==========================================================================================================================================================

class SelectionField{

  constructor(displayArray, valueArray){
    this.displayArray = displayArray;
    this.valueArray = valueArray;
    this.HTMLObject = this.createObject();
  }

  deserialize(selectionField){
    this.setValue(selectionField.value);
  }

  serialize(){
    let object = {
      class : 'SelectionField',
      value : this.getValue()
    }
    return object;
  }

  getObject(){
    return this.HTMLObject;
  }

  setDisplayArray(displayArray){
    this.displayArray = displayArray;
  }

  setValueArray(valueArray){
    this.valueArray = valueArray;
  }

  getValue(){
    return this.getObject().value;
  }

  setValue(value){
    this.getObject().value = value;
  }

  createObject(){
    var selectionField = document.createElement('select');
    selectionField.className = "selectionField";
    var style= "height:20px;min-width:5px;margin:2px 5px;border-radius:5px;text-align:center;border:none;box-shadow:0px 0px 1px 1px #eee;background-color:#ddd;";
    selectionField.style = style;
    for (var count = 0; count < this.displayArray.length; count++){
      var optionField = document.createElement('option');
      optionField.setAttribute('value', this.valueArray[count]);
      optionField.innerHTML = this.displayArray[count];
      selectionField.appendChild(optionField);
    }
    return selectionField;
  }
}

//==========================================================================================================================================================

class TextField{

  constructor(placeholder, value){
    this.placeholder = placeholder;
    this.HTMLObject = this.createObject(value);
    this.onKeyUpListener = this.onKeyUp.bind(this);
    this.onDoubleClickListener = this.onDoubleClick.bind(this);
    this.setGrowable();
    this.setWritable();
  }

  deserialize(textField){
    this.placeHolder = textField.placeHolder;
    this.getObject().placeHolder = textField.placeHolder;
    this.setValue(textField.value);
  }

  serialize(){
    let object = {
      class : 'TextField',
      placeHolder : this.placeholder,
      value : this.getValue(),
    }
    return object;
  }

  getObject(){ return this.HTMLObject; }

  getValue(){ return this.getObject().value; }
  setValue(value){ this.getObject().value = value; this.getObject().style.minWidth = ((value.length + 1) * 7) + 'px';}

  createObject(value){
    var textField = document.createElement('input');
    textField.setAttribute('type', 'text');
    textField.setAttribute('placeholder', this.placeholder);
    textField.setAttribute('readonly', 'readonly');
    textField.className = "textField";
    textField.value = value;
    textField.style= "height:10px;padding:5px 1px;width:50px;margin:0px 5px;border-radius:5px;text-align:center;border:none;box-shadow:0px 0px 1px 1px #eee;background-color:#ddd;";
    textField.style.minWidth = ((value.length + 1) * 7) + 'px';
    return textField;
  }

  setGrowable(growable = true){
    if (growable){
      this.getObject().addEventListener('keyup', this.onKeyUpListener);
    }else{
      this.getObject().removeEventListener('keyup', this.onKeyUpListener);
    }
  }

  setWritable(writable = true){
    if (writable){
      this.getObject().addEventListener('dblclick', this.onDoubleClickListener);
    }else{
      this.getObject().removeEventListener('dblclick', this.onDoubleClickListener);
    }
  }

  onDoubleClick(e){
    if (this.getObject().hasAttribute('readonly')){
      this.getObject().removeAttribute('readonly');
      this.getObject().style.backgroundColor = "white";
      this.getObject().style.boxShadow = "0px 0px 1px 3px #FCF9A4";
    }else{
      this.getObject().setAttribute('readonly', 'readonly');
      this.getObject().style.backgroundColor = "#ddd";
      this.getObject().style.boxShadow = "0px 0px 1px 3px #eee";
    }
  }

  onKeyUp(e){
    if (e.key == "Enter"){
      this.getObject().setAttribute('readonly', 'readonly');
      this.getObject().style.backgroundColor = "#ddd";
      this.getObject().style.boxShadow = "0px 0px 1px 3px #eee";
      return;
    }
    var textbox = this.getObject();
    textbox.style.minWidth = ((textbox.value.length + 1) * 7) + 'px';
  }
}

//==========================================================================================================================================================

class Block{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    this.isSample = isSample;
    this.isDraggable = isDraggable;
    this.inCanvas = inCanvas;
    this.id = "block_" + (++Globals.idCount);
    this.actualBlock = null;
    this.object = this.createObject();
    this.onDragStartListener = this.onDragStart.bind(this);
    this.onDragEndListener = this.onDragEnd.bind(this);
    this.onDragOverListener = this.onDragOver.bind(this);
    this.onDropListener = this.onDrop.bind(this);
    this.onContextMenuListener = this.onContextMenu.bind(this);
    this.setDraggable(this.isDraggable);
    if (!this.isSample) this.setAsDropzone();
  }

  onContextMenu(e){
    e.preventDefault();
    e.stopPropagation();
    var element = document.createElement('div');
    element.style="position:absolute;min-width:150px;padding:5px;box-shadow:0px 0px 5px 2px gray;background-color:#eee;display:flex;flex-flow:column wrap;justify-content:flex-start;align-items:center;";
    element.style.left = e.layerX + "px";
    element.style.top = e.layerY + "px";
    var node1 = document.createElement('div');
    node1.style = "width:100%;height:20px;padding:4px;";
    var block = this;
    node1.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      Globals.copyObject = block.serialize();
      block.getObject().removeChild(element);
    });
    node1.innerHTML = "Copy Block";
    element.appendChild(node1);

    if (block.inCanvas){
      var node2 = document.createElement('div');
      node2.style = "width:100%;height:20px;padding:4px;";
      node2.innerHTML = "Delete Block";
      node2.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        block.getObject().removeChild(element);
        Globals.currentCanvas.removeFromList(block);
        block.getObject().parentNode.removeChild(block.getObject());
      });
      element.appendChild(node2);
    }

    var node3 = document.createElement('div');
    node3.style = "width:100%;height:20px;padding:4px;";
    node3.innerHTML = "Cancel";
    node3.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      block.getObject().removeChild(element);
    });
    element.appendChild(node3);

    this.getObject().appendChild(element);
  }

  deserialize(children){
    for (var id in children){
      let blockTemp = children[id];
      let block = new Globals.classMap[blockTemp.class](blockTemp.isSample, blockTemp.isDraggable, blockTemp.inCanvas);
      block.deserialize(blockTemp);
      this.getObject().appendChild(block.getObject());
    }
  }

  serialize(){
    var objects = {};
    var children = this.getObject().children;
    var count = 0;
    for (var child of children){
      if (child.className == 'containerBlock'){
        let block = Globals.currentCanvas.getJSObjectOf(child);
        objects['child' + (++count)] = block.serialize();
      }
    }

    return objects;
  }

  createObject(){
    var containerBlock = document.createElement('div');
    containerBlock.className = "containerBlock";
    containerBlock.style="margin:5px 0px;background-color:#eee;border-radius:50%;display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-start;";
    var block = document.createElement('div');
    block.className = "block";
    this.actualBlock = block;
    block.style="height:18px;display:flex;padding:3px;font-variant-caps:petite-caps;flex-flow:row nowrap;justify-content:flex-start;align-items:center;border-radius:5px;box-shadow:0px 0px 1px 2px red;background-color:maroon;";
    containerBlock.appendChild(block);
    return containerBlock;
  }

  setInCanvas(inCanvas){ this.inCanvas = inCanvas; }
  getInCanvas(){ return this.inCanvas; }
  getPosition(){ return this.getObject().style.position; }
  setPosition(position){ this.getObject().style.position = position; }

  getObject(){ return this.object; }
  setObject(object){ this.object = object; }

  getActualBlock(){
    return this.actualBlock;
  }

  getX(){ return this.getObject().style.offsetLeft; }
  setX(xPos){ this.getObject().style.left = xPos + "px"; }

  getY(){ return this.getObject().style.offsetTop; }
  setY(yPos){ this.getObject().style.top = yPos + "px"; }

  setLocation(xPos, yPos){ this.setX(xPos); this.setY(yPos); }

  updateLocation(event, dropzone){
    var xPos = event.clientX - dropzone.offsetLeft - Globals.offsetHorizontal;
    var yPos =  event.clientY - dropzone.offsetTop - Globals.offsetVertical;
    this.setLocation(xPos, yPos);
  }

  setDraggable(draggable = true){
    if (draggable){
      this.getObject().draggable = true;
      this.getObject().addEventListener('dragstart', this.onDragStartListener);
      this.getObject().addEventListener('dragend', this.onDragEndListener);
      this.getObject().addEventListener('contextmenu', this.onContextMenuListener);
      this.getObject().style.opacity = "1";
    }else{
      this.getObject().draggable = false;
      this.getObject().removeEventListener('dragstart', this.onDragStartListener);
      this.getObject().removeEventListener('dragend', this.onDragEndListener);
      this.getObject().style.opacity = "0.61";
    }
  }

  setAsDropzone(dropzone = true){
    if (dropzone){
      this.getObject().addEventListener('dragover', this.onDragOverListener);
      this.getObject().addEventListener('drop', this.onDropListener);
    }else{
      this.getObject().removeEventListener('dragover', this.onDragOverListener);
      this.getObject().removeEventListener('drop', this.onDropListener);
    }
  }

  onDragStart(e){
    e.stopPropagation();
    // WorkingArea.workingArea.style.backgroundColor = "#333";
    e.dataTransfer.setData('targetID', this.id);
    Globals.draggedBlock = this;

    if (!this.isSample){
      Globals.offsetHorizontal = e.clientX - this.getObject().parentNode.offsetLeft - this.getObject().offsetLeft;
      Globals.offsetVertical = e.clientY - this.getObject().parentNode.offsetTop - this.getObject().offsetTop;
    }else{
      Globals.offsetHorizontal = e.clientX  - this.getObject().offsetLeft;
      Globals.offsetVertical = e.clientY + this.getObject().parentNode.scrollTop - this.getObject().offsetTop;
    }
  }

  onDragEnd(e){ //WorkingArea.workingArea.style.backgroundColor = WorkingArea.backgroundColor;}
  }

  onDragOver(e){
    e.preventDefault();
    e.stopPropagation();
  }

  onDrop(e){
    e.stopPropagation();
    // WorkingArea.workingArea.style.backgroundColor = WorkingArea.backgroundColor;
    var dragBlock = Globals.draggedBlock;

    // this.getObject().appendChild(dragBlock.getObject());
    if (dragBlock == this){
      dragBlock.updateLocation(e, Globals.currentCanvas.getObject());
      return;
    }

    if (!(this instanceof DependentBlock)){
      dragBlock.droppedInBlock(e, this);
    }
  }

  droppedInBlock(e, dropZoneBlock, block){
    if (!this.isSample){
      // Existing block dropped in Block
      block = this;
    }else{
      // New block dropped in Block
      Globals.currentCanvas.push(block);
    }

    block.setInCanvas(false);
    dropZoneBlock.getObject().appendChild(block.getObject());
    Globals.draggedBlock = null;
    // block.setAssociatedCanvas(Globals.currentCanvas);
    block.setPosition('');
  }


  droppedInBlockHolder(e, blockHolder){
    if (!this.isSample){
      // Existing block dropped in NullHolder
      var block = this;
      blockHolder.setInnerObject(block);
      block.setInCanvas(false);
      block.setPosition('');
      block.setLocation(e.clientX - Globals.currentCanvas.getObject().offsetLeft, e.clientY - Globals.currentCanvas.getObject().offsetTop);
      // block.setAsDropzone(false);
      // console.log(block);

      // block.setAssociatedCanvas(Globals.currentCanvas);
      Globals.draggedBlock = null;
    }
  }



  droppedInNullHolder(e, nullHolder, block){
    if (!this.isSample){
      // Existing block dropped in NullHolder
      block = this;
    }else{
      // New block dropped in NullHolder
      Globals.currentCanvas.push(block);
    }

    nullHolder.setInnerObject(block);
    block.setInCanvas(false);
    block.setPosition('');
    block.setLocation(e.clientX - Globals.currentCanvas.getObject().offsetLeft, e.clientY - Globals.currentCanvas.getObject().offsetTop);
    block.setAsDropzone(false);
    console.log(block);

    // block.setAssociatedCanvas(Globals.currentCanvas);
    Globals.draggedBlock = null;
  }

  droppedInCanvas(e, block){
    if (!this.isSample){
      // If existing block dropped in Canvas
      block = this;

      if (NullHolder.getNullHolder(block.getObject().parentNode)){
        NullHolder.getNullHolder(block.getObject().parentNode).setInnerObject(null);
      }

      if (block.getInCanvas()){
        // Update location of block for Block dropped into Canvas from Canvas itself
        block.updateLocation(e, Globals.currentCanvas.getObject());
      }else{
        block.setLocation(e.clientX - Globals.currentCanvas.getObject().offsetLeft, e.clientY - Globals.currentCanvas.getObject().offsetTop);
      }

    }else{
      // New block dropped in Canvas
      block.updateLocation(e, Globals.currentCanvas.getObject());
      Globals.currentCanvas.push(block);
    }

    block.setPosition('absolute');
    block.setInCanvas(true);
    Globals.currentCanvas.getObject().appendChild(block.getObject());
    // block.setAssociatedCanvas(Globals.currentCanvas);
    Globals.draggedBlock = null;

  }
}

//==========================================================================================================================================================

class DependentBlock extends Block{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.setAsDropzone(false);
  }
}

//==========================================================================================================================================================

class IndependentBlock extends Block{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
  }
}

//==========================================================================================================================================================

class StringBlock extends DependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.textField = new TextField("String", "Hello World!");
    this.setObject(this.createStringObject());
  }

  deserialize(block){
    Globals.currentCanvas.push(this);
    this.getObject().style.left = block.htmlLeft;
    this.setPosition(block.position);
    this.getObject().style.top = block.htmlTop;
    this.textField.deserialize(block.textField);
  }

  serialize(){
    let object = {
      class : 'StringBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      textField : this.textField.serialize()
    }
    return object;
  }

  createStringObject(){
    var object = super.getActualBlock();
    object.style.backgroundColor = "limegreen";
    object.style.boxShadow = "0px 0px 1px 2px springgreen";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    var textNode = document.createTextNode("\"");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    object.appendChild(this.textField.getObject());
    var textHolder2 = document.createElement('span');
    textHolder2.style.color = "white";
    var textNode2 = document.createTextNode("\"");
    textHolder2.appendChild(textNode2);
    object.appendChild(textHolder2);

    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new StringBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new StringBlock(false);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new StringBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "\"" + this.textField.getValue() + "\"";
  }

  getPythonValue(){
    return "\"" + this.textField.getValue() + "\"";
  }
}

//==========================================================================================================================================================

class NumberBlock extends DependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.textField = new TextField("Number", 5);
    this.setObject(this.createNumberObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.textField.deserialize(block.textField);
  }

  serialize(){
    let object = {
      class : 'NumberBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      textField : this.textField.serialize()
    }
    return object;
  }

  createNumberObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "royalblue";
    object.style.boxShadow = "0px 0px 1px 2px deepskyblue";
    object.appendChild(this.textField.getObject());
    return this.getObject();
  }

  getValue(){
    return  this.textField.getValue();
  }

  getPythonValue(){
    return  this.textField.getValue();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new NumberBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new NumberBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e, block){
    var block = new NumberBlock(false, true);
    super.droppedInCanvas(e, block);
  }
}

//==========================================================================================================================================================

class BooleanBlock extends DependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.selectionField = new SelectionField(["True", "False"], ["True", "False"]);
    this.setObject(this.createBooleanObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.selectionField.deserialize(block.selectionField);
  }

  serialize(){
    let object = {
      class : 'BooleanBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      selectionField : this.selectionField.serialize()
    }
    return object;
  }

  createBooleanObject(){
    var object = this.getActualBlock();
    object.style.paddingLeft = "15px";
    object.style.backgroundColor = "Fuchsia";
    object.style.boxShadow = "0px 0px 1px 2px violet";
    object.appendChild(this.selectionField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new BooleanBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new BooleanBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e, block){
    var block = new BooleanBlock(false, true);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return this.selectionField.getValue().toLowerCase();
  }

  getPythonValue(){
    return this.selectionField.getValue();
  }
}

//==========================================================================================================================================================

class VariableBlock extends DependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.textField = new TextField("Variable Name", "variable1");
    this.setObject(this.createVariableObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.textField.deserialize(block.textField);
  }

  serialize(){
    let object = {
      class : 'VariableBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      textField : this.textField.serialize()
    }
    return object;
  }

  createVariableObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "yellowgreen";
    object.style.boxShadow = "0px 0px 1px 2px #b8dc6f";
    object.appendChild(this.textField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new VariableBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new VariableBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e, block){
    var block = new VariableBlock(false, true);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return this.textField.getValue();
  }

  getPythonValue(){
    return this.textField.getValue();
  }
}

//==========================================================================================================================================================

class DeclareBlock extends IndependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.variableField = new VariableBlock(false, false);
    // this.typeField = new SelectionField(["String", "Integer", "Boolean"], ["string", "integer", "boolean"]);
    this.setObject(this.createDeclareObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.variableField.deserialize(block.variableField);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'DeclareBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      variableField : this.variableField.serialize(),
      children : childObjects
    }
    return object;
  }

  createDeclareObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "Teal";
    object.style.boxShadow = "0px 0px 1px 2px lightseagreen";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("create");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    object.appendChild(this.variableField.getObject());
    // object.appendChild(this.typeField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new DeclareBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInCanvas(e){
    var block = new DeclareBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "var " + this.variableField.getValue() + ";";
  }

  getPythonValue(){
    return this.variableField.getPythonValue() + " = 0";
  }
}

//==========================================================================================================================================================

class AssignBlock extends IndependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.variableField = new VariableBlock(false, false);
    this.valueField = new NullHolder();
    this.setObject(this.createAssignObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.variableField.deserialize(block.variableField);
    nBlock.valueField.deserialize(block.valueField);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'AssignBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      variableField : this.variableField.serialize(),
      valueField : this.valueField.serialize(),
      children : childObjects
    }
    return object;
  }

  createAssignObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "Teal";
    object.style.boxShadow = "0px 0px 1px 2px lightseagreen";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("set");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    object.appendChild(this.variableField.getObject());
    var textHolder2 = document.createElement('span');
    textHolder2.style.color = "white";
    textHolder2.style.marginRight = "5px";
    textHolder2.style.marginLeft = "5px";
    var textNode2 = document.createTextNode("to");
    textHolder2.appendChild(textNode2);
    object.appendChild(textHolder2);
    object.appendChild(this.valueField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new AssignBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInCanvas(e){
    var block = new AssignBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return this.variableField.getValue() + " = " + this.valueField.getValue() + ";";
  }

  getPythonValue(){
    return this.variableField.getPythonValue() + " = " + this.valueField.getPythonValue();
  }
}

//==========================================================================================================================================================

class InitializeBlock extends IndependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.variableField = new VariableBlock(false, false);
    // this.typeField = new SelectionField(["String", "Integer", "Boolean"], ["string", "integer", "boolean"]);
    this.valueField = new NullHolder();
    this.setObject(this.createInitializeObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.variableField.deserialize(block.variableField);
    nBlock.valueField.deserialize(block.valueField);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'InitializeBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      variableField : this.variableField.serialize(),
      valueField : this.valueField.serialize(),
      children : childObjects
    }
    return object;
  }

  createInitializeObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "Teal";
    object.style.boxShadow = "0px 0px 1px 2px lightseagreen";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("create");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    object.appendChild(this.variableField.getObject());
    // object.appendChild(this.typeField.getObject());
    var textHolder2 = document.createElement('span');
    textHolder2.style.color = "white";
    textHolder2.style.marginRight = "5px";
    textHolder2.style.marginLeft = "5px";
    var textNode2 = document.createTextNode("with");
    textHolder2.appendChild(textNode2);
    object.appendChild(textHolder2);
    object.appendChild(this.valueField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new InitializeBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInCanvas(e){
    var block = new InitializeBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "var " + this.variableField.getValue() + " = " + this.valueField.getValue() + ";";
  }

  getPythonValue(){
    return this.variableField.getPythonValue() + " = " + this.valueField.getPythonValue();
  }
}

//==========================================================================================================================================================

class InputBlock extends DependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.setObject(this.createInputObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
  }

  serialize(){
    let object = {
      class : 'InputBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position
    }
    return object;
  }

  createInputObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "#ddeedd";
    object.style.boxShadow = "0px 0px 1px 2px #b5e7a0";
    var textHolder = document.createElement('span');
    // textHolder.style.color = "slategray";
    textHolder.style.fontWeight = "bolder";
    textHolder.style.margin = "5px";
    var textNode = document.createTextNode("ask user");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new InputBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new InputBlock(false);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new InputBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "window.prompt('','')";
  }

  getPythonValue(){
    return "raw_input()";
  }
}

//==========================================================================================================================================================

class InputWMBlock extends DependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.messageField = new NullHolder();
    this.setObject(this.createInputObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.messageField.deserialize(block.messageField);
  }

  serialize(){
    let object = {
      class : 'InputWMBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      messageField : this.messageField.serialize()
    }
    return object;
  }

  createInputObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "#ddeedd";
    object.style.boxShadow = "0px 0px 1px 2px #b5e7a0";
    var textHolder = document.createElement('span');
    // textHolder.style.color = "slategray";
    textHolder.style.fontWeight = "bolder";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("ask user with");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    object.appendChild(this.messageField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new InputWMBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new InputWMBlock(false);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new InputWMBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "window.prompt(" + this.messageField.getValue() + ",'')";
  }

  getPythonValue(){
    return "raw_input(" + this.messageField.getPythonValue() + ")";
  }
}


class StringTypeCastBlock extends DependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.messageField = new NullHolder();
    this.setObject(this.createInputObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.messageField.deserialize(block.messageField);
  }

  serialize(){
    let object = {
      class : 'StringTypeCastBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      messageField : this.messageField.serialize()
    }
    return object;
  }

  createInputObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "#87bdd8";
    object.style.boxShadow = "0px 0px 1px 2px #cfe0e8";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("to string");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    object.appendChild(this.messageField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new StringTypeCastBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new StringTypeCastBlock(false);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new StringTypeCastBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "String(" + this.messageField.getValue() + ")";
  }

  getPythonValue(){
    return "str(" + this.messageField.getPythonValue() + ")";
  }
}


class IntTypeCastBlock extends DependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.messageField = new NullHolder();
    this.setObject(this.createInputObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.messageField.deserialize(block.messageField);
  }

  serialize(){
    let object = {
      class : 'IntTypeCastBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      messageField : this.messageField.serialize()
    }
    return object;
  }

  createInputObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "#87bdd8";
    object.style.boxShadow = "0px 0px 1px 2px #cfe0e8";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("to number");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    object.appendChild(this.messageField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new IntTypeCastBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new IntTypeCastBlock(false);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new IntTypeCastBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "parseInt(" + this.messageField.getValue() + ")";
  }

  getPythonValue(){
    return "int(" + this.messageField.getPythonValue() + ")";
  }
}

//==========================================================================================================================================================

class OutputBlock extends IndependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.variableField = new NullHolder();
    this.setObject(this.createOutputObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.variableField.deserialize(block.variableField);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'OutputBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      variableField : this.variableField.serialize(),
      children : childObjects
    }
    return object;
  }

  createOutputObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "#ddeedd";
    object.style.boxShadow = "0px 0px 1px 2px #b5e7a0";
    var textHolder = document.createElement('span');
    // textHolder.style.color = "slategray";
    textHolder.style.fontWeight = "bolder";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("output");
    textHolder.appendChild(textNode);
    object.appendChild(textHolder);
    object.appendChild(this.variableField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new OutputBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInCanvas(e){
    var block = new OutputBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "window.alert(" + this.variableField.getValue() + ");";
  }

  getPythonValue(){
    return "print(" + this.variableField.getValue() + ")";
  }
}


class ManualBlock extends IndependentBlock{

  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.codeArea = document.createElement('textarea');
    this.setObject(this.createOutputObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.codeArea.value = block.code;
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'ManualBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      code : this.codeArea.value,
      children : childObjects
    }
    return object;
  }

  createOutputObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "#B4045F";
    object.style.boxShadow = "0px 0px 1px 2px #FE2E9A";
    object.style.width = "auto";
    object.style.height  = "auto";
    object.style.display = "flex";
    object.style.flexFlow = "row wrap";
    this.codeArea.placeholder = "Write code manually in specific language of your choice";
    // var textHolder = document.createElement('span');
    // textHolder.style.color = "white";
    // textHolder.style.marginRight = "5px";
    // var textNode = document.createTextNode("output");
    // textHolder.appendChild(textNode);
    // object.appendChild(textHolder);
    object.appendChild(this.codeArea);
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new ManualBlock(false);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInCanvas(e){
    var block = new ManualBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return this.codeArea.value;
  }

  getPythonValue(){
    return this.codeArea.value;
  }
}

//==========================================================================================================================================================

class OperatorBlock extends DependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
  }
}

//==========================================================================================================================================================

class ConcatOperatorBlock extends OperatorBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.firstValueField = new NullHolder();
    this.operatorField = new TextField(['+'], ['+']);
    this.operatorField.getObject().disabled = true;
    this.secondValueField = new NullHolder();
    this.setObject(this.createOperatorObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.firstValueField.deserialize(block.firstValueField);
    nBlock.operatorField.deserialize(block.operatorField);
    nBlock.secondValueField.deserialize(block.secondValueField);
  }

  serialize(){
    let object = {
      class : 'ConcatOperatorBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      firstValueField : this.firstValueField.serialize(),
      operatorField : this.operatorField.serialize(),
      secondValueField : this.secondValueField.serialize()
    }
    return object;
  }

  createOperatorObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "limegreen";
    object.style.boxShadow = "0px 0px 1px 2px springgreen";
    object.appendChild(this.firstValueField.getObject());
    object.appendChild(this.operatorField.getObject());
    object.appendChild(this.secondValueField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new ConcatOperatorBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new ConcatOperatorBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new ConcatOperatorBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "( " + this.firstValueField.getValue() + " " + this.operatorField.getValue() + " " + this.secondValueField.getValue() + " )";
  }

  getPythonValue(){
    return "( " + this.firstValueField.getValue() + " " + this.operatorField.getValue() + " " + this.secondValueField.getValue() + " )";
  }
}

//==========================================================================================================================================================

class ArithmeticOperatorBlock extends OperatorBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.firstValueField = new NullHolder([StringBlock], true);
    this.operatorField = new SelectionField(['/', '*', '+', '-', '%'], ['/', '*', '+', '-', '%']);
    this.secondValueField = new NullHolder([StringBlock], true);
    this.setObject(this.createOperatorObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.firstValueField.deserialize(block.firstValueField);
    nBlock.operatorField.deserialize(block.operatorField);
    nBlock.secondValueField.deserialize(block.secondValueField);
  }

  serialize(){
    let object = {
      class : 'ArithmeticOperatorBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      firstValueField : this.firstValueField.serialize(),
      operatorField : this.operatorField.serialize(),
      secondValueField : this.secondValueField.serialize()
    }
    return object;
  }

  createOperatorObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "mediumblue";
    object.style.boxShadow = "0px 0px 1px 2px dodgerblue";
    object.appendChild(this.firstValueField.getObject());
    object.appendChild(this.operatorField.getObject());
    object.appendChild(this.secondValueField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new ArithmeticOperatorBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new ArithmeticOperatorBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new ArithmeticOperatorBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "( " + this.firstValueField.getValue() + " " + this.operatorField.getValue() + " " + this.secondValueField.getValue() + " )";
  }

  getPythonValue(){
    return "( " + this.firstValueField.getPythonValue() + " " + this.operatorField.getValue() + " " + this.secondValueField.getPythonValue() + " )";
  }
}

//==========================================================================================================================================================

class UnaryOperatorBlock extends OperatorBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.operatorField = new SelectionField(['-', '!'], ['-', '!']);
    this.valueField = new NullHolder();
    this.setObject(this.createOperatorObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.operatorField.deserialize(block.operatorField);
    nBlock.valueField.deserialize(block.valueField);
  }

  serialize(){
    let object = {
      class : 'UnaryOperatorBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      operatorField : this.operatorField.serialize(),
      valueField : this.valueField.serialize()
    }
    return object;
  }

  createOperatorObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "mediumblue";
    object.style.boxShadow = "0px 0px 1px 2px dodgerblue";
    object.appendChild(this.operatorField.getObject());
    object.appendChild(this.valueField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new UnaryOperatorBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new UnaryOperatorBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new UnaryOperatorBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "(" + this.operatorField.getValue() + this.valueField.getValue() + ")";
  }

  getPythonValue(){
    var operator = this.operatorField.getValue();
    if (operator == "!")
      operator = "not ";

    return "(" + operator + this.valueField.getValue() + ")";
  }
}

//==========================================================================================================================================================

class PreIncDecOperatorBlock extends OperatorBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.operatorField = new SelectionField(['++', '--'], ['++', '--']);
    this.valueField = new NullHolder([NumberBlock, VariableBlock], false);
    this.setObject(this.createOperatorObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.operatorField.deserialize(block.operatorField);
    nBlock.valueField.deserialize(block.valueField);
  }

  serialize(){
    let object = {
      class : 'PreIncDecOperatorBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      operatorField : this.operatorField.serialize(),
      valueField : this.valueField.serialize()
    }
    return object;
  }

  createOperatorObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "mediumblue";
    object.style.boxShadow = "0px 0px 1px 2px dodgerblue";
    object.appendChild(this.operatorField.getObject());
    object.appendChild(this.valueField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new PreIncDecOperatorBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new PreIncDecOperatorBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new PreIncDecOperatorBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "(" + this.operatorField.getValue() + this.valueField.getValue() + ")";
  }

  getPythonValue(){
    return spaces + "# Not supported in Python";
  }
}

//==========================================================================================================================================================

class PostIncDecOperatorBlock extends OperatorBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.operatorField = new SelectionField(['++', '--'], ['++', '--']);
    this.valueField = new NullHolder([NumberBlock, VariableBlock], false);
    this.setObject(this.createOperatorObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.operatorField.deserialize(block.operatorField);
    nBlock.valueField.deserialize(block.valueField);
  }

  serialize(){
    let object = {
      class : 'PostIncDecOperatorBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      operatorField : this.operatorField.serialize(),
      valueField : this.valueField.serialize()
    }
    return object;
  }

  createOperatorObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "mediumblue";
    object.style.boxShadow = "0px 0px 1px 2px dodgerblue";
    object.appendChild(this.valueField.getObject());
    object.appendChild(this.operatorField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new PostIncDecOperatorBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new PostIncDecOperatorBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new PostIncDecOperatorBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "(" + this.valueField.getValue() + this.operatorField.getValue() + ")";
  }

  getPythonValue(){
    return spaces + "# Not supported in Python";
  }
}

//==========================================================================================================================================================

class LogicalOperatorBlock extends OperatorBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.firstValueField = new NullHolder();
    this.operatorField = new SelectionField(['&&', '||'], ['&&', '||']);
    this.secondValueField = new NullHolder();
    this.setObject(this.createOperatorObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.firstValueField.deserialize(block.firstValueField);
    nBlock.operatorField.deserialize(block.operatorField);
    nBlock.secondValueField.deserialize(block.secondValueField);
  }

  serialize(){
    let object = {
      class : 'LogicalOperatorBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      firstValueField : this.firstValueField.serialize(),
      operatorField : this.operatorField.serialize(),
      secondValueField : this.secondValueField.serialize()
    }
    return object;
  }

  createOperatorObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "mediumblue";
    object.style.boxShadow = "0px 0px 1px 2px dodgerblue";
    object.appendChild(this.firstValueField.getObject());
    object.appendChild(this.operatorField.getObject());
    object.appendChild(this.secondValueField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new LogicalOperatorBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new LogicalOperatorBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new LogicalOperatorBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "(" + this.firstValueField.getValue() + " " + this.operatorField.getValue() + " " + this.secondValueField.getValue() + ")";
  }

  getPythonValue(){
    return "(" + this.firstValueField.getPythonValue() + " " + this.operatorField.getValue().substring(0,1) + " " + this.secondValueField.getPythonValue() + ")";
  }
}

//==========================================================================================================================================================

class RelationalOperatorBlock extends OperatorBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.firstValueField = new NullHolder();
    this.operatorField = new SelectionField(['==', '!=', '<', '<=', '>', '>='], ['==', '!=', '<', '<=', '>', '>=']);
    this.secondValueField = new NullHolder();
    this.setObject(this.createOperatorObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.firstValueField.deserialize(block.firstValueField);
    nBlock.operatorField.deserialize(block.operatorField);
    nBlock.secondValueField.deserialize(block.secondValueField);
  }

  serialize(){
    let object = {
      class : 'RelationalOperatorBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      firstValueField : this.firstValueField.serialize(),
      operatorField : this.operatorField.serialize(),
      secondValueField : this.secondValueField.serialize()
    }
    return object;
  }

  createOperatorObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "mediumblue";
    object.style.boxShadow = "0px 0px 1px 2px dodgerblue";
    object.appendChild(this.firstValueField.getObject());
    object.appendChild(this.operatorField.getObject());
    object.appendChild(this.secondValueField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new RelationalOperatorBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new RelationalOperatorBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new RelationalOperatorBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "(" + this.firstValueField.getValue() + " " + this.operatorField.getValue() + " " + this.secondValueField.getValue() + ")";
  }

  getPythonValue(){
    return "(" + this.firstValueField.getPythonValue() + " " + this.operatorField.getValue() + " " + this.secondValueField.getPythonValue() + ")";
  }
}

//==========================================================================================================================================================

class ConditionBlock extends DependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.blockField = new NullHolder([DependentBlock], false);
    this.setObject(this.createConditionObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.blockField.deserialize(block.blockField);
  }

  serialize(){
    let object = {
      class : 'ConditionBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      blockField : this.blockField.serialize()
    }
    return object;
  }

  createConditionObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "rgba(0,0,0,0)";
    object.style.boxShadow = "0px 0px 1px 2px rgba(0,0,0,0)";
    object.appendChild(this.blockField.getObject());
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new ConditionBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  droppedInNullHolder(e, nullHolder){
    var block = new ConditionBlock(false, true);
    super.droppedInNullHolder(e, nullHolder, block);
  }

  droppedInCanvas(e){
    var block = new ConditionBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return this.blockField.getValue();
  }

  getPythonValue(){
    return this.blockField.getPythonValue();
  }
}

//==========================================================================================================================================================

class IfBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.conditionField = new ConditionBlock(false, false, false);
    this.ifHolder = new BlockHolder();
    this.columnFlexer = null;
    this.setObject(this.createIfObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.conditionField.deserialize(block.conditionField);
    nBlock.ifHolder.deserialize(block.ifHolder);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'IfBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      conditionField : this.conditionField.serialize(),
      ifHolder : this.ifHolder.serialize(),
      children : childObjects
    }
    return object;
  }

  createIfObject(){
    var object = this.getActualBlock();
    object.style.height = "100%";
    object.style.backgroundColor = "#ff7b25";
    object.style.boxShadow = "-2px 0px 1px 1px #feb236";
    object.style.paddingRight = "0px";
    this.columnFlexer = document.createElement('div');
    this.columnFlexer.className = "column";
    this.columnFlexer.style="display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-start;";

    var row_one = document.createElement('div');
    row_one.style = "display:flex;padding-right:5px;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("if");
    textHolder.appendChild(textNode);
    row_one.appendChild(textHolder);
    row_one.appendChild(this.conditionField.getObject());
    var textHolder2 = document.createElement('span');
    textHolder2.style.color = "white";
    textHolder2.style.marginLeft = "5px";
    var textNode2 = document.createTextNode("then");
    textHolder2.appendChild(textNode2);
    row_one.appendChild(textHolder2);

    var row_two  = document.createElement('div');
    row_two.style = "display:flex;flex-flow:row nowrap;justify-content:flex-end;align-items:center;width:100%;";
    row_two.appendChild(this.ifHolder.getObject());
    this.columnFlexer.appendChild(row_one);
    this.columnFlexer.appendChild(row_two);
    object.appendChild(this.columnFlexer);

    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new IfBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new IfBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    var value =  "if (" + this.conditionField.getValue() + "){\n";
    value += this.ifHolder.getValue();
    value += spaces + "}";
    return value;
  }

  getPythonValue(){
    var value =  "if (" + this.conditionField.getPythonValue() + "):\n";
    value += this.ifHolder.getPythonValue();
    // value += spaces + "}";
    return value;
  }
}

class IfElseBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.conditionField = new ConditionBlock(false, false, false);
    this.ifHolder = new BlockHolder();
    this.columnFlexer = null;
    this.elseHolder = new BlockHolder();
    this.setObject(this.createIfElseObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.conditionField.deserialize(block.conditionField);
    nBlock.ifHolder.deserialize(block.ifHolder);
    nBlock.elseHolder.deserialize(block.elseHolder);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'IfElseBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      conditionField : this.conditionField.serialize(),
      ifHolder : this.ifHolder.serialize(),
      elseHolder : this.elseHolder.serialize(),
      children : childObjects
    }
    return object;
  }

  createIfElseObject(){
    var object = this.getActualBlock();
    object.style.height = "100%";
    object.style.backgroundColor = "#ff7b25";
    object.style.boxShadow = "-2px 0px 1px 1px #feb236";
    object.style.paddingRight = "0px";
    this.columnFlexer = document.createElement('div');
    this.columnFlexer.style="display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-start;";

    var row_one = document.createElement('div');
    row_one.style = "display:flex;padding-right:5px;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("if");
    textHolder.appendChild(textNode);
    row_one.appendChild(textHolder);
    row_one.appendChild(this.conditionField.getObject());
    var textHolder2 = document.createElement('span');
    textHolder2.style.color = "white";
    textHolder2.style.marginLeft = "5px";
    var textNode2 = document.createTextNode("then");
    textHolder2.appendChild(textNode2);
    row_one.appendChild(textHolder2);

    var row_two  = document.createElement('div');
    row_two.style = "display:flex;flex-flow:row nowrap;justify-content:flex-end;align-items:center;width:100%;";
    row_two.appendChild(this.ifHolder.getObject());
    this.columnFlexer.appendChild(row_one);
    this.columnFlexer.appendChild(row_two);

    var row_three = document.createElement('div');
    row_three.style = "display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("else");
    textHolder.appendChild(textNode);
    row_three.appendChild(textHolder);

    var row_four  = document.createElement('div');
    row_four.style = "display:flex;flex-flow:row nowrap;justify-content:flex-end;align-items:center;width:100%;";
    row_four.appendChild(this.elseHolder.getObject());

    this.columnFlexer.appendChild(row_three);
    this.columnFlexer.appendChild(row_four);
    object.appendChild(this.columnFlexer);

    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new IfElseBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new IfElseBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    var value =  "if (" + this.conditionField.getValue() + "){\n";
    value += this.ifHolder.getValue();
    value += spaces + "}else {\n";
    value += this.elseHolder.getValue();
    value += spaces + "}";
    return value;
  }

  getPythonValue(){
    var value =  "if (" + this.conditionField.getPythonValue() + "):\n";
    value += this.ifHolder.getPythonValue();
    value += "\n" + spaces + "else :\n";
    value += this.elseHolder.getPythonValue();
    // value += spaces + "}";
    return value;
  }

}


class IfElseIfBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.conditionField = new ConditionBlock(false, false, false);
    this.elseConditionField = new ConditionBlock(false, false, false);
    this.ifHolder = new BlockHolder();
    this.elseifHolder = new BlockHolder();
    this.columnFlexer = null;
    this.elseHolder = new BlockHolder();
    this.setObject(this.createIfElseIfObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.conditionField.deserialize(block.conditionField);
    nBlock.elseConditionField.deserialize(block.elseConditionField);
    nBlock.ifHolder.deserialize(block.ifHolder);
    nBlock.elseHolder.deserialize(block.elseHolder);
    nBlock.elseifHolder.deserialize(block.elseifHolder);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'IfElseIfBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      conditionField : this.conditionField.serialize(),
      elseConditionField : this.elseConditionField.serialize(),
      ifHolder : this.ifHolder.serialize(),
      elseifHolder : this.elseifHolder.serialize(),
      elseHolder : this.elseHolder.serialize(),
      children : childObjects
    }
    return object;
  }

  createIfElseIfObject(){
    var object = this.getActualBlock();
    object.style.height = "100%";
    object.style.backgroundColor = "#ff7b25";
    object.style.boxShadow = "-2px 0px 1px 1px #feb236";
    object.style.paddingRight = "0px";
    this.columnFlexer = document.createElement('div');
    this.columnFlexer.style="display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-start;";

    var row_one = document.createElement('div');
    row_one.style = "display:flex;padding-right:5px;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("if");
    textHolder.appendChild(textNode);
    row_one.appendChild(textHolder);
    row_one.appendChild(this.conditionField.getObject());
    var textHolder2 = document.createElement('span');
    textHolder2.style.color = "white";
    textHolder2.style.marginLeft = "5px";
    var textNode2 = document.createTextNode("then");
    textHolder2.appendChild(textNode2);
    row_one.appendChild(textHolder2);

    var row_two  = document.createElement('div');
    row_two.style = "display:flex;flex-flow:row nowrap;justify-content:flex-end;align-items:center;width:100%;";
    row_two.appendChild(this.ifHolder.getObject());
    this.columnFlexer.appendChild(row_one);
    this.columnFlexer.appendChild(row_two);

    var row_five = document.createElement('div');
    row_five.style = "display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("else if");
    textHolder.appendChild(textNode);
    row_five.appendChild(textHolder);
    row_five.appendChild(this.elseConditionField.getObject());

    var row_six  = document.createElement('div');
    row_six.style = "display:flex;flex-flow:row nowrap;justify-content:flex-end;align-items:center;width:100%;";
    row_six.appendChild(this.elseifHolder.getObject());
    this.columnFlexer.appendChild(row_five);
    this.columnFlexer.appendChild(row_six);

    var row_three = document.createElement('div');
    row_three.style = "display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder = document.createElement('span');
    textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("else");
    textHolder.appendChild(textNode);
    row_three.appendChild(textHolder);

    var row_four  = document.createElement('div');
    row_four.style = "display:flex;flex-flow:row nowrap;justify-content:flex-end;align-items:center;width:100%;";
    row_four.appendChild(this.elseHolder.getObject());

    this.columnFlexer.appendChild(row_three);
    this.columnFlexer.appendChild(row_four);
    object.appendChild(this.columnFlexer);

    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new IfElseIfBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new IfElseIfBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    var value =  "if (" + this.conditionField.getValue() + "){\n";
    value += this.ifHolder.getValue();
    value += spaces + "}else if (" +  this.elseConditionField.getValue() + "){\n";
    value += this.elseifHolder.getValue();
    value += spaces + "}else {\n";
    value += this.elseHolder.getValue();
    value += spaces + "}";
    return value;
  }

  getPythonValue(){
    var value =  "if (" + this.conditionField.getPythonValue() + "):\n";
    value += this.ifHolder.getPythonValue();
    value += "\n" + spaces + "elif (" + this.elseConditionField.getPythonValue() + "):\n";
    value += this.elseifHolder.getPythonValue();
    value += "\n" + spaces + "else :\n";
    value += this.elseHolder.getPythonValue();
    // value += spaces + "}";
    return value;
  }

}

class BreakBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.setObject(this.createNewObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'BreakBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      children : childObjects
    }
    return object;
  }

  createNewObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "#ffcc5c";
    object.style.boxShadow = "-2px 0px 1px 1px #ffeead";
    object.appendChild(document.createTextNode("break"));
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new BreakBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new BreakBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "break;";
  }

  getPythonValue(){
    var value = "break";
    return value;
  }
}

class ContinueBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.setObject(this.createNewObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'ContinueBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      children : childObjects
    }
    return object;
  }

  createNewObject(){
    var object = this.getActualBlock();
    object.style.backgroundColor = "#ffcc5c";
    object.style.boxShadow = "-2px 0px 1px 1px #ffeead";
    object.appendChild(document.createTextNode("continue"));
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new ContinueBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new ContinueBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "continue;";
  }

  getPythonValue(){
    var value = "continue";
    return value;
  }
}
//==========================================================================================================================================================

class ForBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.variableField = new VariableBlock(false, false, false);
    this.fromVarField = new NullHolder();
    this.toVarField = new NullHolder();
    this.stepField = new SelectionField(["+", "-"], ["+", "-"]);
    this.stepVarField = new NullHolder();
    this.bodyField = new BlockHolder();
    this.columnFlexer = null;
    this.setObject(this.createForObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.variableField.deserialize(block.variableField);
    nBlock.fromVarField.deserialize(block.fromVarField);
    nBlock.toVarField.deserialize(block.toVarField);
    nBlock.stepField.deserialize(block.stepField);
    nBlock.stepVarField.deserialize(block.stepVarField);
    nBlock.bodyField.deserialize(block.bodyField);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'ForBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      variableField : this.variableField.serialize(),
      fromVarField : this.fromVarField.serialize(),
      toVarField : this.toVarField.serialize(),
      stepField : this.stepField.serialize(),
      stepVarField : this.stepVarField.serialize(),
      bodyField : this.bodyField.serialize(),
      children : childObjects
    }
    return object;
  }

  createForObject(){
    var object = this.getActualBlock();
    object.style.height = "100%";
    object.style.paddingRight = "0px";
    this.columnFlexer = document.createElement('div');
    this.columnFlexer.style="display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-start;";

    var row_one = document.createElement('div');
    object.style.backgroundColor = "#ffcc5c";
    object.style.boxShadow = "-2px 0px 1px 1px #ffeead";
    row_one.style = "display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder = document.createElement('span');
    // textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("For");
    textHolder.appendChild(textNode);
    row_one.appendChild(textHolder);
    row_one.appendChild(this.variableField.getObject());
    var textHolder4 = document.createElement('span');
    // textHolder4.style.color = "white";
    textHolder4.style.marginRight = "5px";
    textHolder4.style.marginLeft = "5px";
    var textNode4 = document.createTextNode("=");
    textHolder4.appendChild(textNode4);
    row_one.appendChild(textHolder4);

    row_one.appendChild(this.fromVarField.getObject());
    var textHolder2 = document.createElement('span');
    // textHolder2.style.color = "white";
    textHolder2.style.marginLeft = "5px";
    var textNode2 = document.createTextNode("to");
    textHolder2.appendChild(textNode2);
    row_one.appendChild(textHolder2);
    row_one.appendChild(this.toVarField.getObject());

    var textHolder3 = document.createElement('span');
    // textHolder3.style.color = "white";
    textHolder3.style.marginLeft = "5px";
    var textNode3 = document.createTextNode("step");
    textHolder3.appendChild(textNode3);
    row_one.appendChild(textHolder3);

    row_one.appendChild(this.stepField.getObject());
    row_one.appendChild(this.stepVarField.getObject());

    var row_two  = document.createElement('div');
    row_two.style = "display:flex;flex-flow:row wrap;width:100%;justify-content:flex-end;align-items:center;";
    row_two.appendChild(this.bodyField.getObject());
    this.columnFlexer.appendChild(row_one);
    this.columnFlexer.appendChild(row_two);
    object.appendChild(this.columnFlexer);

    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new ForBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new ForBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    var condition = " <= ";
    if (this.stepField.getValue() == "-"){
      condition = " >= ";
    }
    var variable = this.variableField.getValue();
    var value =  "for (var " + variable + " = " + this.fromVarField.getValue() + "; " + variable + condition + this.toVarField.getValue() + "; " + variable + " " + this.stepField.getValue() + "= " + this.stepVarField.getValue() + "){\n";
    value += this.bodyField.getValue();
    value += spaces + "}";
    return value;
  }

  getPythonValue(){
    // var condition = "<= ";
    // if (this.stepField.getValue() == "-"){
    //   condition = ">= ";
    // }
    // var n = 0;
    // var value =  "for (var i = " + this.fromVarField.getPythonValue() + "; i " + condition + this.toVarField.getPythonValue() + "; i " + this.stepField.getValue() +"= " + this.stepVarField.getValue() + "){\n";
    // value += "n += 1;";
    // value += spaces + "}";
    // // eval(value);
    // value = "for " + this.variableField.getPythonValue() + " in range(" + n + "):\n";
    // value += this.bodyField.getPythonValue();
    var value = "# Traditional For-Loop is not available in Python.\n # Current Python implementation is yet not supported";
    return value;
  }

}

//==========================================================================================================================================================

class WhileBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.conditionField = new ConditionBlock(false, false, false);
    this.bodyField = new BlockHolder();
    this.columnFlexer = null;
    this.setObject(this.createWhileObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.conditionField.deserialize(block.conditionField);
    nBlock.bodyField.deserialize(block.bodyField);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'WhileBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      conditionField : this.conditionField.serialize(),
      bodyField : this.bodyField.serialize(),
      children : childObjects
    }
    return object;
  }

  createWhileObject(){
    var object = this.getActualBlock();
    object.style.height = "100%";
    object.style.backgroundColor = "#ffcc5c";
    object.style.boxShadow = "-2px 0px 1px 1px #ffeead";
    object.style.paddingRight = "0px";
    this.columnFlexer = document.createElement('div');
    this.columnFlexer.style="display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-start;";

    var row_one = document.createElement('div');
    row_one.style = "display:flex;padding-right:5px;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder = document.createElement('span');
    // textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("while");
    textHolder.appendChild(textNode);
    row_one.appendChild(textHolder);
    row_one.appendChild(this.conditionField.getObject());

    var row_two  = document.createElement('div');
    row_two.style = "display:flex;width:100%;flex-flow:row nowrap;justify-content:flex-end;align-items:center;";;
    row_two.appendChild(this.bodyField.getObject());
    this.columnFlexer.appendChild(row_one);
    this.columnFlexer.appendChild(row_two);
    object.appendChild(this.columnFlexer);

    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new WhileBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new WhileBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    var value = "while (" + this.conditionField.getValue() + "){\n";
    value += this.bodyField.getValue();
    value += spaces + "}";
    return value;
  }

  getPythonValue(){
    var value = "while (" + this.conditionField.getPythonValue() + "):\n";
    value += this.bodyField.getPythonValue();
    // value += spaces + "}";
    return value;
  }

}

class DoWhileBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.conditionField = new ConditionBlock(false, false, false);
    this.bodyField = new BlockHolder();
    this.columnFlexer = null;
    this.setObject(this.createWhileObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    nBlock.conditionField.deserialize(block.conditionField);
    nBlock.bodyField.deserialize(block.bodyField);
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'DoWhileBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      conditionField : this.conditionField.serialize(),
      bodyField : this.bodyField.serialize(),
      children : childObjects
    }
    return object;
  }

  createWhileObject(){
    var object = this.getActualBlock();
    object.style.height = "100%";
    object.style.backgroundColor = "#ffcc5c";
    object.style.boxShadow = "-2px 0px 1px 1px #ffeead";
    object.style.paddingRight = "0px";
    this.columnFlexer = document.createElement('div');
    this.columnFlexer.style="display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-start;";

    var row_one = document.createElement('div');
    row_one.style = "display:flex;flex-flow:row nowrap;justify-content:space-between;width:100%;align-items:center;";
    var textHolder = document.createElement('span');
    // textHolder.style.color = "white";
    textHolder.style.marginRight = "5px";
    var textNode = document.createTextNode("do");
    textHolder.appendChild(textNode);
    row_one.appendChild(textHolder);
    row_one.appendChild(this.bodyField.getObject());

    var row_two  = document.createElement('div');
    row_two.style = "display:flex;padding-right:5px;flex-flow:row nowrap;justify-content:flex-start;align-items:center;";
    var textHolder2 = document.createElement('span');
    // textHolder2.style.color = "white";
    textHolder2.style.marginRight = "5px";
    var textNode2 = document.createTextNode("while");
    textHolder2.appendChild(textNode2);
    row_two.appendChild(textHolder2);
    row_two.appendChild(this.conditionField.getObject());
    this.columnFlexer.appendChild(row_one);
    this.columnFlexer.appendChild(row_two);
    object.appendChild(this.columnFlexer);

    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new DoWhileBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new DoWhileBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    var value = "do {\n";
    value += this.bodyField.getValue();
    value += spaces + "}while (" + this.conditionField.getValue() + ")";
    return value;
  }

  getPythonValue(){
    var value = "while (True):\n";
    value += this.bodyField.getPythonValue();
    var space = spaces;
    if (space.length == 0){
      space = "    ";
      value += space + "if ( !(" + this.conditionField.getValue() + ") ):\n";
      value += space + space.substring(0,4) + "break;"
    }else{
      value += space + space.substring(0,4) + "if ( !(" + this.conditionField.getValue() + ") ):\n";
      value += space + space.substring(0,4) + space.substring(0,4) + "break;"
    }
    return value;
  }
}


class NewlineBlock extends IndependentBlock{
  constructor(isSample = false, isDraggable = true, inCanvas = false){
    super(isSample, isDraggable, inCanvas);
    this.setObject(this.createNLObject());
  }

  deserialize(block){
    var nBlock = this;
    Globals.currentCanvas.push(nBlock);
    nBlock.getObject().style.left = block.htmlLeft;
    nBlock.setPosition(block.position);
    nBlock.getObject().style.top = block.htmlTop;
    super.deserialize(block.children);
  }

  serialize(){
    var childObjects = super.serialize();
    let object = {
      class : 'NewlineBlock',
      isSample : this.isSample,
      isDraggable : this.isDraggable,
      inCanvas : this.inCanvas,
      htmlLeft : this.getObject().style.left,
      htmlTop : this.getObject().style.top,
      position : this.getObject().style.position,
      children : childObjects
    }
    return object;
  }

  createNLObject(){
    var object = this.getActualBlock();
    object.style.height = "100%";
    object.style.color = "white";
    object.appendChild(document.createTextNode("New Line"));
    return this.getObject();
  }

  droppedInBlock(e, dropZoneBlock){
    var block = new NewlineBlock(false, true);
    super.droppedInBlock(e, dropZoneBlock, block);
  }

  // droppedInNullHolder(e, nullHolder){
  //   var block = new ConditionBlock(false, true);
  //   super.droppedInNullHolder(e, nullHolder, block);
  // }

  droppedInCanvas(e){
    var block = new NewlineBlock(false);
    super.droppedInCanvas(e, block);
  }

  getValue(){
    return "\n";
  }

  getPythonValue(){
    return "\n";
  }
}

//==========================================================================================================================================================

class BlockContainer{
  static init(containerID){
    var holder = document.getElementById(containerID);
    var container = document.createElement('div');
    container.className = "codingAssist_block_container";
    container.style = "height:98%;user-select:none;-moz-user-select:none;width:95%;padding:1%;background-color:#fff;display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-start;overflow:scroll;white-space:nowrap;";
    holder.appendChild(container);
    return container;
  }

  static createTitle(title){
    var tag = document.createElement('div');
    tag.className = "titleTag";
    tag.appendChild(document.createTextNode(title));
    return tag;
  }

  static setSampleBlocks(container){
    var nlb = new NewlineBlock(true); container.appendChild(nlb.getObject());
    container.appendChild(BlockContainer.createTitle("Literals Group"));
    var n = new NumberBlock(true); container.appendChild(n.getObject());
    var b = new BooleanBlock(true); container.appendChild(b.getObject());
    var s = new StringBlock(true); container.appendChild(s.getObject());
    container.appendChild(BlockContainer.createTitle("Variables Group"));
    var v = new VariableBlock(true); container.appendChild(v.getObject());
    var d = new DeclareBlock(true); container.appendChild(d.getObject());
    var a = new AssignBlock(true); container.appendChild(a.getObject());
    var i = new InitializeBlock(true); container.appendChild(i.getObject());
    container.appendChild(BlockContainer.createTitle("Type Casting Group"));
    var intTcOb = new IntTypeCastBlock(true); container.appendChild(intTcOb.getObject());
    var strTcOb = new StringTypeCastBlock(true); container.appendChild(strTcOb.getObject());
    container.appendChild(BlockContainer.createTitle("I/O Group"));
    var ib = new InputBlock(true); container.appendChild(ib.getObject());
    var iWMb = new InputWMBlock(true); container.appendChild(iWMb.getObject());
    var o = new OutputBlock(true); container.appendChild(o.getObject());
    container.appendChild(BlockContainer.createTitle("Operators Group"));
    var cOb = new ConcatOperatorBlock(true); container.appendChild(cOb.getObject());
    var aOb = new ArithmeticOperatorBlock(true); container.appendChild(aOb.getObject());
    var uOb = new UnaryOperatorBlock(true); container.appendChild(uOb.getObject());
    var preIDob = new PreIncDecOperatorBlock(true); container.appendChild(preIDob.getObject());
    var postIDob = new PostIncDecOperatorBlock(true); container.appendChild(postIDob.getObject());
    var lOb = new LogicalOperatorBlock(true); container.appendChild(lOb.getObject());
    var rOb = new RelationalOperatorBlock(true); container.appendChild(rOb.getObject());
    container.appendChild(BlockContainer.createTitle("Decision Making Group"));
    // var condOb = new ConditionBlock(true); container.appendChild(condOb.getObject());
    var ifOb = new IfBlock(true); container.appendChild(ifOb.getObject());
    var ifEOb = new IfElseBlock(true); container.appendChild(ifEOb.getObject());
    var ifEiOb = new IfElseIfBlock(true); container.appendChild(ifEiOb.getObject());
    container.appendChild(BlockContainer.createTitle("Loops Group"));
    var brOb = new BreakBlock(true); container.appendChild(brOb.getObject());
    var cnOb = new ContinueBlock(true); container.appendChild(cnOb.getObject());
    var forOb = new ForBlock(true); container.appendChild(forOb.getObject());
    var whOb = new WhileBlock(true); container.appendChild(whOb.getObject());
    var dwhOb = new DoWhileBlock(true); container.appendChild(dwhOb.getObject());
    container.appendChild(BlockContainer.createTitle("Language Specific"));
    var mb = new ManualBlock(true); container.appendChild(mb.getObject());
  }
}

//==========================================================================================================================================================
class Canvas{
  constructor(background = "#fff"){
    this.jscode = "";
    this.pycode = "";
    this.list = [];
    this.containerID = null;
    this.backgroundColor = background;
    this.object = this.createCanvas();
    this.onDragOverListener = this.onDragOver.bind(this);
    this.onDragLeaveListener = this.onDragLeave.bind(this);
    this.onDropListener = this.onDrop.bind(this);
    this.onDragEnterListener = this.onDragEnter.bind(this);
    this.onContextMenuListener = this.onContextMenu.bind(this);
    this.setInteractive();
    Globals.canvasList.push(this);
    this.createName();
  }

  createName(){
    var count = 0;
    for (var i = 0; i < Globals.canvasList.length; i++){
      if (Globals.canvasList[i] == this){
        count = i;
      }
    }
    var textHolder = document.createElement('span');
    textHolder.style="position:scroll; left:5px; top:5px;padding:2px;";
    textHolder.innerHTML = "Canvas" + (++count);
    this.getObject().appendChild(textHolder);
  }

  serialize(){
    let blockSerializedObj = {};
    var count = 0;
    for (var block of this.list){
      if (block == null) continue;
      if (block.getInCanvas()){
        blockSerializedObj['block' + (++count)] = block.serialize();
      }
    }

    let object = {
      class : 'Canvas',
      backgroundColor : this.backgroundColor,
      containerID : this.containerID,
      blocks : blockSerializedObj
    }
    return object;
  }

  createCanvas(){
    var canvas = document.createElement('div');
    canvas.className = "codingAssist_workingAreaHolder";
    // canvas.id = 'canvas';
    canvas.style = "width:98%;padding:1%;height:98%;overflow:scroll;position:relative;white-space:nowrap;user-select:none;-moz-user-select:none;";
    canvas.style.backgroundColor = this.backgroundColor;
    return canvas;
  }

  getObject(){
    return this.object;
  }

  push(object){
    this.list.push(object);
  }

  removeFromList(block){
    for (var object in this.list){
      if (this.list[object] == block){
        this.list[object] = null;
      }
    }
  }

  getJSObjectOf(HTMLObject){
    for (var object of this.list){
      if (object == null) continue;
      if (object.getObject() == HTMLObject){
        return object;
      }
    }
    return false;
  }

  static getJSOfID(id){
    for (var object of this.list){
      if (object == null) continue;
      if (object.id == id){
        return object;
      }
    }
    return false;
  }

  addTo(containerID){
    this.containerID = containerID;
    document.getElementById(containerID).appendChild(this.getObject());
    Globals.currentCanvas = this;
  }

  detach(){
    this.getObject().parentNode.removeChild(this.getObject());
  }

  setInteractive(){
    this.getObject().addEventListener('dragover', this.onDragOverListener);
    this.getObject().addEventListener('dragleave', this.onDragLeaveListener);
    this.getObject().addEventListener('drop', this.onDropListener);
    this.getObject().addEventListener('dragenter', this.onDragEnterListener);
    this.getObject().addEventListener('contextmenu', this.onContextMenuListener);
  }

  onContextMenu(e){
    e.preventDefault();
    var element = document.createElement('div');
    element.style="position:absolute;min-width:150px;padding:5px;box-shadow:0px 0px 5px 2px gray;background-color:#eee;display:flex;flex-flow:column wrap;justify-content:flex-start;align-items:center;";
    element.style.left = e.layerX + "px";
    element.style.top = e.layerY + "px";
    var xPos = element.style.left;
    var yPos = element.style.top;
    var block = this;

    var node0 = document.createElement('div');
    node0.style = "width:100%;height:20px;padding:4px;";
    node0.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var object = {
        canvas1 : block.serialize()
      }
      Globals.deserialize(object);
      block.getObject().removeChild(element);
    });
    node0.innerHTML = "Create Duplicate";
    element.appendChild(node0);

    var node1 = document.createElement('div');
    node1.style = "width:100%;height:20px;padding:4px;";
    node1.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      if (Globals.copyObject != ""){
        var object = Globals.copyObject;
        object.htmlLeft = xPos;
        object.htmlTop = yPos;
        object.position = 'absolute';
        var blockNew = new Globals.classMap[object.class](false, true, true);
        blockNew.deserialize(object);
        block.getObject().appendChild(blockNew.getObject());
      }
      block.getObject().removeChild(element);
    });
    node1.innerHTML = "Paste Block";
    element.appendChild(node1);

    var node2 = document.createElement('div');
    node2.style = "width:100%;height:20px;padding:4px;";
    node2.innerHTML = "Cancel";
    node2.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      block.getObject().removeChild(element);
    });
    element.appendChild(node2);

    this.getObject().appendChild(element);
  }

  onDragEnter(e){
    Globals.currentCanvas = this;
  }

  onDragOver(e){
    e.preventDefault();
  }

  onDragLeave(e){
    // WorkingArea.workingArea.style.backgroundColor = WorkingArea.backgroundColor;
  }

  onDrop(e){
    // e.stopPropagation();
    this.getObject().style.backgroundColor = this.backgroundColor;
    var dragBlock = Globals.draggedBlock;
    dragBlock.droppedInCanvas(e);
  }
}

//==========================================================================================================================================================
