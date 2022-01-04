const container = document.querySelector(".container");

const boards = [
    new Board("toDo","To-Do","#35235D",0),
    new Board("doing","Doing","#CB2402",1),
    new Board("done","Done","#4C49A2",2),
    new Board("approved","Approved","#A31A48",3)
]

const localData = localStorage.getItem('kanban')
const data = localData && localData.length > 1 ? JSON.parse(localData) : boards

const renderKanban = () => {
    data.forEach((element,i) => {
    const elementClass = element.className;
    const $currentBoard = document.querySelector(`.${elementClass}`)
    element.todoList.forEach((listElement,listIndex) => {
        const $todoList = $currentBoard.querySelector(".todolist");
        new ToDo(listElement,$todoList,i,listIndex)
    });
});
}


const actionList = [];


const $undoButton = document.querySelector(".undo");


const undo = () =>{
    localStorage.setItem('kanban', JSON.stringify(boards))
    let lastAction = actionList.pop();
    if (!lastAction) return;
    switch(lastAction.action){
        case 'left':
            lastAction.info.listId.add(lastAction.info.val)
            lastAction.info.listIdprev.removeItem(lastAction.info.itemIndex)
            break;
        case 'right':
            lastAction.info.listId.add(lastAction.info.val)
            lastAction.info.listIdprev.removeItem(lastAction.info.itemIndex)
            break;
        case 'add':
            lastAction.info.listId.add(lastAction.info.val)
            break;
        case 'remove':
            lastAction.info.idList.removeItem(lastAction.info.id)
            break;
        }
    }

$undoButton.addEventListener('click',undo)

function ToDo(value,parent,boardIndex,todoIndex){
    const $element = document.createElement('div');

    let left = ""
    if (boardIndex > 0){
        left = `<div class="left">&lt;</div>`
    }

    let right = ""
    if (boardIndex < boards.length -1){
        right = `<div class="right">&gt;</div>`
    }
    
    $element.classname = "items"; 
    $element.innerHTML = `<div class="items"> ${left} <p class="val">${value}</p> ${right} </div>`

    parent.appendChild($element)
    const saveAction = (obj) => {
        actionList.push(obj)
    }
    

    if (left){
        const $left = $element.querySelector(".left")
        $left.addEventListener("click",e=>{
            boards[boardIndex-1].add(value)
            boards[boardIndex].removeItem(todoIndex)
            saveAction({action:'right',info:{listId:boards[boardIndex],val:value,itemIndex:todoIndex,listIdprev:boards[boardIndex-1]}})
            localStorage.setItem('kanban', JSON.stringify(boards))
        })
    }

    if (right){
        const $right = $element.querySelector(".right")
        $right.addEventListener("click",e=>{
            boards[boardIndex+1].add(value)
            boards[boardIndex].removeItem(todoIndex)
            saveAction({action:'left',info:{listId:boards[boardIndex],val:value,itemIndex:todoIndex-1,listIdprev:boards[boardIndex+1]}})
            localStorage.setItem('kanban', JSON.stringify(boards))
        })
    }

    if(value){
        const $value = $element.querySelector(".val")
        $value.addEventListener("click",e=>{
            let alert = confirm("Are you sure you want to remove this item?")
            if (alert){
                boards[boardIndex].removeItem(todoIndex)
                saveAction({action:'add',info:{listId:boards[boardIndex],val:value,itemIndex:todoIndex,listIdprev:boards[boardIndex+1]}})
                localStorage.setItem('kanban', JSON.stringify(boards))
            }
        })
    }

    
}

function Board(className,title,color,index) {
    const $board = document.createElement("div")
    $board.className = `child ${className}`
    $board.innerHTML = `
                        <h1 class="header" style="background-color:${color}">${title}</h1>
                        <div class="todolist">
                        </div>
                        <div class="inputs">
                        <textarea class="text-area"></textarea><button class="button"  type="submit">Submit</button>
                        </div>
                        `
    container.append($board)

    const $button = $board.querySelector(".button")
    const $textArea = $board.querySelector(".text-area")
    const $todoList = $board.querySelector(".todolist");
    const todoList = []
    this.todoList = todoList;
    this.className = className;
    
    setTimeout(() => {
            data[index].todoList.forEach(element => {
                todoList.push(element);
            }); 
    }, 100);
    
    const renderToDos = () => {
        $todoList.innerHTML = "";

        todoList.forEach((element,i) => {
            new ToDo(element,$todoList,index,i)
        }); 
    }

    $button.addEventListener("click",e=>{
        if (!$textArea.value){
            return
        }
        todoList.push($textArea.value)
        renderToDos()
        saveAction({action:'remove',info:{val:$textArea.value,id:todoList.indexOf($textArea.value),idList:boards[index]}})
        console.log(actionList)
        localStorage.setItem('kanban', JSON.stringify(boards))
    })

    this.add = (value) => {
        todoList.push(value);
        renderToDos();
    }

    this.removeItem = (itemIndex,value) => {
        todoList.splice(itemIndex,1)
        renderToDos();
    }

    const saveAction = (obj) => {
        actionList.push(obj)
    }
}

renderKanban()
