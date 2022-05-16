const express = require("express");
const res = require("express/lib/response");
const db = require("./sqlite3");
const app = express();
const port = 3000;

app.use(express.json());


// # this is just a test api
app.get("/test", (req, res) => {
  display()
    .then((data) => {
      return res.send(data);
    })
    .catch((err) => {
      return res.send(err);
    });
});

function display() {
  return new Promise((resolve, reject) => {
    if (Math.random() > 0.4) resolve("This is resolve");
    else reject("This is reject");
  });
}

//  #1st api
app.post("/api/quiz/", (req, res) => {
  var name = req.body.name;
  var desc = req.body.desc;

  const isValid1 = validiate_input(name);
  const isValid2 = validiate_input(desc);

  if (!isValid1 || !isValid2) {
    return res.status(400).send({
      status: "failure",
      message: "Input request error",
    });
  }

  insert_quiz(req.body)
    .then((id) => {
      console.log(id);
      get_quiz(id)
        .then((row) => {
          console.log(row);
          return res.status(200).send(row);
        })
        .catch((err) => {
          return res.status(400).send({
            status: "failure",
            message: err,
          });
        });
    })
    .catch((err) => {
      return res.status(400).send({
        status: "failure",
        message: err,
      });
    });
});

var insert_quiz = function (req) {
  const query = "INSERT INTO quizs(name,desc) VALUES(?,?)";
  return new Promise((resolve, reject) => {
    db.run(query, [req.name, req.desc], function (err) {
      if (this.lastID > 0) {
        resolve(this.lastID);
      } else {
        reject(new Error("Failed to Insert"));
      }
    });
  });
};

var get_quiz = function (id) {
  const query = "SELECT * FROM quizs WHERE id = ? LIMIT 1";
  return new Promise((resolve, reject) => {
    db.get(query, [id], function (err, row) {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

var validiate_input = function (input) {
  if (input.toString().trim() != "") {
    return true;
  } else {
    return false;
  }
};

// 2nd api

app.post("/api/questions/", (req, res) => {
  var name = req.body.name;
  var options = req.body.options;
  var right_option = req.body.right_option;
  var quiz_id = req.body.quiz_id;

  insert_question(req.body)
    .then((id) => {
      console.log(id);
      get_question(id)
        .then((row) => {
          console.log(row);
          return res.status(200).send(row);
        })
        .catch((err) => {
          return res.status(400).send({
            status: "failure",
            message: err,
          });
        });
    })
    .catch((err) => {
      return res.status(400).send({
        status: "failure",
        message: "err",
      });
    });
});

var insert_question = function (req) {
  const query =
    "INSERT INTO questions(name,options,right_option,quiz_id) VALUES(?,?,?,?)";
  const param = [req.name, req.options, req.right_option, req.quiz_id];
  return new Promise((resolve, reject) => {
    db.run(query, param, function (err) {
      console.log(this.lastID, err);
      if (this.lastID > 0) {
        resolve(this.lastID);
      } else {
        reject(new Error("Failed to Insert"));
      }
    });
  });
};

var get_question = function (id) {
  const query = "SELECT * FROM questions WHERE id = ? LIMIT 1";
  return new Promise((resolve, reject) => {
    db.get(query, [id], function (err, row) {
      if (err) {
        reject(err.message);
      } else {
        resolve(row);
      }
    });
  });
};

// #3rd api

app.get("/api/questions/:quiz_id", (req, res) => {
  var quiz_id = req.params.quiz_id;
  var quiz;

  if (!quiz_id) {
    return res.status(400).send("You have not passed the quiz id!");
  }

  get_quiz(quiz_id)
    .then((row) => {
      quiz = {
        name: row.name,
        desc: row.desc,
      };
      get_question_from_quiz_id(quiz_id)
        .then((row) => {
          return res.status(200).json({
            quiz,
            questions: row,
          });
        })
        .catch((err) => {
          return res.status(400).send({
            status: "failure",
            message: err,
          });
        });
    })
    .catch((err) => {
      return res.status(404).send({
        status: "failure",
        message: "Quiz id is not found in DB!",
      });
    });
});

var get_question_from_quiz_id = function (id) {
  const query = "SELECT * FROM questions q2 WHERE q2.quiz_id = ?";
  return new Promise((resolve, reject) => {
    db.all(query, [id], function (err, row) {
      if (err) {
        reject(err.message);
      } else {
        resolve(row);
      }
    });
  });
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
