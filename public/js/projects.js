//getting all required data
const searchBar = document.querySelector(".search-bar");
const inputBox = document.querySelector("input");
const suggBox = document.querySelector(".autocom-box");
const clearBtn = document.querySelector(".delete-btn");

if(inputBox.value){
    clearBtn.style.display = "none";
}

inputBox.onkeyup = (e)=>{
    let userData = e.target.value;
    let array=[];
    if(userData){
        array = suggestions.filter((data)=>{
            //filtring array value and user char to lowercase and return only those
            //words which are starts with user entered word
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
        });
        array = array.map((data)=>{
            return data = '<li>'+data+'</li>';
        });
        searchBar.classList.add("active");//show autocomplete box
        showSuggestions(array);
        let allList = suggBox.querySelectorAll("li");
        for(let i = 0;i<allList.length;i++){
            //adding onclick attribite in all li tag
            allList[i].setAttribute("onclick" , "select(this)");
        }
    }else{
        searchBar.classList.remove("active");//hide autocomplete box
    }
    
}

function select(element){
    let selectUserData = element.textContent;
    inputBox.value = selectUserData; //passing selected data in textfield
    searchBar.classList.remove("active");
}

function showSuggestions(list){
    let listData;
    if(!list.length){
        userValue = inputBox.value;
        listData = '<li>'+userValue+'</li>';
    }else{
        listData = list.join('');
    }
    suggBox.innerHTML = listData;
}

