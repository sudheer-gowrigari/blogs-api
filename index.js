const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool } = require("./config");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { body, check } = require("express-validator");
const { request, response } = require("express");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());
app.use(helmet());
const isProduction = process.env.NODE_ENV === "production";
const origin = {
  origin: isProduction ? "https://salesforce-blogs.herokuapp.com/" : "*",
};

app.use(cors(origin));

const getBlogs = (request, response) => {
  pool.query("SELECT * FROM blogs", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addBlog = (request, response) => {
  const { title, text } = request.body;

  pool.query(
    "INSERT INTO blogs (title, text) VALUES ($1, $2) RETURNING id, title, text, timestamp",
    [title, text],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).json(results.rows[0]);
    }
  );
};

const updateBlog = (request, response) => {
  const blogId = request.params.id;
  const { title, text } = request.body;
  const query = `UPDATE blogs SET title='${title}', text='${text}' WHERE id='${blogId}' RETURNING id, title, text, timestamp`;
  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).json(results.rows[0]);
  });
};

const getSingleBlog = (request, response) => {
  const blogId = request.params.id;
  const query = `SELECT * FROM blogs where id=${blogId}`;
  pool.query(query, (error, results) => {
    // let resultCount = results.rowCount;
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows[0]);
  });
};

const deletBlogs = (request, response) => {
  pool.query("DELETE FROM blogs", (error, results) => {
    if (error) {
      throw error;
    }
    response
      .status(200)
      .json({ status: "success", message: "All blogs deleted." });
  });
};

const deletSingleBlog = (request, response) => {
  const blogId = request.params.id;
  const query = `DELETE FROM blogs where id=${blogId} RETURNING id`;
  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response
      .status(200)
      .json({ status: "success", message: `blog with id ${blogId} deleted.` });
  });
};

const generateSampleData = (request, response) => {
  const sampaleData = [
    {
      title: "How the Employee Experience (EX) Drives Lamborghini’s Success",
      text:
        "The luxury automobile maker recently celebrated its highest month of production ever. They attribute their customer growth and satisfaction to employees who love what they do.",
    },
    {
      title:
        "How 5G Will Impact Healthcare, Retail, and Manufacturing in 2021.",
      text:
        "The future of 5G in healthcare, retail, and manufacturing promises more than just personalized shopping experiences, telehealth, and more streamlined machine production.",
    },
    {
      title:
        "Online Grocery Sales Have Doubled — Is Your Store Ready To Serve?",
      text:
        "Here’s how online grocery stores can boost sales with better customer convenience and online product information – now.",
    },
    {
      title:
        "Tap Into Expert Advice for the Fastest Path To ROI With Salesforce Technology",
      text:
        "In this blog series, Salesforce experts will share how to achieve your vision using Salesforce technology by diving into the five main areas critical to success.",
    },
    {
      title:
        "Why Your Customer Loyalty Program Isn’t Profitable – and How To Fix It.",
      text:
        "Customer loyalty programs require a complete view of customer data to create true loyalty value.",
    },
    {
      title:
        "Small Businesses Share What They Learned in 2020: Now They’re Ready To Move Forward",
      text:
        "We sat down with a few San Francisco-based small businesses to hear what they learned this year that will help them in 2021 and beyond.",
    },
    {
      title:
        "Mark Cuban Shares 2021 Predictions: Small Businesses Should Prepare for the Post-COVID Snapback",
      text:
        "Mark Cuban shares predictions for the new year and actionable insights for small businesses. Read seven of his insights then watch the conversations for even more tips.",
    },
    {
      title: "Providing Hope in the Form of a Chatbot",
      text:
        "AdventHealth, a Salesforce customer, needed to find digital tools to provide the same level of whole-person care and connection as its in-person health system.",
    },
    {
      title:
        "How the Retail Game in Sports Jerseys Mastered Customer Personalization",
      text:
        "Online sports apparel retailer Fanatics knows they need to know who their customer is rooting for, and that the right data is essential for the win.",
    },
    {
      title:
        "Headless Commerce in 5 Steps – and How To Convince Your Org You Need It",
      text:
        "Use APIs to separate the front end and back end of your ecommerce tools for a more frictionless, targeted customer experience.",
    },
  ];

  for (let data in sampaleData) {
    const { title, text } = sampaleData[data];
    pool.query(
      "INSERT INTO blogs (title, text) VALUES ($1, $2) RETURNING id, title, text, timestamp",
      [title, text],
      (error, results) => {
        if (error) {
          throw error;
        }
      }
    );
  }
  response
    .status(200)
    .json({ status: "success", message: "Sample blogs created." });
};

const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

app.post("/blogs/api", postLimiter, addBlog);

app
  .route("/blogs/api")
  // GET endpoint
  .get(getBlogs)
  // POST endpoint
  .post(addBlog)
  .delete(deletBlogs);
//generate sample data
app
  .route("/blogs/api/generateSampleData")
  // GET endpoint
  .get(generateSampleData);

//CRUD on Single record
app
  .route("/blogs/api/:id")
  .get(getSingleBlog)
  .post(updateBlog)
  .delete(deletSingleBlog);

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`);
});
