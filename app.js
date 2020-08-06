const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// cara untuk pakai lokal javascript "const Judul = require(__dirname + "/namafile.js")"
const date = require(__dirname + "/date.js");

mongoose.connect(
  "mongodb+srv://admin-yosa:test123@todolist.xfruj.mongodb.net/todolistDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// aktifin ejs harus buat folder namanya views isi folder ejs
app.set("view engine", "ejs");

// aktifin static file kayak CSS, images buat folder namanya public
app.use(express.static("public"));

// boleh pakai const soalnya const gak ngerubah isi dalam nya bisa di push kok, bisa juga dirubah
const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Selamat Datang!",
});

const item2 = new Item({
  name: "Tekan + untuk menambah item",
});

const item3 = new Item({
  name: "<-- untuk hapus",
});

const defaultItems = [item1, item2, item3];

const listShema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listShema);

// ini untuk buat bagian home page
app.get("/", function (req, res) {
  Item.find({}, function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success Insert");
        }
      });
      res.redirect("/");
    } else {
      var day = date.getDay();
      res.render("list", { listTitle: day, newListItems: items });
    }
  });
});

// ini bagian aboutnya ceritanya
app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:customListName", function (req, res) {
  const listName = _.capitalize(req.params.customListName);

  List.findOne({ name: listName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // buat list baru
        const list = new List({
          name: listName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        // tunjukan list yang sudah ada
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

// ini untuk terima masukan dari user untuk web appnya
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item4 = new Item({
    name: itemName,
  });

  if (listName === date.getDay()) {
    item4.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === date.getDay()) {
    Item.findByIdAndDelete(itemId, function (err) {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// kasi port server

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function () {
  console.log("this port is 3000");
});
