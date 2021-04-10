var input = document.querySelector('.input_text');
var main = document.querySelector('#name');
var temp = document.querySelector('.temp');
var button= document.querySelector('.submit');

function kel_to_f(temperature){
    return (Math.round((temperature-273.15)*(9/5)+32));
}

button.addEventListener('click', function(name){
fetch('https://api.openweathermap.org/data/2.5/weather?q='+input.value+'&appid=ab5f2db73c7662036b5b892307489e94')
.then(response => response.json())
.then(data => {
  var tempValue = kel_to_f(data['main']['temp']);
  var nameValue = data['name'];
  
   
  main.innerHTML = nameValue;
  temp.innerHTML = "Temperature: "+ tempValue+'\xB0'+ "F";
  input.value ="";

})

.catch(err => alert("Please insert valid city"));

})