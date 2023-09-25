//jshint esversion:6
let optios={weekday:'long',month:'long',day:'numeric'};
let today=new Date();
let day=today.toLocaleDateString("en-Us",optios);

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist."
})
const item2=new Item({
  name:"Click + to add new items."
})
const item3=new Item({
  name:"<-- Check this to delete items."
})
const item4=new Item({
  name:"To add a new list, write its name following by a / in the URL"
})

const defaultItems=[item1,item2,item3,item4];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);






app.get("/", function(req, res) {
  
  
  Item.find({})
  .then(function(foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems)
        .then(function(){
          console.log("success");

        })
        .catch(function(err){
          console.log(err);    
        });      
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItems});

    }

    });

});

app.get("/:customListName",(req,res)=>{

  
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName})
    .then(function(foundList){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
      
        });
      
        list.save();
        console.log("added in list");

        res.redirect("/"+customListName);
        
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    });


});

app.post("/", function(req, res){

  

  const newitem = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:newitem
  });

  if(listName===day){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
      .then(function(foundList){
        foundList.items.push(item);
        foundList.save();

        res.redirect("/"+listName);
      });
  }


  
});

app.post("/delete",(req,res)=>{
  const checkId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName===day){
    Item.findByIdAndRemove(checkId)
      .then(function() {
        console.log("deleted");
        res.redirect("/");
      });

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkId}}})
      .then(function(foundList){
        res.redirect("/"+listName);

      });
  }


});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
