const express = require("express");
const math = require("mathjs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
// Basic arithmetic operations
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../",'index.html'));
});

// Parse JSON bodies
app.use(bodyParser.json());

if (process.env.REACT_APP_DISABLE_DEV_TOOLS === "true") {
  // Disable React DevTools if we're in production
  if (typeof window !== "undefined" && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = null;
  }
}


function evaluateBODMAS(numbers, operators) {
  const precedence = {
    'sin': 4,
    'cos': 4,
    'tan': 4,
    'log': 4, // generic log function
    "*": 2,
    "/": 2,
    "+": 1,
    "-": 1,
  };

  const applyOp = (a, b, op) => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return a / b;
      case "log":
        return a * Math.log10(b); // log base a of b
      case "sin":
        return a * Math.sin(b);
      case "cos":
        return a * Math.cos(b);
      case "tan":
        return a * Math.tan(b);
      default:
        throw new Error(`Unknown operator: ${op}`);
    }
  };

  // First handle all functions (like sin, cos, tan, log)
  while (operators.some((op) => ["sin", "cos", "tan", "log"].includes(op))) {
    let index = operators.findIndex((op) =>
      ["sin", "cos", "tan", "log"].includes(op)
    );
    const op = operators[index];
    const num = numbers[index];
    const nextNum = numbers[index + 1]; // For log, need the next number (base and operand)
    const nexnum = numbers[index + 1];

    let result;
    if (op === "log") {
      if (nextNum === undefined)
        throw new Error("Log operation requires two operands.");
      result = applyOp(num, nextNum, op); // log base num of nextNum
      numbers.splice(index, 2, result); // Replace the base and operand with result
    } else {
      result = applyOp(num, nexnum, op); // For sin, cos, tan, etc.
      numbers.splice(index, 1, result); // Replace one operand with result
    }

    operators.splice(index, 1); // Remove the operator
  }

  // You can now add more logic for other operations (like *, /, +, -)
  // Example: Handle multiplication and division, respecting precedence
  const processOperators = (ops) => {
    for (let i = 0; i < operators.length; ) {
      if (ops.includes(operators[i])) {
        const result = applyOp(numbers[i], numbers[i + 1], operators[i]);
        numbers.splice(i, 2, result);
        operators.splice(i, 1);
      } else {
        i++;
      }
    }
  };

  // Process * and / before + and -
  processOperators(["*", "/"]);
  processOperators(["+", "-"]);

  return numbers[0];
}




app.post("/evaluate", (req, res) => {
  const { numbers, operators } = req.body;

  if (!Array.isArray(numbers) || !Array.isArray(operators)) {
    return res
      .status(400)
      .json({
        error: "Invalid input. 'numbers' and 'operators' must be arrays.",
      });
  }

  if (numbers.length !== operators.length + 1) {
    return res
      .status(400)
      .json({ error: "Mismatch between numbers and operators." });
  }

  try {
    const result = evaluateBODMAS([...numbers], [...operators]); // Use copies
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Evaluation error", details: err.message });
  }
});



app.get("/:operation", (req, res) => {
  try {
    // Get numbers from query parameters
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    if (isNaN(num1) || isNaN(num2)) {
      return res.status(400).send("Invalid input, please enter numbers.");
    }

    let result;
    const operation = req.params.operation;

    // Perform the requested operation
    switch (operation) {
      case "add":
        result = num1 + num2;
        break;
      case "subtract":
        result = num1 - num2;
        break;
      case "multiply":
        result = num1 * num2;
        break;
      case "divide":
        if (num2 === 0) return res.status(400).send("Cannot divide by zero.");
        result = num1 / num2;
        break;
      default:
        return res.status(400).send("Invalid operation.");
    }

    // Send result as plain text
    res.status(200).send(result.toString());
  } catch (error) {
    res.status(500).send("Server error");
  }
});

//app.get("/", (req, res) => {
  //res.sendFile(path.join(__dirname, "../", "index.html"));
//});

app.post("/add", (req, res) => {
  const num1 = Array.isArray(req.body.num1) ? req.body.num1 : [];

  // Validate that all elements are numbers
  if (!num1.every((n) => typeof n === "number" && !isNaN(n))) {
    return res
      .status(400)
      .send("Invalid input, please provide an array of numbers.");
  }

  // Sum the numbers
  const sum = num1.reduce((result, val) => result + val, 0);

  res.json(sum.toString());
});


app.post("/subtract", (req, res) => {
  const num1 = Array.isArray(req.body.num1) ? req.body.num1 : [];

  // Validate that all elements are numbers
  if (!num1.every((n) => typeof n === "number" && !isNaN(n))) {
    return res
      .status(400)
      .send("Invalid input, please provide an array of numbers.");
  }

  // Subtract the numbers
  const sub = num1.reduce((result, val) => result - val, 0);
  res.json(sub.toString());
});

app.post("/multiply", (req, res) => {
  const num1 = Array.isArray(req.body.num1) ? req.body.num1 : [];

  // Validate that all elements are numbers
  if (!num1.every((n) => typeof n === "number" && !isNaN(n))) {
    return res
      .status(400)
      .send("Invalid input, please provide an array of numbers.");
  }

  // Sum the numbers
  const mul = num1.reduce((result, val) => result * val, 0);
  res.json(mul.toString());
});

app.post("/divide", (req, res) => {
  const num1 = Array.isArray(req.body.num1) ? req.body.num1 : [];

  // Validate that all elements are numbers
  if (!num1.every((n) => typeof n === "number" && !isNaN(n))) {
    return res
      .status(400)
      .send("Invalid input, please provide an array of numbers.");
  }

  // Sum the numbers
  const div = num1.reduce((result, val) => result / val, 0);
  res.json(div.toString());
});


// Scientific functions
app.post("/power", (req, res) => {
     const { num1, num2 } = req.body;

  // Validate request body
  if (typeof num1 !== "number" || typeof num2 !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const sum = Math.pow(parseFloat(num1), parseFloat(num2)) ;
  res.status(200).json({ result: sum });
});


app.post("/sqrt", (req, res) => {
    const { num } = req.body;

  // Validate request body
  if (typeof num !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const sum = Math.sqrt(num);
  res.status(200).json({ result: sum });
});  


app.post("/log", (req, res) => {

      const num1 = req.body.num1;
      const num2 = req.body.num2;
      // Validate request body
 if (isNaN(num2) || isNaN(num1)) {
   return res.status(400).send("Invalid input, please enter numbers.");
 }

   const sum = Math.log(num2) / Math.log(num1);
  //res.status(200).send(sum.toString());
  res.json(sum.toString());
});
   


app.post("/sin", (req, res) => {

        const num  = req.body.num;

  // Validate request body
  if (typeof num !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const sum = Math.sin(parseFloat(num));
  //res.status(200).json({ result: sum });
  res.json(sum.toString());
});


app.post("/cos", (req, res) => {
    const num  = req.body.num;

  // Validate request body
  if (typeof num !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const sum = Math.cos(parseFloat(num));
  //res.status(200).json({ result: sum });
  res.json(sum.toString());
});


app.post("/tan", (req, res) => {
    const  num  = req.body.num;

  // Validate request body
  if (typeof num !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const sum = Math.tan(parseFloat(num));
  //res.status(200).json({ result: sum });
  res.json(sum.toString());
});  


// Start server
//app.listen(port, () => {
  //console.log(
    //`Scientific Calculator API is running on ${port} Server running on https://alexanderkwesi.github.io/calculator_api:3000`
  //);
//});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
