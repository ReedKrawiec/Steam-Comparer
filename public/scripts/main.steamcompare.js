var counter = 0;
var final_array = [];

function createinput(){
  /*
  <div class="main_input_bar_container">
    <input class="main_input_bar" name="value_1"></input>
    <div class="main_input_remove">
      <div class="main_input_remove_minus">
      </div>
    </div>
  </div>
  */
  $("#main_inputs").append($('<div class="main_input_bar_container" id="container_'+counter+'"><input class="main_input_bar""></input><div class="main_input_remove" onclick="removeinput('+counter+')"   data="'+counter+'"><div class="main_input_remove_minus"></div></div></div>').css("display","flex").fadeIn("fast"))
  counter++;
}
function finalinput(){
    final_array = [];
    $('input').each(function(){
      final_array.push($(this).val());
     });

    $.get( "/Compare", { "urls":final_array },function(data){
        console.log("Finished Post");
        $("#panel").animate({
          top:$("#top_bar").height()
        },500,function(){
          data = JSON.parse(data);
          if(data=="ERROR"){

          }
          else{
          console.log(data);
            for(var g = 0;g<data.length;g++){
              console.log("APPEND");
              //FIX STRING
              //"<div style='display:flex;justify-contents:center;align-items:center'><img src='http://media.steampowered.com/steamcommunity/public/images/apps/"+data[g].appid+"/"+data[g].img_logo_url+".jpg></img></div>")
              $("#dark_black").append("<div class='finalcontainer'><img src='http://media.steampowered.com/steamcommunity/public/images/apps/"+data[g].appid+"/"+data[g].img_logo_url+".jpg' /></div>")
            }
          }
        });
    });

    $("#main_content").animate({
      left:"-100vw"
    },500,function(){

    });
   console.log("HI");
   console.log(final_array);
}

function removeinput(num){
  console.log(num);
  $("#container_"+num).fadeOut("fast",function(){
    $("#container_"+num).remove();
  });
};
$(document).ready(function(){
  for(var a = 0;a<2;a++)
    createinput();
    $("#panel").css("top","100vh");
    $("#panel").css("height",$('html').height()-$("#top_bar").height())
});
window.onresize = function(){
    $("#panel").css("height",$('html').height()-$("#top_bar").height())
};
