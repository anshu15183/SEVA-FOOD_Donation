const express = require("express");
const app = express();

const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const dotenv = require("dotenv");

const homeRoutes = require("./routes/home.js");
const authRoutes = require("./routes/auth.js");
const adminRoutes = require("./routes/admin.js");
const donorRoutes = require("./routes/donor.js");
const agentRoutes = require("./routes/agent.js");

require("dotenv").config();
require("./config/dbConnection.js")();
require("./config/passport.js")(passport);

app.set("view engine", "ejs");

app.use(expressLayouts);
app.use("/assets", express.static(__dirname + "/assets"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const MongoStore = require("connect-mongo");

app.use(
	session({
		secret: process.env.SESSION_SECRET || "your_secret_key", // Use a strong secret
		resave: false, // Do not save session if unmodified
		saveUninitialized: false, // Do not create session until something stored
		store: MongoStore.create({
			mongoUrl: process.env.MONGO_URI, // Connect to the same MongoDB
			collectionName: "sessions", // Optional, custom session collection name
		}),
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 day expiration for the cookie
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(methodOverride("_method"));
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.warning = req.flash("warning");
	next();
});

// Routes
app.use(homeRoutes);
app.use(authRoutes);
app.use(donorRoutes);
app.use(adminRoutes);
app.use(agentRoutes);
app.use((req, res) => {
	res.status(404).render("404page", { title: "Page not found" });
});

const port = process.env.PORT || 5000;
app.listen(port, async () => {
	console.log(`Server is running at http://localhost:${port}`);

	const open = await import("open");
	open.default(`http://localhost:${port}`);
});
